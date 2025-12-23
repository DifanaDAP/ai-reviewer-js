# 🤖 AI PR Reviewer & Summarizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AI-based code reviewer and summarizer for GitHub pull requests using OpenAI's
GPT models. Includes pattern-based analyzers and MongoDB integration for review
history.

## ✨ Features

### Core Review Capabilities

- **PR Summarization** - Auto-generates summary and release notes for every PR
- **Line-by-line Code Review** - AI provides specific suggestions on code
  changes
- **Incremental Reviews** - Reviews are performed on each commit, saving tokens
  and reducing noise
- **Chat with Bot** - Reply to bot comments to ask follow-up questions

### 🔍 Modular Analyzers (v2)

Six specialized pattern-based analyzers provide fast, deterministic feedback:

| Analyzer                   | Description                                                                |
| -------------------------- | -------------------------------------------------------------------------- |
| 🔍 **Static Analyzer**     | Code style, naming conventions, anti-patterns                              |
| 🛡️ **Risk Analyzer**       | Security vulnerabilities (SQL injection, XSS, secrets), performance issues |
| 📋 **Structure Analyzer**  | PR title (Conventional Commits), description, and size validation          |
| 🧪 **Test Analyzer**       | Missing tests, skipped tests, test isolation                               |
| 📝 **Doc Analyzer**        | Documentation updates, JSDoc presence                                      |
| 📏 **Convention Analyzer** | File naming and coding conventions                                         |

### 💾 MongoDB Integration

Store review history for tracking and analytics. See
[MongoDB Setup](#mongodb-integration-v2).

---

## 🚀 Quick Start

Add this file to your repository at `.github/workflows/ai-pr-reviewer.yml`:

```yaml
name: AI PR Review

permissions:
  contents: read
  pull-requests: write

on:
  pull_request:
  pull_request_review_comment:
    types: [created]

concurrency:
  group:
    ${{ github.repository }}-${{ github.event.number || github.head_ref ||
    github.sha }}-${{ github.workflow }}-${{ github.event_name ==
    'pull_request_review_comment' && 'pr_comment' || 'pr' }}
  cancel-in-progress: ${{ github.event_name != 'pull_request_review_comment' }}

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: DifanaDAP/ai-reviewer-js@main
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        with:
          debug: false
          review_simple_changes: false
          review_comment_lgtm: false
```

### Required Secrets

| Secret           | Description                                  | Required    |
| ---------------- | -------------------------------------------- | ----------- |
| `OPENAI_API_KEY` | OpenAI API key for GPT models                | ✅ Yes      |
| `GITHUB_TOKEN`   | Automatically provided by GitHub Actions     | ✅ Auto     |
| `MONGODB_URI`    | MongoDB connection string for review storage | ❌ Optional |

---

## ⚙️ Configuration

All options can be configured in your workflow file. See
[action.yml](./action.yml) for full list.

### Common Options

```yaml
with:
  # Models
  openai_light_model: 'gpt-3.5-turbo' # For summaries
  openai_heavy_model: 'gpt-4' # For code reviews

  # Behavior
  review_simple_changes: false # Skip trivial changes
  review_comment_lgtm: false # Don't comment on good code
  disable_review: false # Set true for summary only
  disable_release_notes: false # Set true to skip release notes

  # Limits
  max_files: 150
  openai_timeout_ms: 360000
```

### Advanced: Custom Analyzer Config (`.ai-reviewer.yml`)

Create this file in your repo root to customize analyzers:

```yaml
enabled: true

pr_structure:
  title_pattern: '^(feat|fix|docs|style|refactor|test|chore)...'
  require_description: true

pr_size:
  max_files: 20
  max_lines_added: 500

naming:
  typescript:
    class: '^[A-Z][a-zA-Z0-9]*$'
    function: '^[a-z][a-zA-Z0-9]*$'

ignore:
  - '*.lock'
  - 'dist/*'
```

---

## 💾 MongoDB Integration (v2)

Store reviews persistently for tracking and analytics.

### Setup

1. **Get MongoDB URI** - Use [MongoDB Atlas](https://www.mongodb.com/atlas)
   (free tier works great) or local MongoDB

2. **Add Secret** - Go to repo Settings → Secrets → Actions → New secret:

   - Name: `MONGODB_URI`
   - Value: `mongodb+srv://<user>:<password>@cluster.mongodb.net/ai_reviews`

3. **Update Workflow**:

   ```yaml
   with:
     mongodb_uri: ${{ secrets.MONGODB_URI }}
   ```

4. **Verification** - Each PR comment will show:
   - ✅ **Review saved to MongoDB** - Success
   - ⚠️ **Failed to save review** - Check connection string

---

## 💬 Interacting with the Bot

### Chat with the Bot

Reply to any review comment and tag the bot:

```
@ai-pr-reviewer Please explain this suggestion in more detail.
```

### Ignore a PR

Add this anywhere in your PR description to skip review:

```
@ai-pr-reviewer: ignore
```

---

## 🖥️ Local Development

### Environment Setup

1. Copy environment template:

   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials in `.env`:
   ```
   OPENAI_API_KEY=sk-your-key
   MONGODB_URI=mongodb://localhost:27017/ai-reviewer
   ```

### Commands

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Bundle for GitHub Actions
npm run package

# Run tests
npm test

# Test MongoDB connection
npm run test:connection
```

---

## 🔐 Security & Privacy

- **Data Sent to OpenAI**: File diffs, PR titles/descriptions, and relevant code
  context
- **No Affiliation**: This action is not affiliated with OpenAI
- **MongoDB Storage**: If configured, review data is stored in your database

---

## 📋 PR Output Example

When the bot reviews a PR, it generates:

### 1. Summary Comment

- Walkthrough of changes
- Table of modified files
- Fun poem celebrating the changes

### 2. Automated Checks Table

| Check            | Status | Details                     |
| ---------------- | ------ | --------------------------- |
| PR Title         | ✅/❌  | Conventional Commits format |
| Description      | ✅/❌  | Sufficient detail check     |
| Test Coverage    | ✅/⚠️  | Test files modified         |
| Security         | ✅/🔴  | High priority issues found  |
| Pattern Analysis | ✅/🟡  | Total analyzer issues       |

### 3. Line-by-Line Comments

Specific suggestions on code changes, directly on the diff.

---

## 📄 License

MIT License - See [LICENSE](./LICENSE)

---

## 🙏 Credits

Originally forked from
[CodeRabbit OSS](https://github.com/coderabbitai/openai-pr-reviewer),
extensively modified with:

- Pattern-based analyzers
- MongoDB integration
- Custom branding
- Enhanced automated checks
