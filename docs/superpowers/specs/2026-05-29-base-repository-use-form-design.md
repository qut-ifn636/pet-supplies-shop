# Design Spec — BaseRepository & useForm Hook

**Date:** 2026-05-29
**Scope:** Backend repository inheritance + frontend form state hook

---

## 1. Problem

Three backend repositories (`UserRepository`, `ProductRepository`, `CategoryRepository`) each contain identical implementations of `findById`, `create`, `save`, and `deleteById`. Five frontend form components (`Login`, `Register`, `Profile`, `ProductForm`, `CategoryForm`) each duplicate the same three `useState` declarations and a `handleChange` function.

---

## 2. Solution Overview

- **Backend:** Introduce `BaseRepository` as a parent class. The three existing repositories extend it and inherit the shared methods.
- **Frontend:** Introduce a `useForm` custom hook. The five form components call it instead of declaring form state inline.
- **Docs:** Update `docs/design-patterns.md` Inheritance section to use `BaseRepository` as the primary example (stronger than the existing Mongoose model example since it is custom code).

---

## 3. BaseRepository

### New file: `backend/repositories/BaseRepository.js`

```js
class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findById(id) {
        return this.model.findById(id);
    }

    async create(data) {
        return this.model.create(data);
    }

    async save(doc) {
        return doc.save();
    }

    async deleteById(id) {
        return this.model.findByIdAndDelete(id);
    }
}

module.exports = BaseRepository;
```

### Changes to each subclass

All three repositories:
- Change constructor to `super(Model)` — drops `this.userModel = Model` pattern
- Change all `this.xModel` references inside the class to `this.model`
- Delete the 4 methods now inherited from the base

**`UserRepository extends BaseRepository`** — keeps only:
- `findByEmail(email)`
- `findAllWithoutPassword()`

**`ProductRepository extends BaseRepository`** — keeps only:
- `findAll(filter)`
- `findByIdWithCategory(id)`
- `populateCategory(product)`
- `countByCategory(categoryId)`

**`CategoryRepository extends BaseRepository`** — keeps only:
- `findAll()`

### Exports (unchanged)

All three files continue to export a singleton instance as `module.exports = new XRepository()` and the class as `module.exports.XRepository = XRepository`. Controller `require()` calls are unaffected.

---

## 4. useForm Hook

### New file: `frontend/src/hooks/useForm.js`

```js
import { useState } from 'react';

export function useForm(initialValues) {
    const [formData, setFormData] = useState(initialValues);
    const [error, setError]       = useState('');
    const [loading, setLoading]   = useState(false);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    return { formData, setFormData, error, setError, loading, setLoading, handleChange };
}
```

### Changes to each consumer

For each of `Login.jsx`, `Register.jsx`, `Profile.jsx`, `ProductForm.jsx`, `CategoryForm.jsx`:

1. Add import: `import { useForm } from '../hooks/useForm';` (adjust path as needed)
2. Remove the three `useState` declarations for `formData`, `error`, `loading`
3. Remove the `handleChange` function definition
4. Add one line: `const { formData, setFormData, error, setError, loading, setLoading, handleChange } = useForm({ ...initialShape });`
5. All `handleSubmit` logic, JSX, and conditional rendering are untouched

---

## 5. Docs Update

**`docs/design-patterns.md`** — Inheritance section:
- Replace the Mongoose model example with `BaseRepository` / `UserRepository extends BaseRepository`
- Show constructor with `super()`, one inherited method, and one subclass-specific method
- Update the Quick Reference table row for Inheritance

---

## 6. Backward Compatibility

| Concern | Status |
|---------|--------|
| Controller `require()` calls | Unchanged — singleton exports preserved |
| Test constructor injection | Works — `super(fakeModel)` sets `this.model = fakeModel` |
| Frontend component APIs | Unchanged — same state variable names returned from hook |
| JSX / submit handlers | Unchanged — no logic touched |

---

## 7. Files Changed

| File | Action |
|------|--------|
| `backend/repositories/BaseRepository.js` | Create |
| `backend/repositories/UserRepository.js` | Update — extend BaseRepository |
| `backend/repositories/ProductRepository.js` | Update — extend BaseRepository |
| `backend/repositories/CategoryRepository.js` | Update — extend BaseRepository |
| `frontend/src/hooks/useForm.js` | Create |
| `frontend/src/pages/Login.jsx` | Update — use useForm |
| `frontend/src/pages/Register.jsx` | Update — use useForm |
| `frontend/src/pages/Profile.jsx` | Update — use useForm |
| `frontend/src/components/ProductForm.jsx` | Update — use useForm |
| `frontend/src/components/CategoryForm.jsx` | Update — use useForm |
| `docs/design-patterns.md` | Update — replace Inheritance example |
