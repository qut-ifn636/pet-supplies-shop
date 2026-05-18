# Repository Pattern

The backend uses the repository pattern to separate database access from HTTP
controller logic.

Controllers should call repository methods instead of importing Mongoose models
directly. For example, controllers should use `productRepository.findAll(filter)`
instead of `Product.find(filter)`.

## Repository Classes

Repository classes live in `backend/repositories/`:

- `ProductRepository.js`
- `CategoryRepository.js`
- `UserRepository.js`

Each repository wraps Mongoose calls behind object-oriented methods that describe
the data operation the application needs.

## Why This Is Necessary

This pattern makes the backend easier to maintain because database logic is kept
in one layer. If the project later changes how products, categories, or users are
queried, the change can usually happen in the repository instead of being repeated
across multiple controllers.

It also improves testability. Each repository accepts its Mongoose model through
the constructor, so a test can inject a fake model or stub the model without
changing controller code.

## OOP Principles Used

- Encapsulation: Mongoose query details are hidden inside repository classes.
- Single responsibility: controllers handle request and response flow; repositories handle persistence.
- Dependency inversion: repositories depend on injected model objects instead of hard-coding all dependencies inside controller functions.

## Current Repository Responsibilities

`ProductRepository` handles product lookup, creation, saving, deletion, category
population, and product counts by category.

`CategoryRepository` handles category lookup, creation, saving, and deletion.

`UserRepository` handles user lookup, creation, profile saving, and listing users
without password fields.
