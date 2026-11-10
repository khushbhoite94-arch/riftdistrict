import { query, withTransaction, sql, getPool } from "@/lib/sql";

export interface PublicUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  address: string | null;
}

export interface AuthUserRow extends PublicUser {
  password: string;
}

export interface AddressRow {
  label: string | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string | null;
  phone: string | null;
  isDefault: boolean;
}

export interface UserProfile extends PublicUser {
  createdAt: Date;
  updatedAt: Date;
  addresses: AddressRow[];
  wishlist: string[];
}

const PUBLIC_COLUMNS =
  "id AS [_id], name, email, role, phone, [address]";

export async function findUserByEmail(
  email: string
): Promise<AuthUserRow | null> {
  const res = await query<AuthUserRow>(
    `SELECT TOP 1 ${PUBLIC_COLUMNS}, password FROM users WHERE email = @email`,
    { email }
  );
  return res.recordset[0] ?? null;
}

// --- Email verification & password-reset OTP support -----------------

/**
 * Idempotently add the auth columns the email system needs:
 *   is_verified, otp_hash, otp_expiry, reset_otp_hash, reset_otp_expiry.
 *
 * On first creation of is_verified, existing accounts are backfilled to
 * verified so they are never locked out by the new gating (only NEW signups
 * start unverified).
 */
export async function ensureUserAuthColumns(): Promise<void> {
  const pool = await getPool();
  await pool.request().batch(`
    IF COL_LENGTH('users','is_verified') IS NULL
    BEGIN
      ALTER TABLE users ADD is_verified BIT NOT NULL CONSTRAINT DF_users_is_verified DEFAULT 0;
      EXEC('UPDATE users SET is_verified = 1');
    END;
    IF COL_LENGTH('users','otp_hash') IS NULL ALTER TABLE users ADD otp_hash NVARCHAR(255) NULL;
    IF COL_LENGTH('users','otp_expiry') IS NULL ALTER TABLE users ADD otp_expiry DATETIME2 NULL;
    IF COL_LENGTH('users','reset_otp_hash') IS NULL ALTER TABLE users ADD reset_otp_hash NVARCHAR(255) NULL;
    IF COL_LENGTH('users','reset_otp_expiry') IS NULL ALTER TABLE users ADD reset_otp_expiry DATETIME2 NULL;
    IF COL_LENGTH('users','otp_attempts') IS NULL ALTER TABLE users ADD otp_attempts INT NOT NULL CONSTRAINT DF_users_otp_attempts DEFAULT 0;
    IF COL_LENGTH('users','otp_locked_until') IS NULL ALTER TABLE users ADD otp_locked_until DATETIME2 NULL;
  `);
}

export interface AuthAccount {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  isVerified: boolean;
  otpHash: string | null;
  otpExpiry: Date | null;
  otpAttempts: number;
  otpLockedUntil: Date | null;
  resetOtpHash: string | null;
  resetOtpExpiry: Date | null;
}

/** Fetch the full auth record (incl. verification + OTP state) by email. */
export async function getAuthByEmail(email: string): Promise<AuthAccount | null> {
  await ensureUserAuthColumns();
  const res = await query<AuthAccount>(
    `SELECT TOP 1 id AS [_id], name, email, password, role,
            is_verified AS isVerified,
            otp_hash AS otpHash, otp_expiry AS otpExpiry,
            otp_attempts AS otpAttempts, otp_locked_until AS otpLockedUntil,
            reset_otp_hash AS resetOtpHash, reset_otp_expiry AS resetOtpExpiry
     FROM users WHERE email = @email`,
    { email }
  );
  return res.recordset[0] ?? null;
}

/** Light contact lookup for transactional emails. */
export async function getUserContactById(
  id: string
): Promise<{ name: string; email: string } | null> {
  const res = await query<{ name: string; email: string }>(
    `SELECT TOP 1 name, email FROM users WHERE id = @id`,
    { id }
  );
  return res.recordset[0] ?? null;
}

/** Store a freshly issued signup-verification OTP (hashed) + expiry. */
export async function setUserOtp(
  userId: string,
  otpHash: string,
  expiry: Date
): Promise<void> {
  await ensureUserAuthColumns();
  await query(
    `UPDATE users
     SET otp_hash = @otpHash, otp_expiry = @expiry,
         otp_attempts = 0, otp_locked_until = NULL
     WHERE id = @userId`,
    { userId, otpHash, expiry }
  );
}


/** Atomically record a failed verification attempt and lock after five failures. */
export async function recordOtpFailure(
  userId: string
): Promise<{ attempts: number; lockedUntil: Date | null }> {
  await ensureUserAuthColumns();
  const res = await query<{ attempts: number; lockedUntil: Date | null }>(
    `UPDATE users
     SET otp_attempts = otp_attempts + 1,
         otp_locked_until = CASE
           WHEN otp_attempts + 1 >= 5 THEN DATEADD(MINUTE, 15, SYSUTCDATETIME())
           ELSE otp_locked_until
         END,
         otp_hash = CASE WHEN otp_attempts + 1 >= 5 THEN NULL ELSE otp_hash END,
         otp_expiry = CASE WHEN otp_attempts + 1 >= 5 THEN NULL ELSE otp_expiry END
     OUTPUT INSERTED.otp_attempts AS attempts,
            INSERTED.otp_locked_until AS lockedUntil
     WHERE id = @userId AND is_verified = 0`,
    { userId }
  );
  return res.recordset[0] ?? { attempts: 5, lockedUntil: null };
}

/** Mark an account verified and clear its verification OTP. */
export async function markUserVerified(userId: string): Promise<void> {
  await ensureUserAuthColumns();
  await query(
    `UPDATE users
     SET is_verified = 1, otp_hash = NULL, otp_expiry = NULL,
         otp_attempts = 0, otp_locked_until = NULL
     WHERE id = @userId`,
    { userId }
  );
}

/** Store a freshly issued password-reset OTP (hashed) + expiry. */
export async function setUserResetOtp(
  userId: string,
  otpHash: string,
  expiry: Date
): Promise<void> {
  await ensureUserAuthColumns();
  await query(
    `UPDATE users SET reset_otp_hash = @otpHash, reset_otp_expiry = @expiry WHERE id = @userId`,
    { userId, otpHash, expiry }
  );
}

/** Replace the password and clear the reset OTP. */
export async function updateUserPassword(
  userId: string,
  passwordHash: string
): Promise<void> {
  await ensureUserAuthColumns();
  await query(
    `UPDATE users SET password = @passwordHash, reset_otp_hash = NULL, reset_otp_expiry = NULL WHERE id = @userId`,
    { userId, passwordHash }
  );
}

export async function emailExists(email: string): Promise<boolean> {
  const res = await query<{ n: number }>(
    `SELECT COUNT(*) AS n FROM users WHERE email = @email`,
    { email }
  );
  return (res.recordset[0]?.n ?? 0) > 0;
}

export async function createUser(input: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<PublicUser> {
  const res = await query<PublicUser>(
    `INSERT INTO users (name, email, password, role)
     OUTPUT INSERTED.id AS [_id], INSERTED.name, INSERTED.email,
            INSERTED.role, INSERTED.phone, INSERTED.[address]
     VALUES (@name, @email, @password, @role)`,
    {
      name: input.name,
      email: input.email,
      password: input.password,
      role: input.role ?? "user",
    }
  );
  return res.recordset[0];
}

export async function listCustomers(): Promise<
  (PublicUser & { createdAt: Date })[]
> {
  const res = await query<PublicUser & { createdAt: Date }>(
    `SELECT ${PUBLIC_COLUMNS}, created_at AS createdAt
     FROM users WHERE role = 'user'
     ORDER BY created_at DESC`
  );
  return res.recordset;
}

export async function getUserNameById(id: string): Promise<string | null> {
  const res = await query<{ name: string }>(
    `SELECT TOP 1 name FROM users WHERE id = @id`,
    { id }
  );
  return res.recordset[0]?.name ?? null;
}

export async function getUserProfile(id: string): Promise<UserProfile | null> {
  const userRes = await query<
    PublicUser & { createdAt: Date; updatedAt: Date }
  >(
    `SELECT TOP 1 ${PUBLIC_COLUMNS},
            created_at AS createdAt, updated_at AS updatedAt
     FROM users WHERE id = @id`,
    { id }
  );
  const user = userRes.recordset[0];
  if (!user) return null;

  const addrRes = await query<AddressRow>(
    `SELECT label, street, city, [state], zip, country, phone,
            is_default AS isDefault
     FROM user_addresses WHERE user_id = @id`,
    { id }
  );

  const wishRes = await query<{ productId: string }>(
    `SELECT product_id AS productId
     FROM wishlist_items WHERE user_id = @id`,
    { id }
  );

  return {
    ...user,
    addresses: addrRes.recordset,
    wishlist: wishRes.recordset.map((r) => r.productId),
  };
}

export async function updateUserProfile(
  id: string,
  updates: {
    name?: string;
    phone?: string;
    address?: string;
    addresses?: AddressRow[];
  }
): Promise<UserProfile | null> {
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };
  if (typeof updates.name === "string") {
    sets.push("name = @name");
    params.name = updates.name;
  }
  if (typeof updates.phone === "string") {
    sets.push("phone = @phone");
    params.phone = updates.phone;
  }
  if (typeof updates.address === "string") {
    sets.push("[address] = @address");
    params.address = updates.address;
  }

  if (sets.length > 0) {
    await query(`UPDATE users SET ${sets.join(", ")} WHERE id = @id`, params);
  }

  if (Array.isArray(updates.addresses)) {
    const addresses = updates.addresses;
    await withTransaction(async (tx) => {
      await tx
        .request()
        .input("id", id)
        .query("DELETE FROM user_addresses WHERE user_id = @id");
      for (const a of addresses) {
        await tx
          .request()
          .input("userId", id)
          .input("label", a.label ?? null)
          .input("street", a.street ?? null)
          .input("city", a.city ?? null)
          .input("state", a.state ?? null)
          .input("zip", a.zip ?? null)
          .input("country", a.country ?? null)
          .input("phone", a.phone ?? null)
          .input("isDefault", a.isDefault ?? false)
          .query(
            `INSERT INTO user_addresses
               (user_id, label, street, city, [state], zip, country, phone, is_default)
             VALUES (@userId, @label, @street, @city, @state, @zip, @country, @phone, @isDefault)`
          );
      }
    });
  }

  return getUserProfile(id);
}

export { sql };
