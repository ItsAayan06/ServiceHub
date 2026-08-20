import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api.js';
import { connectSocket, disconnectSocket } from '../utils/socket.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
      setProvider(data.provider || null);
      connectSocket(data.user._id);
    } catch {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) fetchMe();
    else setLoading(false);
  }, [fetchMe]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    setProvider(data.provider || null);
    connectSocket(data.user._id);
    return data;
  };

  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    localStorage.setItem('token', data.token);
    setUser(data.user);
    connectSocket(data.user._id);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setProvider(null);
    disconnectSocket();
  };

  const updateUser = (updatedUser) => setUser(updatedUser);
  const updateProvider = (updatedProvider) => setProvider(updatedProvider);

  return (
    <AuthContext.Provider value={{ user, provider, loading, login, register, logout, updateUser, updateProvider, refetch: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
