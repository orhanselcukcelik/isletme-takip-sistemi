// src/components/Auth/AuthPage.js
import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, UserPlus, Building, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    businessName: '',
    ownerName: ''
  });

  const { login, signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        // Kayıt için form validasyonu
        if (!formData.businessName.trim()) {
          throw new Error('İşletme adı zorunludur.');
        }
        if (!formData.ownerName.trim()) {
          throw new Error('Sahip adı zorunludur.');
        }
        result = await signup(
          formData.email, 
          formData.password, 
          formData.businessName.trim(), 
          formData.ownerName.trim()
        );
      }

      // Eğer işlem başarısız olduysa hata mesajını göster
      if (!result.success) {
        setError(result.error);
      }
      // Başarılı olursa useAuth hook'u otomatik olarak kullanıcıyı yönlendirecek
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Building size={32} />
          </div>
          <h1 className="auth-title">İşletme Takip Sistemi</h1>
          <p className="auth-subtitle">
            {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
          </p>
        </div>

        {error && (
          <div className="auth-error">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="form-group">
                <div className="input-wrapper">
                  <Building className="input-icon" size={20} />
                  <input
                    type="text"
                    name="businessName"
                    placeholder="İşletme Adı"
                    value={formData.businessName}
                    onChange={handleInputChange}
                    className="auth-input"
                    required={!isLogin}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="input-wrapper">
                  <User className="input-icon" size={20} />
                  <input
                    type="text"
                    name="ownerName"
                    placeholder="Sahip Adı Soyadı"
                    value={formData.ownerName}
                    onChange={handleInputChange}
                    className="auth-input"
                    required={!isLogin}
                  />
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <div className="input-wrapper">
              <Mail className="input-icon" size={20} />
              <input
                type="email"
                name="email"
                placeholder="E-posta Adresi"
                value={formData.email}
                onChange={handleInputChange}
                className="auth-input"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Şifre"
                value={formData.password}
                onChange={handleInputChange}
                className="auth-input"
                required
                minLength={6}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                {isLogin ? <LogIn className="btn-icon" /> : <UserPlus className="btn-icon" />}
                {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
              </>
            )}
          </button>
        </form>

        <div className="auth-switch">
          <p>
            {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
            <button
              type="button"
              className="switch-btn"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setFormData({ email: '', password: '', businessName: '', ownerName: '' });
              }}
            >
              {isLogin ? 'Kayıt Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;