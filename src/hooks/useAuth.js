// src/hooks/useAuth.js
// Bu hook tüm authentication işlemlerini yönetir

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const useAuth = () => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ fullName: '', businessName: '' });
  const [loading, setLoading] = useState(true);

  // Firebase - Kullanıcı giriş/çıkış dinleyici
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Firebase - Kullanıcı profili dinleme
  useEffect(() => {
    if (!user) {
      setProfile({ fullName: '', businessName: '' });
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      const data = snapshot.data() || {};
      setProfile({
        fullName: data.ownerName || '',
        businessName: data.businessName || ''
      });
    });

    return () => unsubscribe();
  }, [user]);

  // ✅ Giriş yapma fonksiyonu
  const login = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Giriş hatası:", error);
      return { success: false, error: error.message };
    }
  };

  // Çıkış yapma fonksiyonu
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true, message: 'Çıkış yapıldı!' };
    } catch (error) {
      console.error('Çıkış hatası:', error);
      return { success: false, error: error.message };
    }
  };

  // Kullanıcı bilgileri hesaplama
  const displayName = profile.fullName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Kullanıcı');
  const businessTitle = profile.businessName || 'İşletme Sistemi';
  const avatarLetter = (displayName?.trim()?.[0] || 'U').toUpperCase();

  return {
    user,
    profile,
    loading,
    displayName,
    businessTitle,
    avatarLetter,
    // Fonksiyonlar
    login,   // 👈 artık burada var
    logout,
    isAuthenticated: !!user
  };
};

export default useAuth;
