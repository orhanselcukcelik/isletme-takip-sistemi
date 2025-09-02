// src/services/orderService.js
import { increment } from 'firebase/firestore';
import { ORDER_STATUS } from '../utils/constants';

import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';

const normalizeDateToISO = (raw) => {
  try {
    if (!raw) return new Date().toISOString();
    // Firestore Timestamp (has toDate)
    if (typeof raw.toDate === 'function') {
      const d = raw.toDate();
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    }
    // number timestamp (ms)
    if (typeof raw === 'number') {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    }
    // string
    if (typeof raw === 'string') {
      const d = new Date(raw);
      return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
    }
    // Date object
    if (raw instanceof Date) {
      return isNaN(raw.getTime()) ? new Date().toISOString() : raw.toISOString();
    }
    return new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
};

export const orderService = {
  subscribeToOrders: (userId, callback) => {
    console.log('Siparişler dinlenmeye başlandı:', userId);
    
    const ordersRef = collection(db, "users", userId, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        const normalizedDate = normalizeDateToISO(data.date);
        return {
          id: docSnap.id,
          ...data,
          date: normalizedDate, // ISO string kesin
          status: data.status || ORDER_STATUS.UNPAID
        };
      });
      
      console.log('Siparişler güncellendi (subscribeToOrders):', orders.length);
      callback(orders);
    }, (error) => {
      console.error('Sipariş dinleme hatası:', error);
    });
  },

  addOrder: async (userId, selectedProducts, products, orderStatus = ORDER_STATUS.UNPAID) => {
    console.log('Yeni sipariş oluşturuluyor:', selectedProducts);
    
    try {
      const orderItems = Object.entries(selectedProducts)
        .filter(([_, quantity]) => quantity > 0)
        .map(([productId, quantity]) => {
          const product = products.find(p => p.id === productId);
          if (!product) throw new Error(`Ürün bulunamadı: ${productId}`);
          if (product.stock < quantity) throw new Error(`${product.name} için yeterli stok yok! (Mevcut: ${product.stock})`);
          
          const totalRevenue = product.sellPrice * quantity;
          const totalTax = totalRevenue * (product.taxRate / 100);
          
          return {
            productId: product.id,
            productName: product.name,
            quantity,
            costPrice: product.costPrice,
            sellPrice: product.sellPrice,
            taxRate: product.taxRate,
            totalCost: product.costPrice * quantity,
            totalRevenue,
            totalTax
          };
        });

      if (orderItems.length === 0) throw new Error('Sipariş oluşturmak için ürün seçin.');

      const totalRevenue = orderItems.reduce((sum, item) => sum + item.totalRevenue, 0);
      const totalCost = orderItems.reduce((sum, item) => sum + item.totalCost, 0);
      const totalTax = orderItems.reduce((sum, item) => sum + item.totalTax, 0);
      const profit = totalRevenue - totalCost;

      const order = {
        date: new Date().toISOString(), // ISO string burada da
        items: orderItems,
        totalRevenue,
        totalCost,
        totalTax,
        profit,
        status: orderStatus,
        createdAt: serverTimestamp()
      };

      const ordersRef = collection(db, "users", userId, "orders");
      const docRef = await addDoc(ordersRef, order);

      await orderService.updateStocks(userId, orderItems, 'decrease');

      console.log('Sipariş başarıyla eklendi:', docRef.id);
      return { success: true, id: docRef.id };
      
    } catch (error) {
      console.error('Sipariş ekleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  updateOrder: async (userId, orderId, originalOrder, updatedItems, updatedDate, updatedStatus) => {
    console.log('Sipariş güncelleniyor:', orderId);
    
    try {
      // Boş sipariş kontrolü
      if (!updatedItems || updatedItems.length === 0) {
        throw new Error('Sipariş en az bir ürün içermeli.');
      }

      // 0 veya negatif quantity olan itemları filtrele (quantity 0 olanlar silinmiş sayılır)
      const validItems = updatedItems.filter(item => {
        const qty = parseInt(item.quantity) || 0;
        return qty > 0;
      });
      
      console.log('Geçerli ürünler filtrelendi:', validItems.length, 'adet');
      
      if (validItems.length === 0) {
        throw new Error('Sipariş en az bir ürün içermeli. Lütfen en az bir ürün için geçerli miktar giriniz.');
      }

      // İtem hesaplamalarını yap
      const processedItems = validItems.map(item => {
        const quantity = parseInt(item.quantity) || 0;
        const sellPrice = parseFloat(item.sellPrice) || 0;
        const costPrice = parseFloat(item.costPrice) || 0;
        const taxRate = parseFloat(item.taxRate) || 0;
        
        const totalRevenue = sellPrice * quantity;
        const totalTax = totalRevenue * (taxRate / 100);
        const totalCost = costPrice * quantity;
        
        return {
          ...item,
          quantity,
          sellPrice,
          costPrice,
          taxRate,
          totalRevenue,
          totalTax,
          totalCost
        };
      });

      // Toplam hesaplamalar
      const totalRevenue = processedItems.reduce((sum, item) => sum + item.totalRevenue, 0);
      const totalCost = processedItems.reduce((sum, item) => sum + item.totalCost, 0);
      const totalTax = processedItems.reduce((sum, item) => sum + item.totalTax, 0);
      const profit = totalRevenue - totalCost;

      // Siparişi güncelle
      const orderRef = doc(db, "users", userId, "orders", orderId);
      await updateDoc(orderRef, {
        date: new Date(updatedDate).toISOString(),
        items: processedItems,
        totalRevenue,
        totalCost,
        totalTax,
        profit,
        status: updatedStatus
      });

      // Stok güncellemelerini yap
      await orderService.updateStockDifferences(userId, originalOrder.items, processedItems);

      console.log('Sipariş başarıyla güncellendi');
      return { success: true, message: 'Sipariş başarıyla güncellendi!' };
      
    } catch (error) {
      console.error('Sipariş güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  deleteOrder: async (userId, orderId, orderItems) => {
    console.log('Sipariş siliniyor:', orderId);
    
    try {
      const orderRef = doc(db, "users", userId, "orders", orderId);
      await deleteDoc(orderRef);

      await orderService.updateStocks(userId, orderItems, 'increase');

      console.log('Sipariş başarıyla silindi');
      return { success: true };
      
    } catch (error) {
      console.error('Sipariş silme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  updateOrderStatus: async (userId, orderId, newStatus) => {
    console.log('Sipariş durumu güncelleniyor:', orderId, 'yeni durum:', newStatus);
    
    try {
      const orderRef = doc(db, "users", userId, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      console.log('Sipariş durumu başarıyla güncellendi');
      return { success: true };
    } catch (error) {
      console.error('Sipariş durumu güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  updateStocks: async (userId, orderItems, operation) => {
    console.log('Stoklar güncelleniyor:', operation);
    const promises = orderItems.map(async (item) => {
      const productRef = doc(db, "users", userId, "products", item.productId);
      const stockChange = operation === 'increase' ? item.quantity : -item.quantity;
      return updateDoc(productRef, { stock: increment(stockChange) });
    });
    await Promise.all(promises);
    console.log('Tüm stoklar güncellendi');
  },

  updateStockDifferences: async (userId, originalItems, updatedItems) => {
    console.log('Stok farkları hesaplanıyor');
    const stockChanges = {};

    // Orijinal siparişten stokları geri ekle
    originalItems.forEach(item => {
      if (!stockChanges[item.productId]) stockChanges[item.productId] = 0;
      stockChanges[item.productId] += item.quantity;
    });

    // Yeni siparişten stokları düş
    updatedItems.forEach(item => {
      if (!stockChanges[item.productId]) stockChanges[item.productId] = 0;
      stockChanges[item.productId] -= item.quantity;
    });

    // Değişiklik olan stokları güncelle
    const promises = Object.entries(stockChanges)
      .filter(([_, change]) => change !== 0)
      .map(([productId, change]) => {
        const productRef = doc(db, "users", userId, "products", productId);
        return updateDoc(productRef, { stock: increment(change) });
      });

    await Promise.all(promises);
    console.log('Stok farkları güncellendi');
  }
};

export default orderService;
