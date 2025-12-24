# Penjelasan: `src/test-connection.ts`

File ini adalah script utilitas mandiri yang digunakan untuk mengetes koneksi
MongoDB secara lokal sebelum menjalankan bot di GitHub Actions. Ini sangat
berguna untuk memastikan bahwa URL MongoDB dan akses jaringan Anda sudah benar.

## Cara Menggunakan

Jalankan perintah berikut di terminal Anda:

```bash
npm run test:connection
```

_Catatan: Anda harus memiliki file `.env` yang berisi `MONGODB_URI`._

## Apa yang Dilakukan Script Ini?

1.  **Membaca Koneksi**: Mencoba terhubung ke URI yang ada di `.env`.
2.  **Uji Tulis (Test Write)**: Membuat satu dokumen review dummy di database
    untuk memastikan akun Anda punya akses "Write".
3.  **Uji Baca (Test Read)**: Mencoba mencari kembali dokumen tadi untuk
    memastikan akses "Read" berfungsi.
4.  **Pembersihan (Cleanup)**: Menghapus kembali dokumen dummy tadi agar
    database tetap bersih.
5.  **Laporan**: Memberikan tanda ✅ jika sukses atau ❌ jika gagal di setiap
    tahap.

Script ini adalah "dokter" pertama yang harus Anda panggil jika merasa MongoDB
tidak terhubung.
