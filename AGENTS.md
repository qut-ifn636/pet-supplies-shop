# Agent Instructions

These instructions apply to all automated coding agents working in this repository.

## Git Workflow

- Before starting any new feature, create and switch to a new branch from the current base branch.
- Use a clear branch name that describes the work, such as `feature/add-product-filter` or `fix/login-validation`.
- Do not commit directly to `main` for new feature work unless the user explicitly asks for it.
- Before making changes, check the current Git status and avoid overwriting unrelated user work.
- After each completed change, create a Git commit with a concise, descriptive message.
- Commit messages should explain the actual change, for example `Add category delete validation` or `Update API documentation for products`.
- Keep commits focused. Do not mix unrelated code, tests, formatting, and documentation changes in one commit unless they are part of the same task.

## Documentation

- Update relevant documentation whenever behavior, setup, API routes, environment variables, data models, scripts, deployment steps, or user-facing workflows change.
- Common documentation locations include:
  - `README.md`
  - `docs/`
  - `backend/docs/`
  - `frontend/docs/`
- If no documentation update is needed, mention that in the final response.

## Quality Checks

- Run relevant tests or validation commands before committing when practical.
- For backend changes, prefer `npm test` from `backend/` when the change affects API behavior, controllers, middleware, or models.
- For frontend changes, run the relevant React test or build command when the change affects UI behavior or routing.
- If tests cannot be run, clearly state why in the final response.

## Project Context

- This is the Petopia Admin project, a full-stack MERN admin system for a pet supplies shop.
- The backend uses Node.js, Express, MongoDB, Mongoose, JWT, and bcrypt.
- The frontend uses React, React Router, Axios, and Tailwind CSS.
- Preserve the existing project structure and coding style unless a task specifically requires changing it.
