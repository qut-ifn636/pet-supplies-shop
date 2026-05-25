import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [meta, setMeta] = useState({ role: '', createdAt: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
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

  if (loading) return <div className="text-center mt-20 text-gray-500">Loading profile…</div>;

  return (
    <div className="max-w-md mx-auto mt-20 px-4">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-1 text-center">Your Profile</h1>
        <p className="text-center text-sm text-gray-500 mb-5">
          Role: <span className="font-medium capitalize">{meta.role}</span>
          {meta.createdAt && (
            <> · Joined {new Date(meta.createdAt).toLocaleDateString()}</>
          )}
        </p>

        {error   && <p className="mb-4 text-red-600 bg-red-50 border border-red-200 rounded p-2 text-sm">{error}</p>}
        {success && <p className="mb-4 text-green-600 bg-green-50 border border-green-200 rounded p-2 text-sm">{success}</p>}

        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full mb-4 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
