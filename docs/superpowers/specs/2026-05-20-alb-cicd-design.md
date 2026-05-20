# ALB + CI/CD Load Balancing Design

**Date:** 2026-05-20
**Scope:** Add a second EC2, Application Load Balancer, updated GitHub Actions pipeline, and Artillery load tests to Petopia Admin.

---

## 1. Health Endpoint

Add `GET /api/health` to the Express backend.

**Response:**
```json
{ "status": "ok", "instance": "ec2-1" }
```

- `INSTANCE_ID` is an environment variable set in `backend/.env` on each EC2 individually (`ec2-1` or `ec2-2`)
- The ALB target group health check points to `/api/health`, expects HTTP 200
- Hitting the ALB URL 20+ times and observing alternating `instance` values proves traffic distribution

**Implementation:** Add the route directly in `backend/server.js` (or a thin `routes/healthRoutes.js` if preferred).

---

## 2. EC2 Instance Setup

Both EC2 instances are freshly launched and must be configured identically, except for `INSTANCE_ID`.

### Steps (repeat on each instance via SSH)

1. **Install runtime dependencies**
   - Node.js 22 via NodeSource
   - PM2 globally (`npm install -g pm2`)
   - Nginx to proxy port 80 → 5001

2. **Clone the repository**
   ```bash
   git clone <repo-url> /home/ec2-user/app
   cd /home/ec2-user/app
   ```

3. **Configure environment**
   Create `backend/.env`:
   ```
   MONGO_URI=<atlas-connection-string>
   JWT_SECRET=<secret>
   PORT=5001
   INSTANCE_ID=ec2-1   # ec2-2 on the second instance
   ```

4. **Build the frontend**
   ```bash
   cd frontend && yarn install && yarn build
   ```

5. **Start with PM2**
   ```bash
   pm2 start backend/server.js --name petopia-backend
   pm2 save
   pm2 startup   # follow the printed command to enable auto-start on reboot
   ```

6. **Register the GitHub Actions runner**
   - Runner name: `petopia-ec2-1` (or `petopia-ec2-2`)
   - Runner label: `petopia` (shared label used by the workflow matrix)
   - Follow GitHub → Settings → Actions → Runners → New self-hosted runner

### Security Groups (AWS Console)

| Security Group | Inbound Rule | Source |
|---|---|---|
| ALB SG | TCP 80, 443 | `0.0.0.0/0` |
| EC2 SG | TCP 80 | ALB SG only |
| EC2 SG | TCP 22 | Your IP |

Remove any rule that allows world-facing port 80 directly on EC2 instances.

---

## 3. GitHub Actions Workflow

Restructure `.github/workflows/ci.yml` from a single monolithic job into two jobs: `test` and `deploy`.

### Job 1: `test`

Runs on a single runner (`[self-hosted, petopia]`). Handles everything that only needs to happen once:

- Checkout code
- Setup Node.js 22
- Install backend and frontend dependencies
- Build frontend (`yarn build`)
- Run backend tests — env vars injected via the `env:` block in YAML, **not** by writing to `.env`

> **Important:** Do not write `backend/.env` from `secrets.PROD` in the workflow. Each EC2's `.env` is gitignored and persists on disk between deploys. Overwriting it from a shared secret would erase the per-instance `INSTANCE_ID`. Instead, pass `MONGO_URI`, `JWT_SECRET`, and `PORT` directly to the test step via `env:`.

### Job 2: `deploy`

Runs only after `test` passes (`needs: test`). Fans out to both instances in parallel via a matrix:

```yaml
strategy:
  matrix:
    instance: [ec2-1, ec2-2]
runs-on: [self-hosted, "${{ matrix.instance }}"]
```

Each runner:
- Pulls latest code (`git pull origin main`)
- Installs backend dependencies (`yarn install` in `backend/`)
- Rebuilds frontend (`yarn build` in `frontend/`) — each runner has its own filesystem
- Restarts PM2 (`pm2 restart petopia-backend`)

Each EC2's `backend/.env` (including its unique `INSTANCE_ID`) is already on disk from the one-time manual setup. The deploy job never touches `.env`.

### GitHub Secrets

| Secret | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string (used in test job `env:` block) |
| `JWT_SECRET` | JWT signing secret (used in test job `env:` block) |
| `PORT` | Express port (5001) (used in test job `env:` block) |

`INSTANCE_ID` is **not** a GitHub Secret — it is set once in each instance's `backend/.env` during manual setup and never overwritten by the pipeline.

---

## 4. Artillery Load Testing

Install Artillery locally or on EC2-1:
```bash
npm install -g artillery
```

### Test 1 — Sustained load (`load-test-1.yml`)

- **50 virtual users**, **2 minutes** sustained (constant arrival rate)
- Target: `GET /api/health` on the ALB DNS URL
- Proves baseline performance and traffic distribution (check `instance` field in responses)

### Test 2 — Ramp load (`load-test-2.yml`)

- Ramps from **0 → 200 virtual users** over **5 minutes**
- Same target, optionally add `GET /api/products` scenario to stress the full stack
- Reveals where latency degrades and errors begin under sustained pressure

### Metrics to Capture

**Artillery output (both tests):**
- Response time: p50, p95, p99
- Throughput (req/s)
- Error rate

**Comparison table (for writeup):**

| Metric | Test 1 (50 VU / 2 min) | Test 2 (200 VU / 5 min) |
|---|---|---|
| p50 response time | | |
| p99 response time | | |
| Throughput (req/s) | | |
| Error rate | | |

**CloudWatch screenshots (from AWS Console after tests):**
- ALB → `RequestCount` per target (proves distribution)
- ALB → `TargetResponseTime`
- EC2 → `CPUUtilization` per instance

### Written Analysis Prompts

- Where did most requests land? Was distribution even?
- At what user count did latency noticeably increase in Test 2?
- What did Test 2 reveal that Test 1 didn't (errors, CPU ceiling, response time spike)?
- Where is the bottleneck — app CPU, MongoDB, or network?

---

## 5. Public URL Update

Once the ALB is active and both targets are healthy:
- Update `README.md` public URL from the raw EC2 IP (`http://3.25.55.176`) to the ALB DNS name (e.g. `http://petopia-alb-xxxx.ap-southeast-2.elb.amazonaws.com`)
- This becomes the submission URL

---

## Evidence Checklist

- [ ] `GET /api/health` returns 200 with correct `instance` value on each EC2
- [ ] ALB console — active state, listener on port 80, both targets healthy
- [ ] Hit ALB URL ~20 times, show responses from both `ec2-1` and `ec2-2`
- [ ] GitHub Actions — workflow YAML, green-checkmark run showing both `deploy` matrix jobs
- [ ] `pm2 status` on each EC2 showing `petopia-backend` online
- [ ] Browser screenshot at the ALB DNS URL
- [ ] GitHub Secrets page (values blurred)
- [ ] Artillery Test 1 output (50 VU / 2 min)
- [ ] Artillery Test 2 output (200 VU / 5 min)
- [ ] CloudWatch: RequestCount, TargetResponseTime, CPUUtilization
- [ ] README updated to ALB DNS URL
