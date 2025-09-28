import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
// Removed: useNavigate (no navigation needed)
// Removed: wishlistService (no service calls needed)
import '../../styles/dashboard/wish-detail.css';
import '../../styles/common/loading.css';
import { MdClose } from 'react-icons/md'; // Only need MdClose
import Icon from '../common/Icon/Icon';

// Note: This component expects the full wish object to be passed as `wishData`
const SharedWishDetailModal = ({ wishData, isOpen, onClose }) => {
  const { t } = useTranslation();

  // State initialization is simpler as data is passed directly
  const [wish, setWish] = useState(wishData);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const modalRef = useRef(null);

  // Touch handling for swipe down to close
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;
  
  // Update local state when prop changes (e.g., when a new wish is selected)
  useEffect(() => {
    setWish(wishData);
    setIsFullscreenOpen(false); // Close fullscreen if new wish is loaded
  }, [wishData]);

  const openLink = (url) => {
    if (url) {
      let fullUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        fullUrl = 'https://' + url;
      }
      window.open(fullUrl, '_blank');
    } else {
      toast.warning(t('wish.noLinkAvailable') || 'No link available');
    }
  };

  // Handler to open the fullscreen image view
  const handleImageClick = (e) => {
    e.stopPropagation(); 
    if (wish?.imageUrl) {
        setIsFullscreenOpen(true);
    }
  };

  // Handler to close the fullscreen image view
  const closeFullscreen = (e) => {
    e.stopPropagation();
    setIsFullscreenOpen(false);
  };
  
  // Touch handling (unchanged)
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isDownSwipe) {
      onClose();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!isOpen || !wish) {
    return null;
  }

  // Fullscreen Image Preview Component
  const FullscreenImage = () => (
    <div className="fullscreen-overlay" onClick={closeFullscreen}>
      <button 
        className="fullscreen-close-btn" 
        onClick={closeFullscreen}
        aria-label="Close full screen image"
      >
        <MdClose size={32} />
      </button>
      <img src={wish.imageUrl} alt={wish.title} className="fullscreen-image" />
    </div>
  );

  return (
    <div className="modal-overlay" onClick={onClose}>
        {/* Render Fullscreen Image if state is true */}
        {isFullscreenOpen && wish?.imageUrl && <FullscreenImage />}

      <div 
        ref={modalRef}
        className="wish-detail-modal" 
        onClick={(e) => e.stopPropagation()} 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}>
        {/* Modal Content */}
        <div className="modal-content">
          <div className="wish-modal-header">
            <h1 className="subtitle1" style={{textAlign: 'center', width: '100%'}}>{wish.title}</h1>
            
            {/* NO MENU BUTTON: It's a shared/read-only view */}
          </div>
          
          {/* Removed isLoading/error checks as data is passed directly */}

          <div className="wish-detail-content">
            {/* Main wish image - clickable */}
            {wish.imageUrl && (
              <>
                <div 
                    className="wish-modal-image-container clickable-image"
                    onClick={handleImageClick}
                >
                  <img 
                    src={wish.imageUrl} 
                    alt={wish.title} 
                    className="wish-modal-image"
                  />
                </div>
                {/* Hint Text */}
                <p className="image-fullscreen-hint">
                  {t('common.tapForFullscreen') || 'Tap image for full screen'}
                </p>
              </>
            )}

            {/* Price Range */}
            <div className="price-range">
              {wish.price ? `${wish.price} ₸` : ''}
            </div>
            
            {/* Description */}
            {wish.description && (
              <div className="wish-modal-description">
                {wish.description}
              </div>
            )}
            
            {/* Link button */}
            { wish.url && (
            <button 
              className="view-link-button"
              onClick={() => openLink(wish.url || '')}
            >
              {t('wish.viewLink') || 'Сілтемеге өту'} 
              <Icon name="vector" size={16} />
            </button>
          )}
          </div>
        </div>

        {/* Removed Mobile browser bar section */}
      </div>
    </div>
  );
};

export default SharedWishDetailModal;