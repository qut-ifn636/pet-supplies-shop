import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import CategoryForm from '../components/CategoryForm';
import Spinner from '../components/Spinner';

const CategoryList = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${user.token}` } }),
    [user.token]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/api/categories', authHeader);
        setCategories(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load categories.');
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, [authHeader]);

  const handleAdd = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const res = await axiosInstance.post('/api/categories', formData, authHeader);
      setCategories((prev) => [...prev, res.data]);
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (formData) => {
    setSaving(true);
    setError('');
    try {
      const res = await axiosInstance.put(`/api/categories/${editingCategory._id}`, formData, authHeader);
      setCategories((prev) => prev.map((c) => (c._id === editingCategory._id ? res.data : c)));
      setEditingCategory(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? This cannot be undone.`)) return;
    setError('');
    try {
      await axiosInstance.delete(`/api/categories/${id}`, authHeader);
      setCategories((prev) => prev.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Categories</h1>
          <p className="text-sm text-slate-500 mt-0.5">Organise products into categories</p>
        </div>
        {!showAddForm && !editingCategory && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
          >
            + Add Category
          </button>
        )}
      </div>

      {error && <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</p>}

      {showAddForm && (
        <CategoryForm onSubmit={handleAdd} onCancel={() => setShowAddForm(false)} loading={saving} />
      )}

      {loading && <Spinner label="Loading categories…" />}

      {!loading && (
        categories.length === 0 && !showAddForm ? (
          <div className="text-center py-16 bg-white border border-teal-100 rounded-xl shadow-sm">
            <div className="text-5xl mb-3">🏷️</div>
            <p className="text-base font-semibold text-teal-900 mb-1">No categories yet</p>
            <p className="text-sm text-slate-500 mb-5">Add your first category to start organising products.</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
            >
              + Add Category
            </button>
          </div>
        ) : (
          <div className="bg-white border border-teal-100 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-teal-50 border-b border-teal-100">
                  <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Name</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Description</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Created</th>
                  <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat._id} className={`border-b border-teal-50 ${i % 2 === 1 ? 'bg-teal-50/30' : ''}`}>
                    {editingCategory?._id === cat._id ? (
                      <td colSpan={4} className="px-4 py-3 bg-teal-50/60">
                        <CategoryForm
                          category={cat}
                          onSubmit={handleUpdate}
                          onCancel={() => setEditingCategory(null)}
                          loading={saving}
                        />
                      </td>
                    ) : (
                      <>
                        <td className="px-4 py-3 text-sm font-medium text-teal-900">{cat.name}</td>
                        <td className="px-4 py-3 text-sm text-slate-500">{cat.description || '—'}</td>
                        <td className="px-4 py-3 text-sm text-slate-400">{new Date(cat.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button
                            onClick={() => { setEditingCategory(cat); setShowAddForm(false); }}
                            className="bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-md text-xs font-semibold hover:bg-teal-100 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id, cat.name)}
                            className="bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-md text-xs font-semibold hover:bg-rose-100 transition-colors"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
};

export default CategoryList;
