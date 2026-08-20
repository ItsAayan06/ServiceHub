import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Eye } from 'lucide-react';
import api from '../../utils/api.js';
import { formatDate, getInitials } from '../../utils/helpers.js';
import StarRating from '../../components/common/StarRating.jsx';
import { PageLoader } from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';

export default function AdminProviders() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [filter, setFilter] = useState('all');
  const [total, setTotal] = useState(0);

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const q = filter !== 'all' ? `?approved=${filter === 'approved'}` : '';
      const { data } = await api.get(`/admin/providers${q}`);
      setProviders(data.providers || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const handleApprove = async (providerId, approved) => {
    setApproving(providerId);
    try {
      const { data } = await api.put(`/admin/providers/${providerId}/approve`, { approved });
      setProviders(prev => prev.map(p => p._id === providerId ? { ...p, isApproved: data.provider.isApproved } : p));
      toast.success(`Provider ${approved ? 'approved' : 'rejected'}`);
    } catch {
      toast.error('Action failed');
    } finally { setApproving(null); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Providers</h1>
        <p className="text-slate-500">{total} total providers</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {['all', 'pending', 'approved'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all ${filter === f ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
            {f === 'pending' ? '⏳ Pending' : f === 'approved' ? '✅ Approved' : 'All'}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        <div className="space-y-4">
          {providers.length === 0 ? (
            <div className="card p-16 text-center">
              <div className="text-4xl mb-3">🔧</div>
              <p className="text-slate-500">No {filter !== 'all' ? filter : ''} providers found</p>
            </div>
          ) : providers.map(p => (
            <div key={p._id} className={`card p-5 border-l-4 ${p.isApproved ? 'border-green-400' : 'border-yellow-400'}`}>
              <div className="flex items-start gap-4 flex-wrap">
                {/* Avatar */}
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-400 to-violet-700 flex items-center justify-center text-white font-bold text-xl overflow-hidden flex-shrink-0">
                  {p.user?.avatar ? <img src={p.user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(p.user?.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-slate-900 text-lg">{p.user?.name}</h3>
                    <span className={`badge ${p.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {p.isApproved ? '✅ Approved' : '⏳ Pending'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{p.user?.email}</p>

                  <div className="flex flex-wrap gap-4 mt-3">
                    <div>
                      <span className="text-xs text-slate-400">Category</span>
                      <p className="text-sm font-semibold text-slate-700">{p.category?.icon} {p.category?.name}</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Experience</span>
                      <p className="text-sm font-semibold text-slate-700">{p.experience} years</p>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Rating</span>
                      <div className="flex items-center gap-1">
                        <StarRating rating={Math.round(p.rating)} size="sm" />
                        <span className="text-sm font-semibold text-slate-700">({p.reviewCount})</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400">Registered</span>
                      <p className="text-sm font-semibold text-slate-700">{formatDate(p.createdAt)}</p>
                    </div>
                  </div>

                  {p.bio && (
                    <p className="text-sm text-slate-500 mt-2 line-clamp-2">{p.bio}</p>
                  )}

                  {/* Skills */}
                  {p.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {p.skills.slice(0, 5).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <a href={`/providers/${p._id}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold transition-all">
                    <Eye className="w-4 h-4" /> View
                  </a>
                  {!p.isApproved ? (
                    <button onClick={() => handleApprove(p._id, true)} disabled={approving === p._id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-semibold transition-all disabled:opacity-50">
                      {approving === p._id ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Approve
                    </button>
                  ) : (
                    <button onClick={() => handleApprove(p._id, false)} disabled={approving === p._id}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-all disabled:opacity-50">
                      <XCircle className="w-4 h-4" /> Revoke
                    </button>
                  )}
                </div>
              </div>

              {/* Services */}
              {p.services?.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400 mb-2">Services offered:</p>
                  <div className="flex flex-wrap gap-2">
                    {p.services.map((svc, i) => (
                      <span key={i} className="text-xs bg-primary-50 text-primary-700 px-3 py-1 rounded-full font-medium">
                        {svc.name} — ₹{svc.price}/{svc.unit}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
