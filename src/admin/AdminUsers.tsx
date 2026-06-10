import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAdminAuth } from './AdminAuth';

const ROLES = ['ADMIN', 'EDITOR', 'AUTHOR'];

interface User { id: number; name: string; email: string; role: string; createdAt: string; }

function CreateUserModal({ token, onClose, onCreated }: { token: string; onClose: () => void; onCreated: () => void }) {
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]     = useState('AUTHOR');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('/api/users', { name, email, password, role }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onCreated();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-sm mx-4">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Create New User</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">×</button>
        </div>
        <form onSubmit={submit} className="px-5 py-4 space-y-3">
          {error && <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>}
          {[
            { label: 'Full Name', value: name, set: setName, type: 'text', placeholder: 'John Doe' },
            { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'user@iremee.com' },
            { label: 'Password', value: password, set: setPassword, type: 'password', placeholder: '••••••••' },
          ].map(({ label, value, set, type, placeholder }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
              <input required type={type} value={value} onChange={e => set(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded font-bold text-sm text-white disabled:opacity-60"
            style={{ backgroundColor: '#e05c1a' }}>
            {loading ? 'Creating…' : 'Create User'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminUsers() {
  const { token, user: me } = useAdminAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [updating, setUpdating] = useState<number | null>(null);

  function fetchUsers() {
    setLoading(true);
    axios.get('/api/users', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setUsers(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { fetchUsers(); }, []);

  async function updateRole(userId: number, newRole: string) {
    setUpdating(userId);
    try {
      await axios.put(`/api/users/${userId}`, { role: newRole }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(us => us.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch { alert('Failed to update role'); }
    finally { setUpdating(null); }
  }

  async function deleteUser(userId: number) {
    if (!confirm('Delete this user?')) return;
    try {
      await axios.delete(`/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(us => us.filter(u => u.id !== userId));
    } catch { alert('Failed to delete user'); }
  }

  const roleColor: Record<string, string> = {
    ADMIN: '#fee2e2|#991b1b',
    EDITOR: '#dbeafe|#1e40af',
    AUTHOR: '#dcfce7|#166534',
  };

  return (
    <div className="space-y-4">
      {showModal && (
        <CreateUserModal token={token} onClose={() => setShowModal(false)} onCreated={fetchUsers} />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">{users.length} users</p>
        </div>
        {me?.role === 'ADMIN' && (
          <button onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded font-bold text-sm text-white hover:opacity-90"
            style={{ backgroundColor: '#e05c1a' }}>
            + New User
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Loading users…</div>
        ) : (
          <table className="w-full text-sm">
            <thead style={{ backgroundColor: '#f9fafb' }}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">User</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">Role</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide hidden md:table-cell">Joined</th>
                {me?.role === 'ADMIN' && (
                  <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wide">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(u => {
                const [bg, text] = (roleColor[u.role] ?? '#f3f4f6|#6b7280').split('|');
                return (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                          style={{ backgroundColor: '#e05c1a' }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{u.name}</div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {me?.role === 'ADMIN' && u.id !== me?.id ? (
                        <select
                          value={u.role}
                          disabled={updating === u.id}
                          onChange={e => updateRole(u.id, e.target.value)}
                          className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-orange-500 disabled:opacity-50">
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                          style={{ backgroundColor: bg, color: text }}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    {me?.role === 'ADMIN' && (
                      <td className="px-4 py-3 text-right">
                        {u.id !== me?.id && (
                          <button onClick={() => deleteUser(u.id)}
                            className="text-xs text-red-500 hover:text-red-700 font-medium">
                            Delete
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
