// contexts/AuthContext.js
import React, { createContext, useContext } from 'react';
import { useAuth as useAuthHook } from '../hooks/useAuth';

// Auth context oluştur
const AuthContext = createContext(null);

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const authData = useAuthHook();
  
  return (
    <AuthContext.Provider value={authData}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth hook - context'ten veri almak için
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Hook'u da export et (geriye uyumluluk için)
export { useAuthHook };