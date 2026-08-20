import { useState, useEffect } from 'react';
import { Users, Briefcase, CalendarCheck, DollarSign, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import api from '../../utils/api.js';
import { formatCurrency } from '../../utils/helpers.js';
import { PageLoader } from '../../components/common/Spinner.jsx';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics')
      .then(r => setAnalytics(r.data.analytics))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const statCards = [
    { icon: Users, label: 'Total Users', value: analytics?.totalUsers || 0, color: 'text-primary-600 bg-primary-50', sub: 'Customers' },
    { icon: Briefcase, label: 'Providers', value: analytics?.totalProviders || 0, color: 'text-violet-600 bg-violet-50', sub: 'Professionals' },
    { icon: CalendarCheck, label: 'Bookings', value: analytics?.totalBookings || 0, color: 'text-blue-600 bg-blue-50', sub: 'Total' },
    { icon: DollarSign, label: 'Revenue', value: formatCurrency(analytics?.totalRevenue || 0), color: 'text-green-600 bg-green-50', sub: 'Completed' },
  ];

  const maxRevenue = analytics?.monthlyBookings?.length
    ? Math.max(...analytics.monthlyBookings.map(m => m.revenue))
    : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Platform overview and analytics</p>
      </div>

      {/* Pending providers alert */}
      {(analytics?.pendingProviders || 0) > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-4">
          <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900">
              {analytics.pendingProviders} provider{analytics.pendingProviders > 1 ? 's' : ''} awaiting approval
            </p>
            <p className="text-sm text-amber-700">Review and approve provider applications</p>
          </div>
          <a href="/admin/providers" className="btn-primary text-sm py-2">Review</a>
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color, sub }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
            <div className="text-xs text-slate-400 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>

      {/* Booking status breakdown */}
      {analytics?.bookingsByStatus?.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-slate-900 mb-5">Bookings by Status</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {analytics.bookingsByStatus.map(({ _id: status, count }) => {
              const colors = {
                pending: 'bg-yellow-50 border-yellow-200 text-yellow-700',
                accepted: 'bg-blue-50 border-blue-200 text-blue-700',
                in_progress: 'bg-violet-50 border-violet-200 text-violet-700',
                completed: 'bg-green-50 border-green-200 text-green-700',
                cancelled: 'bg-red-50 border-red-200 text-red-700',
                rejected: 'bg-rose-50 border-rose-200 text-rose-700',
              };
              return (
                <div key={status} className={`border-2 rounded-xl p-3 text-center ${colors[status] || 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs font-semibold capitalize mt-0.5">{status?.replace('_', ' ')}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Monthly revenue chart */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary-500" /> Monthly Revenue & Bookings
        </h2>
        {analytics?.monthlyBookings?.length > 0 ? (
          <div className="space-y-4">
            {[...analytics.monthlyBookings].reverse().map((m, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-slate-500 w-8 font-semibold">
                  {MONTHS[m._id.month]}
                </span>
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full flex items-center px-2 transition-all"
                        style={{ width: `${maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0}%`, minWidth: '50px' }}>
                        <span className="text-xs font-bold text-white">{formatCurrency(m.revenue)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">{m.count} bookings completed</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No revenue data yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
