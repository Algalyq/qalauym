import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../../styles/common/buttons.css';
import '../../../styles/common/typography.css';

const CreateWishlistModal = ({
  isOpen,
  onClose,
  newWishlist,
  onInputChange,
  onSubmit
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Call the onSubmit handler with the current newWishlist data
    console.log('Submitting form with data:', newWishlist);
    onSubmit(newWishlist);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    onInputChange({
      target: {
        name,
        value
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="subtitle1">{t('dashboard.createNewWishlist')}</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              name="title"
              value={newWishlist.title || ''}
              onChange={handleInputChange}
              placeholder={t('dashboard.wishlistTitlePlaceholder')}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <textarea
              name="description"
              value={newWishlist.description || ''}
              onChange={handleInputChange}
              placeholder={t('dashboard.wishlistDescriptionPlaceholder')}
              className="form-textarea"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <select
              name="visibility"
              value={newWishlist.visibility || 'PUBLIC'}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="PUBLIC">{t('dashboard.public')}</option>
              <option value="PRIVATE">{t('dashboard.private')}</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {t('common.creating')}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWishlistModal;
