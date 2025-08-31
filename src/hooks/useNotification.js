// src/hooks/useNotification.js
// Bu hook bildirim sistemini yönetir

import { useState, useRef, useCallback, useEffect } from 'react';
import { ORDER_STATUS } from '../utils/constants';

export const useNotification = (duration = 3000) => {
  const [notification, setNotification] = useState({ show: false, message: '', type: 'info' });
  const unpaidOrderTimersRef = useRef(new Map());
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

  // Ödenmemiş sipariş timer'ı başlatma
  const startUnpaidOrderTimer = useCallback((orderId, orderDate) => {
    console.log('Ödenmemiş sipariş timer başlatılıyor:', orderId);
    
    // Eğer bu sipariş için zaten bir timer varsa, önce onu temizle
    if (unpaidOrderTimersRef.current.has(orderId)) {
      clearTimeout(unpaidOrderTimersRef.current.get(orderId));
    }

    // 30 dakika = 30 * 60 * 1000 = 1800000 ms
    // Test için 30 saniye kullanabilirsiniz: 30 * 1000 = 30000 ms
    const THIRTY_MINUTES = 30 * 60 * 1000;
    
    const timerId = setTimeout(() => {
      console.log('30 dakika doldu, ödenmemiş sipariş bildirimi gösteriliyor:', orderId);
      showWarning('Ödenmeyen siparişlerinizi kontrol edin!');
      
      // Timer'ı map'ten kaldır
      unpaidOrderTimersRef.current.delete(orderId);
    }, THIRTY_MINUTES);

    // Timer'ı map'e ekle
    unpaidOrderTimersRef.current.set(orderId, timerId);
  }, [showWarning]);

  // Ödenmemiş sipariş timer'ını iptal etme
  const cancelUnpaidOrderTimer = useCallback((orderId) => {
    console.log('Ödenmemiş sipariş timer iptal ediliyor:', orderId);
    
    if (unpaidOrderTimersRef.current.has(orderId)) {
      clearTimeout(unpaidOrderTimersRef.current.get(orderId));
      unpaidOrderTimersRef.current.delete(orderId);
    }
  }, []);

  // Sipariş durumu değişikliklerini izleme
  const handleOrderStatusChange = useCallback((orderId, newStatus, orderDate) => {
    if (newStatus === ORDER_STATUS.UNPAID) {
      // Sipariş ödenmemiş duruma geçti, timer başlat
      startUnpaidOrderTimer(orderId, orderDate);
    } else if (newStatus === ORDER_STATUS.PAID) {
      // Sipariş ödendi, timer'ı iptal et
      cancelUnpaidOrderTimer(orderId);
    }
  }, [startUnpaidOrderTimer, cancelUnpaidOrderTimer]);

  // Yeni sipariş ekleme durumunu izleme
  const handleNewOrder = useCallback((orderId, status, orderDate) => {
    if (status === ORDER_STATUS.UNPAID) {
      startUnpaidOrderTimer(orderId, orderDate);
    }
  }, [startUnpaidOrderTimer]);

  // Sipariş silme durumunu izleme
  const handleOrderDelete = useCallback((orderId) => {
    cancelUnpaidOrderTimer(orderId);
  }, [cancelUnpaidOrderTimer]);

  // Component unmount olduğunda tüm timer'ları temizle
  useEffect(() => {
    return () => {
      console.log('useNotification unmount, tüm timer\'lar temizleniyor');
      unpaidOrderTimersRef.current.forEach((timerId) => {
        clearTimeout(timerId);
      });
      unpaidOrderTimersRef.current.clear();
    };
  }, []); // Dependency array'i boş bırakıyoruz

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
    
    // Unpaid order timer functions
    startUnpaidOrderTimer,
    cancelUnpaidOrderTimer,
    handleOrderStatusChange,
    handleNewOrder,
    handleOrderDelete,
    
    // Status
    isVisible: notification.show,
    activeTimersCount: unpaidOrderTimersRef.current.size
  };
};

export default useNotification;