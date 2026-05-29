# Petopia — Requirements Reference

Compiled from Assignment 1 (requirements diagram + JIRA traceability matrix). Phrased in "The system shall…" form for direct reuse in the Assessment 2 SRS (sections 1.5 and 1.6).

---

## Functional Requirements

| ID | Name | Requirement | Maps to (JIRA) |
|---|---|---|---|
| FR1.1 | Register | The system shall allow a customer to register with an email and password. | PS-1 |
| FR1.2 | Login | The system shall allow registered users to log in with their credentials and receive a session token. | PS-2 |
| FR1.3 | Manage Profile | The system shall allow a user to view, update, and delete their own profile. | PS-4, PS-13 |
| FR1.4 | Browse & Search | The system shall allow a customer to browse products by category, search by keyword, and view full product details. | PS-7, PS-8, PS-9 |
| FR1.5 | Shopping Cart | The system shall allow a customer to add, update the quantity of, and remove items in a cart, and shall calculate the cart total. | PS-10 |
| FR1.6 | Order Placement | The system shall allow a customer to place an order from their cart and view their past order history. | PS-11, PS-12 |
| FR2.1 | Product CRUD | The system shall allow an admin to create, read, update, and delete products. | PS-6 |
| FR2.2 | Category CRUD | The system shall allow an admin to create, read, update, and delete categories, and shall prevent deletion of a category that has products assigned. | PS-5 |
| FR2.3 | Order Management | The system shall allow an admin to view all orders, update order status, and view the registered customer list. | PS-14, PS-15 |
| FR3 | Access Control | The system shall restrict admin-only routes to authenticated users holding the admin role. | PS-2, PS-3 |

---

## Non-Functional Requirements

| ID | Name | Requirement |
|---|---|---|
| NFR1.1 | Usability | The system shall provide a responsive UI that works on screens from 375px (mobile) to 1024px+ (desktop), with clear error messages on all user actions. |
| NFR1.2 | Performance | The system shall respond to standard API requests within 2 seconds under normal load. |
| NFR1.3 | Reliability | The system shall handle errors gracefully without crashing, returning meaningful HTTP status codes, and shall recover automatically via process management (PM2). |
| NFR2 | Security | The system shall hash passwords with bcrypt, authenticate requests using JWT, and store secrets in environment variables (never in source control). |

---

## Notes for the A2 SRS

- **Scope reconciliation:** Assignment 1 defined the full e-commerce set above (incl. cart, checkout, orders). The A1.2 implementation was scoped down to an **admin management portal** (Products, Categories, Users — no customer cart/checkout/orders). Your A2 FRs/NFRs should match what you actually demo. If the cart/order flow isn't built, mark FR1.5, FR1.6, and FR2.3 as out of scope or move them to a "future work" subsection.
- **Format:** The A2 template asks for `FR-01:` style numbering. The IDs above are the original A1 IDs; renumber sequentially (FR-01, FR-02, …) if you want strict template alignment.
- **Quantify NFRs:** The HD descriptor rewards measurable NFRs — the 2s response time and 375px/1024px breakpoints above are examples; add more if you have them.
