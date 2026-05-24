# Section 1 — SRS Documentation

## Purpose

Document what the system does, who it's for, and the constraints around it. Worth 4 marks. Most content carries over from Assignment 1.2 — the HD-specific additions are the accessibility paragraph, the risk register, and updating the system diagram to show the ALB + two EC2 instances.

## Subsections Required

### 1.1 Project Overview & Purpose
Petopia Admin is a full-stack web application for managing a pet supplies shop. It allows administrators to manage the product catalogue, categories, and user accounts. Customers can register, log in, and view their profile.

### 1.2 Problem Statement & Scope

**Problem:** Pet supplies retailers need a reliable way to manage their online product catalogue. Manual updates across multiple systems are error-prone and slow.

**Scope — included:**
- Admin CRUD for products and categories
- Role-based access (admin vs customer)
- JWT-authenticated REST API
- Deployed on AWS with automated CI/CD

**Scope — excluded:**
- Customer-facing storefront / shopping cart
- Payment processing
- Supplier management / inventory tracking

### 1.3 User Characteristics

| Role | Description | Technical skill |
|---|---|---|
| Admin | Store manager who manages products and categories | Low — simple web UI |
| Customer | Registered user who can view their profile | Low |

### 1.4 Constraints
- Node.js ≥ 18 runtime
- MongoDB Atlas (cloud-hosted)
- Deployed on `t2.micro` EC2 instances (limited CPU/RAM)
- University AWS portal — EC2 instances stop every 24 hours; IPs change on restart

### 1.5 Functional Requirements

| ID | Requirement |
|---|---|
| FR-01 | The system shall allow users to register with a name, email, and password |
| FR-02 | The system shall authenticate users with email and password and return a JWT |
| FR-03 | The system shall allow admin users to create, read, update, and delete product categories |
| FR-04 | The system shall prevent deletion of a category that has associated products |
| FR-05 | The system shall allow admin users to create, read, update, and delete products |
| FR-06 | The system shall allow admin users to search products by name and filter by category |
| FR-07 | The system shall allow admin users to view all registered users |
| FR-08 | The system shall expose a health check endpoint returning current instance ID |

### 1.6 Non-Functional Requirements

| ID | Requirement |
|---|---|
| NFR-01 | API responses shall be returned within 2 seconds under normal load (≤ 10 concurrent users) |
| NFR-02 | The system shall reject unauthenticated requests to protected routes with HTTP 401 |
| NFR-03 | The system shall reject non-admin access to admin routes with HTTP 403 |
| NFR-04 | Passwords shall be stored as bcrypt hashes (min cost factor 10) — plaintext never stored |
| NFR-05 | The system shall maintain 99% uptime via ALB failover across two EC2 instances |
| NFR-06 | The CI/CD pipeline shall deploy to both EC2 instances within 5 minutes of a push to `main` |

### 1.7 Low-fidelity wireframes
(Reuse Figma wireframes from Assignment 1.2 — Login, Dashboard, Product List, Add Product, Category List)

### 1.8 System Diagram

The diagram must show all of these components connected:

```
Browser (user)
  ↓ HTTP
ALB (AWS Application Load Balancer)
  ↓ round-robin
  ├── EC2 Instance 1
  │     Nginx :80 → Express :5001 → MongoDB Atlas
  │     PM2 (process manager)
  │     GitHub Actions self-hosted runner (ec2-1)
  └── EC2 Instance 2
        Nginx :80 → Express :5001 → MongoDB Atlas
        PM2
        GitHub Actions self-hosted runner (ec2-2)

GitHub Actions (CI/CD)
  ↑ push to main
  Test job (petopia runner)
  Deploy job matrix → ec2-1 runner + ec2-2 runner
```

> Update your 1.2 diagram to add the ALB and the second EC2. The diagram must show the load balancer in the data path.

## Accessibility (HD addition)

Petopia Admin targets store staff on desktop browsers. Accessibility considerations include:
- Keyboard navigation for all form inputs and action buttons
- Sufficient colour contrast between text and backgrounds (WCAG AA, minimum 4.5:1)
- Responsive layout for tablet viewports (min-width 768px) — admin staff may use tablets on the shop floor
- Error messages displayed as text (not colour-only) so screen readers can announce them

## System Safety (HD addition)

| Concern | How it's handled |
|---|---|
| Authentication | JWT tokens signed with a secret stored only in GitHub Secrets and the server's `.env` |
| Password storage | bcrypt with cost factor 10 via a Mongoose `pre('save')` hook — never stored in plaintext |
| Secret management | `.env` is gitignored; written at deploy time from GitHub Secrets |
| Process recovery | PM2 auto-restarts Express if it crashes |
| Error handling | All API errors return structured JSON via `ResponseFactory`; unhandled exceptions caught by Express error middleware |

## Risk Register (HD addition)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| EC2 public IP changes on restart | High (daily at uni) | Low | ALB DNS is stable; SSH via EC2 Instance Connect (no fixed IP needed) |
| Exposed secrets in repo | Low | High | `.env` gitignored; all secrets in GitHub Secrets |
| Unauthorised admin access | Low | High | JWT + `adminCheck` middleware on all admin routes |
| Database unavailable | Low | High | Mongoose connection errors caught and returned as 500; PM2 restarts backend |
| Both instances fail simultaneously | Very low | High | Independent EC2s — single-AZ deployment; acceptable for academic scope |
