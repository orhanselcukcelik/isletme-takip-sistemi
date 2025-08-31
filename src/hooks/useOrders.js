// src/hooks/useOrders.js
import { useState, useEffect, useMemo } from 'react';
import { orderService } from '../services/orderService';
import { ORDER_STATUS, RANGES } from '../utils/constants';

// safe number
const safeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

// calculateStats - özel tarih aralığı desteği eklendi
const calculateStats = (orders, range, customDateRange = null) => {
  const now = new Date();
  
  const matchers = {
    daily: (d) => d.toDateString() === now.toDateString(),
    monthly: (d) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(),
    yearly: (d) => d.getFullYear() === now.getFullYear(),
    custom: (d) => {
      if (!customDateRange) return false;
      const startDate = new Date(customDateRange.startDate);
      const endDate = new Date(customDateRange.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      return d >= startDate && d <= endDate;
    }
  };

  const selectedOrders = orders.filter(order => {
    try {
      const d = new Date(order.date);
      if (isNaN(d.getTime())) return false;
      return matchers[range](d);
    } catch {
      return false;
    }
  });

  const paidOrders = selectedOrders.filter(order => order.status === ORDER_STATUS.PAID);
  const unpaidOrders = selectedOrders.filter(order => order.status === ORDER_STATUS.UNPAID);

  return {
    totalRevenue: paidOrders.reduce((sum, order) => sum + safeNumber(order.totalRevenue), 0),
    totalCost: paidOrders.reduce((sum, order) => sum + safeNumber(order.totalCost), 0),
    totalProfit: paidOrders.reduce((sum, order) => sum + safeNumber(order.profit), 0),
    totalTax: paidOrders.reduce((sum, order) => sum + safeNumber(order.totalTax), 0),
    orderCount: selectedOrders.length,
    paidOrderCount: paidOrders.length,
    unpaidOrderCount: unpaidOrders.length,
    paidRevenue: paidOrders.reduce((sum, order) => sum + safeNumber(order.totalRevenue), 0),
    unpaidRevenue: unpaidOrders.reduce((sum, order) => sum + safeNumber(order.totalRevenue), 0),
    paidProfit: paidOrders.reduce((sum, order) => sum + safeNumber(order.profit), 0),
    unpaidProfit: unpaidOrders.reduce((sum, order) => sum + safeNumber(order.profit), 0),
    totalRevenueAll: selectedOrders.reduce((sum, order) => sum + safeNumber(order.totalRevenue), 0),
    totalCostAll: selectedOrders.reduce((sum, order) => sum + safeNumber(order.totalCost), 0),
    totalProfitAll: selectedOrders.reduce((sum, order) => sum + safeNumber(order.profit), 0),
    totalTaxAll: selectedOrders.reduce((sum, order) => sum + safeNumber(order.totalTax), 0)
  };
};

// getGroupingKey - özel tarih aralığı desteği eklendi
const getGroupingKey = (dateIso, range, customDateRange = null) => {
  const d = new Date(dateIso);
  if (isNaN(d.getTime())) return null;
  const now = new Date();

  if (range === 'custom' && customDateRange) {
    const startDate = new Date(customDateRange.startDate);
    const endDate = new Date(customDateRange.endDate);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    if (d < startDate || d > endDate) return null;
    
    // Özel tarih aralığında günlere göre gruplama
    return d.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
  }

  if (range === 'daily') {
    if (d.toDateString() === now.toDateString()) {
      return `${String(d.getHours()).padStart(2, '0')}:00`;
    }
    return null;
  }

  if (range === 'monthly') {
    if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
      return String(d.getDate()).padStart(2, '0'); // '01', '02', ...
    }
    return null;
  }

  if (d.getFullYear() === now.getFullYear()) {
    return String(d.getMonth() + 1).padStart(2, '0'); // '01'..'12'
  }
  return null;
};

const calculateChartData = (orders, range, customDateRange = null) => {
  const grouped = {};

  orders.forEach(order => {
    if (!order || !order.date) return;
    const key = getGroupingKey(order.date, range, customDateRange);
    if (!key) return;

    if (!grouped[key]) {
      grouped[key] = {
        date: key,
        revenue: 0,
        profit: 0,
        orders: 0,
        paidRevenue: 0,
        unpaidRevenue: 0,
        paidOrders: 0,
        unpaidOrders: 0
      };
    }

    grouped[key].orders += 1;

    if (order.status === ORDER_STATUS.PAID) {
      grouped[key].revenue += safeNumber(order.totalRevenue);
      grouped[key].profit += safeNumber(order.profit);
      grouped[key].paidRevenue += safeNumber(order.totalRevenue);
      grouped[key].paidOrders += 1;
    } else {
      grouped[key].unpaidRevenue += safeNumber(order.totalRevenue);
      grouped[key].unpaidOrders += 1;
    }
  });

  if (range === 'custom' && customDateRange) {
    // Özel tarih aralığı için günlere göre chart data
    const startDate = new Date(customDateRange.startDate);
    const endDate = new Date(customDateRange.endDate);
    const dates = [];
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateKey = currentDate.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' });
      dates.push(dateKey);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates.map(date => ({
      date: date,
      revenue: grouped[date]?.revenue || 0,
      profit: grouped[date]?.profit || 0,
      orders: grouped[date]?.orders || 0,
      paidRevenue: grouped[date]?.paidRevenue || 0,
      unpaidRevenue: grouped[date]?.unpaidRevenue || 0,
      paidOrders: grouped[date]?.paidOrders || 0,
      unpaidOrders: grouped[date]?.unpaidOrders || 0
    }));
  }

  if (range === 'daily') {
    const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`);
    return hours.map(hour => ({
      date: hour,
      revenue: grouped[hour]?.revenue || 0,
      profit: grouped[hour]?.profit || 0,
      orders: grouped[hour]?.orders || 0,
      paidRevenue: grouped[hour]?.paidRevenue || 0,
      unpaidRevenue: grouped[hour]?.unpaidRevenue || 0,
      paidOrders: grouped[hour]?.paidOrders || 0,
      unpaidOrders: grouped[hour]?.unpaidOrders || 0
    }));
  }

  if (range === 'monthly') {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, i) => String(i + 1).padStart(2, '0'));
    return days.map(day => ({
      date: day,
      revenue: grouped[day]?.revenue || 0,
      profit: grouped[day]?.profit || 0,
      orders: grouped[day]?.orders || 0,
      paidRevenue: grouped[day]?.paidRevenue || 0,
      unpaidRevenue: grouped[day]?.unpaidRevenue || 0,
      paidOrders: grouped[day]?.paidOrders || 0,
      unpaidOrders: grouped[day]?.unpaidOrders || 0
    }));
  }

  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  return months.map(month => ({
    date: month,
    revenue: grouped[month]?.revenue || 0,
    profit: grouped[month]?.profit || 0,
    orders: grouped[month]?.orders || 0,
    paidRevenue: grouped[month]?.paidRevenue || 0,
    unpaidRevenue: grouped[month]?.unpaidRevenue || 0,
    paidOrders: grouped[month]?.paidOrders || 0,
    unpaidOrders: grouped[month]?.unpaidOrders || 0
  }));
};

export const useOrders = (user, products = [], customDateRange = null, notificationHook = null) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasInitializedTimers, setHasInitializedTimers] = useState(false);

  const [selectedProducts, setSelectedProducts] = useState({});
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState([]);
  const [editOrderDate, setEditOrderDate] = useState('');
  const [editOrderStatus, setEditOrderStatus] = useState(ORDER_STATUS.UNPAID);
  const [newOrderStatus, setNewOrderStatus] = useState(ORDER_STATUS.UNPAID);

  // sanitize order: ensure numbers and date ISO string
  const sanitizeOrder = (o) => {
    const dateIso = (() => {
      try {
        if (!o?.date) return new Date().toISOString();
        if (typeof o.date === 'string') {
          const d = new Date(o.date);
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        }
        if (typeof o.date === 'number') {
          const d = new Date(o.date);
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        }
        if (o.date instanceof Date) {
          return isNaN(o.date.getTime()) ? new Date().toISOString() : o.date.toISOString();
        }
        if (typeof o.date.toDate === 'function') {
          const d = o.date.toDate();
          return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
        }
        return new Date().toISOString();
      } catch {
        return new Date().toISOString();
      }
    })();

    return {
      ...o,
      date: dateIso,
      totalRevenue: safeNumber(o.totalRevenue),
      totalCost: safeNumber(o.totalCost),
      profit: safeNumber(o.profit),
      totalTax: safeNumber(o.totalTax),
      items: Array.isArray(o.items) ? o.items.map(it => ({
        ...it,
        quantity: safeNumber(it.quantity),
        sellPrice: safeNumber(it.sellPrice),
        totalRevenue: safeNumber(it.totalRevenue)
      })) : []
    };
  };

  useEffect(() => {
    if (!user) {
      setOrders([]);
      return;
    }

    let prevOrders = [];

    const unsubscribe = orderService.subscribeToOrders(user.uid, (newOrdersRaw) => {
      const newOrders = (Array.isArray(newOrdersRaw) ? newOrdersRaw : []).map(o => sanitizeOrder(o));
      // notification logic (kopya gönder)
      if (notificationHook && prevOrders.length > 0) {
        const prevIds = new Set(prevOrders.map(o => o.id));
        const added = newOrders.filter(o => !prevIds.has(o.id));
        added.forEach(order => {
          if (order.status === ORDER_STATUS.UNPAID) {
            try { notificationHook.handleNewOrder(order.id, order.status, order.date); } catch (e) { console.error(e); }
          }
        });

        const prevMap = new Map(prevOrders.map(o => [o.id, o]));
        newOrders.forEach(order => {
          const prev = prevMap.get(order.id);
          if (prev && prev.status !== order.status) {
            try { notificationHook.handleOrderStatusChange(order.id, order.status, order.date); } catch (e) { console.error(e); }
          }
        });

        const newIds = new Set(newOrders.map(o => o.id));
        prevOrders.forEach(order => {
          if (!newIds.has(order.id)) {
            try { notificationHook.handleOrderDelete(order.id); } catch (e) { console.error(e); }
          }
        });
      }

      prevOrders = newOrders.map(o => ({ ...o }));
      setOrders(newOrders);
    });

    return () => {
      try { unsubscribe(); } catch (e) {}
    };
  }, [user?.uid, notificationHook]);

  useEffect(() => {
    if (!notificationHook || orders.length === 0 || hasInitializedTimers) return;

    orders.forEach(order => {
      if (order.status === ORDER_STATUS.UNPAID) {
        const orderTime = new Date(order.date).getTime();
        const now = Date.now();
        const elapsedTime = now - orderTime;
        const thirtyMinutes = 30 * 60 * 1000;
        if (elapsedTime < thirtyMinutes) {
          const remaining = thirtyMinutes - elapsedTime;
          setTimeout(() => {
            try { notificationHook.handleNewOrder(order.id, order.status, order.date); } catch (e) { console.error(e); }
          }, remaining);
        }
      }
    });

    setHasInitializedTimers(true);
  }, [orders, notificationHook, hasInitializedTimers]);

  // Stats hesaplama - özel tarih aralığı desteği eklendi
  const stats = useMemo(() => {
    const baseStats = {
      daily: calculateStats(orders, 'daily'),
      monthly: calculateStats(orders, 'monthly'),
      yearly: calculateStats(orders, 'yearly')
    };
    
    // Özel tarih aralığı varsa, custom stats'i de ekle
    if (customDateRange) {
      baseStats[RANGES.CUSTOM] = calculateStats(orders, 'custom', customDateRange);
    }
    
    return baseStats;
  }, [orders, customDateRange]);

  // Chart data hesaplama - özel tarih aralığı desteği eklendi
  const chartData = useMemo(() => {
    const baseChartData = {
      daily: calculateChartData(orders, 'daily'),
      monthly: calculateChartData(orders, 'monthly'),
      yearly: calculateChartData(orders, 'yearly')
    };
    
    // Özel tarih aralığı varsa, custom chart data'sını da ekle
    if (customDateRange) {
      baseChartData[RANGES.CUSTOM] = calculateChartData(orders, 'custom', customDateRange);
    }
    
    return baseChartData;
  }, [orders, customDateRange]);

  // add/delete/update/toggle etc. (kısaltılmış, eskisi gibi bırakabilirsiniz)
  const addOrder = async () => {
    if (!user) return { success: false, error: 'Önce giriş yapmalısınız.' };
    const selectedCount = Object.values(selectedProducts).filter(q => q > 0).length;
    if (selectedCount === 0) return { success: false, error: 'Sipariş oluşturmak için ürün seçin.' };
    setLoading(true);
    try {
      const result = await orderService.addOrder(user.uid, selectedProducts, products, newOrderStatus);
      if (result.success) {
        setSelectedProducts({});
        setNewOrderStatus(ORDER_STATUS.UNPAID);
        return { success: true, message: 'Sipariş eklendi!' };
      }
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı' };
    const orderToDelete = orders.find(order => order.id === orderId);
    if (!orderToDelete) return { success: false, error: 'Sipariş bulunamadı' };
    const result = await orderService.deleteOrder(user.uid, orderId, orderToDelete.items);
    return result.success ? { success: true, message: 'Sipariş silindi!' } : result;
  };

  const toggleOrderStatus = async (orderId) => {
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı' };
    const order = orders.find(order => order.id === orderId);
    if (!order) return { success: false, error: 'Sipariş bulunamadı' };
    const newStatus = order.status === ORDER_STATUS.PAID ? ORDER_STATUS.UNPAID : ORDER_STATUS.PAID;
    const result = await orderService.updateOrderStatus(user.uid, orderId, newStatus);
    return result;
  };

  const startEditOrder = (order) => {
    setEditingOrder(order.id);
    setEditOrderForm(order.items.map(item => ({ ...item })));
    setEditOrderDate(new Date(order.date).toISOString().slice(0,16));
    setEditOrderStatus(order.status || ORDER_STATUS.UNPAID);
  };

  const saveEditOrder = async () => {
    if (!editingOrder || !user) return { success: false, error: 'Gerekli bilgiler bulunamadı.' };
    const originalOrder = orders.find(order => order.id === editingOrder);
    if (!originalOrder) return { success: false, error: 'Orijinal sipariş bulunamadı.' };
    const result = await orderService.updateOrder(user.uid, editingOrder, originalOrder, editOrderForm, editOrderDate, editOrderStatus);
    if (result.success) {
      setEditingOrder(null);
      setEditOrderForm([]);
      setEditOrderDate('');
      setEditOrderStatus(ORDER_STATUS.UNPAID);
    }
    return result;
  };

  const cancelEditOrder = () => {
    setEditingOrder(null);
    setEditOrderForm([]);
    setEditOrderDate('');
    setEditOrderStatus(ORDER_STATUS.UNPAID);
  };

  return {
    orders,
    loading,
    selectedProducts,
    editingOrder,
    editOrderForm,
    editOrderDate,
    editOrderStatus,
    newOrderStatus,
    setSelectedProducts,
    setEditOrderForm,
    setEditOrderDate,
    setEditOrderStatus,
    setNewOrderStatus,
    addOrder,
    deleteOrder,
    startEditOrder,
    saveEditOrder,
    cancelEditOrder,
    toggleOrderStatus,
    stats,
    chartData,
    ordersCount: orders.length,
    hasSelectedProducts: Object.values(selectedProducts).some(qty => qty > 0)
  };
};

export default useOrders;