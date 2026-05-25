# Petopia Admin — Frontend Component Guide

All frontend source lives in `frontend/src/`.

---

## Route Map

| Route                   | Component file              | Auth required |
|-------------------------|-----------------------------|---------------|
| `/`                     | Redirects to `/dashboard`   | —             |
| `/login`                | `pages/Login.jsx`           | No            |
| `/register`             | `pages/Register.jsx`        | No            |
| `/dashboard`            | `pages/Dashboard.jsx`       | Yes           |
| `/profile`              | `pages/Profile.jsx`         | Yes           |
| `/products`             | `pages/ProductList.jsx`     | Yes           |
| `/products/new`         | `pages/AddProduct.jsx`      | Yes           |
| `/products/edit/:id`    | `pages/EditProduct.jsx`     | Yes           |
| `/categories`           | `pages/CategoryList.jsx`    | Yes           |
| `/users`                | `pages/UserList.jsx`        | Yes           |

---

## Shared Components

| Component               | Props                                                     | Purpose                                              |
|-------------------------|-----------------------------------------------------------|------------------------------------------------------|
| `Navbar.jsx`            | —                                                         | Top navigation bar; reads `user` from AuthContext; mobile hamburger at < md breakpoint |
| `ProtectedRoute.jsx`    | `{ children }`                                            | Redirects to `/login` using `<Navigate>` if no user in context |
| `ProductForm.jsx`       | `{ product?, onSubmit, loading }`                         | Reusable add/edit form; fetches categories internally; validates name, price ≥ 0, category, stock ≥ 0 |
| `CategoryForm.jsx`      | `{ category?, onSubmit, onCancel, loading }`              | Inline add/edit form; validates name required        |

---

## Page Summaries

| Page                | Fetches                         | Can mutate            |
|---------------------|---------------------------------|-----------------------|
| `Dashboard.jsx`     | products, categories, users     | No (read-only stats)  |
| `ProductList.jsx`   | products (search + filter)      | Delete                |
| `AddProduct.jsx`    | —                               | POST product          |
| `EditProduct.jsx`   | single product by id            | PUT product           |
| `CategoryList.jsx`  | categories                      | POST, PUT, DELETE     |
| `UserList.jsx`      | users                           | No (read-only)        |
| `Profile.jsx`       | own profile                     | PUT own profile       |

---

## Tailwind Conventions

| Element                  | Class string                                                 |
|--------------------------|--------------------------------------------------------------|
| Page wrapper             | `max-w-4xl mx-auto p-6`  (or `max-w-6xl` for wide tables)   |
| Form wrapper             | `bg-white p-6 shadow rounded max-w-lg mx-auto`               |
| Form input / select      | `w-full p-2 border rounded mb-4`                             |
| Primary button           | `bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700` |
| Danger button            | `bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700 text-xs` |
| Warning / edit button    | `bg-yellow-400 text-white px-3 py-1 rounded hover:bg-yellow-500 text-xs` |
| Disabled state           | `disabled:opacity-50` added to any button                    |
| Inline error message     | `text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm` |
| Inline success message   | `text-green-600 bg-green-50 border border-green-200 rounded p-2 text-sm` |
| Table header row         | `bg-gray-100 text-sm text-gray-700`                          |
| Table body row (hover)   | `hover:bg-gray-50 text-sm`                                   |

---

## Axios Instance (`axiosConfig.jsx`)

All API calls use the shared `axiosInstance` (never raw `axios`). It is configured with:

- **`baseURL: ''`** — uses relative URLs so requests go to the same origin as the frontend, letting nginx/ALB proxy `/api` to the backend regardless of environment.
- **Response interceptor** — auth endpoints (`/api/auth/*`) return a `ResponseFactory` envelope `{ success, message, data, timestamp, statusCode }`. The interceptor detects this shape and unwraps it, replacing `response.data` with the inner `data` payload. Components always read `res.data` uniformly; no call site needs to know whether an endpoint uses the envelope or returns raw data.

```js
// Detected shape → unwrapped transparently
{ success: true, message: '...', data: { token, ... } }  →  res.data = { token, ... }

// Raw shape (products, categories) → passed through unchanged
[{ _id, name, ... }]  →  res.data = [{ _id, name, ... }]
```

If you add a new endpoint that uses `ResponseFactory`, the interceptor handles it automatically with no frontend changes needed.

---

## Auth Flow

1. User lands on `/` → redirected to `/dashboard` by React Router
2. `ProtectedRoute` checks `user` from `AuthContext` — if null, redirects to `/login`
3. After login, `AuthContext.login()` saves the user object to both state and `localStorage`
4. On page refresh, `AuthContext` re-initialises from `localStorage`, keeping the session alive
5. `AuthContext.logout()` clears both state and `localStorage`, then `Navbar` navigates to `/login`
