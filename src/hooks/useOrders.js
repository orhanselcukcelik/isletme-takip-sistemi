// src/hooks/useOrders.js
// Bu hook tüm sipariş işlemlerini yönetir

import { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';

export const useOrders = (user, products = []) => {
  // Orders state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Selected products for new order
  const [selectedProducts, setSelectedProducts] = useState({});
  
  // Order editing state
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState([]);
  const [editOrderDate, setEditOrderDate] = useState('');

  // Firebase - Siparişleri dinleme
  useEffect(() => {
    if (!user) {
      console.log('Kullanıcı yok, siparişler temizleniyor');
      setOrders([]);
      return;
    }

    console.log('Siparişler dinlenmeye başlanıyor:', user.uid);
    
    const unsubscribe = orderService.subscribeToOrders(user.uid, (orders) => {
      console.log('Siparişler güncellendi:', orders.length, 'adet');
      setOrders(orders);
    });

    return () => {
      console.log('Sipariş listener kapatılıyor...');
      unsubscribe();
    };
  }, [user]);

  // Statistics hesaplama helpers
  const getStats = (range) => {
    const now = new Date();
    const matchers = {
      daily: (d) => d.toDateString() === now.toDateString(),
      monthly: (d) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(),
      yearly: (d) => d.getFullYear() === now.getFullYear()
    };
    
    const selectedOrders = orders.filter(order => matchers[range](new Date(order.date)));
    
    return {
      totalRevenue: selectedOrders.reduce((sum, order) => sum + (order.totalRevenue || 0), 0),
      totalCost: selectedOrders.reduce((sum, order) => sum + (order.totalCost || 0), 0),
      totalProfit: selectedOrders.reduce((sum, order) => sum + (order.profit || 0), 0),
      totalTax: selectedOrders.reduce((sum, order) => sum + (order.totalTax || 0), 0),
      orderCount: selectedOrders.length
    };
  };

  const getGroupingKey = (date, range) => {
    const d = new Date(date);
    const now = new Date();
    
    if (range === 'daily') {
      if (d.toDateString() === now.toDateString()) {
        return `${String(d.getHours()).padStart(2,'0')}:00`;
      }
      return null;
    }
    
    if (range === 'monthly') {
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        return String(d.getDate());
      }
      return null;
    }
    
    if (d.getFullYear() === now.getFullYear()) {
      return String(d.getMonth() + 1);
    }
    return null;
  };

  const getChartData = (range) => {
    const grouped = {};
    
    orders.forEach(order => {
      const key = getGroupingKey(order.date, range);
      if (!key) return;
      
      if (!grouped[key]) {
        grouped[key] = { date: key, revenue: 0, profit: 0, orders: 0 };
      }
      grouped[key].revenue += (order.totalRevenue || 0);
      grouped[key].profit += (order.profit || 0);
      grouped[key].orders += 1;
    });

    const parseKey = (k) => {
      if (range === 'daily') return parseInt(k.split(':')[0]);
      return parseInt(k);
    };

    // Eksik aralıkları doldur
    if (range === 'daily') {
      const hours = Array.from({length: 24}, (_, i) => `${String(i).padStart(2,'0')}:00`);
      return hours.map(hour => grouped[hour] || { date: hour, revenue: 0, profit: 0, orders: 0 });
    }
    
    if (range === 'monthly') {
      const now = new Date();
      const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const days = Array.from({length: daysInMonth}, (_, i) => String(i + 1));
      return days.map(day => grouped[day] || { date: day, revenue: 0, profit: 0, orders: 0 });
    }
    
    const months = Array.from({length: 12}, (_, i) => String(i + 1));
    return months.map(month => grouped[month] || { date: month, revenue: 0, profit: 0, orders: 0 });
  };

  // Memoized calculations
  const stats = useMemo(() => ({
    daily: getStats('daily'),
    monthly: getStats('monthly'),
    yearly: getStats('yearly')
  }), [orders]);

  const chartData = useMemo(() => ({
    daily: getChartData('daily'),
    monthly: getChartData('monthly'),
    yearly: getChartData('yearly')
  }), [orders]);

  // Yeni sipariş ekleme
  const addOrder = async () => {
    console.log('Yeni sipariş ekleniyor:', selectedProducts);
    
    if (!user) {
      return { success: false, error: 'Önce giriş yapmalısınız.' };
    }

    // Seçilen ürün kontrolü
    const selectedCount = Object.values(selectedProducts).filter(qty => qty > 0).length;
    if (selectedCount === 0) {
      return { success: false, error: 'Sipariş oluşturmak için ürün seçin.' };
    }

    setLoading(true);
    
    try {
      const result = await orderService.addOrder(user.uid, selectedProducts, products);
      
      if (result.success) {
        setSelectedProducts({});
        console.log('Sipariş başarıyla eklendi');
        return { success: true, message: 'Sipariş eklendi!' };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Sipariş ekleme hatası:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Sipariş silme
  const deleteOrder = async (orderId) => {
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı' };
    
    const orderToDelete = orders.find(order => order.id === orderId);
    if (!orderToDelete) return { success: false, error: 'Sipariş bulunamadı' };

    console.log('Sipariş siliniyor:', orderId);
    
    const result = await orderService.deleteOrder(user.uid, orderId, orderToDelete.items);
    
    if (result.success) {
      return { success: true, message: 'Sipariş silindi!' };
    } else {
      return result;
    }
  };

  // Sipariş düzenleme başlatma
  const startEditOrder = (order) => {
    console.log('Sipariş düzenleme başlatılıyor:', order.id);
    
    setEditingOrder(order.id);
    setEditOrderForm(order.items.map(item => ({ ...item })));
    setEditOrderDate(new Date(order.date).toISOString().slice(0,16));
  };

  // Sipariş düzenleme kaydetme
  const saveEditOrder = async () => {
    if (!editingOrder || !user) {
      return { success: false, error: 'Gerekli bilgiler bulunamadı.' };
    }
    
    const originalOrder = orders.find(order => order.id === editingOrder);
    if (!originalOrder) {
      return { success: false, error: 'Orijinal sipariş bulunamadı.' };
    }

    console.log('Sipariş düzenleme kaydediliyor:', editingOrder);
    
    const result = await orderService.updateOrder(
      user.uid, 
      editingOrder, 
      originalOrder, 
      editOrderForm, 
      editOrderDate
    );
    
    if (result.success) {
      setEditingOrder(null);
      setEditOrderForm([]);
      setEditOrderDate('');
      return { success: true, message: 'Sipariş güncellendi!' };
    } else {
      return result;
    }
  };

  // Sipariş düzenleme iptal etme
  const cancelEditOrder = () => {
    console.log('Sipariş düzenleme iptal edildi');
    setEditingOrder(null);
    setEditOrderForm([]);
    setEditOrderDate('');
  };

  // Hook'un döndürdüğü değerler
  return {
    // State
    orders,
    loading,
    selectedProducts,
    editingOrder,
    editOrderForm,
    editOrderDate,
    
    // Setters
    setSelectedProducts,
    setEditOrderForm,
    setEditOrderDate,
    
    // Actions
    addOrder,
    deleteOrder,
    startEditOrder,
    saveEditOrder,
    cancelEditOrder,
    
    // Statistics
    stats,
    chartData,
    
    // Utils
    ordersCount: orders.length,
    hasSelectedProducts: Object.values(selectedProducts).some(qty => qty > 0)
  };
};

export default useOrders;