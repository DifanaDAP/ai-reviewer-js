# Penjelasan `src/prompts.ts`

File ini berisi template prompt (instruksi) yang akan dikirim ke OpenAI. Prompt ini dirancang agar AI memberikan output sesuai format yang kita inginkan.

## Class `Prompts`

### Template Prompt Utama

1.  **`summarizeFileDiff`**:
    - Meminta AI untuk meringkas perubahan dalam satu file (maksimal 100 kata).
    - Fokus pada fungsi yang diekspor, struktur data, dan perubahan behavior.

2.  **`triageFileDiff`**:
    - Bagian tambahan untuk prompt summary.
    - Meminta AI menentukan: `[TRIAGE]: NEEDS_REVIEW` atau `[TRIAGE]: APPROVED`.
    - `NEEDS_REVIEW`: Jika ada perubahan logika.
    - `APPROVED`: Jika cuma typo, formatting, atau rename variabel.

3.  **`summarizeChangesets`**:
    - Digunakan untuk menggabungkan dan merapikan ringkasan dari banyak file sekaligus.
    - Meminta deduplikasi dan pengelompokan file yang berkaitan.

4.  **`summarizeShort` (Summary Pendek)**:
    - Ringkasan super padat (< 500 kata) yang akan digunakan sebagai **konteks** saat AI mereview file lain. Tujuannya agar AI punya gambaran besar PR ini tentang apa sebelum mereview detail kode.

5.  **`reviewFileDiff`**:
    - **Prompt paling kompleks**.
    - Memberikan input: Hunk kode baru + lama, judul PR, deskripsi, summary.
    - **Instruksi Analisis**: Cari isu Keamanan, Performa, dan Code Style.
    - **Format Prioritas**: Gunakan emoji 🔴 (High), 🟡 (Medium), 🟢 (Low).
    - **Format Output JSON**: Wajib menyertakan ringkasan isu dalam format JSON di akhir jawaban agar bisa diparsing mesin.
    - Aturan ketat: Jangan memuji, fokus pada masalah objektif. Jika aman, balas `LGTM!`.

6.  **`comment`**:
    - Prompt untuk fitur **Chat**.
    - Memberikan konteks diskusi (comment chain) dan meminta AI membalas pertanyaan/komentar user seolah-olah dia adalah engineer yang sedang diskusi.

### Fungsi Render
Fungsi-fungsi seperti `renderSummarizeFileDiff`, `renderReviewFileDiff`, dll., bertugas menggabungkan template string di atas dengan data `Inputs` (judul, diff, dll) menggunakan teknik *string replacement*.
