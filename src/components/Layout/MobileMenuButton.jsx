// components/Layout/MobileMenuButton.jsx
import React from 'react';
import { Menu } from 'lucide-react';

const MobileMenuButton = ({ onMenuOpen }) => {
  return (
    <button 
      className="mobile-menu-btn" 
      onClick={onMenuOpen} 
      aria-label="Menüyü aç"
    >
      <Menu size={20} />
    </button>
  );
};

export default MobileMenuButton;