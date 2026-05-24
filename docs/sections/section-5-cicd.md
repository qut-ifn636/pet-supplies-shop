# Section 5 — CI/CD Pipeline

## Purpose

Show that code changes are automatically tested and deployed without manual steps. Worth 4 marks. Most of this carries over from Assignment 1.2 — it's mainly verification and screenshots.

## How the Pipeline Works

Every push to `main` triggers `.github/workflows/ci.yml`, which has two jobs:

### Job 1: Test

Runs on any runner tagged `petopia`. Steps:
1. Checks out the code
2. Installs Node 22
3. Installs backend dependencies (`yarn install`)
4. Installs frontend dependencies
5. Runs backend tests (`yarn test`) with secrets injected as environment variables

Tests must pass before deployment proceeds.

### Job 2: Deploy (matrix — runs on both EC2s in parallel)

Runs on runners tagged `ec2-1` and `ec2-2` respectively. Steps:
1. Checks out latest code (with `clean: false` to preserve the `.env` file)
2. Writes `.env` from GitHub Secrets + injects `INSTANCE_ID` from the matrix variable
3. Installs backend dependencies
4. Builds the React frontend (`yarn build`)
5. Restarts the backend with PM2 (`pm2 restart petopia-backend`)

The frontend build output is served by Nginx directly from disk. Only `/api/` requests are proxied to Express on port 5001.

## Screenshots Required

| # | What to capture |
|---|---|
| 5.1 | The `.github/workflows/ci.yml` file (open in browser or screenshot from VS Code) |
| 5.2 | `pm2 status` output from each EC2 terminal — both processes must show `online` |
| 5.3 | GitHub Actions page showing the workflow run with all steps passing (green) |
| 5.4 | The app's first page in the browser with the **ALB DNS URL visible** in the address bar |

For 5.2, SSH into each EC2 and run:
```bash
pm2 status
```
Take a screenshot showing `petopia-backend` with status `online`.

For 5.4, use the ALB DNS:
```
http://pet-supplies-shop-ALB-803410956.ap-southeast-2.elb.amazonaws.com
```

## Architecture Summary

```
GitHub push to main
  → GitHub Actions (test job on self-hosted petopia runner)
    → if tests pass:
      → Deploy job matrix (ec2-1 runner + ec2-2 runner, in parallel)
        → checkout → write .env → yarn install → yarn build → pm2 restart
```

On each EC2:
- **Nginx** (port 80) serves `frontend/build` for all non-API routes
- **Nginx** proxies `/api/` → `localhost:5001`
- **PM2** keeps the Express server (`backend/server.js`) alive and restarts it on crash

## Key Talking Points for the Demo

- "The pipeline has two jobs: test first, then deploy. If any test fails, deployment is blocked."
- "Deployment runs as a matrix — both EC2 instances deploy in parallel, not sequentially."
- "Secrets (MONGO_URI, JWT_SECRET) are stored in GitHub Secrets, not in the repo. The `.env` file is written by the deploy job at runtime and is gitignored."
- "PM2 keeps the backend running across SSH sessions. If the process crashes, PM2 auto-restarts it."
- "The public URL is the ALB DNS, which stays stable even when EC2 IPs change after a restart."

## What to Know About `clean: false`

By default, `actions/checkout@v4` runs `git clean -ffdx`, which deletes any untracked files — including `.env`. By setting `clean: false`, the checkout step skips that clean, preserving the `.env` file written in a previous run. The deploy job always overwrites `.env` anyway (step 2), so there's no stale data risk.
