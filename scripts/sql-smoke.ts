import * as dotenv from "dotenv";
import path from "path";

// .env.local takes precedence over .env (loaded first wins in dotenv).
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const { query, getPool } = await import("../src/lib/sql");

  const ping = await query<{ ok: number }>("SELECT 1 AS ok");
  console.log("SELECT 1 =>", ping.recordset[0]?.ok);

  const tables = await query<{ name: string }>(
    "SELECT name FROM sys.tables ORDER BY name"
  );
  console.log(`tables (${tables.recordset.length}):`, tables.recordset.map((t) => t.name).join(", "));

  const products = await query<{ n: number }>("SELECT COUNT(*) AS n FROM products");
  console.log("products count =>", products.recordset[0]?.n);

  const pool = await getPool();
  await pool.close();
}

main().catch((err) => {
  console.error("SQL smoke test failed:", err);
  process.exit(1);
});
