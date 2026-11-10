# Belajar Psikotest

Aplikasi latihan psikotes online. Peserta mendaftar, memilih psikotes dari dashboard, mengerjakannya dengan batas waktu, dan **baru bisa melihat hasil setelah semua tes selesai**. Superadmin dapat memantau progres, melihat hasil serta jawaban per soal setiap peserta, mereset tes, dan mengekspor CSV.

| Tes                                   | Jenis                          | Soal | Waktu  |
| ------------------------------------- | ------------------------------ | ---- | ------ |
| Tes Kepribadian (Big Five, Mini-IPIP) | Skala Likert, 5 dimensi        | 20   | 10 mnt |
| Tes Kemampuan Numerik                 | Deret angka + aritmetika       | 20   | 15 mnt |
| Tes Kemampuan Verbal                  | Sinonim, antonim, analogi      | 20   | 12 mnt |
| Tes Penalaran Logis                   | Silogisme + analitis           | 15   | 12 mnt |
| Tes Ketelitian                        | Bandingkan data (sama/berbeda) | 25   | 4 mnt  |

## Stack

- **Monorepo**: pnpm workspaces + Turborepo
- **App**: Next.js 16 (App Router, Server Components, Server Actions), React 19, Tailwind CSS 4
- **Database**: PostgreSQL ([Neon](https://neon.tech) atau [Supabase](https://supabase.com)) + Drizzle ORM
- **Email**: [Resend](https://resend.com)
- **Auth**: sesi berbasis cookie (httpOnly, token di-hash SHA-256 di DB), password scrypt, rate limit di Postgres
- **Kualitas**: Biome (lint + format), Vitest, TypeScript strict
- **CI/CD**: GitHub Actions → Vercel (preview per PR, production dari `main`)

```
apps/
  web/                 Next.js app (UI, server actions, auth)
packages/
  core/                Definisi soal + penilaian (TypeScript murni, ada unit test)
  db/                  Schema Drizzle, migrasi SQL, seed superadmin
  email/               Klien Resend + template email
  tsconfig/            Konfigurasi TypeScript bersama
.github/workflows/     Pipeline CI/CD
```

## Kenapa cepat

- **Server Components**: hampir semua halaman dirender di server; JavaScript di browser hanya untuk form dan runner tes.
- **Kunci jawaban tidak pernah dikirim ke browser**; penilaian dihitung di server (juga mencegah kecurangan).
- **Proxy tanpa query DB**: proteksi route hanya memeriksa cookie; validasi sesi 1 query per request (di-cache per request).
- **Landing page statis** (dirender saat build, disajikan dari CDN).
- **Autosave dengan debounce** + email dikirim lewat `after()` setelah response, sehingga pengguna tidak menunggu.
- **Region Vercel `sin1` (Singapura)**: pilih region database yang sama (Neon `ap-southeast-1` / Supabase Singapore) agar latensi query ~1-2 ms.
- Agregasi statistik admin dihitung di SQL (bukan di JavaScript) dan memakai index.

## Menjalankan secara lokal

Prasyarat: Node.js 22+ (disarankan 24) dan pnpm 10 (`npm i -g pnpm@10`).

```bash
pnpm install
cp .env.example .env          # isi DATABASE_URL & akun superadmin
pnpm db:migrate               # buat tabel
pnpm db:seed                  # buat/update akun superadmin
pnpm dev                      # http://localhost:3000
```

Tanpa `RESEND_API_KEY`, email (verifikasi, reset password, notifikasi) **dicetak ke terminal**, sehingga semua alur tetap bisa dicoba.

Perintah lain:

| Perintah                      | Fungsi                                                         |
| ----------------------------- | -------------------------------------------------------------- |
| `pnpm lint` / `pnpm lint:fix` | Cek / perbaiki lint & format (Biome)                           |
| `pnpm typecheck`              | Cek TypeScript semua package                                   |
| `pnpm test`                   | Unit test (penilaian, template email, keamanan)                |
| `pnpm build`                  | Build production                                               |
| `pnpm db:generate`            | Buat file migrasi setelah mengubah `packages/db/src/schema.ts` |
| `pnpm db:studio`              | Buka Drizzle Studio                                            |

## Setup layanan

### 1. Database: Neon atau Supabase

Pilih salah satu; kodenya sama (driver `postgres.js`, `prepare: false` agar aman dengan pooler).

- **Neon**: buat project di region **AWS Asia Pacific (Singapore)**. Salin connection string **Pooled** ke `DATABASE_URL`, dan yang non-pooled ke `DIRECT_DATABASE_URL`. Untuk preview PR, Anda bisa membuat branch Neon dan memakai URL-nya sebagai `PREVIEW_DATABASE_URL`.
- **Supabase**: buat project di region **Southeast Asia (Singapore)**. Pakai **Transaction pooler** (port 6543) untuk `DATABASE_URL`, dan **Session pooler** (port 5432) untuk `DIRECT_DATABASE_URL`.

### 2. Resend

1. Verifikasi domain Anda di Resend (mis. `mail.domainanda.id`).
2. Buat API key lalu isi `RESEND_API_KEY`.
3. Isi `EMAIL_FROM`, mis. `Belajar Psikotest <noreply@mail.domainanda.id>`.

> `onboarding@resend.dev` hanya bisa mengirim ke email pemilik akun Resend. Untuk peserta sungguhan, domain wajib diverifikasi.

### 3. Vercel

1. Import repo ini di Vercel, set **Root Directory = `apps/web`** (framework terdeteksi otomatis sebagai Next.js).
2. Isi Environment Variables (Production & Preview): `DATABASE_URL`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_NOTIFY_EMAIL`, `REQUIRE_EMAIL_VERIFICATION`, dan opsional `APP_URL` (domain custom).
3. Deploy otomatis dari integrasi Git Vercel **dimatikan** (`apps/web/vercel.json` → `git.deploymentEnabled: false`), karena deploy dilakukan oleh GitHub Actions setelah semua cek lulus.

### 4. GitHub Actions (CI/CD)

Tambahkan secrets di **Settings → Secrets and variables → Actions**:

| Secret                               | Keterangan                                                                     |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| `VERCEL_TOKEN`                       | Buat di vercel.com/account/tokens                                              |
| `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` | Dari `.vercel/project.json` setelah menjalankan `npx vercel link` di root repo |
| `DATABASE_URL`                       | Database production (untuk migrasi)                                            |
| `DIRECT_DATABASE_URL`                | Opsional, koneksi non-pooled untuk migrasi                                     |
| `PREVIEW_DATABASE_URL`               | Opsional, database/branch untuk preview PR                                     |

Alur pipeline (`.github/workflows/ci-cd.yml`):

1. **CI** (setiap PR & push): install → lint → typecheck → unit test → build → cek file migrasi sinkron dengan schema → uji migrasi + seed pada Postgres sungguhan.
2. **Deploy Preview** (PR): migrasi DB preview (bila diset) → `vercel build` → deploy → URL dikomentari di PR.
3. **Deploy Production** (push ke `main`): migrasi DB production → `vercel build --prod` → deploy.

Setelah deploy pertama, jalankan seed superadmin sekali dari komputer Anda dengan `DATABASE_URL` production:

```bash
DATABASE_URL="postgres://..." SUPERADMIN_EMAIL="admin@domain.id" SUPERADMIN_PASSWORD="..." pnpm db:seed
```

## Alur aplikasi

**Peserta**

1. Daftar → otomatis login → email verifikasi dikirim (wajib/tidaknya diatur oleh `REQUIRE_EMAIL_VERIFICATION`).
2. Dashboard menampilkan 5 psikotes beserta statusnya (belum / sedang / selesai). Setiap tes hanya bisa dikerjakan **satu kali**.
3. Saat mengerjakan: timer sinkron dengan jam server, jawaban tersimpan otomatis, bisa dilanjutkan bila koneksi/halaman terputus, pintasan keyboard (A-D / 1-5, ← →), dan dikumpulkan otomatis saat waktu habis.
4. Halaman **Hasil** terkunci sampai seluruh tes selesai. Setelah itu tampil ringkasan, skor per bagian, dan profil kepribadian (bisa dicetak/simpan PDF). Email "hasil tersedia" dikirim ke peserta dan notifikasi ke superadmin.

**Superadmin** (`/admin`)

- Ringkasan: jumlah peserta, yang sudah selesai semua, tes yang sedang berjalan, statistik per tes, aktivitas terbaru.
- Daftar peserta: pencarian, filter status, paginasi.
- Detail peserta: hasil setiap tes (kapan pun, tidak menunggu semua selesai), durasi, tanda "dikumpulkan otomatis", **jawaban per soal vs kunci**, dan tombol **Reset tes** agar peserta dapat mengulang.
- **Ekspor CSV** seluruh hasil.

Tes yang ditinggalkan dan melewati batas waktu otomatis diselesaikan dengan jawaban terakhir yang tersimpan, saat peserta/admin membuka halaman berikutnya (tanpa cron).

## Menambah atau mengubah soal

Soal ada di `packages/core/src/tests/*.ts`, didaftarkan di `packages/core/src/catalog.ts`. Urutan opsi diacak secara deterministik dan kunci jawaban dihitung otomatis dari `correct`, jadi cukup tulis:

```ts
choice({ id: "n21", section: "Deret Angka", prompt: "5, 10, 20, …", correct: "40", distractors: ["30", "35", "45"] });
```

> Jangan mengubah `id` soal atau teks opsi yang sudah dipakai peserta, karena jawaban tersimpan berdasarkan id tersebut. Untuk revisi besar, buat tes dengan `slug` baru. Jalankan `pnpm test` setelah mengubah soal.

## Keamanan

- Password di-hash dengan scrypt; token sesi, verifikasi, dan reset password hanya disimpan dalam bentuk hash SHA-256.
- Cookie `__Host-` (httpOnly, Secure, SameSite=Lax); Server Actions memiliki proteksi CSRF bawaan Next.js.
- Rate limit untuk login, registrasi, lupa password, dan kirim ulang verifikasi.
- Tidak ada user enumeration pada lupa password; waktu respons login disamakan.
- Tautan email memakai `APP_URL` (bukan header Host). Redirect `?next=` hanya ke path internal.
- Header keamanan (HSTS, X-Frame-Options, nosniff, Referrer-Policy) dan proteksi CSV injection pada ekspor.

> Hasil psikotes di aplikasi ini bersifat latihan, bukan diagnosis psikologis.
