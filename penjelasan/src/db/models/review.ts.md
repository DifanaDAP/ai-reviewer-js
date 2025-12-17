# Penjelasan `src/db/models/review.ts`

File ini mendefinisikan **Schema** (struktur data) untuk objek `Review` yang akan disimpan di MongoDB.

## Schema: `ReviewSchema`

Setiap dokumen `Review` yang disimpan di database akan memiliki field berikut:

- **`repoOwner`** (String): Nama pemilik repository (misal: `octocat`).
- **`repoName`** (String): Nama repository (misal: `Hello-World`).
- **`prNumber`** (Number): Nomor Pull Request.
- **`commitId`** (String): Hash SHA dari commit terakhir yang direview.
- **`summary`** (String): Ringkasan review yang dihasilkan oleh AI.
- **`securityIssues`** (Array of String): Daftar isu keamanan yang ditemukan.
- **`performanceIssues`** (Array of String): Daftar isu performa yang ditemukan.
- **`codeStyleIssues`** (Array of String): Daftar saran gaya kode.
- **`createdAt`** (Date): Waktu review dibuat (otomatis diisi waktu sekarang).

## Export
File ini mengekspor Model Mongoose dengan nama `Review`, yang bisa digunakan di file lain (seperti di `src/review.ts`) untuk melakukan operasi database seperti `.save()`, `.find()`, dll.
