# Penjelasan `jest.config.json`

File ini mengatur konfigurasi untuk **Jest**, yaitu framework testing yang digunakan dalam proyek ini.

## Konfigurasi Utama

| Key | Nilai | Penjelasan |
| :--- | :--- | :--- |
| `clearMocks` | `true` | Otomatis membersihkan data rekaman mock (tiruan) setiap selesai satu test case, agar test satu tidak mengganggu test lainnya. |
| `moduleFileExtensions` | `["js", "ts"]` | Ekstensi file yang akan dianggap sebagai modul oleh Jest. |
| `testMatch` | `["**/*.test.ts"]` | Pola pencarian file test. Jest akan menjalankan semua file yang berakhiran `.test.ts`. |
| `transform` | `{"^.+\\.ts$": "ts-jest"}` | Instruksi agar file TypeScript (`.ts`) diproses menggunakan `ts-jest` sebelum dijalankan. |
| `verbose` | `true` | Menampilkan output log hasil test secara detail di terminal. |
