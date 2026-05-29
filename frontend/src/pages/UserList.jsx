import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import Spinner from '../components/Spinner';

const roleBadge = (role) =>
  role === 'admin'
    ? 'bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 text-xs font-semibold'
    : 'bg-slate-100 text-slate-600 border border-slate-200 rounded-full px-2.5 py-0.5 text-xs font-semibold';

const UserList = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axiosInstance.get('/api/auth/users', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setUsers(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-teal-900">Users</h1>
        <p className="text-sm text-slate-500 mt-0.5">All registered accounts</p>
      </div>

      {loading && <Spinner label="Loading users…" />}
      {error   && <p className="text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">{error}</p>}

      {!loading && !error && (
        users.length === 0 ? (
          <div className="text-center py-16 bg-white border border-teal-100 rounded-xl shadow-sm">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-base font-semibold text-teal-900 mb-1">No users found</p>
            <p className="text-sm text-slate-500">Registered users will appear here.</p>
          </div>
        ) : (
          <div className="bg-white border border-teal-100 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-teal-50 border-b border-teal-100">
                    <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Role</th>
                    <th className="px-4 py-3 text-xs font-semibold text-teal-700 uppercase tracking-wide">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u._id} className={`border-b border-teal-50 hover:bg-teal-50/50 ${i % 2 === 1 ? 'bg-teal-50/30' : ''}`}>
                      <td className="px-4 py-3 text-sm font-medium text-teal-900">{u.name}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className={roleBadge(u.role)}>{u.role}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
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

export default UserList;
