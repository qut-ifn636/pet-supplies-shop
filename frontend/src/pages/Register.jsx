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
