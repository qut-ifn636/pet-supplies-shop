import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

// Individual stat card displayed on the dashboard
const StatCard = ({ label, value, to, color }) => (
  <Link
    to={to}
    className={`block rounded-lg p-6 shadow hover:shadow-md transition-shadow text-white ${color}`}
  >
    <p className="text-4xl font-bold">{value ?? '—'}</p>
    <p className="mt-1 text-sm font-medium opacity-90">{label}</p>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: null, categories: null, users: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      const headers = { Authorization: `Bearer ${user.token}` };
      try {
        // Fetch all three resources in parallel for speed
        const [productsRes, categoriesRes, usersRes] = await Promise.all([
          axiosInstance.get('/api/products',   { headers }),
          axiosInstance.get('/api/categories', { headers }),
          axiosInstance.get('/api/auth/users', { headers }),
        ]);
        setStats({
          products:   productsRes.data.length,
          categories: categoriesRes.data.length,
          users:      usersRes.data.length,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Welcome back, {user?.name}. Here's a quick overview.</p>

      {loading && <p className="text-gray-500">Loading stats…</p>}
      {error   && <p className="text-red-600 bg-red-50 border border-red-200 rounded p-3">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard label="Total Products"   value={stats.products}   to="/products"   color="bg-blue-600" />
          <StatCard label="Total Categories" value={stats.categories} to="/categories" color="bg-green-600" />
          <StatCard label="Registered Users" value={stats.users}      to="/users"      color="bg-purple-600" />
        </div>
      )}

      {!loading && !error && (
        <div className="mt-10 flex flex-wrap gap-4">
          <Link to="/products/new" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Add Product
          </Link>
          <Link to="/categories" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Manage Categories
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
