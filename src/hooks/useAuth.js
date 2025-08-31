// src/hooks/useAuth.js
// Bu hook tüm authentication işlemlerini yönetir

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export const useAuth = () => {
  // Authentication state
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({ fullName: '', businessName: '' });
  const [loading, setLoading] = useState(true);

  // Firebase - Kullanıcı giriş/çıkış dinleyici
  useEffect(() => {
    console.log('Auth listener başlatılıyor...');
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth durumu değişti:', currentUser ? 'Giriş yapıldı' : 'Çıkış yapıldı');
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      console.log('Auth listener kapatılıyor...');
      unsubscribe();
    };
  }, []);

  // Firebase - Kullanıcı profili dinleme
  useEffect(() => {
    if (!user) {
      console.log('Kullanıcı yok, profil temizleniyor');
      setProfile({ fullName: '', businessName: '' });
      return;
    }

    console.log('Profil dinlenmeye başlanıyor:', user.uid);
    
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      const data = snapshot.data() || {};
      console.log('Profil güncellendi:', data);
      
      setProfile({
        fullName: data.ownerName || '',
        businessName: data.businessName || ''
      });
    }, (error) => {
      console.error('Profil dinleme hatası:', error);
    });

    return () => {
      console.log('Profil listener kapatılıyor...');
      unsubscribe();
    };
  }, [user]);

  // Çıkış yapma fonksiyonu
  const logout = async () => {
    console.log('Çıkış yapılıyor...');
    
    try {
      await signOut(auth);
      console.log('Çıkış başarılı');
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

  // Hook'un döndürdüğü değerler
  return {
    // State
    user,
    profile,
    loading,
    
    // Hesaplanmış değerler
    displayName,
    businessTitle,
    avatarLetter,
    
    // Fonksiyonlar
    logout,
    
    // Yardımcı
    isAuthenticated: !!user
  };
};

export default useAuth;