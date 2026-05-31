# Petopia API Reference

**Base URL:** `http://localhost:5001`

## Authentication

All protected routes require the following header:

```
Authorization: Bearer <token>
```

Tokens are returned by the `/register` and `/login` endpoints and expire after 30 days.

---

## Auth Routes (`/api/auth`)

Auth endpoints use `ResponseFactory` and return a standard envelope:

```json
{
  "success": true,
  "message": "Login successful",
  "data": { ... },
  "timestamp": "2026-01-01T00:00:00.000Z",
  "statusCode": 200
}
```

The `data` payload for each endpoint is shown in the table below. The frontend axios instance (`axiosConfig.jsx`) unwraps this envelope automatically so components receive `data` directly via `res.data`.

| Method | Endpoint   | Auth  | Body / Query Params                    | `data` payload                                |
|--------|------------|-------|----------------------------------------|-----------------------------------------------|
| POST   | /register  | None  | `{ name, email, password }`            | `{ id, name, email, token }` (201)            |
| POST   | /login     | None  | `{ email, password }`                  | `{ id, name, email, role, token }`            |
| GET    | /profile   | User  | —                                      | `{ id, name, email, role, createdAt }`        |
| PUT    | /profile   | User  | `{ name?, email? }`                    | `{ id, name, email, role, token }`            |
| GET    | /users     | Admin | —                                      | `[{ _id, name, email, role, createdAt }]`     |

**Error responses:** `{ success: false, message: '...', errors: null, timestamp, statusCode }` with appropriate status (400, 401, 403, 404, 500)

---

## Category Routes (`/api/categories`)

| Method | Endpoint | Auth  | Body / Query Params          | Success Response                        |
|--------|----------|-------|------------------------------|-----------------------------------------|
| GET    | /        | Admin | —                            | `[{ _id, name, description, createdAt }]` |
| GET    | /:id     | Admin | —                            | `{ _id, name, description, createdAt }` |
| POST   | /        | Admin | `{ name, description? }`     | `{ _id, name, description, createdAt }` (201) |
| PUT    | /:id     | Admin | `{ name?, description? }`    | `{ _id, name, description, createdAt }` |
| DELETE | /:id     | Admin | —                            | `null` (envelope `message`: `'Category deleted successfully'`) |

Like the auth routes, category endpoints return the standard `ResponseFactory` envelope; the **Success Response** column above shows the `data` payload (unwrapped automatically by `axiosConfig.jsx`).

**Error responses:** `{ success: false, message: '...', errors: null, timestamp, statusCode }` with appropriate status (400, 404, 409, 500)

- `POST` returns **400** if `name` is missing
- `POST` / `PUT` return **409** if a category with that name already exists
- `DELETE` returns **400** if any products reference this category

---

## Product Routes (`/api/products`)

| Method | Endpoint | Auth  | Body / Query Params                                                    | Success Response                                   |
|--------|----------|-------|------------------------------------------------------------------------|----------------------------------------------------|
| GET    | /        | Admin | `?search=<string>` `?category=<ObjectId>`                              | `[{ _id, name, price, category: { name }, stock, imageUrl, createdAt }]` |
| GET    | /:id     | Admin | —                                                                      | `{ _id, name, description, price, category: { name }, stock, imageUrl, createdAt }` |
| POST   | /        | Admin | `{ name, price, category, description?, stock?, imageUrl? }`           | same as GET /:id (201) |
| PUT    | /:id     | Admin | `{ name?, description?, price?, category?, stock?, imageUrl? }`        | same as GET /:id |
| DELETE | /:id     | Admin | —                                                                      | `null` (envelope `message`: `'Product deleted successfully'`) |

**Query params (GET /):**
- `?search=dog` — case-insensitive regex match on product name
- `?category=<ObjectId>` — filter products by category ID

Like the auth routes, product endpoints return the standard `ResponseFactory` envelope; the **Success Response** column above shows the `data` payload (unwrapped automatically by `axiosConfig.jsx`).

**Error responses:** `{ success: false, message: '...', errors: null, timestamp, statusCode }` with appropriate status (400, 404, 500)

- `POST` / `PUT` return **400** if `name`, `price`, or `category` are missing, price is negative, or the referenced category does not exist
