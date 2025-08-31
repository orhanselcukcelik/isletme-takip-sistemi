// utils/calculations.js
// İş mantığı hesaplama fonksiyonları

/**
 * Kar marjını hesaplar
 * @param {number} costPrice - Maliyet fiyatı
 * @param {number} sellPrice - Satış fiyatı
 * @returns {number} Kar marjı yüzdesi
 */
export const calculateProfitMargin = (costPrice, sellPrice) => {
  if (costPrice <= 0) return 0;
  return ((sellPrice - costPrice) / costPrice) * 100;
};

/**
 * Para formatını düzenler
 * @param {number} amount - Miktar
 * @param {number} decimalPlaces - Ondalık basamak sayısı
 * @returns {string} Formatlanmış para birimi
 */
export const formatCurrency = (amount, decimalPlaces = 2) => {
  return `₺${Number(amount).toFixed(decimalPlaces)}`;
};

/**
 * Stok durumunu kontrol eder
 * @param {number} stock - Stok miktarı
 * @param {number} threshold - Uyarı eşiği
 * @returns {boolean} Düşük stok durumu
 */
export const isLowStock = (stock, threshold = 10) => {
  return stock <= threshold;
};

/**
 * Sipariş toplam tutarını hesaplar
 * @param {Array} items - Sipariş kalemleri
 * @returns {Object} Toplam hesaplar
 */
export const calculateOrderTotals = (items) => {
  const totals = items.reduce((acc, item) => {
    const itemRevenue = item.sellPrice * item.quantity;
    const itemCost = item.costPrice * item.quantity;
    const itemTax = (itemRevenue * item.taxRate) / 100;
    
    return {
      totalRevenue: acc.totalRevenue + itemRevenue,
      totalCost: acc.totalCost + itemCost,
      totalTax: acc.totalTax + itemTax
    };
  }, {
    totalRevenue: 0,
    totalCost: 0,
    totalTax: 0
  });

  // Kar hesaplama
  totals.profit = totals.totalRevenue - totals.totalCost - totals.totalTax;
  
  return totals;
};

/**
 * Yüzde hesaplama
 * @param {number} value - Değer
 * @param {number} total - Toplam
 * @returns {number} Yüzde değeri
 */
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return (value / total) * 100;
};

/**
 * İki ondalık basamağa yuvarlar
 * @param {number} number - Sayı
 * @returns {number} Yuvarlanmış sayı
 */
export const roundToTwo = (number) => {
  return Math.round(number * 100) / 100;
};