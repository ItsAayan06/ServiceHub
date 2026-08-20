import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Briefcase, Star } from 'lucide-react';
import api from '../../utils/api.js';
import { formatCurrency } from '../../utils/helpers.js';
import { PageLoader } from '../../components/common/Spinner.jsx';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function ProviderEarnings() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/provider/stats')
      .then(r => setStats(r.data.stats))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  const maxEarnings = stats?.monthlyEarnings?.length ? Math.max(...stats.monthlyEarnings.map(m => m.earnings)) : 1;

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900">Earnings Overview</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: DollarSign, label: 'Total Earnings', value: formatCurrency(stats?.totalEarnings || 0), color: 'text-green-600 bg-green-50' },
          { icon: Briefcase, label: 'Jobs Completed', value: stats?.completed || 0, color: 'text-primary-600 bg-primary-50' },
          { icon: TrendingUp, label: 'In Progress', value: stats?.inProgress || 0, color: 'text-violet-600 bg-violet-50' },
          { icon: Star, label: 'Avg Rating', value: `${stats?.rating?.toFixed(1) || '0.0'} ★`, color: 'text-amber-600 bg-amber-50' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="text-2xl font-bold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Monthly chart */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-6">Monthly Earnings</h2>
        {stats?.monthlyEarnings?.length > 0 ? (
          <div className="space-y-3">
            {[...stats.monthlyEarnings].reverse().map((m, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-sm text-slate-500 w-8 font-medium">{MONTHS[m._id.month]}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-8 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-400 rounded-full flex items-center px-3 transition-all duration-700"
                    style={{ width: `${maxEarnings > 0 ? (m.earnings / maxEarnings) * 100 : 0}%`, minWidth: '60px' }}>
                    <span className="text-xs font-bold text-white">{formatCurrency(m.earnings)}</span>
                  </div>
                </div>
                <span className="text-xs text-slate-400 w-16 text-right">{m.count} job{m.count !== 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-slate-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No earnings data yet. Complete bookings to see your stats.</p>
          </div>
        )}
      </div>

      {/* Breakdown */}
      <div className="card p-6">
        <h2 className="font-bold text-slate-900 mb-4">Booking Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats?.total || 0, bg: 'bg-slate-100' },
            { label: 'Pending', value: stats?.pending || 0, bg: 'bg-yellow-100' },
            { label: 'Completed', value: stats?.completed || 0, bg: 'bg-green-100' },
            { label: 'In Progress', value: stats?.inProgress || 0, bg: 'bg-violet-100' },
          ].map(({ label, value, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
              <div className="text-3xl font-bold text-slate-900">{value}</div>
              <div className="text-sm text-slate-600 mt-1">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
