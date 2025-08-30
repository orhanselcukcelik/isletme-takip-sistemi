// PART 1 - Başlangıç, state, helper fonksiyonlar, veri hazırlama
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Plus, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Trash2, 
  Star, 
  Home,
  Box,
  Menu,
  X,
  Edit2,
  Check,
  Sun,
  Moon,
  User,
  Settings,
  LogOut,
  ChevronUp
} from 'lucide-react';

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

import './App.css';

function App() {
  /* -------------------------
     STATE & REFS (her zaman en üstte)
     ------------------------- */
  const [products, setProducts] = useState([
    { id: 1, name: 'Döner', costPrice: 15, sellPrice: 25, taxRate: 18, stock: 50, isFavorite: false },
    { id: 2, name: 'Lahmacun', costPrice: 8, sellPrice: 15, taxRate: 18, stock: 30, isFavorite: false },
    { id: 3, name: 'Ayran', costPrice: 2, sellPrice: 5, taxRate: 8, stock: 100, isFavorite: false }
  ]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSubTab, setActiveSubTab] = useState('new-order');
  const [newProduct, setNewProduct] = useState({ name: '', costPrice: '', sellPrice: '', taxRate: '', stock: '' });
  const [selectedProducts, setSelectedProducts] = useState({});
  const [notification, setNotification] = useState({ show: false, message: '' });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sortType, setSortType] = useState('default');
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', costPrice: '', sellPrice: '', taxRate: '', stock: '' });
  const [editingOrder, setEditingOrder] = useState(null);
  const [editOrderForm, setEditOrderForm] = useState([]);
  const [editOrderDate, setEditOrderDate] = useState('');
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    try { return localStorage.getItem('theme') === 'dark'; } catch { return false; }
  });
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Yeni özellik: günlük / aylık / yıllık görünüm
  const [range, setRange] = useState('daily'); // 'daily' | 'monthly' | 'yearly'
  const rangeLabel = range === 'daily' ? 'Günlük' : range === 'monthly' ? 'Aylık' : 'Yıllık';

  /* -------------------------
     THEME: localStorage ile sakla
     ------------------------- */
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkTheme) {
      root.classList.add('dark');
      try { localStorage.setItem('theme', 'dark'); } catch {}
    } else {
      root.classList.remove('dark');
      try { localStorage.setItem('theme', 'light'); } catch {}
    }
  }, [isDarkTheme]);

  const toggleTheme = () => setIsDarkTheme(v => !v);

  /* -------------------------
     PROFILE DROPDOWN: click outside & ESC
     ------------------------- */
  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdownOpen(false);
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setProfileDropdownOpen(false);
    };
    if (profileDropdownOpen) {
      document.addEventListener('mousedown', onClickOutside);
      document.addEventListener('keydown', onKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [profileDropdownOpen]);

  /* -------------------------
     NOTIFICATION
     ------------------------- */
  const showNotification = (message) => {
    setNotification({ show: true, message });
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }
    notificationTimeoutRef.current = setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  /* -------------------------
     PRODUCT CRUD
     ------------------------- */
  const addProduct = () => {
    if (!newProduct.name || !newProduct.costPrice || !newProduct.sellPrice || !newProduct.taxRate || !newProduct.stock) {
      showNotification('Lütfen tüm ürün alanlarını doldurun.');
      return;
    }
    const p = {
      id: Date.now(),
      name: newProduct.name,
      costPrice: parseFloat(newProduct.costPrice),
      sellPrice: parseFloat(newProduct.sellPrice),
      taxRate: parseFloat(newProduct.taxRate),
      stock: parseInt(newProduct.stock),
      isFavorite: false
    };
    setProducts(prev => [...prev, p]);
    setNewProduct({ name: '', costPrice: '', sellPrice: '', taxRate: '', stock: '' });
    showNotification('Ürün eklendi!');
  };

  const toggleFavorite = (productId) => {
    setProducts(prev => prev.map(product => product.id === productId ? { ...product, isFavorite: !product.isFavorite } : product));
  };

  const deleteProduct = (id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showNotification('Ürün silindi!');
  };

  /* -------------------------
     ORDER CRUD
     ------------------------- */
  const addOrder = () => {
    const orderItems = Object.entries(selectedProducts)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => {
        const product = products.find(p => p.id === parseInt(productId));
        if (!product) return null;
        if (product.stock < quantity) {
          showNotification(`${product.name} için yeterli stok yok! (Mevcut: ${product.stock})`);
          return null;
        }
        const totalRevenue = product.sellPrice * quantity;
        const totalTax = totalRevenue * (product.taxRate / 100);
        return {
          productId: product.id,
          productName: product.name,
          quantity,
          costPrice: product.costPrice,
          sellPrice: product.sellPrice,
          taxRate: product.taxRate,
          totalCost: product.costPrice * quantity,
          totalRevenue,
          totalTax
        };
      })
      .filter(Boolean);

    if (orderItems.length === 0) {
      showNotification('Sipariş oluşturmak için ürün seçin.');
      return;
    }

    const order = {
      id: Date.now(),
      date: new Date(),
      items: orderItems,
      totalRevenue: orderItems.reduce((s,i) => s + i.totalRevenue, 0),
      totalCost: orderItems.reduce((s,i) => s + i.totalCost, 0),
      totalTax: orderItems.reduce((s,i) => s + i.totalTax, 0),
    };
    order.profit = order.totalRevenue - order.totalCost;

    // Stok güncelle
    const updatedProducts = products.map(product => {
      const item = orderItems.find(it => it.productId === product.id);
      if (item) {
        return { ...product, stock: product.stock - item.quantity };
      }
      return product;
    });

    setProducts(updatedProducts);
    setOrders(prev => [...prev, order]);
    setSelectedProducts({});
    showNotification('Sipariş eklendi!');
  };

  const deleteOrder = (id) => {
    const orderToDelete = orders.find(o => o.id === id);
    if (!orderToDelete) return;
    // stok geri yükle
    const updatedProducts = products.map(product => {
      const item = orderToDelete.items.find(i => i.productId === product.id);
      if (item) return { ...product, stock: product.stock + item.quantity };
      return product;
    });
    setProducts(updatedProducts);
    setOrders(prev => prev.filter(o => o.id !== id));
    showNotification('Sipariş silindi!');
  };

  /* -------------------------
     ORDER EDITING
     ------------------------- */
  const startEditOrder = (order) => {
    setEditingOrder(order.id);
    setEditOrderForm(order.items.map(item => ({ ...item })));
    setEditOrderDate(new Date(order.date).toISOString().slice(0,16));
  };

  const saveEditOrder = () => {
    if (!editingOrder) return;
    const originalOrder = orders.find(o => o.id === editingOrder);
    if (!originalOrder) return;

    // eski siparişin stok etkisini geri al
    let updatedProducts = products.map(product => {
      const originalItem = originalOrder.items.find(i => i.productId === product.id);
      if (originalItem) {
        return { ...product, stock: product.stock + originalItem.quantity };
      }
      return product;
    });

    // stok kontrolü
    for (const item of editOrderForm) {
      const product = updatedProducts.find(p => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        showNotification(`${item.productName} için yeterli stok yok! (Mevcut: ${product ? product.stock : 0})`);
        return;
      }
    }

    // stokları yeni değerlere göre ayarla
    updatedProducts = updatedProducts.map(product => {
      const newItem = editOrderForm.find(i => i.productId === product.id);
      if (newItem) {
        return { ...product, stock: product.stock - newItem.quantity };
      }
      return product;
    });

    // siparişi güncelle
    const updatedItems = editOrderForm.map(item => {
      const totalRevenue = item.sellPrice * item.quantity;
      const totalTax = totalRevenue * (item.taxRate / 100);
      return {
        ...item,
        totalRevenue,
        totalTax,
        totalCost: item.costPrice * item.quantity
      };
    });

    const totalRevenue = updatedItems.reduce((s,i) => s + i.totalRevenue, 0);
    const totalCost = updatedItems.reduce((s,i) => s + i.totalCost, 0);
    const totalTax = updatedItems.reduce((s,i) => s + i.totalTax, 0);

    const updatedOrders = orders.map(o => {
      if (o.id !== editingOrder) return o;
      return {
        ...o,
        date: new Date(editOrderDate),
        items: updatedItems,
        totalRevenue,
        totalCost,
        totalTax,
        profit: totalRevenue - totalCost
      };
    });

    setProducts(updatedProducts);
    setOrders(updatedOrders);
    setEditingOrder(null);
    setEditOrderForm([]);
    setEditOrderDate('');
    showNotification('Sipariş güncellendi!');
  };

  const cancelEditOrder = () => {
    setEditingOrder(null);
    setEditOrderForm([]);
    setEditOrderDate('');
  };

  /* -------------------------
     PRODUCT EDITING
     ------------------------- */
  const startEditProduct = (product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      costPrice: product.costPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      taxRate: product.taxRate.toString(),
      stock: product.stock.toString()
    });
  };

  const saveEditProduct = () => {
    if (!editForm.name || !editForm.costPrice || !editForm.sellPrice || !editForm.taxRate || !editForm.stock) {
      showNotification('Lütfen tüm alanları doldurun.');
      return;
    }
    setProducts(prev => prev.map(p => p.id === editingProduct ? {
      ...p,
      name: editForm.name,
      costPrice: parseFloat(editForm.costPrice),
      sellPrice: parseFloat(editForm.sellPrice),
      taxRate: parseFloat(editForm.taxRate),
      stock: parseInt(editForm.stock)
    } : p));
    setEditingProduct(null);
    setEditForm({ name: '', costPrice: '', sellPrice: '', taxRate: '', stock: '' });
    showNotification('Ürün güncellendi!');
  };

  const cancelEditProduct = () => {
    setEditingProduct(null);
    setEditForm({ name: '', costPrice: '', sellPrice: '', taxRate: '', stock: '' });
  };

  /* -------------------------
     STATS & CHART DATA HELPERS
     Bu fonksiyonlar useMemo'dan önce tanımlanmalı (önemli!)
     ------------------------- */
  const getStats = (range) => {
    const now = new Date();
    const matchers = {
      daily: (d) => d.toDateString() === now.toDateString(),
      monthly: (d) => d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear(),
      yearly: (d) => d.getFullYear() === now.getFullYear()
    };
    const selected = orders.filter(o => matchers[range](new Date(o.date)));
    return {
      totalRevenue: selected.reduce((s,o) => s + (o.totalRevenue || 0), 0),
      totalCost: selected.reduce((s,o) => s + (o.totalCost || 0), 0),
      totalProfit: selected.reduce((s,o) => s + (o.profit || 0), 0),
      totalTax: selected.reduce((s,o) => s + (o.totalTax || 0), 0),
      orderCount: selected.length
    };
  };

  const getGroupingKey = (date, range) => {
    const d = new Date(date);
    const now = new Date();
    
    if (range === 'daily') {
      // Günlük: sadece bugünün saatlerini göster
      if (d.toDateString() === now.toDateString()) {
        return `${String(d.getHours()).padStart(2,'0')}:00`; // "14:00"
      }
      return null; // Bugün değilse dahil etme
    }
    
    if (range === 'monthly') {
      // Aylık: sadece bu ayın günlerini göster
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        return String(d.getDate()); // "29"
      }
      return null; // Bu ay değilse dahil etme
    }
    
    // Yıllık: bu yılın aylarını göster
    if (d.getFullYear() === now.getFullYear()) {
      return String(d.getMonth() + 1); // "8" (Ağustos için)
    }
    return null; // Bu yıl değilse dahil etme
  };

  const getChartData = (range) => {
    const grouped = {};
    
    orders.forEach(order => {
      const key = getGroupingKey(order.date, range);
      if (!key) return; // null ise dahil etme
      
      if (!grouped[key]) grouped[key] = { date: key, revenue: 0, profit: 0, orders: 0 };
      grouped[key].revenue += (order.totalRevenue || 0);
      grouped[key].profit += (order.profit || 0);
      grouped[key].orders += 1;
    });

    const parseKey = (k) => {
      if (range === 'daily') {
        // "14:00" -> saat değeri
        return parseInt(k.split(':')[0]);
      }
      if (range === 'monthly') {
        // "29" -> gün değeri  
        return parseInt(k);
      }
      // Yıllık: "8" -> ay değeri
      return parseInt(k);
    };

    // Boş aralıkları da doldur
    const result = Object.values(grouped).sort((a,b) => parseKey(a.date) - parseKey(b.date));
    
    // Eksik zaman dilimlerini sıfır değerlerle doldur
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
    
    // Yıllık: 12 ay
    const months = Array.from({length: 12}, (_, i) => String(i + 1));
    return months.map(month => grouped[month] || { date: month, revenue: 0, profit: 0, orders: 0 });
  };

  /* -------------------------
     DERIVED DATA (hooks at top-level)
     ------------------------- */
  const stats = useMemo(() => getStats(range), [orders, range]);
  const chartData = useMemo(() => getChartData(range), [orders, range]);

  const sortedProducts = useMemo(() => {
    const arr = [...products];
    switch (sortType) {
      case 'stock-asc': return arr.sort((a,b) => a.stock - b.stock);
      case 'profit-margin-asc': {
        const calc = p => p.costPrice > 0 ? ((p.sellPrice - p.costPrice) / p.costPrice) * 100 : 0;
        return arr.sort((a,b) => calc(a) - calc(b));
      }
      case 'default':
      default:
        return arr.sort((a,b) => (a.isFavorite && !b.isFavorite) ? -1 : (!a.isFavorite && b.isFavorite) ? 1 : 0);
    }
  }, [products, sortType]);

  const getPageInfo = () => {
    switch (activeTab) {
      case 'dashboard': return { title: 'Anasayfa', subtitle: `İşletmenizin ${rangeLabel.toLowerCase()} performansını görüntüleyin` };
      case 'products': return { title: 'Ürün Yönetimi', subtitle: 'Ürünlerinizi ekleyin, düzenleyin ve yönetin' };
      case 'orders': return { title: 'Sipariş İşlemleri', subtitle: activeSubTab === 'new-order' ? 'Yeni sipariş oluşturun' : 'Sipariş geçmişinizi görüntüleyin' };
      default: return { title: '', subtitle: '' };
    }
  };

  const pageInfo = getPageInfo();

  /* PART 1 END - daha sonra return JSX gelecek */
    /* -------------------------
     RENDER (JSX)
     ------------------------- */
  return (
    <div className="app-container">
      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Menüyü aç">
        <Menu size={20} />
      </button>

      {/* Sidebar Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={() => setSidebarOpen(false)}></div>

      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h1>İşletme Sistemi</h1>
          <p>Yönetim Paneli</p>
        </div>

        <nav className="sidebar-nav">
          <button onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }} className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}>
            <Home className="nav-icon" /> Anasayfa
          </button>
          <button onClick={() => { setActiveTab('products'); setSidebarOpen(false); }} className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}>
            <Box className="nav-icon" /> Ürünler
          </button>
          <button onClick={() => { setActiveTab('orders'); setActiveSubTab('new-order'); setSidebarOpen(false); }} className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}>
            <ShoppingCart className="nav-icon" /> Sipariş
          </button>
        </nav>

        <div className="sidebar-profile" ref={profileRef}>
          <button className="profile-button" onClick={() => setProfileDropdownOpen(v => !v)} aria-expanded={profileDropdownOpen}>
            <div className="profile-avatar">A</div>
            <div className="profile-info">
              <div className="profile-name">Admin User</div>
              <div className="profile-role">Yönetici</div>
            </div>
            <ChevronUp size={16} style={{ transform: profileDropdownOpen ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.3s ease' }} />
          </button>

          {profileDropdownOpen && (
            <div className="profile-dropdown">
              <button className="profile-dropdown-item"><User className="nav-icon" /> Profil Bilgileri</button>
              <button className="profile-dropdown-item"><Settings className="nav-icon" /> Ayarlar</button>
              <button className="profile-dropdown-item"><LogOut className="nav-icon" /> Çıkış Yap</button>
            </div>
          )}
        </div>
      </div>

      {/* Tema Değiştirici */}
      <div className="theme-switcher">
        <div className={`theme-switch ${isDarkTheme ? 'active' : ''}`} onClick={toggleTheme} role="switch" aria-checked={isDarkTheme} aria-label="Tema değiştir">
          <div className="theme-switch-handle">{isDarkTheme ? <Moon className="theme-icon" /> : <Sun className="theme-icon" />}</div>
        </div>
      </div>

      {/* Ana İçerik */}
      <div className="main-content">
        {/* Sayfa Başlığı + Range Switcher */}
        <div className="page-header">
          <div>
            <h1 className="page-title">{pageInfo.title}</h1>
            <p className="page-subtitle">{pageInfo.subtitle}</p>
          </div>

          <div className="range-switcher" role="tablist" aria-label="Zaman aralığı">
            <button className={`range-btn ${range === 'daily' ? 'active' : ''}`} onClick={() => setRange('daily')} role="tab" aria-selected={range === 'daily'}>Günlük</button>
            <button className={`range-btn ${range === 'monthly' ? 'active' : ''}`} onClick={() => setRange('monthly')} role="tab" aria-selected={range === 'monthly'}>Aylık</button>
            <button className={`range-btn ${range === 'yearly' ? 'active' : ''}`} onClick={() => setRange('yearly')} role="tab" aria-selected={range === 'yearly'}>Yıllık</button>
          </div>
        </div>

        {/* Bildirim */}
        {notification.show && (
          <div className="notification">
            <div className="notification-content"><span>{notification.message}</span></div>
          </div>
        )}

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card stat-revenue">
                <div className="stat-content"><TrendingUp className="stat-icon" />
                  <div><p className="stat-label">{rangeLabel} Ciro</p><p className="stat-value">₺{stats.totalRevenue.toFixed(2)}</p></div>
                </div>
              </div>

              <div className="stat-card stat-profit">
                <div className="stat-content"><TrendingUp className="stat-icon" />
                  <div><p className="stat-label">{rangeLabel} Kar</p><p className="stat-value">₺{stats.totalProfit.toFixed(2)}</p></div>
                </div>
              </div>

              <div className="stat-card stat-orders">
                <div className="stat-content"><ShoppingCart className="stat-icon" />
                  <div><p className="stat-label">{rangeLabel} Sipariş</p><p className="stat-value">{stats.orderCount}</p></div>
                </div>
              </div>

              <div className="stat-card stat-cost">
                <div className="stat-content"><Package className="stat-icon" />
                  <div><p className="stat-label">{rangeLabel} Maliyet</p><p className="stat-value">₺{stats.totalCost.toFixed(2)}</p></div>
                </div>
              </div>

              <div className="stat-card stat-tax">
                <div className="stat-content"><Package className="stat-icon" />
                  <div><p className="stat-label">{rangeLabel} Vergi</p><p className="stat-value">₺{stats.totalTax.toFixed(2)}</p></div>
                </div>
              </div>
            </div>

            {/* Çizgi Grafikler */}
            <div className="content-card">
              <div className="content-header"><h2>Performans Grafikleri</h2></div>
              <div className="content-body">
                <div className="charts-grid">
                  <div className="recharts-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Ciro" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="recharts-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="profit" stroke="#10b981" name="Kar" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="recharts-wrapper">
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="orders" stroke="#f59e0b" name="Sipariş Sayısı" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Ürün Yönetimi */}
        {activeTab === 'products' && (
          <div>
            <div className="content-card">
              <div className="content-header"><h2>Yeni Ürün Ekle</h2></div>
              <div className="content-body">
                <div className="form-row">
                  <input type="text" placeholder="Ürün adı" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} className="form-input" />
                  <input type="number" placeholder="Maliyet fiyatı (₺)" value={newProduct.costPrice} onChange={(e) => setNewProduct({...newProduct, costPrice: e.target.value})} className="form-input" />
                  <input type="number" placeholder="Satış fiyatı (₺)" value={newProduct.sellPrice} onChange={(e) => setNewProduct({...newProduct, sellPrice: e.target.value})} className="form-input" />
                  <input type="number" placeholder="Vergi oranı (%)" value={newProduct.taxRate} onChange={(e) => setNewProduct({...newProduct, taxRate: e.target.value})} className="form-input" />
                  <input type="number" placeholder="Stok adedi" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} className="form-input" />
                  <button onClick={addProduct} className="btn btn-primary"><Plus className="btn-icon" /> Ekle</button>
                </div>
              </div>
            </div>

            <div className="content-card">
              <div className="content-header">
                <h2>Ürün Listesi</h2>
                <div className="sort-controls">
                  <label htmlFor="sortSelect">Sıralama:</label>
                  <select id="sortSelect" value={sortType} onChange={(e) => setSortType(e.target.value)} className="sort-select">
                    <option value="default">Varsayılan</option>
                    <option value="stock-asc">Stok Sayısı (Az → Çok)</option>
                    <option value="profit-margin-asc">Kar Marjı (Az → Çok)</option>
                  </select>
                </div>
              </div>

              <div className="content-body">
                <div className="table-container">
                  <table className="products-table">
                    <thead>
                      <tr>
                        <th>Favori</th><th>Ürün Adı</th><th>Maliyet</th><th>Satış Fiyatı</th><th>Vergi Oranı</th><th>Stok</th><th>Kar Marjı</th><th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedProducts.map(product => {
                        const profitMargin = product.costPrice > 0 ? ((product.sellPrice - product.costPrice) / product.costPrice) * 100 : 0;
                        const isEditing = editingProduct === product.id;
                        return (
                          <tr key={product.id}>
                            <td>
                              <button onClick={() => toggleFavorite(product.id)} className="favorite-btn" aria-label={product.isFavorite ? 'Favoriden çıkar' : 'Favoriye ekle'}>
                                <Star size={20} className={product.isFavorite ? 'star-filled' : 'star-empty'} fill={product.isFavorite ? '#fbbf24' : 'none'} />
                              </button>
                            </td>
                            <td className={product.isFavorite ? 'favorite-product' : ''}>
                              {isEditing ? <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} className="edit-input" /> : product.name}
                            </td>
                            <td>{isEditing ? <input type="number" value={editForm.costPrice} onChange={(e) => setEditForm({...editForm, costPrice: e.target.value})} className="edit-input" /> : `₺${product.costPrice.toFixed(2)}`}</td>
                            <td>{isEditing ? <input type="number" value={editForm.sellPrice} onChange={(e) => setEditForm({...editForm, sellPrice: e.target.value})} className="edit-input" /> : `₺${product.sellPrice.toFixed(2)}`}</td>
                            <td>{isEditing ? <input type="number" value={editForm.taxRate} onChange={(e) => setEditForm({...editForm, taxRate: e.target.value})} className="edit-input" /> : `%${product.taxRate}`}</td>
                            <td className={product.stock <= 10 ? 'low-stock' : ''}>{isEditing ? <input type="number" value={editForm.stock} onChange={(e) => setEditForm({...editForm, stock: e.target.value})} className="edit-input" /> : product.stock}</td>
                            <td className="profit">%{profitMargin.toFixed(1)}</td>
                            <td>
                              <div className="action-buttons">
                                {isEditing ? (
                                  <>
                                    <button onClick={saveEditProduct} className="btn-save" title="Kaydet"><Check size={16} /></button>
                                    <button onClick={cancelEditProduct} className="btn-cancel" title="İptal"><X size={16} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => startEditProduct(product)} className="btn-edit" title="Düzenle"><Edit2 size={16} /></button>
                                    <button onClick={() => deleteProduct(product.id)} className="btn-delete" title="Sil"><Trash2 size={16} /></button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sipariş İşlemleri */}
        {activeTab === 'orders' && (
          <div>
            <div className="sub-tabs">
              <button onClick={() => setActiveSubTab('new-order')} className={`sub-tab ${activeSubTab === 'new-order' ? 'active' : ''}`}>Sipariş Ver</button>
              <button onClick={() => setActiveSubTab('order-history')} className={`sub-tab ${activeSubTab === 'order-history' ? 'active' : ''}`}>Sipariş Geçmişi</button>
            </div>

            {activeSubTab === 'new-order' && (
              <div className="content-card">
                <div className="content-body">
                  <div className="products-grid">
                    {sortedProducts.map(product => (
                      <div key={product.id} className={`product-card ${product.isFavorite ? 'product-card-favorite' : ''} ${product.stock <= 10 ? 'product-card-low-stock' : ''}`}>
                        <div className="product-header">
                          <h3>{product.name}</h3>
                          <button onClick={() => toggleFavorite(product.id)} className="favorite-btn-small" aria-label={product.isFavorite ? 'Favoriden çıkar' : 'Favoriye ekle'}>
                            <Star size={16} className={product.isFavorite ? 'star-filled' : 'star-empty'} fill={product.isFavorite ? '#fbbf24' : 'none'} />
                          </button>
                        </div>
                        <p className="product-price">Fiyat: ₺{product.sellPrice}</p>
                        <p className="product-stock">Stok: {product.stock} adet</p>
                        <div className="quantity-input">
                          <label>Adet:</label>
                          <input type="number" min="0" max={product.stock} value={selectedProducts[product.id] ?? ''} onChange={(e) => {
                            const raw = e.target.value;
                            const value = raw === '' ? 0 : Math.max(0, Math.floor(Number(raw)));
                            if (value <= product.stock) {
                              setSelectedProducts(prev => ({ ...prev, [product.id]: value }));
                            }
                          }} className="quantity-field" />
                        </div>
                        {product.stock <= 10 && <div className="stock-warning">⚠️ Stok az!</div>}
                      </div>
                    ))}
                  </div>

                  <button onClick={addOrder} className="btn btn-success btn-large"><ShoppingCart className="btn-icon" /> Siparişi Kaydet</button>
                </div>
              </div>
            )}

            {activeSubTab === 'order-history' && (
              <div className="content-card">
                <div className="content-body">
                  {orders.length === 0 ? <p className="no-orders">Henüz sipariş kaydı bulunmuyor.</p> : (
                    <div className="orders-list">
                      {orders.slice().reverse().map(order => {
                        const isEditing = editingOrder === order.id;
                        return (
                          <div key={order.id} className="order-card">
                            <div className="order-header">
                              <div className="order-info">
                                <h3>Sipariş #{order.id}</h3>
                                {isEditing ? <input type="datetime-local" value={editOrderDate} onChange={(e) => setEditOrderDate(e.target.value)} className="order-date-input" /> : <p className="order-date">{new Date(order.date).toLocaleString('tr-TR')}</p>}
                              </div>

                              <div className="order-summary">
                                <p className="order-total">₺{order.totalRevenue.toFixed(2)}</p>
                                <p className="order-profit">Kar: ₺{order.profit.toFixed(2)}</p>
                              </div>

                              <div className="order-actions">
                                {isEditing ? (
                                  <>
                                    <button onClick={saveEditOrder} className="btn-save" title="Kaydet"><Check size={16} /></button>
                                    <button onClick={cancelEditOrder} className="btn-cancel" title="İptal"><X size={16} /></button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => startEditOrder(order)} className="btn-edit" title="Düzenle"><Edit2 size={16} /></button>
                                    <button onClick={() => deleteOrder(order.id)} className="btn-delete" title="Sil"><Trash2 size={16} /></button>
                                  </>
                                )}
                              </div>
                            </div>

                            <div className="order-items">
                              {isEditing ? editOrderForm.map((item, index) => (
                                <div key={index} className="order-item order-item-edit">
                                  <span className="item-name">{item.productName}</span>
                                  <div className="item-quantity">
                                    <label>Adet:</label>
                                    <input type="number" min="1" value={item.quantity} onChange={(e) => {
                                      const newQuantity = Math.max(1, parseInt(e.target.value) || 1);
                                      const newForm = [...editOrderForm];
                                      newForm[index] = { ...item, quantity: newQuantity };
                                      setEditOrderForm(newForm);
                                    }} className="quantity-edit-input" />
                                  </div>
                                  <span className="item-total">₺{(item.sellPrice * item.quantity).toFixed(2)}</span>
                                </div>
                              )) : order.items.map((item, idx) => (
                                <div key={idx} className="order-item"><span>{item.productName} x{item.quantity}</span><span>₺{item.totalRevenue.toFixed(2)}</span></div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;