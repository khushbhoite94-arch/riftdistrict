
import sql, { ConnectionPool, IResult } from "mssql";

const globalForSql = globalThis as unknown as {
  __sqlPool?: Promise<ConnectionPool>;
};

function getConfig(): sql.config {
  const host = process.env.SQLSERVER_HOST;
  const user = process.env.SQLSERVER_USER;
  const password = process.env.SQLSERVER_PASSWORD;

  if (!host || !user || !password) {
    throw new Error(
      "SQL Server is not configured. Set SQLSERVER_HOST, SQLSERVER_USER and SQLSERVER_PASSWORD in .env.local."
    );
  }

  return {
    server: host,
    port: process.env.SQLSERVER_PORT
      ? Number(process.env.SQLSERVER_PORT)
      : 1433,
    database: process.env.SQLSERVER_DB ?? "RiftDistrict",
    user,
    password,
    options: {
      encrypt: process.env.SQLSERVER_ENCRYPT === "true",
      trustServerCertificate:
        process.env.SQLSERVER_TRUST_CERT !== "false",
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000,
    },
  };
}

export function getPool(): Promise<ConnectionPool> {
  if (!globalForSql.__sqlPool) {
    globalForSql.__sqlPool = new ConnectionPool(getConfig())
      .connect()
      .catch((err) => {
        globalForSql.__sqlPool = undefined;
        throw err;
      });
  }

  return globalForSql.__sqlPool;
}

export type SqlParams = Record<string, unknown>;

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
