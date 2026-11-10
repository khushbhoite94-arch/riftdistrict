import { getPool, query, withTransaction, sql } from "@/lib/sql";
import type { ReplacementStatus, ReplacementType } from "@/types/replacement";

const REPLACEMENT_REQUESTS_TABLE_SQL = `
IF OBJECT_ID(N'replacement_requests', N'U') IS NULL
BEGIN
  CREATE TABLE replacement_requests (
    id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    request_id     NVARCHAR(50) NOT NULL UNIQUE,
    order_id       UNIQUEIDENTIFIER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    user_id        UNIQUEIDENTIFIER NOT NULL REFERENCES users(id),
    type           NVARCHAR(20) NOT NULL CHECK (type IN ('damaged','replacement')),
    status         NVARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','approved','rejected','pickup_scheduled','picked_up','out_for_delivery','delivered')),
    images         NVARCHAR(MAX) NOT NULL DEFAULT '[]' CHECK (ISJSON(images) = 1),
    description    NVARCHAR(1000) NULL,
    requested_size NVARCHAR(50) NULL,
    current_size   NVARCHAR(50) NULL,
    admin_notes    NVARCHAR(MAX) NULL,
    delivery_date  DATETIME2 NULL,
    created_at     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );
END;
`;

const REPLACEMENT_REQUESTS_INDEX_SQL = `
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_replacements_user' AND object_id = OBJECT_ID(N'replacement_requests'))
  CREATE INDEX idx_replacements_user ON replacement_requests(user_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_replacements_order' AND object_id = OBJECT_ID(N'replacement_requests'))
  CREATE INDEX idx_replacements_order ON replacement_requests(order_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_replacements_created' AND object_id = OBJECT_ID(N'replacement_requests'))
  CREATE INDEX idx_replacements_created ON replacement_requests(created_at);
`;

const REPLACEMENT_REQUESTS_TRIGGER_SQL = `
IF OBJECT_ID(N'trg_replacements_updated', N'TR') IS NULL
BEGIN
  EXEC(N'
    CREATE TRIGGER trg_replacements_updated
    ON replacement_requests
    AFTER UPDATE AS
    BEGIN
      SET NOCOUNT ON;
      UPDATE r SET updated_at = SYSUTCDATETIME()
      FROM replacement_requests r
      JOIN inserted i ON r.id = i.id;
    END;
  ');
END;
`;

export interface ReplacementRequestRecord {
  _id: string;
  requestId: string;
  orderId: string;
  userId: string;
  type: ReplacementType;
  status: ReplacementStatus;
  images: string[];
  description: string | null;
  requestedSize: string | null;
  currentSize: string | null;
  adminNotes: string | null;
  deliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  userName: string | null;
  userEmail: string | null;
  orderNumber: string | null;
}

export interface CreateReplacementInput {
  orderId: string;
  userId: string;
  type: ReplacementType;
  images: string[];
  description?: string;
  requestedSize?: string;
  currentSize?: string;
}

function parseImages(value: unknown): string[] {
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((image): image is string => typeof image === "string")
      : [];
  } catch {
    return [];
  }
}

const REPLACEMENT_CASE_SEQUENCE_SQL = `
IF NOT EXISTS (SELECT 1 FROM sys.sequences WHERE name = N'seq_replacement_case')
  CREATE SEQUENCE seq_replacement_case AS INT START WITH 1 INCREMENT BY 1;
`;

/** Format a sequence value as a RIFT DISTRICT case ID, e.g. RD-CASE-000001. */
function formatCaseId(seq: number): string {
  return `RD-CASE-${String(seq).padStart(6, "0")}`;
}

export async function ensureReplacementRequestsTable(): Promise<void> {
  const pool = await getPool();

  await pool.request().batch(REPLACEMENT_REQUESTS_TABLE_SQL);

  try {
    await pool.request().batch(REPLACEMENT_CASE_SEQUENCE_SQL);
  } catch (err) {
    console.error("Replacement case sequence bootstrap skipped:", err);
  }

  try {
    await pool.request().batch(REPLACEMENT_REQUESTS_INDEX_SQL);
  } catch (err) {
    console.error("Replacement request index bootstrap skipped:", err);
  }

  try {
    await pool.request().batch(REPLACEMENT_REQUESTS_TRIGGER_SQL);
  } catch (err) {
    console.error("Replacement request trigger bootstrap skipped:", err);
  }
}

export async function createReplacementRequest(
  input: CreateReplacementInput
): Promise<ReplacementRequestRecord> {
  await ensureReplacementRequestsTable();

  const result = await withTransaction(async (tx) => {
    // Sequential case ID: RD-CASE-000001, RD-CASE-000002, ...
    const seqRes = await tx
      .request()
      .query<{ seq: number }>(`SELECT NEXT VALUE FOR seq_replacement_case AS seq`);
    const caseId = formatCaseId(seqRes.recordset[0].seq);

    const request = tx.request();
    request.input("requestId", caseId);
    request.input("orderId", input.orderId);
    request.input("userId", input.userId);
    request.input("type", input.type);
    request.input("status", "pending");
    request.input("images", sql.NVarChar(sql.MAX), JSON.stringify(input.images));
    request.input("description", input.description ?? null);
    request.input("requestedSize", input.requestedSize ?? null);
    request.input("currentSize", input.currentSize ?? null);
    request.input("adminNotes", null);
    request.input("deliveryDate", null);

    const inserted = await request.query<{ _id: string; createdAt: string }>(
      `INSERT INTO replacement_requests 
         (request_id, order_id, user_id, type, status, images, description, requested_size, current_size, admin_notes, delivery_date)
       OUTPUT INSERTED.id AS [_id], INSERTED.created_at AS createdAt
       VALUES 
         (@requestId, @orderId, @userId, @type, @status, @images, @description, @requestedSize, @currentSize, @adminNotes, @deliveryDate)`
    );

    const rowId = inserted.recordset[0]._id;
    const createdAt = inserted.recordset[0].createdAt;

    const fetch = await tx
      .request()
      .input("_id", rowId)
      .query<ReplacementRequestRecord>(
        `SELECT id AS [_id], request_id AS requestId, order_id AS orderId, user_id AS userId,
                type, status, images, description, requested_size AS requestedSize,
                current_size AS currentSize, admin_notes AS adminNotes, delivery_date AS deliveryDate,
                created_at AS createdAt, updated_at AS updatedAt
         FROM replacement_requests WHERE id = @_id`
      );

    const row = fetch.recordset[0];
    return {
      ...row,
      images: parseImages(row.images),
      userName: null,
      userEmail: null,
      orderNumber: null,
    };
  });

  return result;
}

export async function getReplacementByRequestId(requestId: string): Promise<ReplacementRequestRecord | null> {
  await ensureReplacementRequestsTable();

  const res = await query<ReplacementRequestRecord & { images: string }>(
    `SELECT r.id AS [_id], r.request_id AS requestId, r.order_id AS orderId, r.user_id AS userId,
            r.type, r.status, r.images, r.description, r.requested_size AS requestedSize,
            r.current_size AS currentSize, r.admin_notes AS adminNotes, r.delivery_date AS deliveryDate,
            r.created_at AS createdAt, r.updated_at AS updatedAt,
            u.name AS userName, u.email AS userEmail, o.order_number AS orderNumber
     FROM replacement_requests r
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN orders o ON o.id = r.order_id
     WHERE r.request_id = @requestId`,
    { requestId }
  );
  const row = res.recordset[0];
  if (!row) return null;
  return {
    ...row,
    images: parseImages(row.images),
  };
}

export async function getReplacementById(id: string): Promise<ReplacementRequestRecord | null> {
  await ensureReplacementRequestsTable();

  const res = await query<ReplacementRequestRecord & { images: string }>(
    `SELECT r.id AS [_id], r.request_id AS requestId, r.order_id AS orderId, r.user_id AS userId,
            r.type, r.status, r.images, r.description, r.requested_size AS requestedSize,
            r.current_size AS currentSize, r.admin_notes AS adminNotes, r.delivery_date AS deliveryDate,
            r.created_at AS createdAt, r.updated_at AS updatedAt,
            u.name AS userName, u.email AS userEmail, o.order_number AS orderNumber
     FROM replacement_requests r
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN orders o ON o.id = r.order_id
     WHERE r.id = @id`,
    { id }
  );
  const row = res.recordset[0];
  if (!row) return null;
  return {
    ...row,
    images: parseImages(row.images),
  };
}

export async function getReplacementsByUser(userId: string): Promise<ReplacementRequestRecord[]> {
  await ensureReplacementRequestsTable();

  const res = await query<ReplacementRequestRecord & { images: string }>(
    `SELECT id AS [_id], request_id AS requestId, order_id AS orderId, user_id AS userId,
            type, status, images, description, requested_size AS requestedSize,
            current_size AS currentSize, admin_notes AS adminNotes, delivery_date AS deliveryDate,
            created_at AS createdAt, updated_at AS updatedAt
     FROM replacement_requests
     WHERE user_id = @userId
     ORDER BY created_at DESC`,
    { userId }
  );
  return res.recordset.map((r) => ({
    ...r,
    images: parseImages(r.images),
    userName: null,
    userEmail: null,
    orderNumber: null,
  }));
}

export async function hasActiveReplacementForOrder(orderId: string, userId: string): Promise<boolean> {
  await ensureReplacementRequestsTable();

  const res = await query<{ active: number }>(
    `SELECT TOP 1 1 AS active
     FROM replacement_requests
     WHERE order_id = @orderId AND user_id = @userId
       AND status IN ('pending', 'approved', 'pickup_scheduled', 'picked_up', 'out_for_delivery')`,
    { orderId, userId }
  );

  return res.recordset.length > 0;
}

export async function getActiveReplacementForOrder(orderId: string, userId: string): Promise<ReplacementRequestRecord | null> {
  await ensureReplacementRequestsTable();

  const res = await query<ReplacementRequestRecord & { images: string }>(
    `SELECT id AS [_id], request_id AS requestId, order_id AS orderId, user_id AS userId,
            type, status, images, description, requested_size AS requestedSize,
            current_size AS currentSize, admin_notes AS adminNotes, delivery_date AS deliveryDate,
            created_at AS createdAt, updated_at AS updatedAt
     FROM replacement_requests
     WHERE order_id = @orderId AND user_id = @userId AND status IN ('pending', 'approved', 'pickup_scheduled', 'picked_up', 'out_for_delivery')
     ORDER BY created_at DESC`,
    { orderId, userId }
  );
  const row = res.recordset[0];
  if (!row) return null;
  return {
    ...row,
    images: parseImages(row.images),
  };
}

export async function listAllReplacements(): Promise<ReplacementRequestRecord[]> {
  await ensureReplacementRequestsTable();

  const res = await query<ReplacementRequestRecord & { images: string }>(
    `SELECT r.id AS [_id], r.request_id AS requestId, r.order_id AS orderId, r.user_id AS userId,
            r.type, r.status, r.images, r.description, r.requested_size AS requestedSize,
            r.current_size AS currentSize, r.admin_notes AS adminNotes, r.delivery_date AS deliveryDate,
            r.created_at AS createdAt, r.updated_at AS updatedAt,
            u.name AS userName, u.email AS userEmail, o.order_number AS orderNumber
     FROM replacement_requests r
     LEFT JOIN users u ON u.id = r.user_id
     LEFT JOIN orders o ON o.id = r.order_id
     ORDER BY r.created_at DESC`
  );
  return res.recordset.map((r) => ({
    ...r,
    images: parseImages(r.images),
  }));
}

export async function updateReplacementStatus(
  id: string,
  status: ReplacementStatus,
  adminNotes?: string,
  deliveryDate?: string
): Promise<ReplacementRequestRecord | null> {
  await ensureReplacementRequestsTable();

  const sets: string[] = ["status = @status"];
  const params: Record<string, unknown> = { id, status };

  if (adminNotes !== undefined) {
    sets.push("admin_notes = @adminNotes");
    params.adminNotes = adminNotes;
  }
  if (deliveryDate !== undefined) {
    sets.push("delivery_date = @deliveryDate");
    params.deliveryDate = deliveryDate;
  }

  await query(
    `UPDATE replacement_requests SET ${sets.join(", ")}, updated_at = GETDATE() WHERE id = @id`,
    params
  );

  return getReplacementById(id);
}

export async function updateReplacementNotes(id: string, adminNotes: string): Promise<void> {
  await ensureReplacementRequestsTable();

  await query(
    `UPDATE replacement_requests SET admin_notes = @adminNotes, updated_at = GETDATE() WHERE id = @id`,
    { id, adminNotes }
  );
}