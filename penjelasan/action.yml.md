# Penjelasan `action.yml`

File ini mendefinisikan konfigurasi untuk GitHub Action. Ini memberitahu GitHub bagaimana cara menjalankan action ini, input apa yang dibutuhkan, dan branding apa yang digunakan.

## Metadata
- **Name**: `AI-based PR Reviewer & Summarizer with Chat Capabilities` - Nama dari action.
- **Description**: Deskripsi singkat mengenai kegunaan action ini.
- **Result**: `AI-based PR Reviewer & Summarizer with Chat Capabilities`
- **Branding**: Ikon `git-merge` berwarna oranye yang akan tampil di GitHub Marketplace.

## Inputs (Masukan)
Bagian ini mendefinisikan parameter yang bisa diatur oleh pengguna saat menggunakan action ini di workflow mereka.

| Input | Deskripsi | Default | Wajib? |
| :--- | :--- | :--- | :--- |
| `debug` | Mengaktifkan mode debug untuk log yang lebih detail. | `false` | Tidak |
| `mongodb_uri` | URI koneksi MongoDB untuk menyimpan riwayat review. | - | Tidak |
| `max_files` | Batas maksimum file yang akan direview. Jika <= 0, tidak ada limit. | `150` | Tidak |
| `review_simple_changes` | Apakah akan mereview perubahan yang dianggap sederhana/kecil. | `false` | Tidak |
| `review_comment_lgtm` | Meninggalkan komentar meskipun kodenya sudah bagus (LGTM - Looks Good To Me). | `false` | Tidak |
| `path_filters` | Pola pattern untuk memfilter file yang akan direview atau diabaikan (exclude). Mirip `.gitignore`. | Daftar panjang ekstensi file binary/generated (lihat file asli). | Tidak |
| `disable_review` | Jika `true`, hanya membuat ringkasan (summary) tanpa review kode detail. | `false` | Tidak |
| `disable_release_notes` | Mematikan fitur pembuatan release notes otomatis. | `false` | Tidak |
| `openai_base_url` | URL dasar API OpenAI (bisa diganti jika pakai proxy). | `https://api.openai.com/v1` | Tidak |
| `openai_light_model` | Model AI yang lebih ringan/cepat untuk tugas ringkasan (summary). | `gpt-3.5-turbo` | Tidak |
| `openai_heavy_model` | Model AI yang lebih kuat untuk tugas analisis kode yang kompleks. | `gpt-4` | Tidak |
| `openai_model_temperature` | Tingkat "kreativitas" model (0.0 - 1.0). Rendah berarti lebih deterministik/konsisten. | `0.05` | Tidak |
| `openai_retries` | Jumlah percobaan ulang jika API OpenAI error/timeout. | `5` | Tidak |
| `openai_timeout_ms` | Batas waktu tunggu respons OpenAI dalam milidetik. | `360000` (6 menit) | Tidak |
| `openai_concurrency_limit` | Berapa banyak request ke OpenAI yang boleh jalan bersamaan. | `6` | Tidak |
| `github_concurrency_limit` | Berapa banyak request ke GitHub API yang boleh jalan bersamaan. | `6` | Tidak |
| `system_message` | Instruksi dasar (persona) untuk AI. Mendefinisikan AI sebagai engineer berpengalaman yang fokus pada logika, keamanan, performa, dll. | Lihat file asli untuk prompt lengkap. | Tidak |
| `summarize` | Prompt untuk membuat ringkasan akhir PR. | Struktur: Walkthrough, Changes (Tabel), Poem (Puisi). | Tidak |
| `summarize_release_notes` | Prompt untuk membuat catatan rilis (release notes). | Fokus fitur baru, perbaikan bug, dll. | Tidak |
| `language` | Kode bahasa ISO untuk respons AI (misal: `en-US`, `id-ID`). | `en-US` | Tidak |
| `bot_icon` | HTML untuk ikon bot yang muncul di komentar. | Gambar avatar default. | Tidak |

## Runs (Eksekusi)
Bagian ini mengatur bagaimana action dijalankan.
- **Using**: `node16` - Menggunakan Node.js versi 16.
- **Main**: `dist/index.js` - File utama yang akan dieksekusi adalah file hasil kompilasi di folder `dist`.
