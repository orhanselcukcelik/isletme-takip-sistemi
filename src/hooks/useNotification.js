// src/hooks/useNotification.js
// Bu hook bildirim sistemini yönetir

import { useState, useRef, useCallback } from 'react';

export const useNotification = (duration = 3000) => {
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const timeoutRef = useRef(null);

  // Bildirim gösterme
  const showNotification = useCallback((message, type = 'info') => {
    console.log('Bildirim gösteriliyor:', message, type);
    
    // Mevcut timeout'u temizle
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Bildirimi göster
    setNotification({ show: true, message, type });

    // Otomatik gizleme
    timeoutRef.current = setTimeout(() => {
      console.log('Bildirim otomatik gizleniyor');
      setNotification({ show: false, message: '', type: 'info' });
    }, duration);
  }, [duration]);

  // Success bildirimi
  const showSuccess = useCallback((message) => {
    showNotification(message, 'success');
  }, [showNotification]);

  // Error bildirimi
  const showError = useCallback((message) => {
    showNotification(message, 'error');
  }, [showNotification]);

  // Warning bildirimi
  const showWarning = useCallback((message) => {
    showNotification(message, 'warning');
  }, [showNotification]);

  // Info bildirimi
  const showInfo = useCallback((message) => {
    showNotification(message, 'info');
  }, [showNotification]);

  // Bildirimi manuel gizleme
  const hideNotification = useCallback(() => {
    console.log('Bildirim manuel gizleniyor');
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setNotification({ show: false, message: '', type: 'info' });
  }, []);

  // Service sonuçlarını otomatik işleme
  const handleServiceResult = useCallback((result) => {
    if (result.success) {
      if (result.message) {
        showSuccess(result.message);
      }
    } else {
      showError(result.error || 'Bir hata oluştu');
    }
    return result;
  }, [showSuccess, showError]);

  // Hook'un döndürdüğü değerler
  return {
    // State
    notification,
    
    // Basic functions
    showNotification,
    hideNotification,
    
    // Typed functions
    showSuccess,
    showError,
    showWarning,
    showInfo,
    
    // Utility
    handleServiceResult,
    
    // Status
    isVisible: notification.show
  };
};

export default useNotification;