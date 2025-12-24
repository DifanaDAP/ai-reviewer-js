# Penjelasan: `src/config-validator.ts`

File ini berfungsi sebagai sistem validasi pusat untuk memastikan semua
konfigurasi dan rahasia (secrets) yang dibutuhkan oleh AI PR Reviewer sudah
terpasang dengan benar.

## Fitur Utama

1.  **Masking Secrets**: Fungsi `maskSecret` menyembunyikan nilai asli (hanya
    menampilkan 4 karakter awal dan akhir) agar aman saat ditampilkan di log
    publik.
2.  **Laporan Status**: Fungsi `validateConfig` mengecek apakah
    `OPENAI_API_KEY`, `OPENAI_API_ORG`, `MONGODB_URI`, dan `GITHUB_TOKEN` sudah
    terisi.
3.  **Visual Reporting**: Fungsi `printConfigStatus` mencetak tabel status ke
    log GitHub Actions dengan ikon yang jelas (✅, ⚠️, ❌).
4.  **Markdown Generation**: Fungsi `generateConfigStatusMarkdown` membuat tabel
    status dalam format Markdown untuk ditampilkan di komentar Pull Request.

## Fungsi Penting

### `validateConfig(mongodbUri: string)`

Mengumpulkan semua data status dari environment variables dan parameter input.

### `hasRequiredConfig()`

Melakukan pengecekan kritis. Jika `OPENAI_API_KEY` atau `GITHUB_TOKEN` tidak
ada, fungsi ini akan mengembalikan daftar error. Ini mencegah bot berjalan dalam
kondisi "buta" tanpa API key.

### `printConfigStatus(status: ConfigStatus)`

Membantu developer melakukan _troubleshooting_ dengan melihat log. Jika ada yang
salah, user bisa langsung tahu "Oh, API Key saya belum kepanggil".
