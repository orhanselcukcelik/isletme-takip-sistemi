// src/hooks/useFirestore.js
import { useState, useEffect } from 'react';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  query, 
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from './useAuth';

export const useFirestore = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Koleksiyon referansları (kullanıcı bazlı)
  const getProductsRef = () => collection(db, 'users', user.uid, 'products');
  const getOrdersRef = () => collection(db, 'users', user.uid, 'orders');

  /* -------------------------
     PRODUCTS CRUD
     ------------------------- */
  
  // Ürün ekle
  const addProduct = async (product) => {
    try {
      setError(null);
      const productData = {
        ...product,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(getProductsRef(), productData);
      return { id: docRef.id, ...productData };
    } catch (err) {
      console.error('Ürün eklenirken hata:', err);
      setError('Ürün eklenirken hata oluştu');
      throw err;
    }
  };

  // Ürün güncelle
  const updateProduct = async (productId, updates) => {
    try {
      setError(null);
      const productRef = doc(getProductsRef(), productId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      await updateDoc(productRef, updateData);
      return updateData;
    } catch (err) {
      console.error('Ürün güncellenirken hata:', err);
      setError('Ürün güncellenirken hata oluştu');
      throw err;
    }
  };

  // Ürün sil
  const deleteProduct = async (productId) => {
    try {
      setError(null);
      const productRef = doc(getProductsRef(), productId);
      await deleteDoc(productRef);
      return productId;
    } catch (err) {
      console.error('Ürün silinirken hata:', err);
      setError('Ürün silinirken hata oluştu');
      throw err;
    }
  };

  /* -------------------------
     ORDERS CRUD
     ------------------------- */

  // Sipariş ekle
  const addOrder = async (order) => {
    try {
      setError(null);
      const orderData = {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      const docRef = await addDoc(getOrdersRef(), orderData);
      return { id: docRef.id, ...orderData };
    } catch (err) {
      console.error('Sipariş eklenirken hata:', err);
      setError('Sipariş eklenirken hata oluştu');
      throw err;
    }
  };

  // Sipariş güncelle
  const updateOrder = async (orderId, updates) => {
    try {
      setError(null);
      const orderRef = doc(getOrdersRef(), orderId);
      const updateData = {
        ...updates,
        updatedAt: serverTimestamp()
      };
      await updateDoc(orderRef, updateData);
      return updateData;
    } catch (err) {
      console.error('Sipariş güncellenirken hata:', err);
      setError('Sipariş güncellenirken hata oluştu');
      throw err;
    }
  };

  // Sipariş sil
  const deleteOrder = async (orderId) => {
    try {
      setError(null);
      const orderRef = doc(getOrdersRef(), orderId);
      await deleteDoc(orderRef);
      return orderId;
    } catch (err) {
      console.error('Sipariş silinirken hata:', err);
      setError('Sipariş silinirken hata oluştu');
      throw err;
    }
  };

  /* -------------------------
     REAL-TIME LISTENERS
     ------------------------- */

  // Ürünleri dinle
  const useProducts = () => {
    const [products, setProducts] = useState([]);
    
    useEffect(() => {
      if (!user) return;

      setLoading(true);
      const q = query(getProductsRef(), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const productsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Timestamp'leri Date'e çevir
            createdAt: doc.data().createdAt?.toDate(),
            updatedAt: doc.data().updatedAt?.toDate()
          }));
          setProducts(productsData);
          setLoading(false);
        },
        (error) => {
          console.error('Ürünler dinlenirken hata:', error);
          setError('Ürünler yüklenirken hata oluştu');
          setLoading(false);
        }
      );

      return unsubscribe;
    }, [user]);

    return { products, loading };
  };

  // Siparişleri dinle
  const useOrders = () => {
    const [orders, setOrders] = useState([]);
    
    useEffect(() => {
      if (!user) return;

      setLoading(true);
      const q = query(getOrdersRef(), orderBy('createdAt', 'desc'));
      
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const ordersData = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              // Date objelerini yeniden oluştur
              date: data.date?.toDate() || new Date(),
              createdAt: data.createdAt?.toDate(),
              updatedAt: data.updatedAt?.toDate()
            };
          });
          setOrders(ordersData);
          setLoading(false);
        },
        (error) => {
          console.error('Siparişler dinlenirken hata:', error);
          setError('Siparişler yüklenirken hata oluştu');
          setLoading(false);
        }
      );

      return unsubscribe;
    }, [user]);

    return { orders, loading };
  };

  /* -------------------------
     BATCH OPERATIONS
     ------------------------- */

  // Stok güncelleme (sipariş sonrası)
  const updateProductStocks = async (stockUpdates) => {
    try {
      setError(null);
      const promises = stockUpdates.map(({ productId, newStock }) => {
        const productRef = doc(getProductsRef(), productId);
        return updateDoc(productRef, { 
          stock: newStock,
          updatedAt: serverTimestamp()
        });
      });
      
      await Promise.all(promises);
      return true;
    } catch (err) {
      console.error('Stok güncellenirken hata:', err);
      setError('Stok güncellenirken hata oluştu');
      throw err;
    }
  };

  /* -------------------------
     UTILITY FUNCTIONS
     ------------------------- */

  // Hata temizle
  const clearError = () => setError(null);

  // Kullanıcının ilk verilerini oluştur (isteğe bağlı)
  const initializeUserData = async () => {
    try {
      // Örnek ürünler ekle (sadece ilk kez)
      const defaultProducts = [
        { name: 'Döner', costPrice: 15, sellPrice: 25, taxRate: 18, stock: 50, isFavorite: false },
        { name: 'Lahmacun', costPrice: 8, sellPrice: 15, taxRate: 18, stock: 30, isFavorite: false },
        { name: 'Ayran', costPrice: 2, sellPrice: 5, taxRate: 8, stock: 100, isFavorite: false }
      ];

      for (const product of defaultProducts) {
        await addProduct(product);
      }
      
      return true;
    } catch (err) {
      console.error('Varsayılan veriler oluşturulurken hata:', err);
      return false;
    }
  };

  return {
    // CRUD Operations
    addProduct,
    updateProduct,
    deleteProduct,
    addOrder,
    updateOrder,
    deleteOrder,
    updateProductStocks,

    // Real-time hooks
    useProducts,
    useOrders,

    // Utils
    clearError,
    initializeUserData,

    // State
    loading,
    error
  };
};