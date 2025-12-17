# Penjelasan `src/fetch-polyfill.js`

File kecil ini bertujuan untuk kompatibilitas (polyfill).

## Fungsi
Di Node.js versi lama (sebelum v18), fungsi `fetch` (yang biasa ada di browser) belum tersedia secara bawaan.
Kode ini mengecek: "Apakah `globalThis.fetch` sudah ada?"
- Jika **belum**: Ia mengimpor library `node-fetch` dan memasangnya ke global object.
- Jika **sudah**: Tidak melakukan apa-apa.

Ini memastikan aplikasi bisa berjalan mulus baik di Node.js versi lama maupun baru tanpa error "fetch is not defined".
