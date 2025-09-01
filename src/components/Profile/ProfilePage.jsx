// components/Profile/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { User, Building, Mail, Lock, Save, X, Edit3 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const ProfilePage = ({ isOpen, onClose }) => {
  const { user, profile, updateProfile } = useAuth();
  
  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    businessTitle: '',
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile && user) {
      setFormData(prev => ({
        ...prev,
        businessTitle: profile.businessName || '',
        displayName: profile.fullName || user.displayName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    }
  }, [profile, user]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear messages when user types
    if (error) setError('');
    if (success) setSuccess('');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (!formData.currentPassword) {
          throw new Error('Mevcut şifrenizi girmelisiniz');
        }
        if (formData.newPassword !== formData.confirmPassword) {
          throw new Error('Yeni şifreler eşleşmiyor');
        }
        if (formData.newPassword.length < 6) {
          throw new Error('Yeni şifre en az 6 karakter olmalıdır');
        }
      }

      // Prepare update data
      const updateData = {
        businessTitle: formData.businessTitle.trim(),
        displayName: formData.displayName.trim()
      };

      // Add password data if changing
      if (formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      // Call update function
      const result = await updateProfile(updateData);
      
      if (result.success) {
        setSuccess('Profil bilgileri başarıyla güncellendi!');
        setIsEditing(false);
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        throw new Error(result.error || 'Güncelleme başarısız');
      }
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setSuccess('');
    // Reset form data
    if (profile && user) {
      setFormData({
        businessTitle: profile.businessName || '',
        displayName: profile.fullName || user.displayName || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }
  };

  // Close modal with ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content profile-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div className="modal-title">
            <User className="modal-icon" />
            <h2>Profil Bilgileri</h2>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Kapat">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {/* Messages */}
          {error && (
            <div className="alert alert-error">
              {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form">
            {/* Business Title */}
            <div className="form-group">
              <label className="form-label">
                <Building className="form-icon" />
                İşletme Adı
              </label>
              <input
                type="text"
                name="businessTitle"
                value={formData.businessTitle}
                onChange={handleChange}
                disabled={!isEditing}
                className={`form-input ${!isEditing ? 'disabled' : ''}`}
                placeholder="İşletme adınızı girin"
                required
              />
            </div>

            {/* Display Name */}
            <div className="form-group">
              <label className="form-label">
                <User className="form-icon" />
                İşletme Sahibi Adı
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`form-input ${!isEditing ? 'disabled' : ''}`}
                placeholder="Adınızı ve soyadınızı girin"
                required
              />
            </div>

            {/* Email (read-only) */}
            <div className="form-group">
              <label className="form-label">
                <Mail className="form-icon" />
                E-posta Adresi
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="form-input disabled"
                placeholder="E-posta adresiniz"
              />
              <small className="form-help">
                E-posta adresi değiştirilemez
              </small>
            </div>

            {/* Password Change Section */}
            {isEditing && (
              <div className="password-section">
                <h3 className="section-title">Şifre Değiştir (İsteğe Bağlı)</h3>
                
                <div className="form-group">
                  <label className="form-label">
                    <Lock className="form-icon" />
                    Mevcut Şifre
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Mevcut şifrenizi girin"
                    autoComplete="current-password"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock className="form-icon" />
                    Yeni Şifre
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Yeni şifrenizi girin"
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Lock className="form-icon" />
                    Yeni Şifre Tekrar
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Yeni şifrenizi tekrar girin"
                    minLength={6}
                    autoComplete="new-password"
                  />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          {!isEditing ? (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={16} />
              Düzenle
            </button>
          ) : (
            <div className="button-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={loading}
              >
                <X size={16} />
                İptal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                <Save size={16} />
                {loading ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;