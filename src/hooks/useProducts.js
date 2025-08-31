// src/hooks/useProducts.js
// Bu hook tüm ürün işlemlerini yönetir

import { useState, useEffect, useMemo } from 'react';
import { productService } from '../services/productService';

export const useProducts = (user) => {
  // Products state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortType, setSortType] = useState('default');
  
  // Editing state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '', costPrice: '', sellPrice: '', taxRate: '', stock: ''
  });

  // New product form state
  const [newProduct, setNewProduct] = useState({
    name: '', costPrice: '', sellPrice: '', taxRate: '', stock: ''
  });

  // Firebase - Ürünleri dinleme
  useEffect(() => {
    if (!user) {
      console.log('Kullanıcı yok, ürünler temizleniyor');
      setProducts([]);
      return;
    }

    console.log('Ürünler dinlenmeye başlanıyor:', user.uid);
    
    const unsubscribe = productService.subscribeToProducts(user.uid, (products) => {
      console.log('Ürünler güncellendi:', products.length, 'adet');
      setProducts(products);
    });

    return () => {
      console.log('Ürün listener kapatılıyor...');
      unsubscribe();
    };
  }, [user]);

  // Sıralanmış ürünler (memoized)
  const sortedProducts = useMemo(() => {
    console.log('Ürünler sıralanıyor:', sortType);
    
    const arr = [...products];
    switch (sortType) {
      case 'stock-asc':
        return arr.sort((a, b) => a.stock - b.stock);
      case 'profit-margin-asc': {
        const calculateMargin = (product) => 
          product.costPrice > 0 ? ((product.sellPrice - product.costPrice) / product.costPrice) * 100 : 0;
        return arr.sort((a, b) => calculateMargin(a) - calculateMargin(b));
      }
      case 'default':
      default:
        // Favoriler üstte
        return arr.sort((a, b) => 
          (a.isFavorite && !b.isFavorite) ? -1 : 
          (!a.isFavorite && b.isFavorite) ? 1 : 0
        );
    }
  }, [products, sortType]);

  // Ürün ekleme
  const addProduct = async () => {
    console.log('Yeni ürün ekleniyor:', newProduct);
    
    // Validation
    if (!newProduct.name || !newProduct.costPrice || !newProduct.sellPrice || 
        !newProduct.taxRate || newProduct.stock === '') {
      return { success: false, error: 'Lütfen tüm ürün alanlarını doldurun.' };
    }
    
    if (!user) {
      return { success: false, error: 'Önce giriş yapmalısınız.' };
    }

    setLoading(true);
    
    try {
      const result = await productService.addProduct(user.uid, newProduct);
      
      if (result.success) {
        // Formu temizle
        setNewProduct({ name: '', costPrice: '', sellPrice: '', taxRate: '', stock: '' });
        console.log('Ürün başarıyla eklendi');
        return { success: true, message: 'Ürün eklendi!' };
      } else {
        return result;
      }
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Favori değiştirme
  const toggleFavorite = async (productId, currentValue) => {
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı' };
    
    console.log('Favori durumu değiştiriliyor:', productId);
    
    const result = await productService.toggleFavorite(user.uid, productId, currentValue);
    
    if (!result.success) {
      return { success: false, error: result.error };
    }
    
    return { success: true };
  };

  // Ürün silme
  const deleteProduct = async (productId) => {
    if (!user) return { success: false, error: 'Kullanıcı bulunamadı' };
    
    console.log('Ürün siliniyor:', productId);
    
    const result = await productService.deleteProduct(user.uid, productId);
    
    if (result.success) {
      return { success: true, message: 'Ürün silindi!' };
    } else {
      return result;
    }
  };

  // Ürün düzenleme başlatma
  const startEditProduct = (product) => {
    console.log('Ürün düzenleme başlatılıyor:', product.id);
    
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      costPrice: product.costPrice.toString(),
      sellPrice: product.sellPrice.toString(),
      taxRate: product.taxRate.toString(),
      stock: product.stock.toString()
    });
  };

  // Ürün düzenleme kaydetme
  const saveEditProduct = async () => {
    console.log('Ürün düzenleme kaydediliyor:', editingProduct);
    
    // Validation
    if (!editForm.name || !editForm.costPrice || !editForm.sellPrice || 
        !editForm.taxRate || !editForm.stock) {
      return { success: false, error: 'Lütfen tüm alanları doldurun.' };
    }
    
    if (!user || !editingProduct) {
      return { success: false, error: 'Gerekli bilgiler bulunamadı.' };
    }

    const result = await productService.updateProduct(user.uid, editingProduct, editForm);
    
    if (result.success) {
      // Edit durumunu temizle
      setEditingProduct(null);
      setEditForm({ name: '', costPrice: '', sellPrice: '', taxRate: '', stock: '' });
      return { success: true, message: 'Ürün güncellendi!' };
    } else {
      return result;
    }
  };

  // Ürün düzenleme iptal etme
  const cancelEditProduct = () => {
    console.log('Ürün düzenleme iptal edildi');
    setEditingProduct(null);
    setEditForm({ name: '', costPrice: '', sellPrice: '', taxRate: '', stock: '' });
  };

  // Hook'un döndürdüğü değerler
  return {
    // State
    products,
    sortedProducts,
    loading,
    sortType,
    
    // Forms
    newProduct,
    editingProduct,
    editForm,
    
    // Setters
    setSortType,
    setNewProduct,
    setEditForm,
    
    // Actions
    addProduct,
    toggleFavorite,
    deleteProduct,
    startEditProduct,
    saveEditProduct,
    cancelEditProduct,
    
    // Utils
    productsCount: products.length,
    lowStockProducts: products.filter(p => p.stock <= 10)
  };
};

export default useProducts;