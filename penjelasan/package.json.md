# Penjelasan `package.json`

File ini adalah manifest untuk proyek Node.js. Isinya mencakup metadata proyek, script untuk menjalankan perintah, dan daftar library (dependencies) yang digunakan.

## Metadata Proyek
- **Name**: `openai-pr-reviewer`
- **Version**: `0.0.0`
- **Private**: `true` (Tidak dipublikasikan ke npm registry umum).
- **Description**: Reviewer dan Peringkas PR berbasis OpenAI.
- **Main**: `lib/main.js` (Entry point aplikasi).

## Scripts (Perintah)
Daftar perintah yang bisa dijalankan dengan `npm run <nama-script>`:

| Script | Fungsi |
| :--- | :--- |
| `build` | Menyalin file WASM `tiktoken` (token counter) ke folder `dist` lalu melakukan kompilasi TypeScript (`tsc`). |
| `package` | Mengemas aplikasi menjadi satu file tunggal menggunakan `ncc` agar siap dipakai di GitHub Actions. |
| `act` | Menjalankan build, package, lalu mensimulasikan GitHub Action secara lokal menggunakan tool `act`. |
| `format` | Merapikan kode secara otomatis menggunakan `prettier`. |
| `format-check` | Mengecek apakah kode sudah rapi tanpa mengubahnya. |
| `lint` | Mencari potensi error atau gaya penulisan kode yang salah menggunakan `eslint`. |
| `test` | Menjalankan testing menggunakan `jest`. |
| `all` | Menjalankan seluruh proses: build, format, lint, package, dan test. |

## Dependencies (Library Utama)
Library yang dibutuhkan agar aplikasi berjalan:

- **@actions/core**: Fungsi inti GitHub Actions (baca input, set output, logging).
- **@actions/github**: Klien untuk berinteraksi dengan GitHub API.
- **@dqbd/tiktoken**: Untuk menghitung jumlah token OpenAI (agar tidak melebihi batas).
- **@octokit/action**: Helper untuk autentikasi GitHub Action.
- **@octokit/plugin-retry**: Otomatis mencoba ulang request GitHub jika gagal.
- **@octokit/plugin-throttling**: Menangani pembatasan laju (rate limiting) GitHub API.
- **minimatch**: Untuk mencocokkan pola nama file (seperti glob pattern).
- **mongoose**: Library ODM (Object Data Modeling) untuk koneksi ke database MongoDB.
- **node-fetch**: Untuk melakukan HTTP request (polyfill untuk environment Node lama).
- **p-limit**: Membatasi jumlah tugas async yang berjalan bersamaan (concurrency control).
- **p-retry**: Mencoba ulang promise/fungsi async jika gagal.

## DevDependencies (Library Pengembang)
Library yang hanya dibutuhkan saat pengembangan (coding/testing):

- **Types**: `@types/node`, `@types/mongoose` (Definisi tipe data TypeScript).
- **Linter & Formatter**: `eslint`, `prettier`, dan plugin-plugin terkait untuk menjaga kualitas kode.
- **Testing**: `jest`, `ts-jest` (Framework testing).
- **Compiler**: `typescript` (Bahasa pemrograman utama).
- **Packager**: `@vercel/ncc` (Menggabungkan semua file jadi satu untuk distribusi).
