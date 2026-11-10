import * as dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function main() {
  const { getPool } = await import("../src/lib/sql");

  const schemaPath = path.resolve(process.cwd(), "schema.sql");
  const raw = fs.readFileSync(schemaPath, "utf8");

  // Split on standalone GO batch separators (client-side directive, not T-SQL).
  const batches = raw
    .split(/^\s*GO\s*$/im)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  const pool = await getPool();
  console.log(`Applying ${batches.length} batches from schema.sql...`);

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];
    const label = batch.split("\n")[0].slice(0, 60);
    try {
      // .batch() (not .query()) so DDL like CREATE TRIGGER — which must be the
      // first statement in its batch — executes correctly.
      await pool.request().batch(batch);
      console.log(`  [${i + 1}/${batches.length}] ok: ${label}`);
    } catch (err) {
      console.error(`  [${i + 1}/${batches.length}] FAILED: ${label}`);
      throw err;
    }
  }

  console.log("Schema applied successfully.");
  await pool.close();
}

main().catch((err) => {
  console.error("Schema setup failed:", err);
  process.exit(1);
});
