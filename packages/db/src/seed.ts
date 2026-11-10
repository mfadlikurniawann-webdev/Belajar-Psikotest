/**
 * Membuat / memperbarui akun superadmin.
 * Jalankan: pnpm db:seed
 * Env: DATABASE_URL, SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME (opsional)
 */
import { createDb } from "./client";
import { loadRootEnv } from "./load-env";
import { hashPassword } from "./password";
import { users } from "./schema";

loadRootEnv();

const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;
const email = process.env.SUPERADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPERADMIN_PASSWORD;
const name = process.env.SUPERADMIN_NAME?.trim() || "Super Admin";

if (!url) throw new Error("DATABASE_URL belum diset");
if (!email || !password) throw new Error("SUPERADMIN_EMAIL dan SUPERADMIN_PASSWORD wajib diset");
if (password.length < 8) throw new Error("SUPERADMIN_PASSWORD minimal 8 karakter");

const db = createDb(url, { max: 1 });
const passwordHash = await hashPassword(password);
const now = new Date();

const [row] = await db
  .insert(users)
  .values({ name, email, passwordHash, role: "superadmin", emailVerifiedAt: now })
  .onConflictDoUpdate({
    target: users.email,
    set: { name, passwordHash, role: "superadmin", emailVerifiedAt: now, updatedAt: now },
  })
  .returning({ id: users.id, email: users.email });

console.log(`✔ Superadmin siap: ${row?.email}`);
await db.$client.end();
