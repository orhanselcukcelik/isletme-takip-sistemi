// components/Layout/Header.jsx
import React from 'react';
import { RANGES, RANGE_LABELS } from '../../utils/constants';

const Header = ({ 
  pageTitle, 
  pageSubtitle, 
  range, 
  onRangeChange, 
  showRangeSwitcher = true 
}) => {
  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>
      </div>

      {showRangeSwitcher && (
        <div className="range-switcher" role="tablist" aria-label="Zaman aralığı">
          {Object.entries(RANGES).map(([key, value]) => (
            <button 
              key={key}
              className={`range-btn ${range === value ? 'active' : ''}`} 
              onClick={() => onRangeChange(value)} 
              role="tab" 
              aria-selected={range === value}
            >
              {RANGE_LABELS[value]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Header;