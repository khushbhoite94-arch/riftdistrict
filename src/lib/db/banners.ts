import { query } from "@/lib/sql";

export interface IBanner {
  _id: string;
  image: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const BANNER_COLUMNS = `
  id AS [_id], image, active,
  created_at AS createdAt, updated_at AS updatedAt`;

export async function getActiveBanners(): Promise<IBanner[]> {
  const res = await query<IBanner>(
    `SELECT ${BANNER_COLUMNS}
     FROM banners
     WHERE active = 1
     ORDER BY created_at DESC`
  );
  return res.recordset;
}

export async function listAllBanners(): Promise<IBanner[]> {
  const res = await query<IBanner>(
    `SELECT ${BANNER_COLUMNS} FROM banners ORDER BY created_at DESC`
  );
  return res.recordset;
}

export async function createBanner(input: {
  image: string;
  active?: boolean;
}): Promise<IBanner> {
  const res = await query<{ id: string }>(
    `INSERT INTO banners (image, active)
     OUTPUT INSERTED.id AS id
     VALUES (@image, @active)`,
    { image: input.image, active: input.active ?? true }
  );
  const created = await query<IBanner>(
    `SELECT ${BANNER_COLUMNS} FROM banners WHERE id = @id`,
    { id: res.recordset[0].id }
  );
  return created.recordset[0];
}

export async function updateBanner(
  id: string,
  updates: { image?: string; active?: boolean }
): Promise<IBanner | null> {
  const sets: string[] = [];
  const params: Record<string, unknown> = { id };
  if (typeof updates.image === "string") {
    sets.push("image = @image");
    params.image = updates.image;
  }
  if (typeof updates.active === "boolean") {
    sets.push("active = @active");
    params.active = updates.active;
  }
  if (sets.length > 0) {
    await query(`UPDATE banners SET ${sets.join(", ")} WHERE id = @id`, params);
  }
  const res = await query<IBanner>(
    `SELECT ${BANNER_COLUMNS} FROM banners WHERE id = @id`,
    { id }
  );
  return res.recordset[0] ?? null;
}

export async function deleteBanner(id: string): Promise<void> {
  await query(`DELETE FROM banners WHERE id = @id`, { id });
}
