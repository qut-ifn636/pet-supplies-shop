# Section 3 — API Testing using Postman

## Purpose

Demonstrate that every API endpoint works correctly, including error cases. Worth 2.5 marks — a quick win once the collection is built.

## What You Need

- All endpoints tested, including error/unhappy paths
- Screenshots of each request showing status code + response body
- The collection exported as `.json` and committed to the repo
- A working link to the collection in your report

## Postman Collection File

The exported collection JSON is committed at:

```
docs/petopia-postman-collection.json
```

Link this file in your report as: `https://github.com/raytf/qut_ifn636_pet-supplies-shop/blob/main/docs/petopia-postman-collection.json`

> **Important:** The rubric explicitly requires a link to the exported collection. Without the committed file, you cannot provide that link. Keep the file in the repo.

## Endpoints to Cover

### Auth
| Request | Expected |
|---|---|
| POST `/api/auth/register` — valid body | 201, user returned |
| POST `/api/auth/register` — duplicate email | 409 conflict |
| POST `/api/auth/login` — valid credentials | 200, token returned |
| POST `/api/auth/login` — wrong password | 401 |
| GET `/api/auth/profile` — with token | 200, user profile |
| GET `/api/auth/profile` — no token | 401 |

### Categories
| Request | Expected |
|---|---|
| GET `/api/categories` — with token | 200, array |
| POST `/api/categories` — admin token, valid body | 201 |
| POST `/api/categories` — non-admin token | 403 |
| PUT `/api/categories/:id` — admin | 200, updated |
| DELETE `/api/categories/:id` — admin | 200 |
| DELETE `/api/categories/:id` — has products attached | 400 |

### Products
| Request | Expected |
|---|---|
| GET `/api/products` — admin token | 200, array |
| GET `/api/products?search=dog` — admin | 200, filtered |
| GET `/api/products?category=<id>` — admin | 200, filtered |
| POST `/api/products` — admin, valid body | 201 |
| POST `/api/products` — missing price | 400 |
| PUT `/api/products/:id` — admin | 200, updated |
| DELETE `/api/products/:id` — admin | 200 |
| GET `/api/products/:id` — invalid ID | 404 |

### Users
| Request | Expected |
|---|---|
| GET `/api/auth/users` — admin | 200, user list |
| GET `/api/auth/users` — customer token | 403 |

### Health
| Request | Expected |
|---|---|
| GET `/api/health` | 200, `{ status: 'ok', instance: 'ec2-1' }` |

## Postman Tips

- Use an environment variable `{{token}}` — set it from the login response so every subsequent request stays clean.
- Screenshot each response showing: the URL, the HTTP method, the status code badge, and the response body.
- For error cases: show the 400/401/403/404 response body with the error message.

## Key Talking Points for the Demo

- "I used a Postman environment variable for the JWT token so I don't paste it into every request manually."
- "For error cases I tested 401 (no token), 403 (customer hitting admin route), 404 (invalid product ID), and 400 (missing required field)."
- "The collection is exported to `docs/petopia-postman-collection.json` in the repo so anyone can import it and rerun the tests."
