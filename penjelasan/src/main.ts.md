# Penjelasan `src/main.ts`

File ini adalah titik masuk utama (entry point) dari aplikasi. File ini mengatur alur kerja utama saat GitHub Action dijalankan.

## Fungsi Utama

### `run()`
Fungsi async yang menjadi inti eksekusi program.
- **Tugas**:
    1.  **Membaca Opsi**: Mengambil input dari pengguna (seperti `openai_api_key`, `debug`, dll) menggunakan fungsi `run` dari file `options.ts`.
    2.  **Inisialisasi Prompt**: Membuat objek `Prompts` untuk menyiapkan pesan yang akan dikirim ke AI.
    3.  **Inisialisasi Bot**: Membuat dua instance bot AI:
        - `lightBot`: Menggunakan model ringan (default: `gpt-3.5-turbo`) untuk tugas ringkasan.
        - `heavyBot`: Menggunakan model berat (default: `gpt-4`) untuk review kode mendalam.
    4.  **Deteksi Event**: Mengecek jenis event GitHub yang memicu action:
        - `pull_request` / `pull_request_target`: Menjalankan fungsi `codeReview` untuk mereview PR baru atau update.
        - `pull_request_review_comment`: Menjalankan fungsi `handleReviewComment` untuk membalas komentar pengguna pada review.
    5.  **Error Handling**: Menangkap dan melaporkan error jika terjadi kegagalan saat eksekusi.

### `process` Handlers
Menangani error yang tidak terduga pada level proses Node.js:
- `unhandledRejection`: Menangkap promise yang gagal tapi tidak di-catch.
- `uncaughtException`: Menangkap error fatal yang tidak tertangani.

### `await run()`
Baris terakhir yang memanggil fungsi `run()` untuk memulai aplikasi.
