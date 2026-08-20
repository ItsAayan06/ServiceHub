import { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../utils/socket.js';
import { useAuth } from './AuthContext.jsx';
import toast from 'react-hot-toast';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();

    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(c => c + 1);
      toast(notification.message, { icon: '🔔' });
    });

    socket.on('booking_status_update', ({ status, booking }) => {
      const labels = { accepted: '✅ Booking Accepted', rejected: '❌ Booking Rejected', in_progress: '🔧 Service Started', completed: '🎉 Service Completed', cancelled: '🚫 Booking Cancelled' };
      if (labels[status]) toast.success(labels[status]);
    });

    return () => {
      socket.off('notification');
      socket.off('booking_status_update');
    };
  }, [user]);

  const clearUnread = () => setUnreadCount(0);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, clearUnread }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
