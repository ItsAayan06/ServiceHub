import { useState, useEffect, useCallback } from 'react';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';
import api from '../../utils/api.js';
import { formatDate, getInitials } from '../../utils/helpers.js';
import { PageLoader } from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';

const ROLE_TABS = ['all', 'user', 'provider', 'admin'];

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(null);
  const [activeRole, setActiveRole] = useState('all');
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (activeRole !== 'all') q.set('role', activeRole);
      if (search) q.set('search', search);
      const { data } = await api.get(`/admin/users?${q}`);
      setUsers(data.users || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }, [activeRole, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleUser = async (userId, currentActive) => {
    setToggling(userId);
    try {
      const { data } = await api.put(`/admin/users/${userId}/toggle`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isActive: data.user.isActive } : u));
      toast.success(`User ${data.user.isActive ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update user');
    } finally { setToggling(null); }
  };

  const roleColors = { user: 'bg-primary-100 text-primary-700', provider: 'bg-violet-100 text-violet-700', admin: 'bg-rose-100 text-rose-700' };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-slate-500">{total} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-slate-200">
          <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="flex-1 bg-transparent text-sm outline-none"
          />
        </div>
        <div className="flex gap-2">
          {ROLE_TABS.map(role => (
            <button key={role} onClick={() => setActiveRole(role)}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${activeRole === role ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['User', 'Role', 'Phone', 'Joined', 'Status', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {users.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden flex-shrink-0">
                          {u.avatar ? <img src={u.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(u.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{u.name}</p>
                          <p className="text-xs text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`badge capitalize ${roleColors[u.role] || 'bg-slate-100 text-slate-600'}`}>
                        {u.role === 'admin' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">{u.phone || '—'}</td>
                    <td className="px-5 py-4 text-sm text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${u.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {u.isActive ? '● Active' : '○ Inactive'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => toggleUser(u._id, u.isActive)}
                          disabled={toggling === u._id}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50
                            ${u.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                          {toggling === u._id ? (
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          ) : u.isActive ? (
                            <><UserX className="w-3.5 h-3.5" /> Deactivate</>
                          ) : (
                            <><UserCheck className="w-3.5 h-3.5" /> Activate</>
                          )}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
