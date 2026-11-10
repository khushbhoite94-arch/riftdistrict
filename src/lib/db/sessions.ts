import { query, withTransaction, sql } from "@/lib/sql";

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


/**
 * Rotate a refresh session exactly once. The old token is revoked and the
 * replacement is inserted in the same transaction.
 */
export async function rotateRefreshSession(input: {
  currentTokenIdHash: string;
  userId: string;
  nextTokenIdHash: string;
  expiresAt: Date;
}): Promise<boolean> {
  return withTransaction(async (tx) => {
    const revoked = await tx
      .request()
      .input("tokenIdHash", sql.NVarChar(255), input.currentTokenIdHash)
      .input("userId", sql.UniqueIdentifier, input.userId)
      .query(
        `UPDATE refresh_sessions
         SET revoked_at = SYSUTCDATETIME()
         WHERE token_id_hash = @tokenIdHash
           AND user_id = @userId
           AND revoked_at IS NULL
           AND expires_at > SYSUTCDATETIME()`,
      );

    if ((revoked.rowsAffected[0] ?? 0) !== 1) return false;

    await tx
      .request()
      .input("userId", sql.UniqueIdentifier, input.userId)
      .input("tokenIdHash", sql.NVarChar(255), input.nextTokenIdHash)
      .input("rotatedFrom", sql.NVarChar(255), input.currentTokenIdHash)
      .input("expiresAt", sql.DateTime2, input.expiresAt)
      .query(
        `INSERT INTO refresh_sessions
           (user_id, token_id_hash, rotated_from_token_id_hash, expires_at)
         VALUES (@userId, @tokenIdHash, @rotatedFrom, @expiresAt)`
      );

    return true;
  });
}
