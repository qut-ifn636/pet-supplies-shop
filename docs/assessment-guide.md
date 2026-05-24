# IFN636 Assessment 2 — Assignment Guide

**Project:** Petopia (Pet Supplies Shop) — React + Node/Express + MongoDB
**Total:** 35 marks (delivered as one file submitted via Canvas, plus a live demo)
**Goal of this guide:** translate every rubric criterion into concrete, HD-level actions you can tick off.

> **Read this first.** Your final mark depends on a **demonstration** where you show the system working and explain your design decisions. Everything below should be something you can *explain*, not just paste in. Also: a **Gen-AI usage section is mandatory** — failing to declare it is treated as an academic integrity breach.

---

## Mark Distribution & Effort Priority

| # | Criterion | Marks | Difficulty | New vs A1.2 | Priority |
|---|---|---|---|---|---|
| 1 | SRS Documentation | 4 | Low | Mostly reusable | 🟡 Medium |
| 2 | Design Patterns & OOP | 6 | High | **New** | 🔴 Critical |
| 3 | API Testing (Postman) | 2.5 | Low | New | 🟢 Quick win |
| 4 | Functional Testing | 2.5 | Medium | New | 🟢 Quick win |
| 5 | CI/CD Pipeline | 4 | Low | Reusable | 🟡 Medium |
| 6 | Load Balancing & Load Testing | 6 | High | **New** | 🔴 Critical |
| 7 | Team Collaboration | 5 | Medium | **New** | 🔴 Critical |
| 8 | Report | 5 | Medium | New | 🟡 Medium |

**Biggest point earners that are also new:** Design Patterns/OOP (6), Load Balancing (6), Team Collaboration (5). These three are 17 of 35 marks and none carried over from 1.2 — budget your time accordingly.

---

## ⚠️ Flag: Team Collaboration on a solo project

The rubric awards 5 marks for **team** collaboration evidence: a signed agreement sheet, per-member commit history, pull requests *with reviews*, resolved merge conflicts, and meeting records. If you're working solo, this criterion can't be fully met as written.

**Before doing anything else, confirm with your tutor whether Assessment 2 is solo or team.** A2 differs from A1.2 (which your unit ran individually). If it's a team assessment and you're currently solo, you need a team. If your tutor permits solo submission, ask explicitly how the Team Collaboration criterion will be marked for you, and document that conversation. Don't assume the 1.2 solo arrangement carries over.

---

## 1. SRS Documentation (4 marks)

**HD descriptor:** comprehensive purpose + compelling problem definition tied to real-world needs; full system boundaries (inclusions/exclusions); user roles, skill levels, accessibility; complete FR/NFR; labelled system overview diagram; data protection, error handling, recovery; risk table with likelihood, impact, and mitigation.

Most of this exists in your Assignment 1 requirements work — reuse and tighten it. The HD-specific additions to write fresh:

- **Accessibility considerations** — even a short paragraph (keyboard nav, colour contrast, responsive breakpoints).
- **System safety** — data protection (JWT, bcrypt password hashing, env-managed secrets), error handling pattern, and recovery (PM2 auto-restart, DB connection retry).
- **Risk register** — a table is the cleanest way to hit "well-structured."

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| EC2 public IP changes on restart breaks access | Medium | Medium | Use ALB DNS / Elastic IP; document re-adding security group rules |
| Exposed secrets in repo | Low | High | `.env` gitignored; GitHub Secrets for CI/CD |
| Unauthorised admin access | Low | High | JWT + `isAdmin` middleware on all admin routes |
| DB unavailable | Low | High | Connection retry + PM2 restart; error returned, not crash |

**Subsections to include** (matches the submission template):
1.1 Project Overview & Purpose · 1.2 Problem Statement & Scope · 1.3 User Characteristics · 1.4 Constraints · 1.5 Functional Requirements (`FR-01:` format, "The system shall…") · 1.6 NFRs (quantify, e.g. "respond within 2s under normal load") · 1.7 Low-fidelity wireframes (reuse Figma) · 1.8 Complete system diagram (frontend → backend → MongoDB → GitHub Actions → EC2 → **ALB** → external APIs).

**HD watch-outs:** the system diagram must now show the **load balancer and two EC2 instances** — update it from your 1.2 version. FRs/NFRs must match what you actually demo.

---

## 2. Design Patterns & OOP Principles (6 marks)

**HD descriptor:** correct use of **5 patterns** with strong OOP concepts, clearly explained. For *each* pattern: specific **backend code (screenshot)** + justification for choosing it. For *each* OOP principle: specific backend code + justification.

This is the hardest "new" section. You need five genuine patterns visible in your backend. Candidates that fit a Node/Express/Mongoose app naturally:

| Pattern | Where it lives in Petopia | Justification angle |
|---|---|---|
| **Singleton** | MongoDB connection (`config/db.js`) — one shared connection instance | Avoids reconnect overhead; single source of truth |
| **MVC / layered** | routes → controllers → models separation | Separation of concerns, testability |
| **Middleware (Chain of Responsibility)** | `authMiddleware` → `adminMiddleware` → handler | Each link handles or passes the request |
| **Factory** | a function that builds a standard response object, or a model/document factory | Centralises object creation, consistent shape |
| **Repository / DAO** | a data-access module wrapping Mongoose queries for an entity | Decouples controllers from the ORM |
| **Strategy** | swappable validation or search strategies (e.g. search-by-name vs filter-by-category) | Interchangeable algorithms behind one interface |
| **Observer** | Mongoose pre/post hooks (`schema.pre('save', …)`) | React to model lifecycle events |

Pick **five you can actually point at in code** — examiners check the screenshot matches a real, justified choice, not a label slapped on. The Singleton (DB), Middleware chain, and MVC are essentially already in your starter; Factory (response helper), Repository, Strategy, or Observer (Mongoose hooks) are easy additions.

**OOP principles to evidence** (with a code screenshot + justification each):
- **Encapsulation** — Mongoose schema methods / private logic inside a model or class.
- **Abstraction** — controllers call a repository/service without knowing query internals.
- **Inheritance** — a base schema/class extended by entity-specific ones, or extending Mongoose's base.
- **Polymorphism** — same method name behaving differently across types (e.g. a shared `format()` overridden, or strategy functions sharing an interface).

**HD watch-outs:** "barely implemented" or "label without code" loses marks fast. Each pattern needs (a) a real code screenshot and (b) one or two sentences of *why this pattern here*. Refactoring some controllers into a small service/repository layer is the cleanest way to surface several patterns at once — and you'll be able to explain it in the demo.

---

## 3. API Testing using Postman (2.5 marks)

**HD descriptor:** **all** endpoints tested **with error handling**, screenshots provided, and a **link to the exported Postman collection**.

This is a quick win — you already use Postman.

- Build a collection covering every endpoint: auth (register, login, profile), categories CRUD, products CRUD (+ `?search=` and `?category=`), users list.
- For HD you must show **error cases**, not just happy paths: 400 (validation), 401 (no/invalid token), 404 (not found), 403 (non-admin hitting admin route).
- Use a Postman **environment variable** for the JWT so requests stay clean.
- **Export the collection** (`.json`) and include a link — the rubric explicitly requires it. Put the file in the repo and link it in the report.
- Screenshot each request showing the response body + status code.

---

## 4. Functional Testing (2.5 marks)

**HD descriptor:** terminal pass/fail screenshots for **all** backend functionalities (create, update, delete, fetch), **plus a comprehensive test case table** with columns: **Test Case ID, Expected Output, Actual Output**.

- Use the starter's test framework (extend `example_test.js`). Write tests covering each CRUD operation per entity.
- Run them so you get a clean **terminal pass/fail** output to screenshot (e.g. `npm test`).
- Build the test case table — this is the part people skip and lose marks on:

| Test Case ID | Description | Expected Output | Actual Output | Status |
|---|---|---|---|---|
| TC-01 | Create product with valid data | 201, product returned | 201, product returned | Pass |
| TC-02 | Create product missing price | 400, validation error | 400, validation error | Pass |
| TC-03 | Get products list | 200, array of products | 200, array | Pass |
| TC-04 | Update product | 200, updated fields | 200, updated | Pass |
| TC-05 | Delete category with products attached | 400, blocked | 400, blocked | Pass |
| TC-06 | Access admin route without token | 401 | 401 | Pass |

Cover create/read/update/delete for products and categories at minimum, plus auth failure cases.

---

## 5. CI/CD Pipeline (4 marks)

**HD descriptor:** fully functional automated GitHub Actions pipeline; instance link in docs; `pm2 status` confirms backend + frontend online; working public URL; everything integrated.

This carries over from 1.2 — mostly verification.

Screenshots required by the template:
- **5.1** workflow `.yml` file.
- **5.2** `pm2 status` table from the EC2 terminal (both processes `online`).
- **5.3** GitHub "Run Test" / Actions page showing job steps passing.
- **5.4** app's first page in the browser **highlighting the public IP**.

**HD watch-outs:** with the load balancer added (section 6), decide whether your "public URL" is the **ALB DNS** or a single instance IP — be consistent across the report. Remember your recurring gotcha: after an EC2 restart the IP changes and the security group inbound rules (SSH 22, HTTP 80) need re-adding; the ALB DNS is stable, so prefer linking that.

---

## 6. Load Balancing and Load Testing (6 marks)

**HD descriptor:** all activities evidenced — healthy targets, ALB active, distribution confirmed, **two load tests with different parameters compared**, CloudWatch metrics, and a clear written analysis of load distribution.

This is brand new and worth 6 marks. Plan time for it.

**6.1 Load balancer setup** — deploy on **two EC2 instances** behind an **AWS ALB**:
- (a) both instances **Running** (EC2 console screenshot).
- (b) **Target Group** with both instances **healthy**.
- (c) **ALB Active** showing its **DNS name**.
- (d) traffic distribution — hit the ALB DNS repeatedly (browser refresh or `curl` in a loop) and capture responses **alternating between the two instances**. Tip: add a small env var or hostname tag to a health/response endpoint so you can *see* which instance answered.

**6.2 Load testing** — Apache Benchmark (`ab`), **two tests, different parameters**:
- (a) **Baseline** `ab` output — explain **Requests per second**, **Time per request**, **Failed requests**.
- (b) **Higher concurrency/request count** — compare against baseline, explain differences.
- (c) **CloudWatch** CPU utilisation spike during the test (+ any triggered events).
- (d) **3–5 sentence analysis**: how the ALB distributed traffic, how the system handled increased load, and what this shows about reliability and cost-effectiveness.

Example commands:
```
# Baseline
ab -n 1000 -c 10 http://<ALB-DNS>/

# Higher load
ab -n 5000 -c 100 http://<ALB-DNS>/
```

**HD watch-outs:** the single most-missed item is **(d) the written analysis** — don't just paste screenshots. Also ensure targets show **healthy**, not just registered; an unhealthy target tanks this section.

---

## 7. Team Collaboration (5 marks)

**HD descriptor:** signed team agreement (justified contributions); GitHub evidence of consistent branching, **per-member** commit history, **PRs with reviews**, **resolved merge conflicts**, a parallel-development commit graph; meeting records with dates; communication channel screenshots; coherent collaboration statement.

**See the flag at the top.** If solo, confirm the arrangement with your tutor in writing.

If working in a team, evidence to gather as you go (not at the end):
- **Agreement sheet** filled and signed, with a contribution % per member adding to 100% (in the submission template).
- **GitHub graph view** showing parallel branches from different members.
- **Per-member commits** — everyone's name visible in history.
- **PRs with actual review comments** — reviewer ≠ author. (CodeRabbitAI reviews are a nice supplement but a human reviewer is what the rubric wants.)
- At least one **resolved merge conflict** (screenshot before/after).
- **Meeting log** — dates + brief notes.
- **Comms screenshot** — Slack/Discord/Teams thread.

**7.1** collaboration statement (who did what, how you coordinated) · **7.2** the evidence above.

---

## 8. Report (5 marks)

**HD descriptor:** polished, comprehensive report with clear explanation of design and collaboration.

The report *is* the submission file — sections 1–9 of the template. For HD:
- Write in clear, plain language; tie design decisions to *why*, not just *what*.
- Make every link **work** (GitHub, ALB/public URL, Postman collection) — broken links get negative marking per the template.
- Include the **Gen-AI usage section** (mandatory): which tools (e.g. Claude for specs/report/diagrams, Auggie for implementation, CodeRabbitAI for PR review), and where each was used.
- **Section 8** Discussion & Conclusion and **Section 9** Reflection (what you learned, difficulties faced) — these are easy marks if you actually write them; don't leave them blank.
- **References** in APA style.

---

## Cover Page & Submission Checklist

Fill in on the template's first page:
- [ ] Project Title, full name(s), student ID(s), tutor name, tutorial day/time
- [ ] Team agreement sheet completed + signed (or tutor-confirmed solo arrangement)
- [ ] **GitHub link** working
- [ ] **EC2 Instance ID and Name** filled in

Before you submit:
- [ ] Everything in **one file**, exported as **PDF**
- [ ] All 8 rubric sections present with the required screenshots
- [ ] Five design patterns, each with code screenshot + justification
- [ ] Four OOP principles, each with code screenshot + justification
- [ ] Postman collection exported and linked
- [ ] Functional test case table (TC-ID / Expected / Actual) complete
- [ ] ALB DNS reachable; both targets healthy; two `ab` tests compared
- [ ] CloudWatch CPU screenshot + written analysis included
- [ ] Gen-AI usage section written
- [ ] All links tested and live
- [ ] You can **demo and explain** every section verbally

---

## Suggested Order of Attack

1. **Confirm solo vs team** with tutor (gates section 7).
2. Stand up the **second EC2 + ALB** early (section 6 is the longest pole) — and keep using it as your public URL for the rest.
3. Refactor backend for **5 patterns + OOP** (section 2) — do this while the code is fresh, it feeds testing.
4. **Postman collection + functional tests** (sections 3 & 4) — fast once the API is stable.
5. **Verify CI/CD** still green against the new setup (section 5).
6. Run **load tests + CloudWatch** capture (section 6.2).
7. Write **SRS + Report + Gen-AI section** last, once screenshots exist (sections 1 & 8).
8. Fill the **cover page**, test every link, export to **PDF**.