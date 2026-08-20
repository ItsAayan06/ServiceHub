import { useState, useEffect, useCallback } from 'react';
import { Search } from 'lucide-react';
import api from '../../utils/api.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDate, formatCurrency, getInitials } from '../../utils/helpers.js';
import { PageLoader } from '../../components/common/Spinner.jsx';

const STATUS_TABS = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');
  const [total, setTotal] = useState(0);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const q = activeStatus !== 'all' ? `?status=${activeStatus}` : '';
      const { data } = await api.get(`/admin/bookings${q}`);
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } finally { setLoading(false); }
  }, [activeStatus]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">All Bookings</h1>
        <p className="text-slate-500">{total} total bookings</p>
      </div>

      {/* Status tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {STATUS_TABS.map(s => (
          <button key={s} onClick={() => setActiveStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all capitalize ${activeStatus === s ? 'bg-rose-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Customer', 'Provider', 'Service', 'Date', 'Amount', 'Status'].map(h => (
                    <th key={h} className="text-left px-5 py-3.5 text-xs font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {bookings.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400">No bookings found</td></tr>
                ) : bookings.map(b => (
                  <tr key={b._id} className="hover:bg-slate-50 transition-colors">
                    {/* Customer */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                          {b.user?.avatar ? <img src={b.user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(b.user?.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{b.user?.name}</p>
                        </div>
                      </div>
                    </td>

                    {/* Provider */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold overflow-hidden flex-shrink-0">
                          {b.provider?.user?.avatar
                            ? <img src={b.provider.user.avatar} alt="" className="w-full h-full object-cover" />
                            : getInitials(b.provider?.user?.name)}
                        </div>
                        <p className="font-semibold text-slate-900 text-sm">{b.provider?.user?.name}</p>
                      </div>
                    </td>

                    {/* Service */}
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-slate-700 max-w-[160px] truncate">{b.service?.name}</p>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {formatDate(b.scheduledDate)}<br />
                      <span className="text-xs">{b.scheduledTime}</span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900">{formatCurrency(b.totalAmount)}</span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={b.status} />
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
