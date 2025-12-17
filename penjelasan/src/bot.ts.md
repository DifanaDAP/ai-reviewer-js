# Penjelasan `src/bot.ts`

File ini adalah wrapper (pembungkus) untuk komunikasi dengan API OpenAI. Ia menyederhanakan proses pengiriman pesan dan penanganan error.

## Class `Bot`

### Constructor
- Memeriksa ketersediaan `OPENAI_API_KEY`.
- Membangun system prompt yang menyertakan "Current date" dan "Knowledge cutoff" agar AI sadar waktu.
- Menginisialisasi klien `ChatGPTAPI` dengan parameter yang diset di opsi (URL, model, temperatur, dll).

### Fungsi `chat(message, ids)`
Fungsi utama untuk mengirim pesan ke AI.
- **Input**: `message` (prompt user) dan `ids` (ID percakapan sebelumnya untuk menjaga konteks chat).
- **Try-Catch**: Membungkus pemanggilan internal `chat_` untuk menangkap error `ChatGPTError` agar aplikasi tidak crash jika AI error.

### Fungsi Private `chat_(message, ids)`
- **pRetry**: Menggunakan library `p-retry` untuk mencoba ulang request secara otomatis jika gagal (misal timeout atau server error).
- **Logging**: Mencatat waktu respon (latency) dan isi respon (jika debug aktif).
- **Pembersihan Respon**: Terkadang AI menjawab dengan awalan "with ...", kode ini menghapusnya.
- **Return**: Mengembalikan teks jawaban dan ID percakapan baru untuk dipakai di pesan selanjutnya.
