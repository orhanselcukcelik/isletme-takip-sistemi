// utils/dateHelpers.js
// Tarih ve zaman yardımcı fonksiyonları

/**
 * Tarih ve saati Türkçe formata çevirir
 * @param {string|Date} date - Tarih
 * @returns {string} Formatlanmış tarih
 */
export const formatDateTime = (date) => {
  return new Date(date).toLocaleString('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Sadece tarihi formatlar
 * @param {string|Date} date - Tarih
 * @returns {string} Formatlanmış tarih
 */
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('tr-TR');
};

/**
 * Mevcut tarih ve saati HTML datetime-local formatında döndürür
 * @returns {string} YYYY-MM-DDTHH:mm formatında tarih
 */
export const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

/**
 * Tarih aralığına göre başlangıç ve bitiş tarihlerini döndürür
 * @param {string} range - 'daily', 'monthly', 'yearly'
 * @returns {Object} {startDate, endDate}
 */
export const getDateRange = (range) => {
  const now = new Date();
  const startDate = new Date();
  
  switch (range) {
    case 'daily':
      startDate.setHours(0, 0, 0, 0);
      return {
        startDate,
        endDate: new Date(now.setHours(23, 59, 59, 999))
      };
      
    case 'monthly':
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      endDate.setHours(23, 59, 59, 999);
      return { startDate, endDate };
      
    case 'yearly':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      const yearEndDate = new Date(now.getFullYear(), 11, 31);
      yearEndDate.setHours(23, 59, 59, 999);
      return { startDate, endDate: yearEndDate };
      
    default:
      return { startDate: null, endDate: null };
  }
};

/**
 * İki tarih arasındaki farkı gün olarak hesaplar
 * @param {Date} date1 - İlk tarih
 * @param {Date} date2 - İkinci tarih
 * @returns {number} Gün farkı
 */
export const getDaysDifference = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

/**
 * Tarihin bugün olup olmadığını kontrol eder
 * @param {string|Date} date - Kontrol edilecek tarih
 * @returns {boolean} Bugün mü?
 */
export const isToday = (date) => {
  const today = new Date();
  const checkDate = new Date(date);
  
  return today.getDate() === checkDate.getDate() &&
         today.getMonth() === checkDate.getMonth() &&
         today.getFullYear() === checkDate.getFullYear();
};

/**
 * Tarihin bu hafta olup olmadığını kontrol eder
 * @param {string|Date} date - Kontrol edilecek tarih
 * @returns {boolean} Bu hafta mı?
 */
export const isThisWeek = (date) => {
  const now = new Date();
  const checkDate = new Date(date);
  
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  
  return checkDate >= startOfWeek && checkDate <= endOfWeek;
};