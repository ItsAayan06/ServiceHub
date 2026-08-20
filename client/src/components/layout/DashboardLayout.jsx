import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  LayoutDashboard, CalendarCheck, User, DollarSign, Users,
  ShieldCheck, BookOpen, Menu, X, LogOut, ChevronRight, Bell
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { getInitials } from '../../utils/helpers.js';

const navItems = {
  user: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
    { to: '/dashboard/bookings', icon: CalendarCheck, label: 'My Bookings' },
    { to: '/dashboard/profile', icon: User, label: 'Profile' },
  ],
  provider: [
    { to: '/provider', icon: LayoutDashboard, label: 'Overview' },
    { to: '/provider/bookings', icon: CalendarCheck, label: 'Bookings' },
    { to: '/provider/earnings', icon: DollarSign, label: 'Earnings' },
    { to: '/provider/profile', icon: User, label: 'My Profile' },
  ],
  admin: [
    { to: '/admin', icon: LayoutDashboard, label: 'Overview' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/providers', icon: ShieldCheck, label: 'Providers' },
    { to: '/admin/bookings', icon: BookOpen, label: 'Bookings' },
  ],
};

const roleColors = {
  user: 'from-primary-500 to-primary-700',
  provider: 'from-violet-500 to-violet-700',
  admin: 'from-rose-500 to-rose-700',
};

export default function DashboardLayout({ role }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const items = navItems[role] || navItems.user;

  const handleLogout = () => { logout(); navigate('/'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-slate-100">
        <Link to="/" className="flex items-center gap-2">
          <div className={`w-9 h-9 bg-gradient-to-br ${roleColors[role]} rounded-xl flex items-center justify-center shadow-md`}>
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl text-slate-900">Service<span className="text-primary-600">Hub</span></span>
        </Link>
      </div>

      {/* User info */}
      <div className="p-4 mx-3 mt-4 rounded-2xl bg-slate-50 border border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${roleColors[role]} flex items-center justify-center text-white font-bold text-sm overflow-hidden flex-shrink-0`}>
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : getInitials(user?.name)}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 text-sm truncate">{user?.name}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${roleColors[role]} text-white font-medium capitalize`}>{role}</span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {items.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-150 group
                ${active
                  ? `bg-gradient-to-r ${roleColors[role]} text-white shadow-md`
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight className="w-4 h-4 opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-slate-100 space-y-1">
        <Link to="/" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-600 hover:bg-slate-100 transition-colors">
          <span>🏠</span> Back to Home
        </Link>
        <button onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors w-full">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-col bg-white border-r border-slate-100 shadow-sm fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-white h-full shadow-2xl animate-slide-in-right">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 h-16">
            <button className="lg:hidden p-2 rounded-xl hover:bg-slate-100" onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5 text-slate-600" />
            </button>
            <div className="hidden lg:block">
              <h1 className="font-semibold text-slate-800 capitalize">{role} Dashboard</h1>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <button className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                <Bell className="w-5 h-5 text-slate-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
                <p className="text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
