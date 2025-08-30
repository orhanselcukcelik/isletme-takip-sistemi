// hooks/useAuth.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc
} from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Kullanıcı girişi
  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Kullanıcı profilini Firestore'dan al
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
      if (userDoc.exists()) {
        setUserProfile(userDoc.data());
      }
      
      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Giriş yapılırken hata oluştu: ' + error.message);
    }
  };

  // Kullanıcı kaydı
  const signup = async (email, password, businessName, ownerName) => {
    try {
      // Firebase Authentication ile kullanıcı oluştur
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Kullanıcı profilini Firestore'a kaydet
      const userProfile = {
        uid: user.uid,
        email: user.email,
        businessName: businessName,
        ownerName: ownerName,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);
      setUserProfile(userProfile);

      // Başlangıç ürünlerini ekle (isteğe bağlı)
      const defaultProducts = [
        {
          name: 'Döner',
          costPrice: 15,
          sellPrice: 25,
          taxRate: 18,
          stock: 50,
          isFavorite: false,
          createdAt: new Date()
        },
        {
          name: 'Lahmacun',
          costPrice: 8,
          sellPrice: 15,
          taxRate: 18,
          stock: 30,
          isFavorite: false,
          createdAt: new Date()
        },
        {
          name: 'Ayran',
          costPrice: 2,
          sellPrice: 5,
          taxRate: 8,
          stock: 100,
          isFavorite: false,
          createdAt: new Date()
        }
      ];

      // Her bir ürünü Firestore'a ekle
      for (const product of defaultProducts) {
        await setDoc(doc(db, 'users', user.uid, 'products', Date.now() + Math.random()), product);
      }

      return userCredential;
    } catch (error) {
      console.error('Signup error:', error);
      
      // Firebase hata mesajlarını Türkçe'ye çevir
      let errorMessage = 'Kayıt olurken hata oluştu: ';
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Bu e-posta adresi zaten kullanılıyor.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalı.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Geçersiz e-posta adresi.';
          break;
        default:
          errorMessage += error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  // Çıkış yap
  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw new Error('Çıkış yapılırken hata oluştu.');
    }
  };

  // Kullanıcı durumunu dinle
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Kullanıcı girişli ise profilini al
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};