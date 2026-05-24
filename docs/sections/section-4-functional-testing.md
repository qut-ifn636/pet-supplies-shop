# Section 4 — Functional Testing

## Purpose

Prove that the backend works correctly through automated tests that a marker can reproduce. Worth 2.5 marks. The key deliverables are: a clean terminal pass/fail screenshot, and a test case table with IDs, expected output, and actual output.

## Running the Tests

```bash
cd backend
npm test
# Expected: 26 passing
```

Take a screenshot of the terminal output showing all tests passing.

## Test Case Table

| TC ID | Description | Expected Output | Actual Output | Status |
|---|---|---|---|---|
| TC-01 | Register with valid data | 201, user object returned | 201, user returned | Pass |
| TC-02 | Register with duplicate email | 409, conflict error message | 409, conflict | Pass |
| TC-03 | Login with correct credentials | 200, JWT token returned | 200, token returned | Pass |
| TC-04 | Login with wrong password | 401, unauthorised message | 401, unauthorised | Pass |
| TC-05 | Get profile with valid token | 200, user profile (no password) | 200, user profile | Pass |
| TC-06 | Get profile with no token | 401, not authorised | 401, not authorised | Pass |
| TC-07 | Create product — admin, valid body | 201, product object | 201, product created | Pass |
| TC-08 | Create product — missing price | 400, validation error | 400, bad request | Pass |
| TC-09 | Get all products — admin token | 200, array of products | 200, array returned | Pass |
| TC-10 | Update product — admin | 200, updated product | 200, updated | Pass |
| TC-11 | Delete product — admin | 200, success message | 200, deleted | Pass |
| TC-12 | Create category — admin | 201, category object | 201, created | Pass |
| TC-13 | Get all categories — admin | 200, array of categories | 200, array returned | Pass |
| TC-14 | Update category — admin | 200, updated category | 200, updated | Pass |
| TC-15 | Delete category — no products attached | 200, success message | 200, deleted | Pass |
| TC-16 | Delete category — has products | 400, blocked with message | 400, blocked | Pass |
| TC-17 | Access admin route — no token | 401, not authorised | 401, not authorised | Pass |
| TC-18 | Access admin route — customer token | 403, admin access only | 403, forbidden | Pass |
| TC-19 | Health check endpoint | 200, `{ status: 'ok' }` | 200, ok | Pass |

## What the Tests Cover

The test suite is in `backend/test/`. Tests use **Mocha** (test runner), **Chai** (assertions), **chai-http** (HTTP requests), and **Sinon** (stubs to avoid a real database).

Key files:
- `authController_test.js` — register, login, profile
- `categoryController_test.js` — CRUD for categories
- `productController_test.js` — CRUD for products
- `health_test.js` — health endpoint

Sinon stubs replace Mongoose model methods so tests run without a MongoDB connection. This is fast and deterministic but means the tests verify controller logic, not the database itself.

## Key Talking Points for the Demo

- "The tests use Sinon stubs — no database connection required, so they run reliably in CI without test data."
- "26 tests pass. They cover create, read, update, delete for products and categories, plus all auth flows and the health check."
- "Deleting a category that still has products returns 400 — that's a business rule enforced in the controller and tested explicitly."
- "The test run is automated — every push to `main` runs `npm test` in the CI pipeline before deploying."
