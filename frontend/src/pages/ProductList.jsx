import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Spinner from '../components/Spinner';

const ProductList = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const authHeader = useMemo(
    () => ({ headers: { Authorization: `Bearer ${user.token}` } }),
    [user.token]
  );

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axiosInstance.get('/api/categories', authHeader);
        setCategories(res.data);
      } catch {
        // Non-critical — filter dropdown just won't populate
      }
    };
    fetchCategories();
  }, [authHeader]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (search)         params.append('search', search);
        if (categoryFilter) params.append('category', categoryFilter);
        const res = await axiosInstance.get(`/api/products?${params.toString()}`, authHeader);
        setProducts(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load products.');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, categoryFilter, authHeader]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await axiosInstance.delete(`/api/products/${id}`, authHeader);
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const inputClass = 'px-3 py-2 border border-teal-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent';

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-teal-900">Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your pet supply inventory</p>
        </div>
        <Link
          to="/products/new"
          className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors text-center"
        >
          + Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="🔍  Search by name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full sm:w-64 ${inputClass}`}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={`w-full sm:w-52 ${inputClass}`}
        >
          <option value="">All categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {loading && <Spinner label="Loading products…" />}
      {error   && <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</p>}

      {!loading && !error && (
        products.length === 0 ? (
          <div className="text-center py-16 bg-white border border-teal-100 rounded-xl shadow-sm">
            <div className="text-5xl mb-3">📦</div>
            <p className="text-base font-semibold text-teal-900 mb-1">No products found</p>
            <p className="text-sm text-slate-500 mb-5">
              {search || categoryFilter ? 'Try adjusting your search or filter.' : 'Add your first product to get started.'}
            </p>
            {!search && !categoryFilter && (
              <Link
                to="/products/new"
                className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
              >
                + Add Product
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white border border-teal-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-teal-50 border-b border-teal-100">
                    <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Category</th>
                    <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Price</th>
                    <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Stock</th>
                    <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product, i) => (
                    <tr key={product._id} className={`border-b border-teal-50 hover:bg-teal-50/50 ${i % 2 === 1 ? 'bg-teal-50/30' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-teal-900">{product.name}</td>
                      <td className="px-4 py-3">
                        {product.category?.name ? (
                          <span className="bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
                            {product.category.name}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-slate-700">{product.stock}</td>
                      <td className="px-4 py-3 flex gap-2">
                        <Link
                          to={`/products/edit/${product._id}`}
                          className="bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-md text-xs font-semibold hover:bg-teal-100 transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(product._id, product.name)}
                          className="bg-rose-50 text-rose-600 border border-rose-200 px-3 py-1 rounded-md text-xs font-semibold hover:bg-rose-100 transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default ProductList;
