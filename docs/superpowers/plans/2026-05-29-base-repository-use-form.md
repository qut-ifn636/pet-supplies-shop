# BaseRepository & useForm Hook Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Eliminate duplicated CRUD methods across three backend repositories via a `BaseRepository` parent class, and eliminate duplicated form state across five frontend components via a `useForm` hook.

**Architecture:** `BaseRepository` holds the four methods common to all repositories (`findById`, `create`, `save`, `deleteById`); each existing repository class extends it and retains only its domain-specific methods. A `useForm(initialValues)` hook centralises the three-state-variable + `handleChange` pattern repeated in every form component; components destructure what they need and leave the rest unchanged.

**Tech Stack:** Node.js, Mongoose, Mocha + Chai + Sinon (backend tests), React 18 functional components + hooks (frontend, no frontend test suite)

---

## File Map

| Action | Path |
|--------|------|
| Create | `backend/repositories/BaseRepository.js` |
| Create | `backend/test/baseRepository_test.js` |
| Modify | `backend/repositories/UserRepository.js` |
| Modify | `backend/repositories/ProductRepository.js` |
| Modify | `backend/repositories/CategoryRepository.js` |
| Create | `frontend/src/hooks/useForm.js` |
| Modify | `frontend/src/pages/Login.jsx` |
| Modify | `frontend/src/pages/Register.jsx` |
| Modify | `frontend/src/pages/Profile.jsx` |
| Modify | `frontend/src/components/ProductForm.jsx` |
| Modify | `frontend/src/components/CategoryForm.jsx` |
| Modify | `docs/design-patterns.md` |
| Modify | `docs/sections/section-2-design-patterns.md` |

---

## Task 1: Create BaseRepository (TDD)

**Files:**
- Create: `backend/repositories/BaseRepository.js`
- Create: `backend/test/baseRepository_test.js`

- [ ] **Step 1: Write the failing tests**

Create `backend/test/baseRepository_test.js`:

```js
const { expect } = require('chai');
const sinon = require('sinon');
const BaseRepository = require('../repositories/BaseRepository');

describe('BaseRepository', () => {
    let fakeModel;
    let repo;

    beforeEach(() => {
        fakeModel = {
            findById: sinon.stub(),
            create: sinon.stub(),
            findByIdAndDelete: sinon.stub(),
        };
        repo = new BaseRepository(fakeModel);
    });

    afterEach(() => sinon.restore());

    describe('findById', () => {
        it('delegates to model.findById and returns the result', async () => {
            const fakeDoc = { _id: 'abc123', name: 'Fido' };
            fakeModel.findById.resolves(fakeDoc);

            const result = await repo.findById('abc123');

            expect(fakeModel.findById.calledOnceWith('abc123')).to.be.true;
            expect(result).to.deep.equal(fakeDoc);
        });
    });

    describe('create', () => {
        it('delegates to model.create and returns the new document', async () => {
            const data = { name: 'Fido' };
            const fakeDoc = { _id: 'abc123', ...data };
            fakeModel.create.resolves(fakeDoc);

            const result = await repo.create(data);

            expect(fakeModel.create.calledOnceWith(data)).to.be.true;
            expect(result).to.deep.equal(fakeDoc);
        });
    });

    describe('save', () => {
        it('calls doc.save() and returns the result', async () => {
            const fakeDoc = { _id: 'abc123', save: sinon.stub().resolves({ _id: 'abc123' }) };

            const result = await repo.save(fakeDoc);

            expect(fakeDoc.save.calledOnce).to.be.true;
            expect(result._id).to.equal('abc123');
        });
    });

    describe('deleteById', () => {
        it('delegates to model.findByIdAndDelete and returns the deleted document', async () => {
            const fakeDoc = { _id: 'abc123' };
            fakeModel.findByIdAndDelete.resolves(fakeDoc);

            const result = await repo.deleteById('abc123');

            expect(fakeModel.findByIdAndDelete.calledOnceWith('abc123')).to.be.true;
            expect(result).to.deep.equal(fakeDoc);
        });
    });
});
```

- [ ] **Step 2: Run the tests to confirm they fail**

Run from `backend/`:
```
npm test
```
Expected: 4 failures — `Cannot find module '../repositories/BaseRepository'`

- [ ] **Step 3: Create BaseRepository**

Create `backend/repositories/BaseRepository.js`:

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

- [ ] **Step 4: Run the tests to confirm they pass**

Run from `backend/`:
```
npm test
```
Expected: 4 new passing tests under `BaseRepository`, all pre-existing tests still passing.

- [ ] **Step 5: Commit**

```bash
git add backend/repositories/BaseRepository.js backend/test/baseRepository_test.js
git commit -m "feat: add BaseRepository with shared CRUD methods"
```

---

## Task 2: Refactor UserRepository

**Files:**
- Modify: `backend/repositories/UserRepository.js`

- [ ] **Step 1: Replace the file content**

```js
const User = require('../models/User');
const BaseRepository = require('./BaseRepository');

class UserRepository extends BaseRepository {
    constructor(userModel = User) {
        super(userModel);
    }

    async findByEmail(email) {
        return this.model.findOne({ email });
    }

    async findAllWithoutPassword() {
        return this.model.find().select('-password');
    }
}

module.exports = new UserRepository();
module.exports.UserRepository = UserRepository;
```

- [ ] **Step 2: Run all backend tests**

Run from `backend/`:
```
npm test
```
Expected: all tests pass — no regression in auth controller tests.

- [ ] **Step 3: Commit**

```bash
git add backend/repositories/UserRepository.js
git commit -m "refactor: UserRepository extends BaseRepository"
```

---

## Task 3: Refactor ProductRepository

**Files:**
- Modify: `backend/repositories/ProductRepository.js`

- [ ] **Step 1: Replace the file content**

```js
const Product = require('../models/Product');
const BaseRepository = require('./BaseRepository');

class ProductRepository extends BaseRepository {
    constructor(productModel = Product) {
        super(productModel);
    }

    async findAll(filter = {}) {
        return this.model.find(filter)
            .populate('category', 'name')
            .sort({ createdAt: -1 });
    }

    async findByIdWithCategory(id) {
        return this.model.findById(id).populate('category', 'name');
    }

    async populateCategory(product) {
        return product.populate('category', 'name');
    }

    async countByCategory(categoryId) {
        return this.model.countDocuments({ category: categoryId });
    }
}

module.exports = new ProductRepository();
module.exports.ProductRepository = ProductRepository;
```

- [ ] **Step 2: Run all backend tests**

Run from `backend/`:
```
npm test
```
Expected: all tests pass — no regression in product controller tests.

- [ ] **Step 3: Commit**

```bash
git add backend/repositories/ProductRepository.js
git commit -m "refactor: ProductRepository extends BaseRepository"
```

---

## Task 4: Refactor CategoryRepository

**Files:**
- Modify: `backend/repositories/CategoryRepository.js`

- [ ] **Step 1: Replace the file content**

```js
const Category = require('../models/Category');
const BaseRepository = require('./BaseRepository');

class CategoryRepository extends BaseRepository {
    constructor(categoryModel = Category) {
        super(categoryModel);
    }

    async findAll() {
        return this.model.find().sort({ name: 1 });
    }
}

module.exports = new CategoryRepository();
module.exports.CategoryRepository = CategoryRepository;
```

- [ ] **Step 2: Run all backend tests**

Run from `backend/`:
```
npm test
```
Expected: all tests pass — no regression in category controller tests.

- [ ] **Step 3: Commit**

```bash
git add backend/repositories/CategoryRepository.js
git commit -m "refactor: CategoryRepository extends BaseRepository"
```

---

## Task 5: Create useForm hook

**Files:**
- Create: `frontend/src/hooks/useForm.js`

- [ ] **Step 1: Create the hooks directory and file**

Create `frontend/src/hooks/useForm.js`:

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

- [ ] **Step 2: Commit**

```bash
git add frontend/src/hooks/useForm.js
git commit -m "feat: add useForm hook for shared form state"
```

---

## Task 6: Refactor Login.jsx

**Files:**
- Modify: `frontend/src/pages/Login.jsx`

- [ ] **Step 1: Replace the file content**

```jsx
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useForm } from '../hooks/useForm';

const Login = () => {
  const { formData, setFormData, error, setError, loading, setLoading } = useForm({ email: '', password: '' });
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-2 text-center">🐾 Petopia Admin</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Sign in to your admin account</p>

        {error && (
          <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</p>
        )}

        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Login'}
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
```

Note: `import { useState } from 'react'` is removed — the hook owns all state.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Login.jsx
git commit -m "refactor: Login uses useForm hook"
```

---

## Task 7: Refactor Register.jsx

**Files:**
- Modify: `frontend/src/pages/Register.jsx`

- [ ] **Step 1: Replace the file content**

```jsx
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useForm } from '../hooks/useForm';

const Register = () => {
  const { formData, setFormData, error, setError, loading, setLoading } = useForm({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axiosInstance.post('/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-2 text-center">🐾 Petopia Admin</h1>
        <p className="text-center text-gray-500 mb-6 text-sm">Create a new account</p>

        {error && (
          <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</p>
        )}

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 disabled:opacity-50"
        >
          {loading ? 'Registering…' : 'Register'}
        </button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
```

Note: `import { useState } from 'react'` is removed — the hook owns all state.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Register.jsx
git commit -m "refactor: Register uses useForm hook"
```

---

## Task 8: Refactor Profile.jsx

**Files:**
- Modify: `frontend/src/pages/Profile.jsx`

Profile has two distinct loading states: `loading` (page fetch, starts `true`) and `saving` (form submit, starts `false`). The hook's `loading` maps to `saving` via destructuring rename. The page-fetch `loading` stays as a regular `useState`.

- [ ] **Step 1: Replace the file content**

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { useForm } from '../hooks/useForm';

const Profile = () => {
  const { user } = useAuth();
  const { formData, setFormData, error, setError, loading: saving, setLoading: setSaving } = useForm({ name: '', email: '' });
  const [meta, setMeta] = useState({ role: '', createdAt: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({ name: res.data.name, email: res.data.email });
        setMeta({ role: res.data.role, createdAt: res.data.createdAt });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading profile…</div>;

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-1 text-center">Your Profile</h1>
        <p className="text-center text-sm text-gray-500 mb-5">
          Role: <span className="font-medium capitalize">{meta.role}</span>
          {meta.createdAt && (
            <> · Joined {new Date(meta.createdAt).toLocaleDateString()}</>
          )}
        </p>

        {error   && <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</p>}
        {success && <p className="mb-4 text-green-600 bg-green-50 border border-green-200 rounded p-2 text-sm">{success}</p>}

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/pages/Profile.jsx
git commit -m "refactor: Profile uses useForm hook"
```

---

## Task 9: Refactor ProductForm.jsx

**Files:**
- Modify: `frontend/src/components/ProductForm.jsx`

`loading` in ProductForm is a **prop**, not local state — it is not replaced by the hook. Only `formData`, `error`, and `handleChange` come from the hook.

- [ ] **Step 1: Replace the file content**

```jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { useForm } from '../hooks/useForm';

/**
 * Reusable form for creating and editing a product.
 * Props:
 *   - product: existing product object (for edit mode); omit for add mode
 *   - onSubmit: async function called with form data on valid submit
 *   - loading: boolean — disables the submit button while the parent is saving
 */
const ProductForm = ({ product, onSubmit, loading }) => {
  const { user } = useAuth();

  const { formData, setFormData, error, setError, handleChange } = useForm({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    imageUrl: '',
  });
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(true);

  useEffect(() => {
    if (product) {
      setFormData({
        name:        product.name || '',
        description: product.description || '',
        price:       product.price ?? '',
        category:    product.category?._id || product.category || '',
        stock:       product.stock ?? '',
        imageUrl:    product.imageUrl || '',
      });
    }
  }, [product]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/api/categories', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setCategories(res.data);
      } catch {
        setError('Failed to load categories.');
      } finally {
        setCatLoading(false);
      }
    };
    fetchCategories();
  }, [user]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('Product name is required.');
    if (formData.price === '' || Number(formData.price) < 0) return setError('A valid price (≥ 0) is required.');
    if (!formData.category) return setError('Please select a category.');
    if (formData.stock === '' || Number(formData.stock) < 0) return setError('Stock must be 0 or more.');

    onSubmit({
      ...formData,
      price: Number(formData.price),
      stock: Number(formData.stock),
    });
  };

  const inputClass = 'w-full p-2 border rounded mb-4';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow rounded max-w-lg mx-auto">
      {error && (
        <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</p>
      )}

      <div>
        <label className={labelClass}>Name *</label>
        <input name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Premium Dog Food" />
      </div>

      <div>
        <label className={labelClass}>Description</label>
        <textarea name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={3} placeholder="Optional product description" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Price ($) *</label>
          <input name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} className={inputClass} placeholder="0.00" />
        </div>
        <div>
          <label className={labelClass}>Stock *</label>
          <input name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} className={inputClass} placeholder="0" />
        </div>
      </div>

      <div>
        <label className={labelClass}>Category *</label>
        {catLoading ? (
          <p className="text-sm text-gray-500 mb-4">Loading categories...</p>
        ) : (
          <select name="category" value={formData.category} onChange={handleChange} className={inputClass}>
            <option value="">— Select a category —</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <label className={labelClass}>Image URL</label>
        <input name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputClass} placeholder="https://example.com/image.jpg" />
      </div>

      <button
        type="submit"
        disabled={loading || catLoading}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
      </button>
    </form>
  );
};

export default ProductForm;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ProductForm.jsx
git commit -m "refactor: ProductForm uses useForm hook"
```

---

## Task 10: Refactor CategoryForm.jsx

**Files:**
- Modify: `frontend/src/components/CategoryForm.jsx`

`loading` in CategoryForm is a **prop** — not replaced by the hook. `useState` import is no longer needed after removing both state declarations.

- [ ] **Step 1: Replace the file content**

```jsx
import { useEffect } from 'react';
import { useForm } from '../hooks/useForm';

/**
 * Inline form for adding or editing a category.
 * Props:
 *   - category: existing category object (edit mode); omit for add mode
 *   - onSubmit: function called with { name, description } on valid submit
 *   - onCancel: function called when the user dismisses the form
 *   - loading: boolean — disables the submit button while saving
 */
const CategoryForm = ({ category, onSubmit, onCancel, loading }) => {
  const { formData, setFormData, error, setError } = useForm({ name: '', description: '' });

  useEffect(() => {
    if (category) {
      setFormData({ name: category.name || '', description: category.description || '' });
    }
  }, [category]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) return setError('Category name is required.');
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 border rounded p-4 mb-4">
      <h3 className="font-semibold mb-3">{category ? 'Edit Category' : 'Add Category'}</h3>

      {error && (
        <p className="mb-3 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</p>
      )}

      <input
        type="text"
        placeholder="Category name *"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        className="w-full p-2 border rounded mb-3"
      />
      <input
        type="text"
        placeholder="Description (optional)"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full p-2 border rounded mb-3"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving…' : category ? 'Update' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/CategoryForm.jsx
git commit -m "refactor: CategoryForm uses useForm hook"
```

---

## Task 11: Update design docs

**Files:**
- Modify: `docs/design-patterns.md`
- Modify: `docs/sections/section-2-design-patterns.md`

- [ ] **Step 1: Replace the Inheritance section in docs/design-patterns.md**

Find this entire block (lines 188–203):

```markdown
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
```

Replace with:

```markdown
### Inheritance — `backend/repositories/`

**What is it?**
Inheritance means a child class takes on the properties and behaviour of a parent. Think of a `Dog` class that inherits from `Animal` — it gets all of Animal's basic behaviour and adds its own.

**In Petopia:**
`BaseRepository` defines the four methods every repository needs: `findById`, `create`, `save`, and `deleteById`. Each concrete repository (`UserRepository`, `ProductRepository`, `CategoryRepository`) calls `extends BaseRepository` and inherits these methods without rewriting them. Each subclass then adds only the domain-specific queries it needs — for example, `UserRepository` adds `findByEmail` and `findAllWithoutPassword`, while `ProductRepository` adds `findByIdWithCategory` and `countByCategory`.

```js
// backend/repositories/BaseRepository.js
class BaseRepository {
    constructor(model) { this.model = model; }
    async findById(id)   { return this.model.findById(id); }
    async create(data)   { return this.model.create(data); }
    async save(doc)      { return doc.save(); }
    async deleteById(id) { return this.model.findByIdAndDelete(id); }
}

// backend/repositories/UserRepository.js
class UserRepository extends BaseRepository {
    constructor(userModel = User) { super(userModel); }
    // inherits findById, create, save, deleteById
    async findByEmail(email) { return this.model.findOne({ email }); }
    async findAllWithoutPassword() { return this.model.find().select('-password'); }
}
```

**Why it matters:**
Without `BaseRepository`, the same four method bodies appear identically in all three repository files. If `create` ever needed to change — for example, to add audit logging — the change would need to be made in three places. With inheritance, it is in one.
```

- [ ] **Step 2: Update the Quick Reference table row for Inheritance in docs/design-patterns.md**

Find:
```markdown
| Inheritance | `models/*.js` | All models inherit Mongoose's built-in query methods |
```

Replace with:
```markdown
| Inheritance | `repositories/BaseRepository.js` | Shared CRUD methods in one base class; subclasses add domain-specific queries |
```

- [ ] **Step 3: Update the OOP Principles table in docs/sections/section-2-design-patterns.md**

Find:
```markdown
| Inheritance | `models/*.js` | Every model extends Mongoose's base `Model` — gets `.save()`, `.find()`, `.findById()` for free |
```

Replace with:
```markdown
| Inheritance | `repositories/BaseRepository.js` | `UserRepository`, `ProductRepository`, `CategoryRepository` all extend `BaseRepository` — inherit `findById`, `create`, `save`, `deleteById` for free |
```

- [ ] **Step 4: Run all backend tests one final time**

Run from `backend/`:
```
npm test
```
Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add docs/design-patterns.md docs/sections/section-2-design-patterns.md
git commit -m "docs: update Inheritance example to use BaseRepository"
```
