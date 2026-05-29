import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useForm } from '../hooks/useForm';

const Register = () => {
  const { formData, setFormData, error, setError, loading, setLoading, handleChange } = useForm({ name: '', email: '', password: '' });
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
    <div className="min-h-screen bg-teal-50 flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white border border-teal-100 rounded-xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🐾</div>
          <h1 className="text-xl font-bold text-teal-900">Petopia Admin</h1>
          <p className="text-sm text-slate-500 mt-1">Create a new account</p>
        </div>

        {error && (
          <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</p>
        )}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-teal-900 mb-1" htmlFor="name">Full name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold text-teal-900 mb-1" htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-teal-900 mb-1" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-teal-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Registering…' : 'Create account'}
        </button>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-teal-700 font-semibold hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
