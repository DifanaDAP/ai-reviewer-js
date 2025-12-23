# Penjelasan `src/review-comment.ts`

File ini menangani logika fitur **"Chat dengan Bot"**. Logika ini berjalan
ketika event yang terjadi adalah `pull_request_review_comment` (user membalas
komentar review).

## Fungsi Utama: `handleReviewComment`

1.  **Validasi Event**:

    - Memastikan event benar-benar komentar baru (`created`), bukan edit atau
      hapus.
    - Memastikan komentar bukan dari bot sendiri (untuk mencegah infinite loop
      bot ngobrol sama bot).

2.  **Identifikasi Konteks**:

    - Bot mengecek apakah komentar user ini ada di dalam thread yang pernah bot
      komentari sebelumnya (`COMMENT_TAG` atau `COMMENT_REPLY_TAG`).
    - Atau apakah user secara eksplisit me-mention bot `@ai-pr-reviewer`.

3.  **Persiapan Input untuk AI**:

    - **Diff**: Mengambil potongan kode (diff) yang sedang dibahas. Jika di
      komentar tidak ada, bot mencoba ambil dari GitHub API.
    - **Sejarah Chat**: Mengambil `commentChain` (semua balasan sebelumnya di
      thread itu) agar AI nyambung ngobrolnya.
    - **Summary**: Mengambil ringkasan PR sebagai konteks tambahan.

4.  **Pengecekan Token**:

    - Menghitung apakah gabungan kode + sejarah chat + summary masih muat dalam
      batas token model.
    - Jika overlimit, bot akan membalas maaf bahwa konteks terlalu besar dan
      tidak bisa memproses.

5.  **Eksekusi Chat**:
    - Mengirim prompt (`prompts.renderComment`) ke `heavyBot`.
    - Jawaban AI kemudian diposting sebagai balasan (reply) di thread yang sama
      menggunakan `commenter.reviewCommentReply`.
