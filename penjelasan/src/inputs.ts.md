# Penjelasan `src/inputs.ts`

File ini mendefinisikan struktur data (objek) yang digunakan untuk menyusun prompt atau pesan yang akan dikirim ke OpenAI. Ini bertindak sebagai template data.

## Class `Inputs`
Kelas ini menyimpan semua variabel yang mungkin dibutuhkan dalam prompt.

### Properti Utama
- `systemMessage`: Instruksi level sistem (system prompt) untuk AI.
- `title`: Judul Pull Request.
- `description`: Deskripsi Pull Request.
- `rawSummary`: Ringkasan mentah dari perubahan.
- `filename`: Nama file yang sedang direview.
- `fileContent`: Isi file kode.
- `fileDiff`: Perbedaan (diff) spesifik file tersebut.
- `patches`: Kumpulan patch perubahan.
- `diff`: Diff keseluruhan.
- `commentChain`: Riwayat komentar sebelumnya (untuk fitur chat).
- `comment`: Komentar terbaru dari pengguna.

### `render(content)`
Fungsi penting untuk melakukan **find & replace** placeholder dalam string prompt.
- **Contoh**: Jika prompt berisi `$title`, fungsi ini akan menggantinya dengan nilai properti `this.title`.
- Ini memungkinkan pembuatan prompt yang dinamis berdasarkan data PR yang sedang diproses.

### `clone()`
Membuat salinan baru (deep copy) dari objek `Inputs`. Berguna saat kita ingin memodifikasi input untuk satu file tanpa mengubah data asli yang dipakai file lain.
