import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('cnf_token');
    if (token) {
      api.get('/auth/me')
        .then((res) => {
          setUser(res.user);
        })
        .catch(() => {
          localStorage.removeItem('cnf_token');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('cnf_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (name, email, password, phone) => {
    const res = await api.post('/auth/register', { name, email, password, phone });
    localStorage.setItem('cnf_token', res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    localStorage.removeItem('cnf_token');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.user);
    } catch (e) {
      // ignore
    }
  };

  const addAddress = async (addressData) => {
    const res = await api.post('/auth/addresses', addressData);
    await refreshUser();
    return res.address;
  };

  const deleteAddress = async (id) => {
    await api.delete(`/auth/addresses/${id}`);
    await refreshUser();
  };

  const value = {
    user,
    loading,
    isAdmin: user?.role === 'ADMIN',
    login,
    register,
    logout,
    refreshUser,
    addAddress,
    deleteAddress
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
