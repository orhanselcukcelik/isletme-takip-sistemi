// src/App.js
import React, { useState } from "react";
import { TrendingUp, Package, ShoppingCart } from "lucide-react";
import "./App.css";

// Layout
import Notification from "./components/Layout/Notification";
import ThemeSwitcher from "./components/Layout/ThemeSwitcher";
import Header from "./components/Layout/Header";
import Sidebar from "./components/Layout/Sidebar";
import MobileMenuButton from "./components/Layout/MobileMenuButton";

// Pages
import Dashboard from "./components/Dashboard/Dashboard";
import ProductManagement from "./components/Products/ProductManagement";
import OrderManagement from "./components/Orders/OrderManagement";
import AuthPage from "./components/Auth/Authpage";

// Constants & utils
import { TABS, ORDER_SUB_TABS, RANGES } from "./utils/constants";
import useIsDarkMode from "./hooks/useIsDarkMode";
import { getChartTheme } from "./utils/chartTheme";

// Hooks
import { useAuth } from "./hooks/useAuth";
import { useProducts } from "./hooks/useProducts";
import { useOrders } from "./hooks/useOrders";
import { useNotification } from "./hooks/useNotification";

export default function App() {
  // UI states
  const [activeTab, setActiveTab] = useState(TABS.DASHBOARD);
  const [activeSubTab, setActiveSubTab] = useState(ORDER_SUB_TABS.NEW_ORDER);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [range, setRange] = useState(RANGES.DAILY);
  const [customDateRange, setCustomDateRange] = useState(null); // Özel tarih aralığı state'i

  // Hooks
  const { user, profile, loading: authLoading, logout, displayName, businessTitle, avatarLetter } = useAuth();
  const { handleServiceResult, notification } = useNotification();
  const {
    products, sortedProducts, loading: productsLoading, sortType, setSortType,
    newProduct, setNewProduct, editingProduct, editForm, setEditForm,
    addProduct, toggleFavorite, deleteProduct, startEditProduct, saveEditProduct, cancelEditProduct
  } = useProducts(user);
  
  // Güncellenmiş useOrders hook çağrısı - yeni state'leri dahil ettik
  const {
    orders, loading: ordersLoading, selectedProducts, setSelectedProducts,
    editingOrder, editOrderForm, setEditOrderForm, editOrderDate, setEditOrderDate,
    editOrderStatus, setEditOrderStatus, // Yeni - düzenleme sırasındaki durum
    newOrderStatus, setNewOrderStatus, // Yeni - yeni sipariş durumu
    addOrder, deleteOrder, startEditOrder, saveEditOrder, cancelEditOrder,
    toggleOrderStatus, // Yeni - durum değiştirme fonksiyonu
    stats, chartData
  } = useOrders(user, products, customDateRange, handleServiceResult); // customDateRange ve notification hook'u geçiriyoruz

  const isDarkMode = useIsDarkMode();
  const chartTheme = getChartTheme(isDarkMode);

  // Handlers
  const toggleTheme = () => {
    const root = document.documentElement;
    const dark = root.classList.contains("dark");
    dark ? root.classList.remove("dark") : root.classList.add("dark");
    try { localStorage.setItem("theme", dark ? "light" : "dark"); } catch {}
  };
  const handleTabChange = (tab, subTab) => { setActiveTab(tab); if (subTab) setActiveSubTab(subTab); };
  const handleLogout = async () => { const r = await logout(); handleServiceResult(r); setProfileDropdownOpen(false); };

  // Özel tarih işleyicileri
  const handleCustomDateChange = (dateRange) => {
    setCustomDateRange(dateRange);
    setRange(RANGES.CUSTOM);
  };

  const handleClearCustomDate = () => {
    setCustomDateRange(null);
    setRange(RANGES.DAILY);
  };

  const handleRangeChange = (newRange) => {
    if (newRange !== RANGES.CUSTOM) {
      setCustomDateRange(null);
    }
    setRange(newRange);
  };

  // Product handlers
  const handleAddProduct = async () => handleServiceResult(await addProduct());
  const handleToggleFavorite = async (id, val) => { const r = await toggleFavorite(id, val); if (!r.success) handleServiceResult(r); };
  const handleDeleteProduct = async (id) => handleServiceResult(await deleteProduct(id));
  const handleSaveEditProduct = async () => handleServiceResult(await saveEditProduct());

  // Order handlers
  const handleAddOrder = async () => handleServiceResult(await addOrder());
  const handleDeleteOrder = async (id) => handleServiceResult(await deleteOrder(id));
  const handleSaveEditOrder = async () => handleServiceResult(await saveEditOrder());
  const handleToggleOrderStatus = async (id) => handleServiceResult(await toggleOrderStatus(id)); // Yeni handler

  // Loading & auth
  if (authLoading) return <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"100vh",fontSize:"1.2rem",color:"#6b7280"}}>Yükleniyor...</div>;
  if (!user) return <AuthPage />;

  // Page info
  const getRangeLabel = () => {
    if (customDateRange) {
      const startDate = new Date(customDateRange.startDate).toLocaleDateString('tr-TR');
      const endDate = new Date(customDateRange.endDate).toLocaleDateString('tr-TR');
      return `${startDate} - ${endDate}`;
    }
    return range === RANGES.DAILY ? "Günlük" : range === RANGES.MONTHLY ? "Aylık" : "Yıllık";
  };

  const rangeLabel = getRangeLabel();
  const pageInfo = activeTab === TABS.DASHBOARD
    ? { title: "Anasayfa", subtitle: `İşletmenizin ${customDateRange ? 'seçili tarih aralığındaki' : rangeLabel.toLowerCase()} performansını görüntüleyin` }
    : activeTab === TABS.PRODUCTS
    ? { title: "Ürün Yönetimi", subtitle: "Ürünlerinizi ekleyin, düzenleyin ve yönetin" }
    : { title: "Sipariş İşlemleri", subtitle: activeSubTab === ORDER_SUB_TABS.NEW_ORDER ? "Yeni sipariş oluşturun" : "Sipariş geçmişinizi görüntüleyin" };

  const currentStats = stats[customDateRange ? RANGES.CUSTOM : range];
  const currentChartData = chartData[customDateRange ? RANGES.CUSTOM : range];

  return (
    <div className="app-container">
      <MobileMenuButton onMenuOpen={() => setSidebarOpen(true)} />

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        businessTitle={businessTitle}
        displayName={displayName}
        avatarLetter={avatarLetter}
        profileDropdownOpen={profileDropdownOpen}
        setProfileDropdownOpen={setProfileDropdownOpen}
        onLogout={handleLogout}
      />

      <ThemeSwitcher isDarkMode={isDarkMode} onToggle={toggleTheme} />

      <div className="main-content">
        <Header 
          pageTitle={pageInfo.title} 
          pageSubtitle={pageInfo.subtitle} 
          range={range} 
          onRangeChange={handleRangeChange}
          customDateRange={customDateRange}
          onCustomDateChange={handleCustomDateChange}
          onClearCustomDate={handleClearCustomDate}
          showRangeSwitcher 
        />

        <Notification notification={notification} />

        {activeTab === TABS.DASHBOARD && (
          <Dashboard 
            range={customDateRange ? RANGES.CUSTOM : range} 
            setRange={setRange} 
            currentStats={currentStats} 
            currentChartData={currentChartData} 
            chartTheme={chartTheme}
            customDateRange={customDateRange}
          />
        )}

        {activeTab === TABS.PRODUCTS && (
          <ProductManagement
            newProduct={newProduct} setNewProduct={setNewProduct} productsLoading={productsLoading}
            sortedProducts={sortedProducts} sortType={sortType} setSortType={setSortType}
            editingProduct={editingProduct} editForm={editForm} setEditForm={setEditForm}
            onAddProduct={handleAddProduct}
            onToggleFavorite={handleToggleFavorite}
            onStartEditProduct={startEditProduct}
            onCancelEditProduct={cancelEditProduct}
            onSaveEditProduct={handleSaveEditProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

        {activeTab === TABS.ORDERS && (
          <OrderManagement
            activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab}
            products={sortedProducts}
            selectedProducts={selectedProducts} setSelectedProducts={setSelectedProducts}
            onToggleFavorite={handleToggleFavorite}
            orders={orders} ordersLoading={ordersLoading}
            editingOrder={editingOrder} editOrderForm={editOrderForm} setEditOrderForm={setEditOrderForm}
            editOrderDate={editOrderDate} setEditOrderDate={setEditOrderDate}
            editOrderStatus={editOrderStatus} setEditOrderStatus={setEditOrderStatus} // Yeni prop
            newOrderStatus={newOrderStatus} setNewOrderStatus={setNewOrderStatus} // Yeni prop
            onAddOrder={handleAddOrder}
            onDeleteOrder={handleDeleteOrder}
            onStartEditOrder={startEditOrder}
            onSaveEditOrder={handleSaveEditOrder}
            onCancelEditOrder={cancelEditOrder}
            onToggleOrderStatus={handleToggleOrderStatus} // Yeni prop
          />
        )}
      </div>
    </div>
  );
}
