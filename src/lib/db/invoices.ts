import { query, withTransaction, sql, getPool, type SqlParams } from "@/lib/sql";

export type InvoiceStatus = "draft" | "issued" | "paid" | "refunded" | "cancelled";

export interface InvoiceRecord {
  _id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  status: InvoiceStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  issuedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItemRecord {
  productId: string;
  name: string;
  image?: string | null;
  price: number;
  size?: string | null;
  color?: string | null;
  quantity: number;
}

const INVOICE_COLUMNS = `
  id AS [_id], invoice_number AS invoiceNumber, order_id AS orderId, order_number AS orderNumber,
  user_id AS userId, status, subtotal, discount, shipping, total, payment_method AS paymentMethod,
  issued_at AS issuedAt, created_at AS createdAt, updated_at AS updatedAt`;

function bind(request: sql.Request, params: SqlParams): sql.Request {
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  return request;
}

export async function ensureInvoiceTable(): Promise<void> {
  const pool = await getPool();
  await pool.request().batch(`
    IF OBJECT_ID(N'dbo.invoices', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.invoices (
        id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        invoice_number NVARCHAR(50) NOT NULL UNIQUE,
        order_id UNIQUEIDENTIFIER NOT NULL,
        order_number NVARCHAR(50) NOT NULL,
        user_id UNIQUEIDENTIFIER NOT NULL,
        status NVARCHAR(20) NOT NULL DEFAULT 'issued',
        subtotal DECIMAL(10,2) NOT NULL,
        discount DECIMAL(10,2) NOT NULL DEFAULT 0,
        shipping DECIMAL(10,2) NOT NULL DEFAULT 0,
        total DECIMAL(10,2) NOT NULL,
        payment_method NVARCHAR(50) NOT NULL,
        issued_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
        updated_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
      );
      CREATE INDEX idx_invoices_user ON dbo.invoices(user_id);
      CREATE INDEX idx_invoices_order ON dbo.invoices(order_id);
      CREATE INDEX idx_invoices_status ON dbo.invoices(status);
      CREATE INDEX idx_invoices_created ON dbo.invoices(created_at);
    END;
  `);
}

export async function ensureInvoiceItemsTable(): Promise<void> {
  const pool = await getPool();
  await pool.request().batch(`
    IF OBJECT_ID(N'dbo.invoice_items', N'U') IS NULL
    BEGIN
      CREATE TABLE dbo.invoice_items (
        id UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
        invoice_id UNIQUEIDENTIFIER NOT NULL,
        product_id UNIQUEIDENTIFIER NULL,
        name NVARCHAR(255) NOT NULL,
        image NVARCHAR(MAX) NULL,
        price DECIMAL(10,2) NOT NULL,
        size NVARCHAR(50) NULL,
        color NVARCHAR(50) NULL,
        quantity INT NOT NULL DEFAULT 1
      );
      CREATE INDEX idx_invoice_items_invoice ON dbo.invoice_items(invoice_id);
    END;
  `);
}

async function loadInvoiceItems(invoiceId: string): Promise<InvoiceItemRecord[]> {
  const res = await query<InvoiceItemRecord>(
    `SELECT product_id AS productId, name, image, price, size, color, quantity
     FROM invoice_items WHERE invoice_id = @invoiceId`,
    { invoiceId }
  );
  return res.recordset.map((row) => ({
    productId: row.productId ?? "",
    name: row.name,
    image: row.image ?? null,
    price: Number(row.price),
    size: row.size ?? null,
    color: row.color ?? null,
    quantity: row.quantity,
  }));
}

function generateInvoiceNumber(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const prefix = `RD${yy}${mm}${dd}`;
  return `${prefix}${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function createInvoiceForOrder(input: {
  orderId: string;
  orderNumber: string;
  userId: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  paymentMethod: string;
  items: InvoiceItemRecord[];
}): Promise<InvoiceRecord> {
  await ensureInvoiceTable();
  await ensureInvoiceItemsTable();

  return withTransaction(async (tx) => {
    let invoiceNumber = generateInvoiceNumber();
    let exists = true;
    while (exists) {
      const res = await bind(new sql.Request(tx), { invoiceNumber }).query<{ count: number }>(
        `SELECT COUNT(1) AS count FROM invoices WHERE invoice_number = @invoiceNumber`
      );
      exists = (res.recordset[0]?.count ?? 0) > 0;
      if (exists) invoiceNumber = generateInvoiceNumber();
    }

    const inserted = await bind(new sql.Request(tx), {
      invoiceNumber,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      userId: input.userId,
      subtotal: input.subtotal,
      discount: input.discount,
      shipping: input.shipping,
      total: input.total,
      paymentMethod: input.paymentMethod,
    }).query<{ _id: string; createdAt: string; updatedAt: string }>(
      `INSERT INTO invoices
         (invoice_number, order_id, order_number, user_id, status, subtotal, discount, shipping, total, payment_method)
       OUTPUT INSERTED.id AS [_id], INSERTED.created_at AS createdAt, INSERTED.updated_at AS updatedAt
       VALUES
         (@invoiceNumber, @orderId, @orderNumber, @userId, 'issued', @subtotal, @discount, @shipping, @total, @paymentMethod)`
    );

    const invoiceId = inserted.recordset[0]._id;
    for (const item of input.items) {
      await bind(new sql.Request(tx), {
        invoiceId,
        productId: item.productId || null,
        name: item.name,
        image: item.image ?? null,
        price: item.price,
        size: item.size ?? null,
        color: item.color ?? null,
        quantity: item.quantity,
      }).query(
        `INSERT INTO invoice_items
           (invoice_id, product_id, name, image, price, size, color, quantity)
         VALUES
           (@invoiceId, @productId, @name, @image, @price, @size, @color, @quantity)`
      );
    }

    return {
      _id: invoiceId,
      invoiceNumber,
      orderId: input.orderId,
      orderNumber: input.orderNumber,
      userId: input.userId,
      status: "issued",
      subtotal: input.subtotal,
      discount: input.discount,
      shipping: input.shipping,
      total: input.total,
      paymentMethod: input.paymentMethod,
      issuedAt: new Date().toISOString(),
      createdAt: inserted.recordset[0].createdAt,
      updatedAt: inserted.recordset[0].updatedAt,
    };
  });
}

export async function getInvoiceByOrderId(orderId: string): Promise<InvoiceRecord | null> {
  await ensureInvoiceTable();
  const res = await query<InvoiceRecord>(`SELECT ${INVOICE_COLUMNS} FROM invoices WHERE order_id = @orderId`, { orderId });
  const invoice = res.recordset[0];
  if (!invoice) return null;
  return invoice;
}

export async function getInvoiceById(invoiceId: string): Promise<(InvoiceRecord & { items: InvoiceItemRecord[] }) | null> {
  await ensureInvoiceTable();
  const res = await query<InvoiceRecord>(`SELECT ${INVOICE_COLUMNS} FROM invoices WHERE id = @invoiceId`, { invoiceId });
  const invoice = res.recordset[0];
  if (!invoice) return null;
  return { ...invoice, items: await loadInvoiceItems(invoiceId) };
}

export async function listInvoicesForUser(userId: string): Promise<Array<InvoiceRecord & { items: InvoiceItemRecord[] }>> {
  await ensureInvoiceTable();
  const res = await query<InvoiceRecord>(`SELECT ${INVOICE_COLUMNS} FROM invoices WHERE user_id = @userId ORDER BY created_at DESC`, { userId });
  const invoices = [] as Array<InvoiceRecord & { items: InvoiceItemRecord[] }>;
  for (const invoice of res.recordset) {
    invoices.push({ ...invoice, items: await loadInvoiceItems(invoice._id) });
  }
  return invoices;
}

export async function updateInvoiceStatus(invoiceId: string, status: InvoiceStatus): Promise<void> {
  await ensureInvoiceTable();
  await query(`UPDATE invoices SET status = @status, updated_at = SYSUTCDATETIME() WHERE id = @invoiceId`, { invoiceId, status });
}
