# Design Patterns & OOP Principles — Petopia Backend

> Explanations use the Feynman technique: simple analogy first, then how it applies to the code, then why it matters.

---

## Design Patterns

### 1. Singleton — `backend/config/db.js`

**What is it?**
Imagine a pet store with one central stock management system. Every department — food, toys, accessories — queries the same system to check inventory. There's no point running a separate database for each department; one shared system handles all queries. A Singleton ensures a class has only one instance and everyone shares it.

**In Petopia:**
The `connectDB` function connects to MongoDB once. The connection is created the first time the app starts and reused for every database query from that point on. Mongoose itself manages the single connection pool under the hood — `connectDB` is only called once in `server.js`.

```js
// backend/config/db.js
const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI);
};
// Called once in server.js — all repositories share this connection
```

**Why it matters:**
Opening a new database connection for every request would be extremely slow and would exhaust the database's connection limit. One shared connection handles hundreds of concurrent requests efficiently.

---

### 2. Factory — `backend/responseFactory.js`

**What is it?**
Imagine a pet store's label printer. Every product on the shelf — dog food, cat toys, fish tanks — gets a label printed in exactly the same format: name, price, SKU, and barcode. No one hand-writes labels differently for each product; one printer produces a consistent label every time. A Factory centralises object creation so every object comes out in the same standard shape.

**In Petopia:**
`ResponseFactory` is a class with static methods that build response objects. Every controller calls `ResponseFactory.ok()`, `ResponseFactory.notFound()`, etc. instead of constructing the JSON object by hand. Every response automatically includes `success`, `message`, `data`, `timestamp`, and `statusCode`.

```js
// backend/responseFactory.js
class ResponseFactory {
    static ok(data, message = 'Request successful') {
        return this.success(data, message, 200);
    }
    static notFound(message = 'Resource not found') {
        return this.error(message, 404);
    }
    // ...
}

// In a controller:
res.status(200).json(ResponseFactory.ok(user));
```

**Why it matters:**
Without a factory, each controller would hand-craft its own JSON shape. One controller might return `{ data: user }`, another `{ user }`, another `{ result: user }` — the frontend has to handle all variations. The factory guarantees a single consistent shape across the entire API.

---

### 3. Repository — `backend/repositories/`

**What is it?**
Imagine a pet store warehouse manager. When a staff member needs to know if a particular brand of dog food is in stock, they ask the warehouse manager — they don't go into the warehouse and search through every shelf themselves. The warehouse manager knows exactly where everything is stored and returns the answer. A Repository is that warehouse manager: it hides all the database query details behind plain, intention-revealing methods.

**In Petopia:**
Three repository classes (`UserRepository`, `CategoryRepository`, `ProductRepository`) wrap all Mongoose queries. Controllers never write `.find()`, `.findById()`, or `.populate()` directly — they call methods like `userRepo.findByEmail()` or `productRepo.findByIdWithCategory()`.

```js
// backend/repositories/UserRepository.js
class UserRepository extends BaseRepository {
    constructor(userModel = User) {
        super(userModel); // model injected — easy to swap in tests
    }

    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    // Override of BaseRepository.findAll — never expose password hashes
    async findAll() {
        return this.model.find().select('-password');
    }
}
module.exports = new UserRepository(); // exported as singleton instance
```

**Why it matters:**
If you ever switch from Mongoose to a different database library, you only change the repository files — not every controller. It also makes testing easy: inject a fake model in the constructor and test controller logic without hitting a real database.

---

### 4. Chain of Responsibility — `backend/middleware/`

**What is it?**
Imagine the checkout process at a pet store. First the cashier scans your loyalty card, then checks if any age-restricted products (like certain medications) require ID verification, then processes the payment. Each step either passes you through or stops the transaction. If any step fails, you don't complete the purchase. A Chain of Responsibility passes a request along a chain of handlers — each one either processes it or rejects it.

**In Petopia:**
Every protected route passes through two middleware functions chained in sequence: `protect` then `adminCheck`. `protect` verifies the JWT and attaches `req.user`. If that passes, `adminCheck` checks that `req.user.role === 'admin'`. Only if both pass does the request reach the route handler.

```js
// backend/routes/productRoutes.js
router.get('/',    protect, adminCheck, getProducts);
router.post('/',   protect, adminCheck, createProduct);
router.delete('/:id', protect, adminCheck, deleteProduct);

// protect (authMiddleware.js): verifies JWT, sets req.user
// adminCheck (adminMiddleware.js): checks req.user.role === 'admin'
// handler: only runs if both links in the chain call next()
```

**Why it matters:**
Authentication and authorisation are separate concerns. Splitting them into two middleware functions means each does one job. You could add a third link (e.g. rate limiting, audit logging) without touching the existing ones. It also makes the intent readable directly from the route definition.

---

### 5. Observer — `backend/models/User.js`

**What is it?**
Imagine a pet store's automatic reorder system. You don't manually check stock levels every day — the system watches inventory, and the moment a product drops below the reorder threshold, it automatically places a supplier order. Nobody has to remember to trigger it; the system reacts on its own. An Observer watches for an event and triggers a reaction without the caller having to think about it.

**In Petopia:**
The User model registers a Mongoose `pre('save')` hook. Whenever a User document is saved — whether on registration or profile update — the hook automatically checks if the password field changed. If it did, it hashes the password with bcrypt before it ever reaches the database. The controller that calls `user.save()` never has to remember to hash the password.

```js
// backend/models/User.js
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next(); // skip if password unchanged
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});
```

**Why it matters:**
If password hashing lived in the controller, every place that saves a user (register, update profile, admin password reset) would need to remember to hash it. One missed call means a plaintext password in the database. The hook makes it impossible to forget — the model handles it automatically every time.

---

## OOP Principles

### Encapsulation — `backend/repositories/UserRepository.js`

**What is it?**
Encapsulation means bundling data and the methods that operate on it into one unit, and protecting that internal state from the outside. Think of a vending machine: the money, inventory, and dispensing mechanism are all locked inside one box. You interact through the buttons on the front — you can't reach in and rearrange the cans yourself.

The emphasis is on **what lives inside the class**: data and behaviour are co-located, and internal state can't be directly modified by callers.

> **Encapsulation vs Abstraction:** Encapsulation is the *mechanism* — it's about how a class protects and organises its internals. Abstraction is the *outcome* — it's about what a simplified interface looks like to the caller. A class can encapsulate without providing a particularly clean interface, and you can abstract behind a function without bundling state at all.

**In Petopia:**
`UserRepository` owns the model instance and all Mongoose query logic. Controllers can't directly call `.find()` or `.select()` on the model — those details are sealed inside the class. The controller is forced to go through the repository's public methods.

```js
// Controller only sees the intention, not the query
const users = await userRepo.findAll();

// Inside UserRepository — the password projection is hidden from the caller
async findAll() {
    return this.model.find().select('-password');
}
```

**Why it matters:**
If the query needs to change (e.g. also excluding `refreshToken`), the fix is in one place inside the class. No controller needs to be updated. Callers are protected from the change because they never depended on the internal details — `getUsers` just asks for `findAll()` and trusts the repository to return safe data.

---

### Abstraction — `backend/controllers/` using `ResponseFactory`

**What is it?**
Abstraction means exposing only what a caller needs and hiding everything else behind a simple interface. Think of a TV remote: the "Volume Up" button is the interface. The infrared encoding, signal timing, and circuit board are all hidden — and irrelevant to you.

The emphasis is on **what the caller sees**: a clean, intention-revealing interface that lets you say *what* you want without specifying *how* to achieve it.

> **Abstraction vs Encapsulation:** Abstraction is the *outcome* — a simplified interface. Encapsulation is the *mechanism* — bundling and protecting internals inside a class. `ResponseFactory` abstracts response construction; `UserRepository` encapsulates query logic. Both hide complexity, but from different angles: abstraction is a design goal, encapsulation is an implementation technique that often achieves it.

**In Petopia:**
Controllers use `ResponseFactory.ok()` and `ResponseFactory.notFound()` without knowing how the response object is built. The factory handles adding `timestamp`, `statusCode`, and `success` flag internally. Controllers express *what* outcome they want, not *how* to construct it.

```js
// Controller expresses intent clearly
return res.status(200).json(ResponseFactory.ok(product));
// Controller has no idea how that object was constructed
```

**Why it matters:**
If the response shape ever needs to change (e.g. adding a `requestId` field for tracing), the change happens only inside `ResponseFactory`. Every controller that calls `ResponseFactory.ok()` automatically gets the new shape — none of them need to be touched.

---

### Inheritance — `backend/repositories/`

**What is it?**
Inheritance means a child class takes on the properties and behaviour of a parent. Think of a `Dog` class that inherits from `Animal` — it gets all of Animal's basic behaviour and adds its own.

**In Petopia:**
`BaseRepository` defines the methods every repository needs: `findById`, `findAll`, `count`, `create`, `save`, and `deleteById`. Each concrete repository (`UserRepository`, `ProductRepository`, `CategoryRepository`) calls `extends BaseRepository` and inherits these methods without rewriting them. Each subclass then adds only the domain-specific queries it needs — for example, `UserRepository` adds `findByEmail`, while `ProductRepository` adds `findByIdWithCategory` and `countByCategory` (which reuses the inherited `count`). Subclasses also **override** `findAll` where they need different behaviour (see Polymorphism below).

```js
// backend/repositories/BaseRepository.js
class BaseRepository {
    constructor(model) { this.model = model; }
    async findById(id)        { return this.model.findById(id); }
    async findAll(filter = {}) { return this.model.find(filter); }
    async count(filter = {})   { return this.model.countDocuments(filter); }
    async create(data)        { return this.model.create(data); }
    async save(doc)           { return doc.save(); }
    async deleteById(id)      { return this.model.findByIdAndDelete(id); }
}

// backend/repositories/UserRepository.js
class UserRepository extends BaseRepository {
    constructor(userModel = User) { super(userModel); }
    // inherits findById, count, create, save, deleteById
    async findByEmail(email) { return this.model.findOne({ email }); }
    async findAll() { return this.model.find().select('-password'); } // override
}
```

**Why it matters:**
Without `BaseRepository`, the same method bodies appear identically in all three repository files. If `create` ever needed to change — for example, to add audit logging — the change would need to be made in three places. With inheritance, it is in one.

---

### Polymorphism — `backend/repositories/` `findAll()` override

**What is it?**
Polymorphism means one interface, many behaviours: you call the same method on different objects and each does the right thing for its own type. Think of an `Animal` reference with a `speak()` method — call it on a `Dog` and you get a bark, on a `Cat` a meow. The caller doesn't branch on the type; the runtime picks the correct implementation.

**In Petopia:**
Every repository extends `BaseRepository`, which defines a default `findAll(filter)`. Each subclass **overrides** `findAll()` with the query its data needs: `ProductRepository` populates the category and sorts newest-first, `CategoryRepository` sorts alphabetically by name, `UserRepository` strips the password hash. Any code holding a repository calls the same `.findAll()` and the runtime dispatches to the matching override based on the object's actual type.

```js
// BaseRepository — the shared interface + default behaviour
async findAll(filter = {}) { return this.model.find(filter); }

// ProductRepository overrides it
async findAll(filter = {}) {
    return this.model.find(filter).populate('category', 'name').sort({ createdAt: -1 });
}
// CategoryRepository overrides it
async findAll() { return this.model.find().sort({ name: 1 }); }
// UserRepository overrides it
async findAll() { return this.model.find().select('-password'); }
```

The Dashboard is a real polymorphic call site — it fetches products, categories, and users through their `findAll()` endpoints to build its stat counts, and each returns data shaped correctly for its type without the caller knowing how.

```js
// Same call, three different behaviours selected by runtime type
const all = await Promise.all([productRepo, categoryRepo, userRepo].map(r => r.findAll()));
```

**Why it matters:**
The caller depends only on the `BaseRepository` contract (`findAll` returns a list), not on each model's query details. Adding a new repository — say `OrderRepository` with its own `findAll()` — requires no change to any existing caller. This is genuine subtype polymorphism via method overriding, not just helper methods with default arguments.

---

## Quick Reference

| Pattern / Principle | File | One-line summary |
|---|---|---|
| Singleton | `config/db.js` | One shared MongoDB connection for the entire app |
| Factory | `responseFactory.js` | One place that builds all API response objects |
| Repository | `repositories/*.js` | Hides Mongoose query details behind plain method names |
| Chain of Responsibility | `middleware/authMiddleware.js` + `adminMiddleware.js` | JWT check → role check → handler, each link can stop the chain |
| Observer | `models/User.js` | Auto-hashes password before save, no controller involvement |
| Encapsulation | `repositories/UserRepository.js` | Query internals hidden inside the class |
| Abstraction | `controllers/` + `responseFactory.js` | Controllers express intent, not implementation |
| Inheritance | `repositories/BaseRepository.js` | Shared CRUD methods in one base class; subclasses add domain-specific queries |
| Polymorphism | `repositories/*.js` | Each repository overrides `findAll()`; same interface, different query per type |
