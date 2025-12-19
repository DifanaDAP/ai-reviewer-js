# AI-based PR Reviewer & Summarizer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

This is an AI-based code reviewer and summarizer for GitHub pull requests using OpenAI's `gpt-3.5-turbo` and `gpt-4` models. It is designed to be used as a GitHub Action and can be configured to run on every pull request and review comments.

## Features

- **PR Summarization**: Generates a summary and release notes of the changes in the pull request.
- **Modular Analyzers**: Includes 6 specialized analyzers for comprehensive review:
  - 🔍 **Static Analyzer**: Checks for code style issues, naming conventions, and anti-patterns.
  - 🛡️ **Risk Analyzer**: Detects security vulnerabilities (SQL injection, XSS, secrets) and performance issues.
  - 📋 **Structure Analyzer**: Validates PR title (Conventional Commits), description, and size.
  - 🧪 **Test Analyzer**: Checks for missing tests, skipped tests, and test isolation.
  - 📝 **Doc Analyzer**: Verifies documentation updates and JSDoc presence.
  - 📏 **Convention Analyzer**: Enforces file naming and coding conventions.
- **Pattern-Based Analysis**: Fast, deterministic feedback using regex patterns before AI analysis.
- **Line-by-line code change suggestions**: Reviews changes line by line and provides code suggestions.
- **Continuous, incremental reviews**: Reviews are performed on each commit within a pull request.
- **Cost-effective**: Incremental reviews save on tokens and reduce noise by tracking changed files.
- **"Light" model for summary**: Uses lighter models (for summaries) and "heavy" models for complex reviews.
- **Chat with bot**: Supports conversation with the bot in the context of lines of code or entire files.
- **Smart review skipping**: Skips in-depth review for simple changes (e.g. typo fixes) by default.
- **Customizable prompts**: Tailor the `system_message`, `summarize`, and `summarize_release_notes` prompts.

## Setup

To use this tool, add the provided YAML file to your repository and configure the required environment variables (`GITHUB_TOKEN` and `OPENAI_API_KEY`).

### Install instructions

Add the below file to your repository at `.github/workflows/ai-pr-reviewer.yml`

```yaml
name: Code Review

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
      - uses: DifanaDAP/ai-reviewer-js@latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        with:
          debug: false
          review_simple_changes: false
          review_comment_lgtm: false
```

#### Environment variables

- `GITHUB_TOKEN`: Automatically provided by GitHub Actions. Used to add comments to the PR.
- `OPENAI_API_KEY`: Required for OpenAI API authentication. Get one [here](https://platform.openai.com/account/api-keys) and add it to your GitHub Action secrets.
- `OPENAI_API_ORG`: (Optional) Specify your OpenAI organization ID if needed.

### Configuration

See [action.yml](./action.yml) for all available options.

**Common Configurations:**
- `openai_light_model`: Model for summaries (default: `gpt-3.5-turbo`)
- `openai_heavy_model`: Model for code reviews (default: `gpt-4`)
- `path_filters`: Glob patterns to exclude files from review (see action.yml for defaults)

### Advanced Configuration (`.ai-reviewer.yml`)

You can customize the analyzers by adding a `.ai-reviewer.yml` file to the root of your repository:

```yaml
# Enable/disable specific checks
enabled: true

# PR Structure rules
pr_structure:
  title_pattern: "^(feat|fix|docs|style|refactor|test|chore)..."
  require_description: true

# PR Size limits
pr_size:
  max_files: 20
  max_lines_added: 500

# File naming conventions
naming:
  typescript:
    class: "^[A-Z][a-zA-Z0-9]*$"
    function: "^[a-z][a-zA-Z0-9]*$"

# Custom ignore patterns
ignore:
  - "*.lock"
  - "dist/*"
```

### MongoDB Integration (v2)

To enable persistent storage of reviews and feedback, configure a MongoDB connection. This allows you to track PR history and feedback over time.

#### 1. Setup a MongoDB Instance
You can use:
*   **Local MongoDB**: If running on your own server.
*   **MongoDB Atlas**: Free cloud tier is perfect for this. Get a connection string like `mongodb+srv://<user>:<password>@cluster0.mongodb.net/ai_reviews`.

#### 2. Add Secret to GitHub
1. Go to your repository **Settings** > **Secrets and variables** > **Actions**.
2. Create a new repository secret named `MONGODB_URI`.
3. Paste your connection string.

#### 3. Update Workflow YAML
Add the `mongodb_uri` input to your workflow file:

```yaml
      - uses: DifanaDAP/ai-reviewer-js@latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
        with:
          mongodb_uri: ${{ secrets.MONGODB_URI }}
```

#### 4. Verification
Once configured, the PR comment will include a status indicator:
- ✅ **Review saved to MongoDB**: Confirms successful storage.
- ⚠️ **Failed to save review to MongoDB**: Shows the error if storage failed.

## Conversation with the Bot

You can reply to a review comment made by this action and get a response based on the diff context.
Tag the bot in a comment to invite it:

> @ai-pr-reviewer Please generate a test plan for this file.

## Ignoring PRs

To ignore a specific PR, add the following text to the PR description:

```text
@ai-pr-reviewer: ignore
```

## FAQs

### Review pull requests from forks

To review PRs from forks, update your workflow to use `pull_request_target` instead of `pull_request`. Note the security implications and ensure you check out the correct commit.

```yaml
on:
  pull_request_target:
    types: [opened, synchronize, reopened]
```

### Disclaimer

- **Data Usage**: Your code (files, diff, PR title/description) will be sent to OpenAI's servers.
- **Independence**: This action is not affiliated with OpenAI.

## Local Development & Verification

To run and verify the codebase locally (especially for Windows users):

1.  **Environment Setup**:
    Copy `.env.example` to `.env` and fill in your credentials:
    ```bash
    cp .env.example .env
    ```
    *   `MONGODB_URI`: Connection string for your local or remote MongoDB.
    *   `OPENAI_API_KEY`: Your OpenAI API Key.

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Verify MongoDB Connection**:
    Run the included test script to verify your MongoDB connection and read/write permissions:
    ```bash
    npm run test:connection
    ```
    This script will:
    - Connect to the database using `MONGODB_URI`.
    - Create a dummy review document.
    - Read the document back.
    - Clean up (delete) the document.

4.  **Run Tests**:
    ```bash
    npm test
    ```

