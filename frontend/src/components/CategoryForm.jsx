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
