// contexts/NotificationContext.js
import React, { createContext, useContext } from 'react';
import { useNotification as useNotificationHook } from '../hooks/useNotification';

// Notification context oluştur
const NotificationContext = createContext(null);

// NotificationProvider component
export const NotificationProvider = ({ children }) => {
  const notificationData = useNotificationHook();
  
  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
};

// useNotification hook - context'ten veri almak için
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Hook'u da export et (geriye uyumluluk için)
export { useNotificationHook };