// src/services/productService.js
// Bu dosya SADECE ürün işlemleriyle ilgilenecek

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

// Ürün işlemleri için tüm fonksiyonlar burada
export const productService = {
  
  // 1️⃣ Ürünleri dinleme (App.js'teki useEffect'ten gelecek)
  subscribeToProducts: (userId, callback) => {
    console.log('Ürünler dinlenmeye başlandı:', userId);
    
    const productsRef = collection(db, "users", userId, "products");
    const q = query(productsRef, orderBy("createdAt", "desc"));
    
    return onSnapshot(q, (snapshot) => {
      const products = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Ürünler güncellendi:', products.length, 'adet');
      callback(products); // App.js'e geri gönder
    }, (error) => {
      console.error('Ürün dinleme hatası:', error);
    });
  },

  // 2️⃣ Yeni ürün ekleme (App.js'teki addProduct'tan gelecek)
  addProduct: async (userId, productData) => {
    console.log('Yeni ürün ekleniyor:', productData);
    
    try {
      // Veri kontrolü
      const { name, costPrice, sellPrice, taxRate, stock } = productData;
      
      if (!name || !costPrice || !sellPrice || !taxRate || stock === undefined) {
        throw new Error('Tüm alanlar doldurulmalı');
      }

      const productsRef = collection(db, "users", userId, "products");
      const docRef = await addDoc(productsRef, {
        name: name,
        costPrice: parseFloat(costPrice),
        sellPrice: parseFloat(sellPrice),
        taxRate: parseFloat(taxRate),
        stock: parseInt(stock),
        isFavorite: false,
        createdAt: serverTimestamp()
      });

      console.log('Ürün başarıyla eklendi:', docRef.id);
      return { success: true, id: docRef.id };
      
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 3️⃣ Ürün güncelleme (App.js'teki saveEditProduct'tan gelecek)
  updateProduct: async (userId, productId, updates) => {
    console.log('Ürün güncelleniyor:', productId, updates);
    
    try {
      const productRef = doc(db, "users", userId, "products", productId);
      await updateDoc(productRef, {
        ...updates,
        // Sayı alanlarını güvenli şekilde dönüştür
        ...(updates.costPrice && { costPrice: parseFloat(updates.costPrice) }),
        ...(updates.sellPrice && { sellPrice: parseFloat(updates.sellPrice) }),
        ...(updates.taxRate && { taxRate: parseFloat(updates.taxRate) }),
        ...(updates.stock && { stock: parseInt(updates.stock) })
      });

      console.log('Ürün başarıyla güncellendi');
      return { success: true };
      
    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 4️⃣ Ürün silme (App.js'teki deleteProduct'tan gelecek)
  deleteProduct: async (userId, productId) => {
    console.log('Ürün siliniyor:', productId);
    
    try {
      const productRef = doc(db, "users", userId, "products", productId);
      await deleteDoc(productRef);

      console.log('Ürün başarıyla silindi');
      return { success: true };
      
    } catch (error) {
      console.error('Ürün silme hatası:', error);
      return { success: false, error: error.message };
    }
  },

  // 5️⃣ Favori durumu değiştirme (App.js'teki toggleFavorite'tan gelecek)
  toggleFavorite: async (userId, productId, currentValue) => {
    console.log('Favori durumu değiştiriliyor:', productId, !currentValue);
    
    try {
      const productRef = doc(db, "users", userId, "products", productId);
      await updateDoc(productRef, { 
        isFavorite: !currentValue 
      });

      console.log('Favori durumu güncellendi');
      return { success: true };
      
    } catch (error) {
      console.error('Favori güncelleme hatası:', error);
      return { success: false, error: error.message };
    }
  }
};

// Varsayılan export
export default productService;