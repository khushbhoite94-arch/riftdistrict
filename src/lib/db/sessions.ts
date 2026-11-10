import { query } from "@/lib/sql";

export async function createRefreshSession(input: {
  userId: string;
  tokenIdHash: string;
  expiresAt: Date;
  rotatedFromTokenIdHash?: string;
}): Promise<void> {
  await query(
    `INSERT INTO refresh_sessions
       (user_id, token_id_hash, rotated_from_token_id_hash, expires_at)
     VALUES (@userId, @tokenIdHash, @rotatedFrom, @expiresAt)`,
    {
      userId: input.userId,
      tokenIdHash: input.tokenIdHash,
      rotatedFrom: input.rotatedFromTokenIdHash ?? null,
      expiresAt: input.expiresAt,
    }
  );
}

export async function revokeRefreshSession(tokenIdHash: string): Promise<void> {
  await query(
    `UPDATE refresh_sessions SET revoked_at = SYSUTCDATETIME()
     WHERE token_id_hash = @tokenIdHash AND revoked_at IS NULL`,
    { tokenIdHash }
  );
}
