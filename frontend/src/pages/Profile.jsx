import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import { useForm } from '../hooks/useForm';
import Spinner from '../components/Spinner';

const Profile = () => {
  const { user } = useAuth();
  const { formData, setFormData, error, setError, loading: saving, setLoading: setSaving, handleChange } = useForm({ name: '', email: '' });
  const [meta, setMeta] = useState({ role: '', createdAt: '' });
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/profile', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setFormData({ name: res.data.name, email: res.data.email });
        setMeta({ role: res.data.role, createdAt: res.data.createdAt });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center mt-20">
      <Spinner label="Loading profile…" />
    </div>
  );

  const inputClass = 'w-full px-3 py-2 border border-teal-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent';

  return (
    <div className="max-w-md mx-auto p-6 mt-6">
      <form onSubmit={handleSubmit} className="bg-white border border-teal-100 rounded-xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-teal-900 mb-1">Your Profile</h1>

        {/* Role + join date badges */}
        <div className="flex flex-wrap gap-2 mb-5">
          {meta.role && (
            <span className="bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize">
              {meta.role}
            </span>
          )}
          {meta.createdAt && (
            <span className="bg-teal-50 text-teal-700 border border-teal-200 rounded-full px-2.5 py-0.5 text-xs font-medium">
              Joined {new Date(meta.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {error   && <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</p>}
        {success && <p className="mb-4 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3 text-sm">{success}</p>}

        <div className="mb-4">
          <label className="block text-sm font-semibold text-teal-900 mb-1" htmlFor="pr-name">Full name</label>
          <input
            id="pr-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-teal-900 mb-1" htmlFor="pr-email">Email address</label>
          <input
            id="pr-email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-teal-700 text-white py-2 rounded-lg text-sm font-semibold hover:bg-teal-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
