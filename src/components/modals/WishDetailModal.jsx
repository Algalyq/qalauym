import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import wishlistService from '../../services/wishlistService';
import '../../styles/dashboard/wish-detail.css';
import '../../styles/common/loading.css';
import { MdMoreVert, MdDelete, MdEdit, MdClose } from 'react-icons/md'; // Added MdClose for the fullscreen exit button
import Icon from '../common/Icon/Icon';

const WishDetailModal = ({ wishListId, wishId, isOpen, onClose, onWishDeleted }) => {
  const { t } = useTranslation();

  const [wish, setWish] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  // NEW STATE: Tracks if the fullscreen image preview is open
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);

  // Existing states for menu and touch handling
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  useEffect(() => {
    if (isOpen && wishId) {
      fetchWishDetail();
      setIsMenuOpen(false); 
      // Ensure fullscreen is closed when modal opens
      setIsFullscreenOpen(false); 
    }
  }, [wishId, isOpen]);

  // Handler to close the menu when clicking outside (unchanged)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen && isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isOpen]);


  const fetchWishDetail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await wishlistService.getWishDetail(wishId, token);
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
    // Prevent the click from propagating and closing the menu/modal unnecessarily
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


  // Toggle menu visibility (unchanged)
  const toggleMenu = (e) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };
  
  // Handler for Edit button (unchanged)
  const handleEditWish = () => {
    setIsMenuOpen(false); 
    onClose(); // Close the detail modal before navigating
    navigate(`/wishlist/${wishListId}/edit-wish/${wishId}`);
  };
  
  // Handler for Delete button (unchanged, but added toasts back)
  const handleDeleteWish = async () => { 
    setIsMenuOpen(false);
    
    try {
        const token = localStorage.getItem('token');
        await wishlistService.deleteWish(wishId, token); 
        
        if (onWishDeleted) {
            onWishDeleted(); 
        }
        onClose();
        toast.error(t('wish.deleted') || 'Wish deleted successfully!');
    } catch (error) {
        console.error('Error deleting wish:', error);
        toast.error(t('wish.deleteError') || 'Failed to delete wish.');
    }
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

  if (!isOpen) {
    return null;
  }

  // Component for the dropdown menu (unchanged)
  const MenuDropdown = () => (
    <div className="wish-menu-dropdown">
      <button onClick={handleEditWish} className="menu-item edit-item">
        <MdEdit size={18} className="menu-icon" />
        <span className="menu-text">{t('common.edit') || 'Edit'}</span>
      </button>
      <button onClick={handleDeleteWish} className="menu-item delete-item">
        <MdDelete size={18} className="menu-icon" />
        <span className="menu-text">{t('common.delete') || 'Delete'}</span>
      </button>
    </div>
  );

  // NEW: Fullscreen Image Preview Component
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
        // Important: Stop propagation here to prevent modal close when clicking inside, 
        // especially when the fullscreen overlay is not open.
        onClick={(e) => e.stopPropagation()} 
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}>
        {/* Modal Content */}
        <div className="modal-content">
          <div className="wish-modal-header">
            <h1 className="subtitle1" style={{textAlign: 'center', width: '100%'}}>{wish?.title}</h1>
            
            {/* Menu Button and Dropdown Container */}
            <div className="menu-container" ref={menuRef}>
              <button 
                className="menu-button" 
                aria-label="Menu"
                onClick={toggleMenu}
              >
                <MdMoreVert size={24} />
              </button>
              {isMenuOpen && <MenuDropdown />}
            </div>
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
    {/* Main wish image - clickable */}
    {wish.imageUrl && (
      <> {/* Use a Fragment to group image and hint */}
        <div 
            className="wish-modal-image-container clickable-image"
            onClick={handleImageClick} // NEW: Handler to open fullscreen
        >
          <img 
            src={wish.imageUrl} 
            alt={wish.title} 
            className="wish-modal-image"
          />
        </div>
        {/* NEW: Hint Text */}
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
)}

        </div>
      </div>
    </div>
  );
};

export default WishDetailModal;