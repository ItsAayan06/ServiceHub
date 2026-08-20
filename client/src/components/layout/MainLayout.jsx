import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, Bell, ChevronDown, LogOut, User, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNotifications } from '../../context/NotificationContext.jsx';
import { getInitials } from '../../utils/helpers.js';

export default function MainLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dashboardPath = user?.role === 'admin' ? '/admin' : user?.role === 'provider' ? '/provider' : '/dashboard';

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl text-slate-900">Service<span className="text-primary-600">Hub</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/services" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Browse Services</Link>
              <Link to="/services?cat=electrician" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Electrician</Link>
              <Link to="/services?cat=plumber" className="text-slate-600 hover:text-primary-600 font-medium transition-colors">Plumber</Link>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  {/* Notifications */}
                  <button onClick={() => navigate(`${dashboardPath}`)} className="relative p-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <Bell className="w-5 h-5 text-slate-600" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {/* User dropdown */}
                  <div className="relative">
                    <button onClick={() => setDropdownOpen(!dropdownOpen)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
                        {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
                      </div>
                      <span className="hidden sm:block text-sm font-semibold text-slate-700">{user.name.split(' ')[0]}</span>
                      <ChevronDown className="w-4 h-4 text-slate-500" />
                    </button>

                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 card py-2 z-50 animate-fade-in" onMouseLeave={() => setDropdownOpen(false)}>
                        <div className="px-4 py-2 border-b border-slate-100 mb-1">
                          <p className="font-semibold text-slate-900 text-sm">{user.name}</p>
                          <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                        </div>
                        <Link to={dashboardPath} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link to={`${dashboardPath}/profile`} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                          <User className="w-4 h-4" /> Profile
                        </Link>
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login" className="btn-secondary text-sm py-2 px-4">Login</Link>
                  <Link to="/register" className="btn-primary text-sm py-2 px-4">Get Started</Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <button className="md:hidden p-2 rounded-xl hover:bg-slate-100" onClick={() => setMobileOpen(!mobileOpen)}>
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-2 animate-slide-up">
            <Link to="/services" className="block py-2 text-slate-700 font-medium" onClick={() => setMobileOpen(false)}>Browse Services</Link>
            <Link to="/services?cat=electrician" className="block py-2 text-slate-700 font-medium" onClick={() => setMobileOpen(false)}>Electrician</Link>
            <Link to="/services?cat=plumber" className="block py-2 text-slate-700 font-medium" onClick={() => setMobileOpen(false)}>Plumber</Link>
          </div>
        )}
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">S</span>
                </div>
                <span className="font-bold text-lg">ServiceHub</span>
              </div>
              <p className="text-slate-400 text-sm">Book trusted local service professionals with ease.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-slate-300">Services</h4>
              {['Electrician', 'Plumber', 'AC Repair', 'Cleaning', 'Carpenter'].map(s => (
                <Link key={s} to={`/services?search=${s}`} className="block text-slate-400 hover:text-white text-sm py-1 transition-colors">{s}</Link>
              ))}
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-slate-300">Company</h4>
              {['About Us', 'How it Works', 'Careers', 'Blog'].map(s => (
                <a key={s} href="#" className="block text-slate-400 hover:text-white text-sm py-1 transition-colors">{s}</a>
              ))}
            </div>
            <div>
              <h4 className="font-semibold mb-3 text-slate-300">Support</h4>
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service'].map(s => (
                <a key={s} href="#" className="block text-slate-400 hover:text-white text-sm py-1 transition-colors">{s}</a>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-6 text-center text-slate-500 text-sm">
            © {new Date().getFullYear()} ServiceHub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
