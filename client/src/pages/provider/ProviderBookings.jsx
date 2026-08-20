import { useState, useEffect, useCallback } from 'react';
import { Check, X, Play, CheckCircle, MapPin, Phone, Calendar } from 'lucide-react';
import api from '../../utils/api.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDate, formatCurrency, getInitials } from '../../utils/helpers.js';
import { PageLoader } from '../../components/common/Spinner.jsx';
import toast from 'react-hot-toast';

const STATUS_TABS = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

export default function ProviderBookings() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const q = activeTab !== 'all' ? `?status=${activeTab}` : '';
      const { data } = await api.get(`/bookings/provider${q}`);
      setBookings(data.bookings || []);
    } finally { setLoading(false); }
  }, [activeTab]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const updateStatus = async (bookingId, status, note) => {
    setUpdating(bookingId);
    try {
      const { data } = await api.put(`/bookings/${bookingId}/status`, { status, note });
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: data.booking.status } : b));
      toast.success(`Booking ${status.replace('_', ' ')}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  const ActionButtons = ({ booking }) => {
    const disabled = updating === booking._id;
    switch (booking.status) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <button onClick={() => updateStatus(booking._id, 'accepted')} disabled={disabled}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
              <Check className="w-3.5 h-3.5" /> Accept
            </button>
            <button onClick={() => updateStatus(booking._id, 'rejected')} disabled={disabled}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
              <X className="w-3.5 h-3.5" /> Reject
            </button>
          </div>
        );
      case 'accepted':
        return (
          <button onClick={() => updateStatus(booking._id, 'in_progress', 'Service started')} disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-500 hover:bg-violet-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
            <Play className="w-3.5 h-3.5" /> Start
          </button>
        );
      case 'in_progress':
        return (
          <button onClick={() => updateStatus(booking._id, 'completed', 'Service completed successfully')} disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50">
            <CheckCircle className="w-3.5 h-3.5" /> Complete
          </button>
        );
      default: return null;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Manage Bookings</h1>

      {/* Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
            {tab === 'all' ? 'All' : tab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : bookings.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">No bookings</h3>
          <p className="text-slate-500">No {activeTab !== 'all' ? activeTab.replace('_', ' ') : ''} bookings at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b._id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 flex-wrap">
                {/* Customer avatar */}
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                  {b.user?.avatar ? <img src={b.user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(b.user?.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-bold text-slate-900">{b.user?.name}</h3>
                    <StatusBadge status={b.status} />
                  </div>
                  <p className="text-sm font-semibold text-primary-700 mt-1">{b.service?.name}</p>

                  <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(b.scheduledDate)} at {b.scheduledTime}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {b.address?.city}
                    </span>
                    {b.user?.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {b.user.phone}
                      </span>
                    )}
                  </div>

                  {b.notes && (
                    <p className="mt-2 text-sm text-slate-500 bg-slate-50 px-3 py-2 rounded-lg">📝 {b.notes}</p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className="text-lg font-bold text-slate-900">{formatCurrency(b.totalAmount)}</span>
                  <ActionButtons booking={b} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
