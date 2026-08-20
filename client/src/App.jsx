import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { NotificationProvider } from './context/NotificationContext.jsx';

// Layouts
import MainLayout from './components/layout/MainLayout.jsx';
import DashboardLayout from './components/layout/DashboardLayout.jsx';

// Public pages
import HomePage from './pages/HomePage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import ServicesPage from './pages/ServicesPage.jsx';
import ProviderDetailPage from './pages/ProviderDetailPage.jsx';
import ProviderSetupPage from './pages/auth/ProviderSetupPage.jsx';

// User pages
import UserDashboard from './pages/user/UserDashboard.jsx';
import BookingPage from './pages/user/BookingPage.jsx';
import MyBookingsPage from './pages/user/MyBookingsPage.jsx';
import BookingDetailPage from './pages/user/BookingDetailPage.jsx';
import UserProfilePage from './pages/user/UserProfilePage.jsx';

// Provider pages
import ProviderDashboard from './pages/provider/ProviderDashboard.jsx';
import ProviderBookings from './pages/provider/ProviderBookings.jsx';
import ProviderProfile from './pages/provider/ProviderProfile.jsx';
import ProviderEarnings from './pages/provider/ProviderEarnings.jsx';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AdminProviders from './pages/admin/AdminProviders.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/services" element={<ServicesPage />} />
      <Route path="/providers/:id" element={<ProviderDetailPage />} />
    </Route>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/provider/setup" element={<ProtectedRoute><ProviderSetupPage /></ProtectedRoute>} />

    {/* User dashboard */}
    <Route path="/dashboard" element={<ProtectedRoute roles={['user']}><DashboardLayout role="user" /></ProtectedRoute>}>
      <Route index element={<UserDashboard />} />
      <Route path="bookings" element={<MyBookingsPage />} />
      <Route path="bookings/:id" element={<BookingDetailPage />} />
      <Route path="book/:providerId" element={<BookingPage />} />
      <Route path="profile" element={<UserProfilePage />} />
    </Route>

    {/* Provider dashboard */}
    <Route path="/provider" element={<ProtectedRoute roles={['provider']}><DashboardLayout role="provider" /></ProtectedRoute>}>
      <Route index element={<ProviderDashboard />} />
      <Route path="bookings" element={<ProviderBookings />} />
      <Route path="profile" element={<ProviderProfile />} />
      <Route path="earnings" element={<ProviderEarnings />} />
    </Route>

    {/* Admin dashboard */}
    <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout role="admin" /></ProtectedRoute>}>
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<AdminUsers />} />
      <Route path="providers" element={<AdminProviders />} />
      <Route path="bookings" element={<AdminBookings />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { borderRadius: '12px', fontFamily: 'Plus Jakarta Sans', fontSize: '14px' },
            }}
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
