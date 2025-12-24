# Penjelasan `src/main.ts`

File ini adalah titik masuk utama (entry point) dari aplikasi. File ini mengatur
alur kerja utama saat GitHub Action dijalankan.

## Fungsi Utama

### `run()`

Fungsi async yang menjadi inti eksekusi program.

- **Tugas**:
  1.  **Validasi Konfigurasi (Baru!)**: Memanggil `validateConfig` dan
      `printConfigStatus` (dari `config-validator.ts`) di awal startup. Ini
      memastikan log menampilkan status rahasia (secrets) apa saja yang sudah
      terpasang.
  2.  **Membaca Opsi**: Mengambil input dari pengguna (seperti `openai_api_key`,
      `debug`, dll) menggunakan file `options.ts`.
  3.  **Inisialisasi Prompt**: Membuat objek `Prompts` untuk menyiapkan pesan
      yang akan dikirim ke AI.
  4.  **Inisialisasi Bot**: Membuat dua instance bot AI (`lightBot` dan
      `heavyBot`).
  5.  **Deteksi Event**: Mengecek jenis event GitHub yang memicu action.
  6.  **Error Handling**: Menangkap dan melaporkan error jika terjadi kegagalan
      saat eksekusi.

### `process` Handlers

Menangani error yang tidak terduga pada level proses Node.js:

- `unhandledRejection`: Menangkap promise yang gagal tapi tidak di-catch.
- `uncaughtException`: Menangkap error fatal yang tidak tertangani.

### `await run()`

Baris terakhir yang memanggil fungsi `run()` untuk memulai aplikasi.
