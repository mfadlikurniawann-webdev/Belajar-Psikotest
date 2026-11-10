import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export interface CreateDbOptions {
  /** Jumlah koneksi maksimum per instance. Kecil saja karena di serverless + pooler. */
  max?: number;
}

/**
 * Membuat koneksi Drizzle + postgres.js.
 * Kompatibel dengan Neon (pooled URL, "-pooler") maupun Supabase (Transaction pooler, port 6543).
 * `prepare: false` wajib untuk pooler mode transaction (PgBouncer/Supavisor).
 */
export function createDb(url: string, { max = 5 }: CreateDbOptions = {}) {
  const client = postgres(url, {
    max,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
  });
  return drizzle(client, { schema, casing: "snake_case" });
}

export type Database = ReturnType<typeof createDb>;
