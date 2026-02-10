import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUserById, updateUserLastLogin } from '../utils/localStorage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      // Verify user still exists and is not blocked
      const fullUser = getUserById(user.id);
      if (fullUser && !fullUser.isBlocked) {
        setCurrentUser(fullUser);
      } else {
        localStorage.removeItem('currentUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (user) => {
    // Update last login
    updateUserLastLogin(user.id);
    const updatedUser = getUserById(user.id);
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateCurrentUser = () => {
    if (currentUser) {
      const updatedUser = getUserById(currentUser.id);
      if (updatedUser && !updatedUser.isBlocked) {
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      } else {
        logout();
      }
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    updateCurrentUser,
    loading,
    isAdmin: currentUser?.role === 'admin',
    isUser: currentUser?.role === 'user'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};