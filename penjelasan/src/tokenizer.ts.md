# Penjelasan `src/tokenizer.ts`

File kecil namun krusial untuk menghitung jumlah token. Token adalah satuan data yang diproses model bahasa (kira-kira 0.75 kata per token).

## Fungsi
- **`encode(input)`**: Mengubah teks menjadi array angka (token ID) menggunakan library `tiktoken` dengan encoding `cl100k_base` (standar GPT-3.5/GPT-4).
- **`getTokenCount(input)`**:
    - Membersihkan string khusus `<|endoftext|>` agar tidak mengacaukan hitungan.
    - Mengembalikan jumlah (panjang array) token dari input string.
    - Ini dipakai di seluruh aplikasi untuk memastikan prompt kita tidak melebihi batas maksimal model (misal 4096 atau 8192 token).
