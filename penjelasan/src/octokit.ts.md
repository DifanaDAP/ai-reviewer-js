# Penjelasan `src/octokit.ts`

File ini menginisialisasi klien GitHub API (`Octokit`) dengan plugin tambahan untuk menangani masalah jaringan atau batasan (quota).

## Fitur Utama

### `RetryAndThrottlingOctokit`
Ini adalah klien GitHub kustom yang menggabungkan dua plugin:
1.  **`@octokit/plugin-retry`**: Otomatis mencoba ulang (retry) request jika gagal (misal server GitHub sedang down atau timeout).
2.  **`@octokit/plugin-throttling`**: Menangani error "Rate Limit" (terlalu banyak request).

## Konfigurasi Kustom
- **Token**: Menggunakan input `token` dari Action atau `GITHUB_TOKEN` dari environment variable.
- **`onRateLimit`**:
    - Jika kuota request habis, fungsi ini dipanggil.
    - Jika sudah retry 3 kali atau kurang, ia akan menunggu beberapa detik lalu coba lagi.
- **`onSecondaryRateLimit`**:
    - Ini adalah pembatasan "abuse detection" dari GitHub (misal nge-spam komen terlalu cepat).
    - Bot akan menunggu dan mencoba lagi, **KECUALI** jika operasi yang gagal adalah memposting review (POST review), maka tidak diretry untuk mencegah duplikasi masif.
