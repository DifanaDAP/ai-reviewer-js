# Penjelasan `src/commenter.ts`

File ini adalah "tangan" dari robot. Class `Commenter` bertanggung jawab atas semua interaksi baca-tulis komentar di Pull Request.

## Konstanta (Tags)
File ini mendefinisikan banyak tag HTML komentar tersembunyi (misal `<!-- This is an ... -->`). Ini digunakan sebagai:
- **Marker**: Menandai komentar mana yang dibuat oleh bot.
- **Storage**: Menyimpan data di dalam komentar (misal summary ringkas, ID commit yang sudah direview) agar bot bisa membacanya lagi nanti (stateless memory).

## Class `Commenter`

### Fungsi Utama
1.  **`comment(message, tag, mode)`**
    - Fungsi umum untuk memposting komentar.
    - Mode `create`: Buat komentar baru.
    - Mode `replace`: Cari komentar lama dengan tag yang sama, lalu timpa (update). Jika tidak ada, buat baru.

2.  **`getReviewedCommitIds` & `addReviewedCommitId`**
    - Bot perlu tahu commit mana saja yang sudah direview agar tidak mereview ulang kode yang tidak berubah.
    - Daftar ID commit ini disimpan tersembunyi di dalam komentar bot. Fungsi ini bertugas membaca dan menambah ID ke daftar tersebut.

3.  **`bufferReviewComment` & `submitReview`**
    - Saat mereview file, bot tidak langsung memposting komentar satu per satu (bisa kena rate limit).
    - Bot "mem-buffer" (menampung) semua komentar dulu ke dalam array `reviewCommentsBuffer`.
    - Setelah review file selesai, `submitReview` dipanggil untuk mengirim semua komentar sekaligus dalam satu "Review Object" GitHub.
    - Jika gagal, barulah ia fallback memposting satu per satu.

4.  **`getCommentChainsWithinRange`**
    - Mengambil diskusi komentar yang terjadi di baris kode tertentu.
    - Ini krusial agar AI tahu konteks: "Apakah user bertanya sesuatu di baris ini?" atau "Apakah ada debat teknis di sini?".
    - AI kemudian bisa diajak  ikut nimbrung dalam diskusi ini.

5.  **`updateDescription`**
    - Menambahkan "Release Notes" atau ringkasan PR ke bagian deskripsi (body) PR paling atas, sehingga mudah dibaca tanpa scroll komentar.

6.  **`reviewCommentReply`**
    - Khusus menangani fitur chat: Membalas komentar spesifik dari user di dalam sebuah thread review.

### Cache
Class ini menggunakan caching sederhana (`reviewCommentsCache`, `issueCommentsCache`) untuk mengurangi jumlah request ke GitHub API. Jika komentar PR #123 sudah diambil, request berikutnya tinggal baca dari memori.
