# Penjelasan `src/limits.ts`

File ini mengatur batasan token (context window) untuk berbagai model OpenAI. Ini penting agar program tidak mengirim prompt yang melebihi kapasitas model, yang akan menyebabkan error.

## Class `TokenLimits`

### Constructor
Menentukan batas token berdasarkan nama model yang dipilih:

- **GPT-4-32k**:
    - Max Tokens: 32600
    - Response Tokens (cadangan untuk jawaban): 4000
- **GPT-3.5-Turbo-16k**:
    - Max Tokens: 16300
    - Response Tokens: 3000
- **GPT-4 (Standar)**:
    - Max Tokens: 8000
    - Response Tokens: 2000
- **Model Lain (Default/GPT-3.5-Turbo)**:
    - Max Tokens: 4000
    - Response Tokens: 1000

Simbol `requestTokens` dihitung dari `maxTokens - responseTokens - 100` (buffer keamanan). Ini adalah jumlah token maksimal yang boleh kita kirimkan dalam prompt.

### `string()`
Fungsi helper untuk mencetak info batasan token ke dalam format string yang mudah dibaca.
