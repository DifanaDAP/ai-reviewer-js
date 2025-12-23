# Penjelasan `src/review.ts`

File ini adalah "otak" utama dari aplikasi. Di sinilah logika orchestrator
berjalan: mengambil data PR, mengirimnya ke AI untuk direview, dan memposting
hasilnya kembali ke GitHub.

## Fungsi Utama: `codeReview`

Fungsi `codeReview` adalah fungsi `async` raksasa yang mengatur seluruh alur
review. Berikut adalah langkah-langkah detail yang dilakukannya:

### 1. Inisialisasi & Persiapan

- **Database**: Jika `mongodb_uri` disediakan, koneksi ke database dibuat.
- **Concurrency Control**: Menyiapkan pembatasan jumlah request bersamaan ke
  OpenAI dan GitHub menggunakan `p-limit`.
- **Validasi Event**: Memastikan action hanya berjalan pada event `pull_request`
  atau `pull_request_target`. Jika tidak, proses berhenti.
- **Persiapan Input**: Mengambil judul dan deskripsi PR.
- **Ignore Check**: Mengecek apakah di deskripsi PR ada tulisan
  `@ai-pr-reviewer: ignore`. Jika ada, review dibatalkan.

### 2. Manajemen Komentar Ringkasan (Summary)

- Mencari apakah sudah ada komentar summary dari bot sebelumnya.
- Jika ada, bot akan membaca summary lama untuk mendapatkan konteks (seperti
  commit ID terakhir yang direview) agar bisa melakukan review inkremental
  (hanya perubahan baru).

### 3. Mengambil Perubahan (Diff)

- Bot membandingkan commit terakhir yang direview dengan commit terbaru
  (`incrementalDiff`).
- Bot juga mengambil perbedaan total antara branch target dan branch fitur
  (`targetBranchDiff`).
- **Filtering**: File yang tidak berubah atau diabaikan oleh filter
  (`pathFilters`) dibuang dari daftar antrian review.

### 4. Membuat Ringkasan (Summarization)

Proses ini berjalan secara **paralel** dengan batas concurrency:

- **Per File**: Setiap file yang lolos filter dikirim ke `lightBot` (model
  ringan) untuk diringkas perubahannya.
- **Triage**: Selain meringkas, AI juga diminta menentukan apakah file ini butuh
  review mendalam (`NEEDS_REVIEW`) atau aman (`APPROVED`).
- **Batching**: Hasil ringkasan per file dikumpulkan, lalu dikirim dalam grup
  (batch) ke `heavyBot` untuk dibuatkan ringkasan gabungan yang lebih koheren.
- **Final Summary**: Terakhir, `heavyBot` membuat "Walkthrough", data tabel
  perubahan, dan puisi kelinci berdasarkan ringkasan gabungan tadi.

### 5. Automated Checks

Bot melakukan pengecekan otomatis sederhana:

- Apakah judul PR sesuai format Conventional Commits?
- Apakah deskripsi PR cukup panjang/detail?
- Apakah ada file test yang diubah (menandakan adanya testing)? Hasilnya
  ditampilkan dalam tabel status.

### 6. Melakukan Review Kode (Deep Review)

Jika review tidak dimatikan (`disable_review` is false), maka:

- **Filtering Lanjutan**: Hanya file yang ditandai `NEEDS_REVIEW` oleh triase
  sebelumnya yang akan direview detail.
- **Packing Patch**: Bot mencoba memadatkan beberapa potongan kode (patches) ke
  dalam satu request ke OpenAI untuk menghemat token dan waktu, selama batas
  token `gpt-4` belum terlampaui.
- **Konteks Tambahan**: Bot juga mengambil komentar-komentar (diskusi) yang
  mungkin sudah ada di baris kode tersebut (`comment_chains`) agar AI tahu
  konteks diskusi sebelumnya.
- **Analisis AI**: Mengirimkan patch + konteks ke `heavyBot`. AI diminta mencari
  isu Keamanan, Performa, dan Code Style.
- **Parsing**: Jawaban AI (format JSON + komentar) diparsing.
- **Posting Komentar**:
  - Komentar "LGTM" (Looks Good To Me) diabaikan kecuali opsi
    `review_comment_lgtm` aktif.
  - Komentar review yang valid diposting ke baris kode yang relevan di PR.

### 7. Finalisasi

- **Posting Summary**: Mengupdate komentar summary utama dengan status terbaru,
  tabel automated checks, dan ringkasan AI.
- **Simpan ke DB**: Menyimpan data hasil review (repo, PR number, summary, list
  isu) ke MongoDB untuk keperluan analisis/audit di masa depan.
