import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DollarSign, CalendarCheck, Star, Clock, AlertCircle, ArrowRight, TrendingUp } from 'lucide-react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/helpers.js';

export default function ProviderDashboard() {
  const { user, provider } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/bookings/provider/stats'),
      api.get('/bookings/provider?limit=5'),
    ]).then(([statsRes, bookingsRes]) => {
      setStats(statsRes.data.stats);
      setRecentBookings(bookingsRes.data.bookings || []);
    }).finally(() => setLoading(false));
  }, []);

  if (!provider?.isApproved) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card p-10 max-w-md text-center">
          <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Pending Approval</h2>
          <p className="text-slate-500">Your provider profile is under review. We'll notify you once it's approved.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: DollarSign, label: 'Total Earnings', value: stats ? formatCurrency(stats.totalEarnings) : '—', color: 'text-green-600 bg-green-50' },
    { icon: CalendarCheck, label: 'Total Bookings', value: stats?.total ?? '—', color: 'text-primary-600 bg-primary-50' },
    { icon: Clock, label: 'Pending', value: stats?.pending ?? '—', color: 'text-yellow-600 bg-yellow-50' },
    { icon: Star, label: 'Rating', value: stats ? `${stats.rating?.toFixed(1)} ★` : '—', color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {user?.name?.split(' ')[0]}! 🔧</h1>
        <p className="text-slate-500">Manage your bookings and services</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Pending bookings alert */}
      {(stats?.pending || 0) > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-yellow-900">You have {stats.pending} pending booking{stats.pending > 1 ? 's' : ''}</p>
            <p className="text-sm text-yellow-700">Respond to keep customers happy</p>
          </div>
          <Link to="/provider/bookings?status=pending" className="btn-primary text-sm py-2">
            View <ArrowRight className="w-4 h-4 inline" />
          </Link>
        </div>
      )}

      {/* Monthly chart preview */}
      {stats?.monthlyEarnings?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary-500" /> Recent Earnings</h2>
          <div className="flex items-end gap-3 h-24">
            {[...stats.monthlyEarnings].reverse().map((m, i) => {
              const max = Math.max(...stats.monthlyEarnings.map(x => x.earnings));
              const height = max > 0 ? (m.earnings / max) * 100 : 0;
              const months = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full bg-primary-100 rounded-lg overflow-hidden" style={{ height: '80px' }}>
                    <div className="w-full bg-primary-500 rounded-lg transition-all" style={{ height: `${height}%`, marginTop: 'auto' }} />
                  </div>
                  <span className="text-xs text-slate-400">{months[m._id.month]}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent bookings */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Recent Bookings</h2>
          <Link to="/provider/bookings" className="text-sm text-primary-600 font-medium hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center"><div className="w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : recentBookings.length === 0 ? (
          <div className="p-10 text-center text-slate-500">No bookings yet. Share your profile to get started!</div>
        ) : (
          <div className="divide-y divide-slate-50">
            {recentBookings.map(b => (
              <Link key={b._id} to={`/provider/bookings`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">👤</div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{b.service?.name}</p>
                  <p className="text-sm text-slate-500">{b.user?.name} · {formatDate(b.scheduledDate)}</p>
                </div>
                <StatusBadge status={b.status} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
