import React, { useState, useRef, useEffect,useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import userService  from '../../../services/userService';
import { uploadImage } from '../../../services/s3service';
import '../../../styles/profile/edit.css'; 


const getRandomColorClass = (username) => {
  if (!username) return 'gray';
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['rose', 'blue', 'green', 'purple', 'yellow'];
  return colors[Math.abs(hash) % colors.length];
};


const EditProfileModal = ({ profile, onClose, onSave }) => {

  const formatPhoneNumber = (value) => {
    if (!value) return '';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 0) return '';
    
    const numberPart = (digits.startsWith('7') || digits.startsWith('8')) 
      ? digits.substring(1) 
      : digits;
  
    const truncated = numberPart.substring(0, 10);
    let formatted = '+7 (';
    if (truncated.length > 0) formatted += truncated.substring(0, 3);
    if (truncated.length >= 4) formatted += ') ' + truncated.substring(3, 6);
    if (truncated.length >= 7) formatted += ' ' + truncated.substring(6, 8);
    if (truncated.length >= 9) formatted += ' ' + truncated.substring(8, 10);
    
    return formatted;
  };

  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    username: profile.username || '',
    phone: formatPhoneNumber(profile.phone || ''),
    email: profile.email || '',
    birthday: profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : '',
    avatarUrl: profile.avatarUrl || '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef(null);



  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const result = await uploadImage({ file }, 'ava');
      setFormData(prev => ({ ...prev, avatarUrl: result.url }));
    }
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData(prev => ({ ...prev, phone: formatted }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    const submissionData = {
      ...formData,
      phone: `+${formData.phone.replace(/\D/g, '')}`,
    };

    await userService.updateUserProfile(submissionData);
    onSave(submissionData); // Pass updated data back
    setIsSaving(false);
    onClose();
  };

  const avatarBgColorClass = useMemo(() => formData?.username ? getRandomColorClass(formData.username) : 'gray', [formData?.username]);
  const showTextAvatar = !formData.avatarUrl;

  
  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h4>{t('editProfile.title')}</h4>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="modalBody">
          <form onSubmit={handleSubmit} className="form">
          <div className="formHeader">
              <div className="avatarWrapper">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} style={{ display: 'none' }} id="avatar-upload" />
                  
                  {showTextAvatar ? (
                    <div className={`avatarFallback ${avatarBgColorClass}`}>
                      {formData.username ? formData.username.charAt(0) : '?'}
                    </div>
                  ) : (
                    <img src={formData.avatarUrl} alt="User Avatar" className="avatarImage" />
                  )}

                  <label htmlFor="avatar-upload" className="cameraIconLabel">
                    <svg width="12" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                      <circle cx="12" cy="13" r="3"></circle>
                    </svg>
                  </label>
              </div>
            </div>
            <div className="formFields">
                <div>
                    <label htmlFor="firstName">{t('editProfile.firstName')}</label>
                    <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="lastName">{t('editProfile.lastName')}</label>
                    <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="username">{t('editProfile.username')}</label>
                    <input type="text" id="username" name="username" value={formData.username} onChange={handleChange} />
                </div>
                <div>
                  <label htmlFor="phone">{t('editProfile.phone')}</label>
                      {/* 2. Replace the standard input with InputMask */}
                      <input 
                      type="tel" 
                      id="phone" 
                      name="phone" 
                      value={formData.phone} 
                      onChange={handlePhoneChange} 
                      placeholder="+7 (___) ___ __ __"
                    />
                </div>
                {/* <div>
                    <label htmlFor="email">{t('editProfile.email')}</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                </div> */}
                {/* <div>
                    <label htmlFor="birthday">{t('editProfile.birthday')}</label>
                    <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} />
                </div> */}
            </div>
             <div className="modalFooter">
                <button type="submit" className="saveButton" disabled={isSaving}>
                    {isSaving ? t('editProfile.saving') : t('editProfile.saveChanges')}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;