import { defineConfig } from "drizzle-kit";
import { loadRootEnv } from "./src/load-env";

loadRootEnv();

// Untuk migrasi gunakan koneksi langsung (non-pooled) bila tersedia.
const url = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL;

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: { url: url ?? "" },
  strict: true,
  verbose: true,
});
