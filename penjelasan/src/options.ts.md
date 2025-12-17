# Penjelasan `src/options.ts`

File ini berfungsi untuk mengelola konfigurasi dan opsi yang digunakan oleh aplikasi. Ia membaca input dari GitHub Actions dan menyimpannya dalam struktur yang mudah diakses.

## Class `Options`
Kelas utama untuk menyimpan semua konfigurasi.

### Properti Utama
- `debug`: Mode debug aktif/tidak.
- `disableReview`: Mematikan fitur review kode.
- `maxFiles`: Batas maksimum file yang diproses.
- `openaiLightModel` & `openaiHeavyModel`: Nama model OpenAI yang digunakan.
- `lightTokenLimits` & `heavyTokenLimits`: Batas token untuk masing-masing model.

### Constructor
Menerima semua parameter input (biasanya dari `action.yml`), melakukan parsing tipe data (misal string ke number), dan menginisialisasi properti.

### Fungsi `print()`
Mencetak semua konfigurasi yang sedang aktif ke log console (menggunakan `core.info`). Ini berguna untuk debugging melihat setting apa yang sedang berjalan.

### Fungsi `checkPath(path)`
Memeriksa apakah sebuah file harus diproses atau diabaikan berdasarkan aturan filter (`pathFilters`).

## Class `PathFilter`
Kelas pembantu untuk memfilter file berdasarkan pola glob (seperti `.gitignore`).

### Cara Kerja
- Menerima daftar aturan (rules).
- Aturan yang diawali tanda seru `!` dianggap sebagai pengecualian (exclude).
- Fungsi `check(path)` mencocokkan path file dengan aturan menggunakan library `minimatch`.

## Class `OpenAIOptions`
Kelas sederhana untuk mengelompokkan opsi terkait OpenAI, yaitu nama model dan batas tokennya.
