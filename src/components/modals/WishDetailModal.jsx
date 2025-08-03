import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import wishlistService from '../../services/wishlistService';
import '../../styles/dashboard/wish-detail.css';
import '../../styles/common/loading.css';
import { MdMoreVert } from 'react-icons/md';
import Icon from '../common/Icon/Icon';

const WishDetailModal = ({ wishId, isOpen, onClose }) => {
  const { t } = useTranslation();
  
  const [wish, setWish] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  
  // Touch handling for swipe down to close
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  // Minimum required distance between touchStart and touchEnd to be detected as swipe
  const minSwipeDistance = 50;

  useEffect(() => {
    if (isOpen && wishId) {
      fetchWishDetail();
    }
  }, [wishId, isOpen]);

  const fetchWishDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await wishlistService.getWishDetail(wishId, token);
      
      console.log('Wish detail response:', response);
      // Make sure we're accessing the data property from the response
      setWish(response.data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching wish detail:', err);
      setError(t('wish.loadError') || 'Failed to load wish details');
      setIsLoading(false);
    }
  };

  const openLink = (url) => {
    if (url) {
      // Add http if missing
      let fullUrl = url;
      if (!/^https?:\/\//i.test(url)) {
        fullUrl = 'https://' + url;
      }
      window.open(fullUrl, '_blank');
    } else {
      toast.warning(t('wish.noLinkAvailable') || 'No link available');
    }
  };

  // Handle touch start event
  const handleTouchStart = (e) => {
    setTouchEnd(null); // Reset touchEnd
    setTouchStart(e.targetTouches[0].clientY);
  };

  // Handle touch move event
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  // Handle touch end event
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -minSwipeDistance;
    
    if (isDownSwipe) {
      console.log('Swipe down detected, closing modal');
      onClose();
    }
    
    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        ref={modalRef}
        className="wish-detail-modal" 
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}>
        {/* Simple header with title and menu icon */}


        {/* Modal Content */}
        <div className="modal-content">
        <div className="wish-modal-header">
        <h1 className="subtitle1" style={{textAlign: 'center', width: '100%'}}>{wish?.title}</h1>
          <button className="menu-button" aria-label="Menu">
            <MdMoreVert size={24} />
          </button>
        </div>
          {isLoading && (
            <div className="modal-loading">
              <div className="spinner"></div>
              <p className="loading-text">{t('wish.loading') || 'Loading wish details...'}</p>
            </div>
          )}

          {error && (
            <div className="modal-error">
              <div className="error-icon">⚠️</div>
              <p className="error-message">{error}</p>
            </div>
          )}

          {!isLoading && !error && wish && (
            <div className="wish-detail-content">
              {/* Main wish image - centered square */}
              {wish.imageUrl && (
                <div className="wish-modal-image-container">
                  <img 
                    src={wish.imageUrl} 
                    alt={wish.title} 
                    className="wish-modal-image"
                  />
                </div>
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
              <button 
                className="view-link-button"
                onClick={() => openLink(wish.url || '')}
              >
                {t('wish.viewLink') || 'Сілтемеге өту'} 
                <Icon name="vector" size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Mobile browser bar */}
        {!isLoading && !error && wish?.link && (
          <div className="mobile-browser-bar">
            <div className="url-display">
              {wish.link}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishDetailModal;
