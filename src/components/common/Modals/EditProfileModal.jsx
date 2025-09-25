import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import userService  from '../../../services/userService';
import { uploadImage } from '../../../services/s3service';
import '../../../styles/profile/edit.css'; // Import CSS file

const EditProfileModal = ({ profile, onClose, onSave }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    username: profile.username || '',
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    await userService.updateUserProfile(formData);
    onSave();
    onClose();
    setIsSaving(false);
  };
  
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
              {/* Header background and avatar logic can be reused or simplified here */}
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
                    <label htmlFor="email">{t('editProfile.email')}</label>
                    <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} />
                </div>
                <div>
                    <label htmlFor="birthday">{t('editProfile.birthday')}</label>
                    <input type="date" id="birthday" name="birthday" value={formData.birthday} onChange={handleChange} />
                </div>
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