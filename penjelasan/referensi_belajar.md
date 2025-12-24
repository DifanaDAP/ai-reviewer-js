# Referensi Belajar: Pull Request & CI/CD

Untuk memahami cara kerja project ini dengan lebih baik, berikut adalah beberapa
referensi pembelajaran yang direkomendasikan:

## 1. Konsep Dasar Pull Request (PR)

- **GitHub Guides: About Pull Requests**:
  [https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests)
  - _Mengapa penting_: Ini adalah fondasi dari seluruh sistem ini.
- **How to write a Good PR Description**:
  [https://www.freecodecamp.org/news/how-to-write-a-good-pull-request-description/](https://www.freecodecamp.org/news/how-to-write-a-good-pull-request-description/)
  - _Relevansi_: Project ini mengecek apakah deskripsi PR Anda cukup detail.

## 2. GitHub Actions

- **Learn GitHub Actions**:
  [https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions](https://docs.github.com/en/actions/learn-github-actions/understanding-github-actions)
  - _Mengapa penting_: Project ini berjalan sebagai GitHub Action. Anda perlu
    tahu cara kerja workflow YAML.
- **Workflow Syntax for GitHub Actions**:
  [https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
  - _Relevansi_: Membantu Anda mengonfigurasi file `action.yml`.

## 3. Best Practices Code Review

- **Google Engineering Practices: The Standard of Code Review**:
  [https://google.github.io/eng-practices/review/](https://google.github.io/eng-practices/review/)
  - _Mengapa penting_: Prompt AI dalam project ini dirancang mengikuti standar
    engineering tinggi seperti milik Google.
- **Conventional Commits**:
  [https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/)
  - _Relevansi_: Salah satu pengecekan otomatis project ini adalah format judul
    PR menggunakan standar ini (feat, fix, chore, dll).

## 4. MongoDB & Mongoose

- **Mongoose Documentation**:
  [https://mongoosejs.com/docs/guide.html](https://mongoosejs.com/docs/guide.html)
  - _Mengapa penting_: Database history kita menggunakan library ini.

## 5. OpenAI API

- **OpenAI API Documentation**:
  [https://platform.openai.com/docs/api-reference](https://platform.openai.com/docs/api-reference)
  - _Mengapa penting_: Untuk memahami bagaimana bot "berpikir" dan melakukan
    chat.
