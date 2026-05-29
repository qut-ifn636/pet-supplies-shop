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

    // Client-side validation
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
