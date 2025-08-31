// components/Layout/Sidebar.jsx
import React, { useRef, useEffect } from 'react';
import { 
  Home, Box, ShoppingCart, User, Settings, LogOut, ChevronUp 
} from 'lucide-react';
import { TABS } from '../../utils/constants';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  activeTab, 
  onTabChange,
  businessTitle,
  displayName,
  avatarLetter,
  profileDropdownOpen,
  setProfileDropdownOpen,
  onLogout
}) => {
  const profileRef = useRef(null);

  // Profile dropdown - click outside & ESC
  useEffect(() => {
    const onClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
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
  }, [profileDropdownOpen, setProfileDropdownOpen]);

  const navItems = [
    {
      key: TABS.DASHBOARD,
      icon: Home,
      label: 'Anasayfa',
      onClick: () => {
        onTabChange(TABS.DASHBOARD);
        onClose();
      }
    },
    {
      key: TABS.PRODUCTS,
      icon: Box,
      label: 'Ürünler',
      onClick: () => {
        onTabChange(TABS.PRODUCTS);
        onClose();
      }
    },
    {
      key: TABS.ORDERS,
      icon: ShoppingCart,
      label: 'Sipariş',
      onClick: () => {
        onTabChange(TABS.ORDERS, 'new-order'); // Alt tab da geçilebilir
        onClose();
      }
    }
  ];

  return (
    <>
      {/* Sidebar Overlay */}
      <div 
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`} 
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <h1>{businessTitle}</h1>
          <p>Yönetim Paneli</p>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(({ key, icon: Icon, label, onClick }) => (
            <button 
              key={key}
              onClick={onClick}
              className={`nav-item ${activeTab === key ? 'active' : ''}`}
            >
              <Icon className="nav-icon" /> 
              {label}
            </button>
          ))}
        </nav>

        {/* Profile Section */}
        <div className="sidebar-profile" ref={profileRef}>
          <button 
            className="profile-button" 
            onClick={() => setProfileDropdownOpen(v => !v)} 
            aria-expanded={profileDropdownOpen}
          >
            <div className="profile-avatar">{avatarLetter}</div>
            <div className="profile-info">
              <div className="profile-name">{displayName}</div>
              <div className="profile-role">Yönetici</div>
            </div>
            <ChevronUp 
              size={16} 
              style={{ 
                transform: profileDropdownOpen ? 'rotate(0deg)' : 'rotate(180deg)', 
                transition: 'transform 0.3s ease' 
              }} 
            />
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <div className="profile-dropdown">
              <button className="profile-dropdown-item">
                <User className="nav-icon" /> Profil Bilgileri
              </button>
              <button className="profile-dropdown-item">
                <Settings className="nav-icon" /> Ayarlar
              </button>
              <button className="profile-dropdown-item" onClick={onLogout}>
                <LogOut className="nav-icon" /> Çıkış Yap
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;