import "server-only";
import { createDb, type Database } from "@psikotest/db";
import { env } from "./env";

const globalForDb = globalThis as unknown as { __psikotestDb?: Database };

function getDb(): Database {
  // Disimpan di globalThis supaya HMR saat development tidak membuat koneksi baru terus-menerus.
  globalForDb.__psikotestDb ??= createDb(env().DATABASE_URL);
  return globalForDb.__psikotestDb;
}

/** Instance Drizzle yang dibuat lazy saat query pertama. */
export const db = new Proxy({} as Database, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
