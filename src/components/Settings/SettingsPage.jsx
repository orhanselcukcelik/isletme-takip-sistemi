// components/Settings/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, X, Save, Monitor, Globe, Type, Eye
} from 'lucide-react';

const SettingsPage = ({ isOpen, onClose }) => {
  // Settings state - sadece görünüm ayarları
  const [settings, setSettings] = useState({
    theme: 'auto', // 'light', 'dark', 'auto'
    language: 'tr',
    fontSize: 'medium', // 'small', 'medium', 'large'
    compactMode: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        // Sadece görünüm ayarlarını al
        setSettings(prev => ({
          theme: parsed.theme || prev.theme,
          language: parsed.language || prev.language,
          fontSize: parsed.fontSize || prev.fontSize,
          compactMode: parsed.compactMode !== undefined ? parsed.compactMode : prev.compactMode
        }));
      }
    } catch (error) {
      console.error('Ayarlar yüklenirken hata:', error);
    }
  }, []);

  // Handle setting change
  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    // Clear messages
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Save settings
  const handleSaveSettings = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // Mevcut ayarları al ve sadece görünüm ayarlarını güncelle
      const existingSettings = JSON.parse(localStorage.getItem('appSettings') || '{}');
      const updatedSettings = {
        ...existingSettings,
        ...settings
      };
      
      // Save to localStorage
      localStorage.setItem('appSettings', JSON.stringify(updatedSettings));
      
      // Apply theme changes immediately
      applyThemeSettings();
      
      setSuccess('Ayarlar başarıyla kaydedildi!');
      
      // Auto close success message
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Ayarlar kaydedilirken hata:', error);
      setError('Ayarlar kaydedilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Apply theme settings
  const applyThemeSettings = () => {
    const { theme, fontSize, compactMode } = settings;
    const root = document.documentElement;
    
    // Theme application
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else if (theme === 'auto') {
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
    
    // Font size application
    root.setAttribute('data-font-size', fontSize);
    
    // Compact mode
    if (compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }
  };

  // Close modal with ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content settings-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <Settings className="modal-icon" />
            <h2>Ayarlar</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body settings-body">
          {/* Messages */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <div className="settings-container">
            {/* Settings Content - Tek bölüm: Görünüm */}
            <div className="settings-content single-section">
              <div className="settings-section">
                <h3 className="section-title">
                  <Monitor className="section-icon" />
                  Görünüm Ayarları
                </h3>
                
                <div className="setting-group">
                  <label className="setting-label">
                    <Monitor className="setting-icon" />
                    Tema
                  </label>
                  <select 
                    value={settings.theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    className="form-select"
                  >
                    <option value="auto">Otomatik (Sistem)</option>
                    <option value="light">Açık Tema</option>
                    <option value="dark">Koyu Tema</option>
                  </select>
                  <small className="setting-help">
                    Otomatik seçeneği sistem temanızı takip eder
                  </small>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <Globe className="setting-icon" />
                    Dil
                  </label>
                  <select 
                    value={settings.language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    className="form-select"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">English</option>
                  </select>
                  <small className="setting-help">
                    Dil değişikliği sayfa yenilendiğinde etkili olur
                  </small>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <Type className="setting-icon" />
                    Yazı Boyutu
                  </label>
                  <select 
                    value={settings.fontSize}
                    onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                    className="form-select"
                  >
                    <option value="small">Küçük</option>
                    <option value="medium">Orta</option>
                    <option value="large">Büyük</option>
                  </select>
                </div>

                <div className="setting-group">
                  <label className="setting-label">
                    <Eye className="setting-icon" />
                    Kompakt Görünüm
                  </label>
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={settings.compactMode}
                      onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <small className="setting-help">
                    Daha az boşluk ve daha yoğun içerik gösterimi
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <div className="button-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              <X size={16} />
              İptal
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSaveSettings}
              disabled={loading}
            >
              <Save size={16} />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;