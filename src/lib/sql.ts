import sql, { ConnectionPool, IResult } from "mssql";

const SQLSERVER_HOST = process.env.SQLSERVER_HOST;
if (!SQLSERVER_HOST) {
  throw new Error("SQLSERVER_HOST is missing");
}

const config: sql.config = {
  server: SQLSERVER_HOST,
  port: process.env.SQLSERVER_PORT ? Number(process.env.SQLSERVER_PORT) : 1433,
  database: process.env.SQLSERVER_DB ?? "RiftDistrict",
  user: process.env.SQLSERVER_USER,
  password: process.env.SQLSERVER_PASSWORD,
  options: {
    // Default to encrypt:false for local dev (avoids DEP0123 TLS warning with
    // IP addresses and self-signed certs). Set SQLSERVER_ENCRYPT=true in prod.
    encrypt: process.env.SQLSERVER_ENCRYPT === "true",
    trustServerCertificate: process.env.SQLSERVER_TRUST_CERT !== "false",
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

// Reuse a single pool across hot-reloads / serverless invocations.
const globalForSql = globalThis as unknown as {
  __sqlPool?: Promise<ConnectionPool>;
};

export function getPool(): Promise<ConnectionPool> {
  if (!globalForSql.__sqlPool) {
    globalForSql.__sqlPool = new ConnectionPool(config)
      .connect()
      .catch((err) => {
        // Allow a later call to retry instead of caching a rejected pool.
        globalForSql.__sqlPool = undefined;
        throw err;
      });
  }
  return globalForSql.__sqlPool;
}

export type SqlParams = Record<string, unknown>;

/**
 * Run a parameterized query. Pass named params (@name) and a params object —
 * values are bound via request.input(), never string-concatenated.
 */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: SqlParams = {}
): Promise<IResult<T>> {
  const pool = await getPool();
  const request = pool.request();
  for (const [key, value] of Object.entries(params)) {
    request.input(key, value);
  }
  return request.query<T>(text);
}

/**
 * Run several statements atomically. The callback receives a Request bound to
 * the open transaction; bind params with .input() and call .query() on it.
 */
export async function withTransaction<T>(
  fn: (tx: sql.Transaction) => Promise<T>
): Promise<T> {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();
  try {
    const result = await fn(transaction);
    await transaction.commit();
    return result;
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
}

export { sql };