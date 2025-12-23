# Rebranding AI PR Reviewer: Menghapus CodeRabbit dan Update README

**Tanggal: 2025-12-22**

## Gambaran Masalah

Codebase ini adalah fork dari CodeRabbit yang sudah dimodifikasi untuk menjadi
AI PR Reviewer independen. Masih ada sisa-sisa branding CodeRabbit yang perlu
dihapus dan README perlu di-update agar sesuai dengan kode saat ini.

---

## Proposed Changes

### Komponen: Source Code - Branding Comments

#### [MODIFY] src/commenter.ts

File utama yang perlu di-rebrand. Perubahan:

| Line  | Dari                              | Ke               |
| ----- | --------------------------------- | ---------------- |
| 10    | `CodeRabbit`                      | `AI PR Reviewer` |
| 13-43 | Semua tag dengan `OSS CodeRabbit` | `AI PR Reviewer` |

---

### Komponen: Konfigurasi Action

#### [MODIFY] action.yml

| Line | Perubahan                                                   |
| ---- | ----------------------------------------------------------- |
| 243  | Ganti `bot_icon` default dari avatar CodeRabbit ke emoji 🤖 |

---

### Komponen: Dokumentasi

#### [DELETE] docs/images/CodeRabbitName.png

#### [DELETE] docs/images/CoderabbitIcon.png

---

#### [MODIFY] README.md - Update sesuai fitur terbaru

#### [MODIFY] package.json - Update nama dan repository

---

## Penjelasan Tentang `.env`

```
OPENAI_API_KEY=sk-placeholder     # API key dari OpenAI untuk GPT models (WAJIB)
GITHUB_TOKEN=ghp_placeholder       # Token GitHub (otomatis di GitHub Actions)
MONGODB_URI=mongodb://...          # (Opsional) URI MongoDB untuk menyimpan review history
```

---

## Status Kesiapan Code

### ✅ Siap Jalan sebagai GitHub Action

Output yang Dihasilkan:

1. PR Summary Comment
2. Release Notes otomatis
3. Code Review Comments per-line
4. Automated Checks Table (security, test coverage, dll)
5. MongoDB Record (jika dikonfigurasi)
