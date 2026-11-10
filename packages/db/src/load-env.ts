import { existsSync } from "node:fs";
import { dirname, join } from "node:path";

/**
 * Memuat .env terdekat (mencari ke atas dari cwd, maks. 3 level) untuk drizzle-kit & seed
 * saat development lokal. Di CI/Vercel variabel sudah diset lewat environment.
 */
export function loadRootEnv() {
  let dir = process.cwd();
  for (let i = 0; i < 4; i++) {
    const file = join(dir, ".env");
    if (existsSync(file)) {
      process.loadEnvFile(file);
      return;
    }
    dir = dirname(dir);
  }
}
