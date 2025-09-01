// src/hooks/useAuth.js
// Bu hook tüm authentication işlemlerini yönetir

import { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signOut, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

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
      let errorMessage = 'Giriş yapılırken bir hata oluştu';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Bu e-posta adresi ile kayıtlı kullanıcı bulunamadı';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Hatalı şifre';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // ✅ Kayıt olma fonksiyonu
  const signup = async (email, password, businessName, ownerName) => {
    try {
      // Firebase Authentication ile kullanıcı oluştur
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Kullanıcı profilini Firestore'a kaydet
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        ownerName: ownerName.trim(),
        businessName: businessName.trim(),
        email: email,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      return { success: true, user: user };
    } catch (error) {
      console.error("Kayıt hatası:", error);
      let errorMessage = 'Kayıt olurken bir hata oluştu';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Bu e-posta adresi zaten kullanımda';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Şifre çok zayıf. En az 6 karakter olmalıdır';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Geçersiz e-posta adresi';
      }
      
      return { success: false, error: errorMessage };
    }
  };

  // 🆕 Profil güncelleme fonksiyonu
  const updateProfile = async (updateData) => {
    try {
      if (!user) {
        throw new Error('Kullanıcı oturumu bulunamadı');
      }

      // Şifre güncellemesi varsa önce yeniden doğrulama yap
      if (updateData.newPassword && updateData.currentPassword) {
        try {
          // Mevcut şifre ile yeniden doğrulama
          const credential = EmailAuthProvider.credential(user.email, updateData.currentPassword);
          await reauthenticateWithCredential(user, credential);
          
          // Yeni şifreyi güncelle
          await updatePassword(user, updateData.newPassword);
        } catch (error) {
          console.error('Şifre güncelleme hatası:', error);
          if (error.code === 'auth/wrong-password') {
            throw new Error('Mevcut şifre yanlış');
          } else if (error.code === 'auth/weak-password') {
            throw new Error('Yeni şifre çok zayıf. En az 6 karakter olmalıdır');
          } else {
            throw new Error('Şifre güncellenirken hata oluştu');
          }
        }
      }

      // Firestore'daki profil bilgilerini güncelle
      const userDocRef = doc(db, 'users', user.uid);
      const profileUpdateData = {
        updatedAt: new Date()
      };

      // Güncellenmesi gereken alanları ekle
      if (updateData.businessTitle !== undefined) {
        profileUpdateData.businessName = updateData.businessTitle.trim();
      }
      if (updateData.displayName !== undefined) {
        profileUpdateData.ownerName = updateData.displayName.trim();
      }

      await updateDoc(userDocRef, profileUpdateData);

      console.log('Profil başarıyla güncellendi');
      return { success: true, message: 'Profil başarıyla güncellendi!' };

    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
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
    login,
    signup,
    logout,
    updateProfile, // 🆕 Yeni eklenen fonksiyon
    isAuthenticated: !!user
  };
};

export default useAuth;
