import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
  }, [product, setFormData]);

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
  }, [user, setError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!formData.name.trim()) return setError('Product name is required.');
    if (formData.price === '' || Number(formData.price) < 0) return setError('A valid price (≥ 0) is required.');
    if (!formData.category) return setError('Please select a category.');
    if (formData.stock === '' || Number(formData.stock) < 0) return setError('Stock must be 0 or more.');
    onSubmit({ ...formData, price: Number(formData.price), stock: Number(formData.stock) });
  };

  const inputClass = 'w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent';
  const labelClass = 'block text-sm font-semibold text-teal-900 mb-1';

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-teal-100 rounded-xl shadow-sm p-6 max-w-lg">
      {error && (
        <p className="mb-5 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</p>
      )}

      <div className="mb-4">
        <label className={labelClass} htmlFor="pf-name">Name *</label>
        <input id="pf-name" name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="e.g. Premium Dog Food" />
      </div>

      <div className="mb-4">
        <label className={labelClass} htmlFor="pf-description">Description</label>
        <textarea id="pf-description" name="description" value={formData.description} onChange={handleChange} className={inputClass} rows={3} placeholder="Optional product description" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className={labelClass} htmlFor="pf-price">Price ($) *</label>
          <input id="pf-price" name="price" type="number" min="0" step="0.01" value={formData.price} onChange={handleChange} className={inputClass} placeholder="0.00" />
        </div>
        <div>
          <label className={labelClass} htmlFor="pf-stock">Stock *</label>
          <input id="pf-stock" name="stock" type="number" min="0" value={formData.stock} onChange={handleChange} className={inputClass} placeholder="0" />
        </div>
      </div>

      <div className="mb-4">
        <label className={labelClass} htmlFor="pf-category">Category *</label>
        {catLoading ? (
          <p className="text-sm text-slate-400">Loading categories…</p>
        ) : (
          <select id="pf-category" name="category" value={formData.category} onChange={handleChange} className={inputClass}>
            <option value="">— Select a category —</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="mb-6">
        <label className={labelClass} htmlFor="pf-imageUrl">Image URL</label>
        <input id="pf-imageUrl" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className={inputClass} placeholder="https://example.com/image.jpg" />
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading || catLoading}
          className="flex-1 bg-teal-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Saving…' : product ? 'Update Product' : 'Add Product'}
        </button>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default ProductForm;
