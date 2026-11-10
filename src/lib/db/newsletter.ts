import { query } from "@/lib/sql";

export async function isSubscribed(email: string): Promise<boolean> {
  const res = await query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM newsletter_subscriptions WHERE email = @email`,
    { email: email.toLowerCase() }
  );
  return (res.recordset[0]?.n ?? 0) > 0;
}

export async function subscribe(email: string): Promise<void> {
  await query(
    `INSERT INTO newsletter_subscriptions (email) VALUES (@email)`,
    { email: email.toLowerCase() }
  );
}
