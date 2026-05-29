# Section 2 — Design Patterns & OOP Principles

## Purpose

This section demonstrates that you understand and can apply object-oriented design patterns in a real backend. It is worth 6 marks and is one of the hardest new sections. The examiner will ask you to point at actual code and explain *why* you chose each pattern — not just what it is.

## What You Need

- **5 design patterns**, each with: a code screenshot from your backend + a 1–2 sentence justification for why it fits
- **4 OOP principles** (Encapsulation, Abstraction, Inheritance, Polymorphism), each with: a code screenshot + justification

## Patterns in Petopia

| Pattern | File | What to show |
|---|---|---|
| Singleton | `backend/config/db.js` | `connectDB` called once in `server.js`; Mongoose reuses the connection |
| Factory | `backend/responseFactory.js` | `ResponseFactory.ok()`, `.notFound()`, `.created()` — same shape every time |
| Repository | `backend/repositories/UserRepository.js` (or `ProductRepository.js`) | Constructor injection, `findByEmail()`, `findAllWithoutPassword()` |
| Chain of Responsibility | `backend/routes/productRoutes.js` | `router.post('/', protect, adminCheck, createProduct)` — two links before handler |
| Observer | `backend/models/User.js` | `userSchema.pre('save', …)` — auto-hashes password |

## OOP Principles in Petopia

| Principle | Where | One-line |
|---|---|---|
| Encapsulation | `repositories/UserRepository.js` | `.findAllWithoutPassword()` hides `.find().select('-password')` from callers |
| Abstraction | `controllers/` + `responseFactory.js` | Controllers call `ResponseFactory.ok(data)` without knowing how the object is built |
| Inheritance | `repositories/BaseRepository.js` | `UserRepository`, `ProductRepository`, `CategoryRepository` all extend `BaseRepository` — inherit `findById`, `create`, `save`, `deleteById` for free |
| Polymorphism | `responseFactory.js` | `.ok()`, `.created()`, `.notFound()` share the same method interface but produce different status codes |

## Key Talking Points for the Demo

**Singleton** — "The database connection is opened once when the server starts. Every controller and repository shares the same connection pool. Opening a new connection per request would be slow and would hit MongoDB's connection limit."

**Factory** — "Without a factory, each controller would hand-craft its own JSON shape. The factory guarantees every response has `success`, `message`, `data`, `timestamp`, and `statusCode`. The frontend always knows what shape to expect."

**Repository** — "The repository hides all Mongoose syntax. If we switched from Mongoose to another ORM, we'd only change the repository files — not every controller. It also makes testing easy: inject a fake model into the constructor and test controllers without a real database."

**Chain of Responsibility** — "Authentication and authorisation are separate concerns. `protect` verifies the JWT and attaches `req.user`. Only if that passes does `adminCheck` run. Adding a third concern (e.g. rate limiting) means adding a third middleware — the existing two don't change."

**Observer** — "The `pre('save')` hook is the safety net. Every place that saves a User — register, profile update, admin reset — automatically gets password hashing. If the hashing lived in the controller, one missed call would store a plaintext password."

## Common Exam Questions

- "Why Repository instead of calling Mongoose directly in the controller?" → Decoupling + testability.
- "What's the difference between Abstraction and Encapsulation?" → Encapsulation *hides* internals inside a class; Abstraction *exposes* a simple interface that hides complexity from callers.
- "Could you have more than one Singleton?" → Yes — a Singleton is about limiting instantiation, not the number of classes. `userRepo` is also exported as a singleton instance.
