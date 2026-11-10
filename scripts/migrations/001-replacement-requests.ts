import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const migrationSql = `
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

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_replacements_user' AND object_id = OBJECT_ID(N'replacement_requests'))
  CREATE INDEX idx_replacements_user ON replacement_requests(user_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_replacements_order' AND object_id = OBJECT_ID(N'replacement_requests'))
  CREATE INDEX idx_replacements_order ON replacement_requests(order_id);

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = N'idx_replacements_created' AND object_id = OBJECT_ID(N'replacement_requests'))
  CREATE INDEX idx_replacements_created ON replacement_requests(created_at);

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

async function main() {
  const { getPool } = await import("../../src/lib/sql");
  const pool = await getPool();

  try {
    await pool.request().batch(migrationSql);
    console.log("replacement_requests migration completed.");
  } finally {
    await pool.close();
  }
}

main().catch((err) => {
  console.error("replacement_requests migration failed:", err);
  process.exit(1);
});
