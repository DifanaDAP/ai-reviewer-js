# Penjelasan `src/db/index.ts`

File ini mengelola koneksi ke database **MongoDB** dengan fitur diagnostik yang
ditingkatkan. Database ini digunakan untuk menyimpan riwayat review.

## Fitur Baru & Fungsi

### `connectToDatabase(uri)`

- **Validasi URI**: Mengecek format URI (harus mulai dengan `mongodb://` atau
  `mongodb+srv://`).
- **Timeout Proaktif**: Mengatur timeout 10 detik agar sistem tidak "hang"
  terlalu lama jika server MongoDB mati.
- **Ping Test**: Setelah connect, ia melakukan `admin().ping()` untuk memastikan
  koneksi benar-benar bisa dipakai kirim data, bukan cuma sekedar terhubung.
- **Error Hints (Penting!)**: Jika gagal, fungsi ini akan memberikan saran
  solusi berdasarkan jenis errornya:
  - _Authentication failed_: Cek password/user.
  - _Cannot resolve hostname_: Cek apakah URL-nya typo.
  - _Connection timed out_: Cek whitelist IP di MongoDB Atlas.

### `closeDatabaseConnection()`

- Menutup koneksi database secara bersih.

### `getMongoStatus()`

- Mengembalikan status terbaru: apakah terhubung (`connected`) dan pesan error
  terakhir jika ada (`error`). Data ini digunakan untuk laporan di komentar
  GitHub PR.
