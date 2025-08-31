// components/Layout/Header.jsx
import React, { useState } from 'react';
import { X, Calendar } from 'lucide-react';
import { RANGES, RANGE_LABELS } from '../../utils/constants';

const Header = ({ 
  pageTitle, 
  pageSubtitle, 
  range, 
  onRangeChange, 
  customDateRange,
  onCustomDateChange,
  onClearCustomDate,
  showRangeSwitcher = true 
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const handleSaveDates = () => {
    if (tempStartDate && tempEndDate && tempStartDate <= tempEndDate) {
      onCustomDateChange({
        startDate: tempStartDate,
        endDate: tempEndDate
      });
      setShowDatePicker(false);
      setTempStartDate('');
      setTempEndDate('');
    }
  };

  const handleCancelDates = () => {
    setShowDatePicker(false);
    setTempStartDate('');
    setTempEndDate('');
  };

  const handleClearCustomDate = () => {
    onClearCustomDate();
    setShowDatePicker(false);
  };

  const formatDateForDisplay = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('tr-TR');
  };

  return (
    <div className="page-header">
      <div>
        <h1 className="page-title">{pageTitle}</h1>
        <p className="page-subtitle">{pageSubtitle}</p>
      </div>

      {showRangeSwitcher && (
        <div className="range-controls">
          {/* Özel tarih seçici */}
          <div className="date-picker-container">
            {/* Aktif özel tarih göstergesi ve iptal butonu */}
            {customDateRange && (
              <div className="active-custom-date">
                <span className="custom-date-display">
                  {formatDateForDisplay(customDateRange.startDate)} - {formatDateForDisplay(customDateRange.endDate)}
                </span>
                <button 
                  className="clear-custom-date-btn"
                  onClick={handleClearCustomDate}
                  title="Özel tarihi iptal et"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Tarih seçici butonu */}
            <button 
              className={`date-picker-btn ${showDatePicker ? 'active' : ''}`}
              onClick={() => setShowDatePicker(!showDatePicker)}
              title="Özel tarih seç"
            >
              <Calendar size={16} />
              Tarih Seç
            </button>

            {/* Tarih seçici dropdown */}
            {showDatePicker && (
              <div className="date-picker-dropdown">
                <div className="date-picker-content">
                  <div className="date-input-group">
                    <label>Başlangıç Tarihi:</label>
                    <input
                      type="date"
                      value={tempStartDate}
                      onChange={(e) => setTempStartDate(e.target.value)}
                      className="date-input"
                    />
                  </div>
                  <div className="date-input-group">
                    <label>Bitiş Tarihi:</label>
                    <input
                      type="date"
                      value={tempEndDate}
                      onChange={(e) => setTempEndDate(e.target.value)}
                      min={tempStartDate}
                      className="date-input"
                    />
                  </div>
                  <div className="date-picker-buttons">
                    <button 
                      className="date-btn save-btn" 
                      onClick={handleSaveDates}
                      disabled={!tempStartDate || !tempEndDate || tempStartDate > tempEndDate}
                    >
                      Kaydet
                    </button>
                    <button 
                      className="date-btn cancel-btn" 
                      onClick={handleCancelDates}
                    >
                      İptal
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mevcut range switcher - hiç değişiklik yapılmadı */}
          <div className="range-switcher" role="tablist" aria-label="Zaman aralığı">
            {Object.entries(RANGES).filter(([key, value]) => value !== RANGES.CUSTOM).map(([key, value]) => (
              <button 
                key={key}
                className={`range-btn ${range === value && !customDateRange ? 'active' : ''}`} 
                onClick={() => onRangeChange(value)} 
                role="tab" 
                aria-selected={range === value && !customDateRange}
              >
                {RANGE_LABELS[value]}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;