// components/Settings/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { 
  Settings, X, Save, Monitor, Bell, DollarSign, Shield, 
  Database, Download, Trash2, Globe, Type, Volume2,
  Eye, Lock, Smartphone, Mail, RotateCcw, AlertTriangle
} from 'lucide-react';

const SettingsPage = ({ isOpen, onClose }) => {
  // Active tab state
  const [activeSettingsTab, setActiveSettingsTab] = useState('appearance');
  
  // Settings state
  const [settings, setSettings] = useState({
    // Görünüm Ayarları
    theme: 'auto', // 'light', 'dark', 'auto'
    language: 'tr',
    fontSize: 'medium', // 'small', 'medium', 'large'
    compactMode: false,
    
    // Bildirim Ayarları
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    orderReminders: true,
    lowStockAlerts: true,
    dailyReports: false,
    
    // İş Ayarları
    currency: 'TRY',
    defaultTaxRate: 18,
    autoCalculateTax: true,
    defaultPaymentMethod: 'cash',
    showProfitMargins: true,
    quickOrderMode: false,
    
    // Sistem Ayarları
    autoBackup: true,
    dataRetention: '1year', // '3months', '6months', '1year', '2years'
    exportFormat: 'excel', // 'excel', 'pdf', 'csv'
    sessionTimeout: 30, // dakika
    
    // Gizlilik ve Güvenlik
    twoFactorEnabled: false,
    loginAlerts: true,
    dataEncryption: true,
    shareAnalytics: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        setSettings(prev => ({
          ...prev,
          ...JSON.parse(savedSettings)
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
      // Save to localStorage
      localStorage.setItem('appSettings', JSON.stringify(settings));
      
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

  // Reset settings to default
  const handleResetSettings = () => {
    if (window.confirm('Tüm ayarları varsayılan değerlere döndürmek istediğinizden emin misiniz?')) {
      const defaultSettings = {
        theme: 'dark',
        language: 'tr',
        fontSize: 'medium',
        compactMode: false,
        emailNotifications: true,
        pushNotifications: true,
        soundEnabled: true,
        orderReminders: true,
        lowStockAlerts: true,
        dailyReports: false,
        currency: 'TRY',
        defaultTaxRate: 18,
        autoCalculateTax: true,
        defaultPaymentMethod: 'cash',
        showProfitMargins: true,
        quickOrderMode: false,
        autoBackup: true,
        dataRetention: '1year',
        exportFormat: 'excel',
        sessionTimeout: 30,
        twoFactorEnabled: false,
        loginAlerts: true,
        dataEncryption: true,
        shareAnalytics: false
      };
      
      setSettings(defaultSettings);
      localStorage.removeItem('appSettings');
      applyThemeSettings();
      setSuccess('Ayarlar varsayılan değerlere döndürüldü!');
    }
  };

  // Export data
  const handleExportData = () => {
    setLoading(true);
    try {
      // Simulate export process
      setTimeout(() => {
        setSuccess(`Verileriniz ${settings.exportFormat.toUpperCase()} formatında dışa aktarıldı!`);
        setLoading(false);
      }, 2000);
    } catch (error) {
      setError('Veri dışa aktarma sırasında hata oluştu');
      setLoading(false);
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

  const settingsTabs = [
    { key: 'appearance', label: 'Görünüm', icon: Monitor },
    { key: 'notifications', label: 'Bildirimler', icon: Bell },
    { key: 'business', label: 'İş Ayarları', icon: DollarSign },
    { key: 'system', label: 'Sistem', icon: Database },
    { key: 'security', label: 'Güvenlik', icon: Shield }
  ];

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
            {/* Settings Tabs */}
            <div className="settings-tabs">
              {settingsTabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  className={`settings-tab ${activeSettingsTab === key ? 'active' : ''}`}
                  onClick={() => setActiveSettingsTab(key)}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </div>

            {/* Settings Content */}
            <div className="settings-content">
              
              {/* Görünüm Ayarları */}
              {activeSettingsTab === 'appearance' && (
                <div className="settings-section">
                  <h3 className="section-title">Görünüm Ayarları</h3>
                  
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
                  </div>
                </div>
              )}

              {/* Bildirim Ayarları */}
              {activeSettingsTab === 'notifications' && (
                <div className="settings-section">
                  <h3 className="section-title">Bildirim Ayarları</h3>
                  
                  <div className="setting-group">
                    <label className="setting-label">
                      <Mail className="setting-icon" />
                      E-posta Bildirimleri
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.emailNotifications}
                        onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Smartphone className="setting-icon" />
                      Push Bildirimleri
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.pushNotifications}
                        onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Volume2 className="setting-icon" />
                      Ses Bildirimleri
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.soundEnabled}
                        onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Bell className="setting-icon" />
                      Sipariş Hatırlatıcıları
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.orderReminders}
                        onChange={(e) => handleSettingChange('orderReminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <AlertTriangle className="setting-icon" />
                      Düşük Stok Uyarıları
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.lowStockAlerts}
                        onChange={(e) => handleSettingChange('lowStockAlerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Database className="setting-icon" />
                      Günlük Raporlar
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.dailyReports}
                        onChange={(e) => handleSettingChange('dailyReports', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              {/* İş Ayarları */}
              {activeSettingsTab === 'business' && (
                <div className="settings-section">
                  <h3 className="section-title">İş Ayarları</h3>
                  
                  <div className="setting-group">
                    <label className="setting-label">
                      <DollarSign className="setting-icon" />
                      Para Birimi
                    </label>
                    <select 
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                      className="form-select"
                    >
                      <option value="TRY">Türk Lirası (₺)</option>
                      <option value="USD">ABD Doları ($)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <DollarSign className="setting-icon" />
                      Varsayılan KDV Oranı (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={settings.defaultTaxRate}
                      onChange={(e) => handleSettingChange('defaultTaxRate', Number(e.target.value))}
                      className="form-input"
                    />
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <DollarSign className="setting-icon" />
                      Otomatik KDV Hesaplama
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.autoCalculateTax}
                        onChange={(e) => handleSettingChange('autoCalculateTax', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <DollarSign className="setting-icon" />
                      Varsayılan Ödeme Yöntemi
                    </label>
                    <select 
                      value={settings.defaultPaymentMethod}
                      onChange={(e) => handleSettingChange('defaultPaymentMethod', e.target.value)}
                      className="form-select"
                    >
                      <option value="cash">Nakit</option>
                      <option value="card">Kredi Kartı</option>
                      <option value="transfer">Banka Havalesi</option>
                    </select>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Eye className="setting-icon" />
                      Kar Marjlarını Göster
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.showProfitMargins}
                        onChange={(e) => handleSettingChange('showProfitMargins', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Settings className="setting-icon" />
                      Hızlı Sipariş Modu
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.quickOrderMode}
                        onChange={(e) => handleSettingChange('quickOrderMode', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              )}

              {/* Sistem Ayarları */}
              {activeSettingsTab === 'system' && (
                <div className="settings-section">
                  <h3 className="section-title">Sistem Ayarları</h3>
                  
                  <div className="setting-group">
                    <label className="setting-label">
                      <Database className="setting-icon" />
                      Otomatik Yedekleme
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.autoBackup}
                        onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Database className="setting-icon" />
                      Veri Saklama Süresi
                    </label>
                    <select 
                      value={settings.dataRetention}
                      onChange={(e) => handleSettingChange('dataRetention', e.target.value)}
                      className="form-select"
                    >
                      <option value="3months">3 Ay</option>
                      <option value="6months">6 Ay</option>
                      <option value="1year">1 Yıl</option>
                      <option value="2years">2 Yıl</option>
                    </select>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Download className="setting-icon" />
                      Dışa Aktarma Formatı
                    </label>
                    <select 
                      value={settings.exportFormat}
                      onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
                      className="form-select"
                    >
                      <option value="excel">Excel (.xlsx)</option>
                      <option value="pdf">PDF (.pdf)</option>
                      <option value="csv">CSV (.csv)</option>
                    </select>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Lock className="setting-icon" />
                      Oturum Zaman Aşımı (dakika)
                    </label>
                    <select 
                      value={settings.sessionTimeout}
                      onChange={(e) => handleSettingChange('sessionTimeout', Number(e.target.value))}
                      className="form-select"
                    >
                      <option value={15}>15 Dakika</option>
                      <option value={30}>30 Dakika</option>
                      <option value={60}>1 Saat</option>
                      <option value={120}>2 Saat</option>
                    </select>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Download className="setting-icon" />
                      Veri Dışa Aktar
                    </label>
                    <button
                      className="btn btn-secondary"
                      onClick={handleExportData}
                      disabled={loading}
                    >
                      <Download size={16} />
                      {loading ? 'Dışa Aktarılıyor...' : 'Verileri Dışa Aktar'}
                    </button>
                  </div>
                </div>
              )}

              {/* Güvenlik Ayarları */}
              {activeSettingsTab === 'security' && (
                <div className="settings-section">
                  <h3 className="section-title">Güvenlik ve Gizlilik</h3>
                  
                  <div className="setting-group">
                    <label className="setting-label">
                      <Shield className="setting-icon" />
                      İki Faktörlü Doğrulama
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.twoFactorEnabled}
                        onChange={(e) => handleSettingChange('twoFactorEnabled', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <small className="setting-help">
                      Hesap güvenliğiniz için önerilir
                    </small>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Bell className="setting-icon" />
                      Giriş Uyarıları
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.loginAlerts}
                        onChange={(e) => handleSettingChange('loginAlerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Lock className="setting-icon" />
                      Veri Şifreleme
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.dataEncryption}
                        onChange={(e) => handleSettingChange('dataEncryption', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="setting-group">
                    <label className="setting-label">
                      <Database className="setting-icon" />
                      Analitik Verilerini Paylaş
                    </label>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.shareAnalytics}
                        onChange={(e) => handleSettingChange('shareAnalytics', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                    <small className="setting-help">
                      Ürün geliştirilmesine yardımcı olur
                    </small>
                  </div>

                  <div className="setting-group danger-zone">
                    <h4 className="danger-title">
                      <AlertTriangle className="setting-icon" />
                      Tehlikeli Bölge
                    </h4>
                    <div className="danger-actions">
                      <button
                        className="btn btn-outline danger"
                        onClick={handleResetSettings}
                      >
                        <RotateCcw size={16} />
                        Ayarları Sıfırla
                      </button>
                    </div>
                  </div>
                </div>
              )}
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