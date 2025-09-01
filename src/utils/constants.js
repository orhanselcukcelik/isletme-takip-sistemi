// utils/constants.js
// Uygulama genelinde kullanılan sabit değerler

// Tab sabitleri
export const TABS = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  ORDERS: 'orders',
  SETTINGS: 'settings' // Yeni eklenen ayarlar tabı
};

// Sipariş alt tab sabitleri
export const ORDER_SUB_TABS = {
  NEW_ORDER: 'new-order',
  ORDER_HISTORY: 'order-history'
};

// Ayarlar alt tab sabitleri (yeni eklendi)
export const SETTINGS_TABS = {
  APPEARANCE: 'appearance',
  NOTIFICATIONS: 'notifications',
  BUSINESS: 'business',
  SYSTEM: 'system',
  SECURITY: 'security'
};

// Sipariş durumu sabitleri
export const ORDER_STATUS = {
  PAID: 'paid',
  UNPAID: 'unpaid'
};

// Sipariş durumu etiketleri
export const ORDER_STATUS_LABELS = {
  [ORDER_STATUS.PAID]: 'Ödendi',
  [ORDER_STATUS.UNPAID]: 'Ödenmedi'
};

// Sipariş durumu renkleri (CSS sınıfları için)
export const ORDER_STATUS_COLORS = {
  [ORDER_STATUS.PAID]: 'success',
  [ORDER_STATUS.UNPAID]: 'warning'
};

// Sıralama türleri
export const SORT_TYPES = {
  DEFAULT: 'default',
  STOCK_ASC: 'stock-asc',
  PROFIT_MARGIN_ASC: 'profit-margin-asc'
};

// Zaman aralığı sabitleri
export const RANGES = {
  DAILY: 'daily',
  MONTHLY: 'monthly',
  YEARLY: 'yearly',
  CUSTOM: 'custom' // Özel tarih aralığı eklendi
};

// Range etiketleri
export const RANGE_LABELS = {
  [RANGES.DAILY]: 'Günlük',
  [RANGES.MONTHLY]: 'Aylık',
  [RANGES.YEARLY]: 'Yıllık',
  [RANGES.CUSTOM]: 'Özel Tarih' // Özel tarih etiketi eklendi
};

// Tema sabitleri (yeni eklendi)
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  AUTO: 'auto'
};

// Dil sabitleri (yeni eklendi)
export const LANGUAGES = {
  TR: 'tr',
  EN: 'en'
};

// Yazı boyutu sabitleri (yeni eklendi)
export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large'
};

// Para birimi sabitleri (yeni eklendi)
export const CURRENCIES = {
  TRY: 'TRY',
  USD: 'USD',
  EUR: 'EUR'
};

// Para birimi sembolleri (yeni eklendi)
export const CURRENCY_SYMBOLS = {
  [CURRENCIES.TRY]: '₺',
  [CURRENCIES.USD]: '$',
  [CURRENCIES.EUR]: '€'
};

// Ödeme yöntemleri (yeni eklendi)
export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  TRANSFER: 'transfer'
};

// Ödeme yöntemi etiketleri (yeni eklendi)
export const PAYMENT_METHOD_LABELS = {
  [PAYMENT_METHODS.CASH]: 'Nakit',
  [PAYMENT_METHODS.CARD]: 'Kredi Kartı',
  [PAYMENT_METHODS.TRANSFER]: 'Banka Havalesi'
};

// Veri saklama süreleri (yeni eklendi)
export const DATA_RETENTION_PERIODS = {
  THREE_MONTHS: '3months',
  SIX_MONTHS: '6months',
  ONE_YEAR: '1year',
  TWO_YEARS: '2years'
};

// Dışa aktarma formatları (yeni eklendi)
export const EXPORT_FORMATS = {
  EXCEL: 'excel',
  PDF: 'pdf',
  CSV: 'csv'
};

// Oturum zaman aşımı süreleri (yeni eklendi)
export const SESSION_TIMEOUTS = {
  FIFTEEN_MINUTES: 15,
  THIRTY_MINUTES: 30,
  ONE_HOUR: 60,
  TWO_HOURS: 120
};

// Stok uyarı eşiği
export const STOCK_WARNING_THRESHOLD = 10;

// Varsayılan değerler
export const DEFAULT_VALUES = {
  NEW_PRODUCT: {
    name: '',
    costPrice: '',
    sellPrice: '',
    taxRate: '',
    stock: ''
  },
  SELECTED_PRODUCTS: {},
  ORDER_STATUS: ORDER_STATUS.UNPAID, // Varsayılan sipariş durumu
  SETTINGS: { // Yeni eklenen varsayılan ayarlar
    theme: THEMES.AUTO,
    language: LANGUAGES.TR,
    fontSize: FONT_SIZES.MEDIUM,
    compactMode: false,
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    orderReminders: true,
    lowStockAlerts: true,
    dailyReports: false,
    currency: CURRENCIES.TRY,
    defaultTaxRate: 18,
    autoCalculateTax: true,
    defaultPaymentMethod: PAYMENT_METHODS.CASH,
    showProfitMargins: true,
    quickOrderMode: false,
    autoBackup: true,
    dataRetention: DATA_RETENTION_PERIODS.ONE_YEAR,
    exportFormat: EXPORT_FORMATS.EXCEL,
    sessionTimeout: SESSION_TIMEOUTS.THIRTY_MINUTES,
    twoFactorEnabled: false,
    loginAlerts: true,
    dataEncryption: true,
    shareAnalytics: false
  }
};