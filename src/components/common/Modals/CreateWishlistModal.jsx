import React, { memo, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import '../../../styles/common/buttons.css';
import '../../../styles/common/typography.css';

const CreateWishlistModal = memo(({
  isOpen,
  onClose,
  newWishlist,
  onInputChange,
  onSubmit
}) => {
  const { t } = useTranslation();

  // Memoized translations
  const translations = useMemo(() => ({
    createNewWishlist: t('dashboard.createNewWishlist'),
    wishlistTitlePlaceholder: t('dashboard.wishlistTitlePlaceholder'),
    wishlistDescriptionPlaceholder: t('dashboard.wishlistDescriptionPlaceholder'),
    public: t('dashboard.public'),
    private: t('dashboard.private'),
    creating: t('common.creating'),
    cancel: t('common.cancel')
  }), [t]);

  // Memoized handlers
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(newWishlist);
  }, [onSubmit, newWishlist]);

  const handleFormChange = useCallback((e) => {
    const { name, value } = e.target;
    onInputChange({ target: { name, value } });
  }, [onInputChange]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2 className="subtitle1">{translations.createNewWishlist}</h2>
        
        <form onSubmit={handleSubmit} onChange={handleFormChange}>
          <div className="form-group">
            <input
              type="text"
              name="title"
              value={newWishlist.title || ''}
              placeholder={translations.wishlistTitlePlaceholder}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-group">
            <textarea
              name="description"
              value={newWishlist.description || ''}
              placeholder={translations.wishlistDescriptionPlaceholder}
              className="form-textarea"
              rows="3"
            />
          </div>
          
          <div className="form-group">
            <select
              name="visibility"
              value={newWishlist.visibility || 'PUBLIC'}
              className="form-select"
            >
              <option value="PUBLIC">{translations.public}</option>
              <option value="PRIVATE">{translations.private}</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {translations.creating}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="btn-secondary"
            >
              {translations.cancel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

CreateWishlistModal.displayName = 'CreateWishlistModal';

export default CreateWishlistModal;