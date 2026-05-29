import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Spinner from '../components/Spinner';

const StatCard = ({ label, value, to, icon }) => (
  <Link
    to={to}
    className="block bg-white border border-teal-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow group"
  >
    <div className="flex items-start justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-semibold text-teal-600 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-opacity">
        View all →
      </span>
    </div>
    <p className="text-3xl font-bold text-teal-900">{value ?? '—'}</p>
    <p className="mt-1 text-sm font-medium text-teal-700 uppercase tracking-wide">{label}</p>
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
      <h1 className="text-2xl font-bold text-teal-900 mb-1">Dashboard</h1>
      <p className="text-slate-500 mb-8">Welcome back, {user?.name}. Here's a quick overview.</p>

      {loading && <Spinner label="Loading stats…" />}
      {error   && <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</p>}

      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard label="Products"   value={stats.products}   to="/products"   icon="📦" />
          <StatCard label="Categories" value={stats.categories} to="/categories" icon="🏷️" />
          <StatCard label="Users"      value={stats.users}      to="/users"      icon="👥" />
        </div>
      )}

      {!loading && !error && (
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/products/new"
            className="bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 transition-colors"
          >
            + Add Product
          </Link>
          <Link
            to="/categories"
            className="bg-teal-50 text-teal-700 border border-teal-200 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-teal-100 transition-colors"
          >
            Manage Categories
          </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
