import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarCheck, Clock, CheckCircle, XCircle, ArrowRight, Search } from 'lucide-react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import StatusBadge from '../../components/common/StatusBadge.jsx';
import { formatDate, formatCurrency } from '../../utils/helpers.js';

export default function UserDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, completed: 0, cancelled: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my?limit=5').then(r => {
      const b = r.data.bookings || [];
      setBookings(b);
      setStats({
        total: r.data.total || 0,
        pending: b.filter(x => x.status === 'pending').length,
        completed: b.filter(x => x.status === 'completed').length,
        cancelled: b.filter(x => x.status === 'cancelled').length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: CalendarCheck, label: 'Total Bookings', value: stats.total, color: 'text-primary-600 bg-primary-50' },
    { icon: Clock, label: 'Pending', value: stats.pending, color: 'text-yellow-600 bg-yellow-50' },
    { icon: CheckCircle, label: 'Completed', value: stats.completed, color: 'text-green-600 bg-green-50' },
    { icon: XCircle, label: 'Cancelled', value: stats.cancelled, color: 'text-red-600 bg-red-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
        <p className="text-slate-500 mt-1">Manage your service bookings</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link to="/services" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-2xl">🔍</div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 group-hover:text-primary-600 transition-colors">Browse Services</h3>
              <p className="text-sm text-slate-500">Find professionals near you</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link to="/dashboard/bookings" className="card p-6 hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-violet-50 flex items-center justify-center text-2xl">📋</div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 group-hover:text-violet-600 transition-colors">My Bookings</h3>
              <p className="text-sm text-slate-500">View all your bookings</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="card">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="font-bold text-slate-900">Recent Bookings</h2>
          <Link to="/dashboard/bookings" className="text-sm text-primary-600 font-medium hover:underline">View all</Link>
        </div>
        {loading ? (
          <div className="p-8 flex justify-center"><div className="w-6 h-6 border-3 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : bookings.length === 0 ? (
          <div className="p-10 text-center">
            <div className="text-4xl mb-3">📅</div>
            <p className="text-slate-500 mb-4">No bookings yet</p>
            <Link to="/services" className="btn-primary text-sm">Book a Service</Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {bookings.map(b => (
              <Link key={b._id} to={`/dashboard/bookings/${b._id}`}
                className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-xl flex-shrink-0">
                  {b.provider?.category?.icon || '🔧'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{b.service?.name}</p>
                  <p className="text-sm text-slate-500">{b.provider?.user?.name} · {formatDate(b.scheduledDate)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={b.status} />
                  <span className="font-bold text-slate-900 text-sm">{formatCurrency(b.totalAmount)}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
