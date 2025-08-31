// components/Layout/ThemeSwitcher.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeSwitcher = ({ isDarkMode, onToggle }) => {
  return (
    <div className="theme-switcher">
      <div 
        className={`theme-switch ${isDarkMode ? 'active' : ''}`} 
        onClick={onToggle} 
        role="switch" 
        aria-checked={isDarkMode} 
        aria-label="Tema değiştir"
      >
        <div className="theme-switch-handle">
          {isDarkMode ? <Moon className="theme-icon" /> : <Sun className="theme-icon" />}
        </div>
      </div>
    </div>
  );
};

export default ThemeSwitcher;