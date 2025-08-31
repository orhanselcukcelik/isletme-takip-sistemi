// utils/constants.js
// Uygulama genelinde kullanılan sabit değerler

// Tab sabitleri
export const TABS = {
  DASHBOARD: 'dashboard',
  PRODUCTS: 'products',
  ORDERS: 'orders'
};

// Sipariş alt tab sabitleri
export const ORDER_SUB_TABS = {
  NEW_ORDER: 'new-order',
  ORDER_HISTORY: 'order-history'
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
  YEARLY: 'yearly'
};

// Range etiketleri
export const RANGE_LABELS = {
  [RANGES.DAILY]: 'Günlük',
  [RANGES.MONTHLY]: 'Aylık',
  [RANGES.YEARLY]: 'Yıllık'
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
  SELECTED_PRODUCTS: {}
};