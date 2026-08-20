import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api.js';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/helpers.js';
import { PageLoader } from '../../components/common/Spinner.jsx';

const STATUS_TABS = ['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchBookings = async (status) => {
    setLoading(true);
    try {
      const q = status !== 'all' ? `?status=${status}` : '';
      const { data } = await api.get(`/bookings/my${q}`);
      setBookings(data.bookings || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchBookings(activeTab); }, [activeTab]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>

      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {STATUS_TABS.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab ? 'bg-primary-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-400'}`}>
            {tab === 'all' ? 'All' : tab.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
          </button>
        ))}
      </div>

      {loading ? <PageLoader /> : bookings.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h3 className="font-bold text-slate-900 text-lg mb-2">No bookings found</h3>
          <p className="text-slate-500 mb-5">
            {activeTab === 'all' ? "You haven't made any bookings yet." : `No ${activeTab.replace('_', ' ')} bookings.`}
          </p>
          <Link to="/services" className="btn-primary">Browse Services</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map(b => (
            <Link key={b._id} to={`/dashboard/bookings/${b._id}`}
              className="card flex items-center gap-4 p-5 hover:shadow-md transition-all group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl flex-shrink-0">
                {b.provider?.category?.icon || '🔧'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">{b.service?.name}</h3>
                  <StatusBadge status={b.status} />
                </div>
                <p className="text-sm text-slate-500 mt-1">
                  With <span className="font-medium">{b.provider?.user?.name}</span> · {formatDate(b.scheduledDate)} at {b.scheduledTime}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{b.address?.city}, {b.address?.state}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-lg font-bold text-slate-900">{formatCurrency(b.totalAmount)}</div>
                <div className="text-xs text-slate-400 capitalize">{b.paymentStatus}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
