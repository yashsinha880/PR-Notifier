# Monolith PR Deployment Notifier

A Slack bot and CLI tool to notify when a GitHub Pull Request (PR) has been deployed to your environment (e.g., staging or production).

## Features
- Slack bot: Get notified in Slack when your PR is deployed.
- CLI tool: Watch a PR and get notified in the terminal when it is live.
- Integrates with GitHub Actions workflows.

## Prerequisites
- Node.js (v16+ recommended)
- A GitHub Personal Access Token with `repo` and `actions` scopes
- A Slack App with a bot token and signing secret

## Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd monolith-bot
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file in the project root:
   ```env
   SLACK_BOT_TOKEN=xoxb-your-slack-bot-token
   SLACK_SIGNING_SECRET=your-slack-signing-secret
   GITHUB_TOKEN=your-github-token
   PORT=3000
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

## Usage

### Slack Bot
Start the Slack bot:
```bash
npm start
```

In Slack, use the command:
```
/notify-on-env <pr_number> <env>
```
Example:
```
/notify-on-env 57679 staging
```
You will get a DM when your PR is deployed.

### CLI Tool
Watch a PR for deployment:
```bash
npm run notify -- <pr_number>
```
Example:
```bash
npm run notify -- 57679
```
The CLI will poll GitHub Actions and notify you in the terminal when your PR is live.

## Project Structure
- `src/` - Source code
  - `slack/` - Slack bot implementation
  - `cli/` - CLI tool implementation
  - `gh/api/` - GitHub and deployment tracking logic

## Notes
- The tool checks the latest successful GitHub Actions workflow runs to determine if your PR's merge commit has been deployed.
- Make sure your GitHub Actions workflows are configured to run on merges to your deployment branch (e.g., `develop` or `master`).

## License
MIT
