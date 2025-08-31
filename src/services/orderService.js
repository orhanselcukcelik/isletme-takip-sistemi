// src/services/orderService.js
// Bu dosya SADECE sipariş işlemleriyle ilgilenecek

// Firebase increment import (en üste eklenecek)
import { increment } from 'firebase/firestore';

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

// Sipariş işlemleri için tüm fonksiyonlar burada
export const orderService = {
  
  // 1️⃣ Siparişleri dinleme (App.js'teki useEffect'ten gelecek)
  subscribeToOrders: (userId, callback) => {
    console.log('Siparişler dinlenmeye başlandı:', userId);
    
    const ordersRef = collection(db, "users", userId, "orders");
    const q = query(ordersRef, orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Firestore timestamp'i Date'e çevir
        date: doc.data().date?.toDate() || new Date()
      }));
      
      console.log('Siparişler güncellendi:', orders.length, 'adet');
      callback(orders);
    }, (error) => {
      console.error('Sipariş dinleme hatası:', error);
    });
  },

  // 2️⃣ Yeni sipariş ekleme (App.js'teki addOrder'dan gelecek)
  addOrder: async (userId, selectedProducts, products) => {
    console.log('Yeni sipariş oluşturuluyor:', selectedProducts);
    
    try {
      // Sipariş öğelerini hazırla
      const orderItems = Object.entries(selectedProducts)
        .filter(([_, quantity]) => quantity > 0)
        .map(([productId, quantity]) => {
          const product = products.find(p => p.id === productId);
          if (!product) {
            throw new Error(`Ürün bulunamadı: ${productId}`);
          }
          if (product.stock < quantity) {
            throw new Error(`${product.name} için yeterli stok yok! (Mevcut: ${product.stock})`);
          }
          
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

      if (orderItems.length === 0) {
        throw new Error('Sipariş oluşturmak için ürün seçin.');
      }

      // Toplam değerleri hesapla
      const totalRevenue = orderItems.reduce((sum, item) => sum + item.totalRevenue, 0);
      const totalCost = orderItems.reduce((sum, item) => sum + item.totalCost, 0);
      const totalTax = orderItems.reduce((sum, item) => sum + item.totalTax, 0);
      const profit = totalRevenue - totalCost;

      const order = {
        date: new Date(),
        items: orderItems,
        totalRevenue,
        totalCost,
        totalTax,
        profit,
        createdAt: serverTimestamp()
      };

      // Siparişi Firebase'e kaydet
      const ordersRef = collection(db, "users", userId, "orders");
      const docRef = await addDoc(ordersRef, order);

      // Stokları güncelle
      await orderService.updateStocks(userId, orderItems, 'decrease');

      console.log('Sipariş başarıyla eklendi:', docRef.id);
      return { success: true, id: docRef.id };
      
    } catch (error) {
      console.error('Sipariş ekleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 3️⃣ Sipariş güncelleme (App.js'teki saveEditOrder'dan gelecek)
  updateOrder: async (userId, orderId, originalOrder, updatedItems, updatedDate) => {
    console.log('Sipariş güncelleniyor:', orderId);
    
    try {
      // Güncellenen öğeleri hesapla
      const processedItems = updatedItems.map(item => {
        const totalRevenue = item.sellPrice * item.quantity;
        const totalTax = totalRevenue * (item.taxRate / 100);
        return {
          ...item,
          totalRevenue,
          totalTax,
          totalCost: item.costPrice * item.quantity
        };
      });

      const totalRevenue = processedItems.reduce((sum, item) => sum + item.totalRevenue, 0);
      const totalCost = processedItems.reduce((sum, item) => sum + item.totalCost, 0);
      const totalTax = processedItems.reduce((sum, item) => sum + item.totalTax, 0);
      const profit = totalRevenue - totalCost;

      // Siparişi güncelle
      const orderRef = doc(db, "users", userId, "orders", orderId);
      await updateDoc(orderRef, {
        date: new Date(updatedDate),
        items: processedItems,
        totalRevenue,
        totalCost,
        totalTax,
        profit
      });

      // Stok farklarını hesapla ve güncelle
      await orderService.updateStockDifferences(userId, originalOrder.items, processedItems);

      console.log('Sipariş başarıyla güncellendi');
      return { success: true };
      
    } catch (error) {
      console.error('Sipariş güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 4️⃣ Sipariş silme (App.js'teki deleteOrder'dan gelecek)
  deleteOrder: async (userId, orderId, orderItems) => {
    console.log('Sipariş siliniyor:', orderId);
    
    try {
      // Siparişi sil
      const orderRef = doc(db, "users", userId, "orders", orderId);
      await deleteDoc(orderRef);

      // Stokları geri yükle
      await orderService.updateStocks(userId, orderItems, 'increase');

      console.log('Sipariş başarıyla silindi');
      return { success: true };
      
    } catch (error) {
      console.error('Sipariş silme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 🔧 YARDIMCI FONKSİYONLAR

  // Stokları güncelleme (artırma/azaltma)
  updateStocks: async (userId, orderItems, operation) => {
    console.log('Stoklar güncelleniyor:', operation);
    
    const promises = orderItems.map(async (item) => {
      const productRef = doc(db, "users", userId, "products", item.productId);
      
      // Mevcut ürünü bul (App.js'ten products array'i alacağız)
      // Bu kısmı App.js'te products state'i ile çözeceğiz
      const stockChange = operation === 'increase' ? item.quantity : -item.quantity;
      
      return updateDoc(productRef, {
        stock: increment(stockChange) // Firebase increment kullanabiliriz
      });
    });

    await Promise.all(promises);
    console.log('Tüm stoklar güncellendi');
  },

  // Stok farklarını güncelleme (sipariş düzenleme için)
  updateStockDifferences: async (userId, originalItems, updatedItems) => {
    console.log('Stok farkları hesaplanıyor');
    
    // Her ürün için stok farkını hesapla
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

    // Sadece değişen ürünleri güncelle
    const promises = Object.entries(stockChanges)
      .filter(([_, change]) => change !== 0)
      .map(async ([productId, change]) => {
        const productRef = doc(db, "users", userId, "products", productId);
        return updateDoc(productRef, {
          stock: increment(change)
        });
      });

    await Promise.all(promises);
    console.log('Stok farkları güncellendi');
  }
};

export default orderService;