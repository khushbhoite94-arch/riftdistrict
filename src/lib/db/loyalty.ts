import { query, withTransaction, sql, getPool, type SqlParams } from "@/lib/sql";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoyaltyTxnType = "earned" | "redeemed" | "reversed" | "expired" | "adjusted";
export type LoyaltyTxnStatus = "pending" | "credited" | "redeemed" | "reversed" | "expired" | "cancelled";

export interface LoyaltyTransaction {
  _id: string;
  userId: string;
  orderId: string | null;
  orderNumber: string | null;
  type: LoyaltyTxnType;
  status: LoyaltyTxnStatus;
  points: number;
  description: string | null;
  expiresAt: string | null;
  createdAt: string;
  creditedAt: string | null;
}

export interface LoyaltyDashboard {
  availablePoints: number;
  pendingPoints: number;
  lifetimeEarned: number;
  lifetimeRedeemed: number;
  lifetimeExpired: number;
  transactions: LoyaltyTransaction[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** 7-day replacement / return window in milliseconds */
export const REPLACEMENT_WINDOW_DAYS = 7;

// ---------------------------------------------------------------------------
// Table setup
// ---------------------------------------------------------------------------

/** Idempotently create the loyalty_transactions table if it doesn't exist. */
export async function ensureLoyaltyTable(): Promise<void> {
  const pool = await getPool();
  await pool.request().batch(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'loyalty_transactions')
    BEGIN
      CREATE TABLE loyalty_transactions (
        id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        user_id        UNIQUEIDENTIFIER NOT NULL,
        order_id       UNIQUEIDENTIFIER NULL,
        order_number   NVARCHAR(50) NULL,
        type           NVARCHAR(20) NOT NULL,
        status         NVARCHAR(20) NOT NULL DEFAULT 'pending',
        points         INT NOT NULL,
        description    NVARCHAR(500) NULL,
        expires_at     DATETIME2 NULL,
        created_at     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        credited_at    DATETIME2 NULL
      );
      CREATE INDEX idx_loyalty_user     ON loyalty_transactions(user_id);
      CREATE INDEX idx_loyalty_order    ON loyalty_transactions(order_id);
      CREATE INDEX idx_loyalty_status   ON loyalty_transactions(status);
      CREATE INDEX idx_loyalty_expires  ON loyalty_transactions(expires_at);
    END;
  `);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function bind(request: sql.Request, params: SqlParams): sql.Request {
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  return request;
}

// ---------------------------------------------------------------------------
// Read helpers
// ---------------------------------------------------------------------------

const TXN_COLUMNS = `
  id AS [_id], user_id AS userId, order_id AS orderId, order_number AS orderNumber,
  type, status, points, description, expires_at AS expiresAt,
  created_at AS createdAt, credited_at AS creditedAt`;

/**
 * Fetch the loyalty dashboard for a user: balances + recent transactions.
 */
export async function getLoyaltyDashboard(userId: string): Promise<LoyaltyDashboard> {
  // Ensure the table exists before querying
  await ensureLoyaltyTable();

  // Aggregate balances — uses same logic as getAvailableBalance so they never diverge
  const balanceRes = await query<{
    available: number;
    pending: number;
    lifetimeEarned: number;
    lifetimeRedeemed: number;
    lifetimeExpired: number;
  }>(
    `SELECT
       ISNULL(SUM(CASE
         WHEN status = 'credited' AND type IN ('earned','adjusted') THEN points
         WHEN type = 'redeemed'  THEN -ABS(points)
         WHEN type = 'reversed'  THEN -ABS(points)
         ELSE 0
       END), 0) AS available,
       ISNULL(SUM(CASE WHEN status = 'pending' AND type = 'earned' THEN points ELSE 0 END), 0) AS pending,
       ISNULL(SUM(CASE WHEN status = 'credited' AND type = 'earned' THEN points ELSE 0 END), 0) AS lifetimeEarned,
       ISNULL(SUM(CASE WHEN type = 'redeemed' THEN ABS(points) ELSE 0 END), 0) AS lifetimeRedeemed,
       ISNULL(SUM(CASE WHEN status IN ('expired','cancelled') AND type = 'earned' THEN points ELSE 0 END), 0) AS lifetimeExpired
     FROM loyalty_transactions
     WHERE user_id = @userId`,
    { userId }
  );

  const b = balanceRes.recordset[0] ?? {
    available: 0, pending: 0, lifetimeEarned: 0, lifetimeRedeemed: 0, lifetimeExpired: 0,
  };

  // Recent transactions — capped at 50
  const txnRes = await query<LoyaltyTransaction>(
    `SELECT TOP (50) ${TXN_COLUMNS}
     FROM loyalty_transactions
     WHERE user_id = @userId
     ORDER BY created_at DESC`,
    { userId }
  );

  return {
    availablePoints: b.available,
    pendingPoints: b.pending,
    lifetimeEarned: b.lifetimeEarned,
    lifetimeRedeemed: b.lifetimeRedeemed,
    lifetimeExpired: b.lifetimeExpired,
    transactions: txnRes.recordset,
  };
}

/**
 * Fetch a single loyalty transaction by ID.
 */
export async function getLoyaltyTransaction(
  txnId: string
): Promise<LoyaltyTransaction | null> {
  const res = await query<LoyaltyTransaction>(
    `SELECT ${TXN_COLUMNS} FROM loyalty_transactions WHERE id = @txnId`,
    { txnId }
  );
  return res.recordset[0] ?? null;
}

/**
 * Fetch pending loyalty transactions for a specific order.
 */
export async function getPendingTransactionsForOrder(
  orderId: string
): Promise<LoyaltyTransaction[]> {
  const res = await query<LoyaltyTransaction>(
    `SELECT ${TXN_COLUMNS}
      FROM loyalty_transactions
      WHERE order_id = @orderId AND status = 'pending'
      ORDER BY created_at`,
    { orderId }
  );
  return res.recordset;
}

/**
 * Fetch all pending loyalty transactions across all users.
 * Used by admin dashboard.
 */
export async function getAllPendingTransactions(): Promise<LoyaltyTransaction[]> {
  const res = await query<LoyaltyTransaction>(
    `SELECT ${TXN_COLUMNS}
      FROM loyalty_transactions
      WHERE status = 'pending'
      ORDER BY created_at DESC`
  );
  return res.recordset;
}

// ---------------------------------------------------------------------------
// Write helpers
// ---------------------------------------------------------------------------

/**
 * Create a pending loyalty transaction for an order.
 * Called immediately after a successful order is placed.
 */
export async function createPendingLoyaltyTransaction(input: {
  userId: string;
  orderId: string;
  orderNumber: string;
  points: number;
  description?: string;
}): Promise<LoyaltyTransaction> {
  await ensureLoyaltyTable();

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 90); // Points expire after 90 days if not credited

  const res = await query<LoyaltyTransaction>(
    `INSERT INTO loyalty_transactions
       (user_id, order_id, order_number, type, status, points, description, expires_at)
     OUTPUT ${TXN_COLUMNS}
     VALUES
       (@userId, @orderId, @orderNumber, 'earned', 'pending', @points, @description, @expiresAt)`,
    {
      userId: input.userId,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      points: input.points,
      description: input.description ?? `Points earned for order ${input.orderNumber}`,
      expiresAt: expiresAt,
    }
  );
  return res.recordset[0];
}

/**
 * Credit pending points for an order (after 7-day window expires).
 * Changes status from 'pending' to 'credited'.
 */
export async function creditPendingPoints(
  orderId: string
): Promise<LoyaltyTransaction[]> {
  return withTransaction(async (tx) => {
    // Find pending transactions
    const req1 = bind(new sql.Request(tx), { orderId });
    const pending = await req1.query<LoyaltyTransaction>(
      `SELECT ${TXN_COLUMNS}
       FROM loyalty_transactions WITH (UPDLOCK, HOLDLOCK)
       WHERE order_id = @orderId AND status = 'pending'`
    );

    if (pending.recordset.length === 0) return [];

    const creditedTxns: LoyaltyTransaction[] = [];

    for (const txn of pending.recordset) {
      const req2 = bind(new sql.Request(tx), { txnId: txn._id });
      await req2.query(
        `UPDATE loyalty_transactions
         SET status = 'credited'
         WHERE id = @txnId AND status = 'pending'`
      );
      creditedTxns.push({ ...txn, status: "credited", creditedAt: new Date().toISOString() });
    }

    return creditedTxns;
  });
}

/**
 * Mark pending transactions as cancelled (when order is cancelled before delivery).
 */
export async function cancelPendingTransactions(
  orderId: string
): Promise<void> {
  await query(
    `UPDATE loyalty_transactions
     SET status = 'cancelled'
     WHERE order_id = @orderId AND status = 'pending'`,
    { orderId }
  );
}

/**
 * Create a reversal transaction when an order is refunded after points were credited.
 * Deducts points from the user's available balance.
 */
export async function reverseCreditedPoints(input: {
  userId: string;
  orderId: string;
  orderNumber: string;
  points: number;
  description?: string;
}): Promise<LoyaltyTransaction> {
  // Store as negative so the value is unambiguous in raw queries
  const res = await query<LoyaltyTransaction>(
    `INSERT INTO loyalty_transactions
       (user_id, order_id, order_number, type, status, points, description)
     OUTPUT ${TXN_COLUMNS}
     VALUES
       (@userId, @orderId, @orderNumber, 'reversed', 'reversed', @points, @description)`,
    {
      userId: input.userId,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      points: -Math.abs(input.points),
      description: input.description ?? `Points reversed for refunded order ${input.orderNumber}`,
    }
  );
  return res.recordset[0];
}

/**
 * Create a redeemed transaction when points are used for a purchase.
 */
export async function createRedeemedTransaction(input: {
  userId: string;
  orderId: string;
  orderNumber: string;
  points: number;
  description?: string;
}): Promise<LoyaltyTransaction> {
  const res = await query<LoyaltyTransaction>(
    `INSERT INTO loyalty_transactions
       (user_id, order_id, order_number, type, status, points, description)
     OUTPUT ${TXN_COLUMNS}
     VALUES
       (@userId, @orderId, @orderNumber, 'redeemed', 'redeemed', @points, @description)`,
    {
      userId: input.userId,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      points: input.points,
      description: input.description ?? `Points redeemed for order ${input.orderNumber}`,
    }
  );
  return res.recordset[0];
}

/**
 * Get all pending transactions that are past the 7-day replacement window
 * and are eligible for automatic crediting.
 * Used by the credit-processing API endpoint.
 */
export async function getEligiblePendingTransactions(): Promise<
  Array<LoyaltyTransaction & { orderCreatedAt: string }>
> {
  const cols = TXN_COLUMNS.replace(/\n\s+/g, " ").trim();
  const aliasedCols = cols
    .split(",")
    .map((c) => `lt.${c.trim()}`)
    .join(",");

  const res = await query<LoyaltyTransaction & { orderCreatedAt: string }>(
    `SELECT ${aliasedCols}, o.created_at AS orderCreatedAt
      FROM loyalty_transactions lt
      INNER JOIN orders o ON o.id = lt.order_id
      WHERE lt.status = 'pending'
        AND lt.type = 'earned'
        AND o.status = 'delivered'
        AND o.created_at <= DATEADD(DAY, -${REPLACEMENT_WINDOW_DAYS}, SYSUTCDATETIME())
      ORDER BY o.created_at`
  );
  return res.recordset;
}

/**
 * Get the user's available (creditable) balance.
 */
export async function getAvailableBalance(userId: string): Promise<number> {
  const res = await query<{ balance: number }>(
    `SELECT ISNULL(SUM(
       CASE
         WHEN status = 'credited' AND type IN ('earned','adjusted') THEN points
         WHEN type = 'redeemed' THEN -ABS(points)
         ELSE points  -- reversed rows already stored as negative
       END
     ), 0) AS balance
     FROM loyalty_transactions
     WHERE user_id = @userId
       AND status IN ('credited','redeemed','reversed')`,
    { userId }
  );
  return Math.max(0, res.recordset[0]?.balance ?? 0);
}

/**
 * Get the user's total pending points.
 */
export async function getPendingBalance(userId: string): Promise<number> {
  const res = await query<{ pending: number }>(
    `SELECT ISNULL(SUM(points), 0) AS pending
     FROM loyalty_transactions
     WHERE user_id = @userId AND status = 'pending'`,
    { userId }
  );
  return res.recordset[0]?.pending ?? 0;
}