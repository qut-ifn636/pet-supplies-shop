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
  const { formData, setFormData, error, setError, handleChange } = useForm({ name: '', description: '' });

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

  const inputClass = 'w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent';
  const labelClass = 'block text-sm font-semibold text-teal-900 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-teal-50 border border-teal-200 rounded-lg p-4 mb-4">
      <h3 className="font-semibold text-teal-900 mb-3">{category ? 'Edit Category' : 'Add Category'}</h3>

      {error && (
        <p className="mb-3 text-red-600 bg-red-50 border border-red-200 rounded-lg p-2 text-sm">{error}</p>
      )}

      <div className="mb-3">
        <label className={labelClass} htmlFor="cf-name">Name *</label>
        <input
          id="cf-name"
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={inputClass}
          placeholder="e.g. Dogs"
        />
      </div>

      <div className="mb-4">
        <label className={labelClass} htmlFor="cf-description">Description</label>
        <input
          id="cf-description"
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          className={inputClass}
          placeholder="Optional description"
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : category ? 'Update' : 'Add'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;
