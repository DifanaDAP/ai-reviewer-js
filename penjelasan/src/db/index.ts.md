# Penjelasan `src/db/index.ts`

File ini mengelola koneksi ke database **MongoDB**. Database ini digunakan untuk menyimpan riwayat review yang dilakukan oleh bot.

## Fungsi

### `connectToDatabase(uri)`
- Membuka koneksi ke MongoDB menggunakan library `mongoose`.
- **Cek state**: Jika koneksi sudah terbuka (`readyState >= 1`), ia langsung return (tidak perlu connect ulang).
- **Log**: Mencetak pesan sukses atau gagal.

### `closeDatabaseConnection()`
- Menutup koneksi database secara bersih (graceful shutdown). Ini penting dipanggil di akhir eksekusi program supaya tidak ada koneksi yang menggantung (zombie connection).
