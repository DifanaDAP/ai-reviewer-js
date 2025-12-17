# Penjelasan `tsconfig.json`

File ini mengatur konfigurasi kompilator TypeScript (`tsc`). Ini menentukan bagaimana kode TypeScript diubah menjadi JavaScript.

## Compiler Options (Opsi Kompilasi)

| Opsi | Nilai | Penjelasan |
| :--- | :--- | :--- |
| `incremental` | `false` | Tidak menggunakan kompilasi inkremental (build ulang semua tiap kali). |
| `sourceMap` | `false` | Tidak menghasilkan file `.map` (berguna untuk debug, tapi dimatikan di sini). |
| `allowJs` | `true` | Mengizinkan file JavaScript (`.js`) ikut dikompilasi/diproses. |
| `checkJs` | `false` | Tidak melakukan pengecekan error tipe data di file `.js`. |
| `moduleResolution` | `"node"` | Menggunakan strategi resolusi modul ala Node.js (mencari di `node_modules`). |
| `resolveJsonModule` | `true` | Mengizinkan impor file `.json` langsung ke dalam kode TypeScript. |
| `isolatedModules` | `true` | Memastikan setiap file bisa dikompilasi secara terpisah (aman untuk transpilasi babel/swc). |
| `target` | `"ESNext"` | Target versi JavaScript keluaran adalah fitur terbaru (ESNext). |
| `module` | `"ESNext"` | Sistem modul yang digunakan adalah ES Module standar. |
| `outDir` | `"./lib"` | Hasil kompilasi disimpan di folder `lib`. |
| `rootDir` | `"./src"` | Folder sumber kode ada di `src`. |
| `strict` | `true` | Mengaktifkan mode ketat (strict) untuk pengecekan tipe data yang lebih aman. |
| `noImplicitAny` | `true` | Error jika ada penulisan tipe data yang tidak jelas (any). |
| `esModuleInterop` | `true` | Memudahkan impor modul CommonJS (standar lama Node) ke modul ES (standar baru). |

## Exclude (Pengecualian)
Folder atau file yang **tidak** akan dikompilasi oleh TypeScript:
- `dist` (Folder hasil build akhir)
- `lib` (Folder hasil kompilasi sementara)
- `node_modules` (Folder library)
- `**/*.test.ts` (File testing tidak ikut dikompilasi untuk output produksi)
