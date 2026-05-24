# Design Patterns & OOP Principles — Petopia Backend

> Explanations use the Feynman technique: simple analogy first, then how it applies to the code, then why it matters.

---

## Design Patterns

### 1. Singleton — `backend/config/db.js`

**What is it?**
Imagine a town that only ever needs one post office. No matter how many people want to send a letter, they all go to the same post office — there's no point building a second one. A Singleton ensures a class has only one instance and everyone shares it.

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
Imagine a bakery that stamps every loaf with the same label — ingredient list, weight, date. You don't stamp each loaf differently; you have one stamp machine (the factory) that always produces the same consistent label. A Factory centralises object creation so every object comes out in the same standard shape.

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
Imagine a librarian. When you want a book, you ask the librarian — you don't go into the back room yourself and search through the shelves. The librarian knows exactly where everything is. A Repository is that librarian: it hides all the database query details behind plain, intention-revealing methods.

**In Petopia:**
Three repository classes (`UserRepository`, `CategoryRepository`, `ProductRepository`) wrap all Mongoose queries. Controllers never write `.find()`, `.findById()`, or `.populate()` directly — they call methods like `userRepo.findByEmail()` or `productRepo.findByIdWithCategory()`.

```js
// backend/repositories/UserRepository.js
class UserRepository {
    constructor(userModel = User) {
        this.userModel = userModel; // injected — easy to swap in tests
    }

    async findByEmail(email) {
        return this.userModel.findOne({ email });
    }

    async findAllWithoutPassword() {
        return this.userModel.find().select('-password');
    }
}
module.exports = new UserRepository(); // exported as singleton instance
```

**Why it matters:**
If you ever switch from Mongoose to a different database library, you only change the repository files — not every controller. It also makes testing easy: inject a fake model in the constructor and test controller logic without hitting a real database.

---

### 4. Chain of Responsibility — `backend/middleware/`

**What is it?**
Imagine airport security: first you scan your boarding pass, then your bag goes through X-ray, then you walk through the metal detector. Each checkpoint either lets you through or stops you. If any step fails, you don't reach the gate. A Chain of Responsibility passes a request along a chain of handlers — each one either processes it or rejects it.

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
Imagine a motion sensor light: you don't manually turn the light on every time someone walks in — the sensor watches for movement and reacts automatically. An Observer watches for an event and triggers a reaction without the caller having to think about it.

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
Encapsulation means bundling data and the operations that work on it into one unit, and hiding the internal details from the outside world. Think of a car: you press the accelerator without knowing how the engine works internally.

**In Petopia:**
`UserRepository` hides all Mongoose query syntax inside a class. A controller that needs users doesn't know whether they come from `.find()`, `.findOne()`, or a raw query — it just calls `userRepo.findAllWithoutPassword()`. The internal implementation is encapsulated behind a clean method name.

```js
// Controller only sees the intention, not the query
const users = await userRepo.findAllWithoutPassword();

// Inside UserRepository — hidden from caller
async findAllWithoutPassword() {
    return this.userModel.find().select('-password');
}
```

---

### Abstraction — `backend/controllers/` using `ResponseFactory`

**What is it?**
Abstraction means exposing only what's necessary and hiding complexity. Think of a TV remote: you press "Volume Up" without knowing anything about the electronics inside.

**In Petopia:**
Controllers use `ResponseFactory.ok()` and `ResponseFactory.notFound()` without knowing how the response object is built. The factory's internal logic (adding `timestamp`, `statusCode`, `success` flag) is completely hidden. Controllers express *what* they want, not *how* to build it.

```js
// Controller expresses intent clearly
return res.status(200).json(ResponseFactory.ok(product));
// Controller has no idea how that object was constructed
```

---

### Inheritance — `backend/models/` extending Mongoose Schema

**What is it?**
Inheritance means a child class takes on the properties and behaviour of a parent. Think of a `Dog` class that inherits from `Animal` — it gets all of Animal's basic behaviour and adds its own.

**In Petopia:**
Every model (`User`, `Product`, `Category`) is created by calling `mongoose.model()` which produces a class that inherits from Mongoose's base `Model`. This gives every model built-in methods like `.save()`, `.find()`, `.findById()`, and `.populate()` without writing them. The schema definition extends this base with entity-specific fields and validation.

```js
// User inherits all Mongoose Model behaviour
module.exports = mongoose.model('User', userSchema);
// Product inherits same behaviour with different schema
module.exports = mongoose.model('Product', productSchema);
```

---

### Polymorphism — `backend/responseFactory.js` method overloading

**What is it?**
Polymorphism means the same interface behaves differently depending on context. Think of a "+" operator: `1 + 2` is addition, `"hello" + "world"` is concatenation — same symbol, different behaviour.

**In Petopia:**
`ResponseFactory` uses method overloading through default parameters. `success()`, `created()`, and `ok()` all call the same underlying builder but with different default values for `message` and `statusCode`. From the caller's perspective, `ResponseFactory.created(data)` and `ResponseFactory.ok(data)` have the same interface but produce different HTTP status codes and messages.

```js
static created(data, message = 'Resource created successfully') {
    return this.success(data, message, 201); // 201 Created
}

static ok(data, message = 'Request successful') {
    return this.success(data, message, 200); // 200 OK
}
// Same interface, different behaviour based on context
```

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
| Inheritance | `models/*.js` | All models inherit Mongoose's built-in query methods |
| Polymorphism | `responseFactory.js` | Same method interface, different status codes per context |
