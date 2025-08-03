import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { wishlistService } from '../services/api';
import '../styles/dashboard/wish-detail.css';
import '../styles/common/loading.css';
import Icon from '../components/common/Icon/Icon';

const WishDetail = () => {
  const { wishId } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [wish, setWish] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRetry, setShowRetry] = useState(false);

  useEffect(() => {
    const fetchWishDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const token = localStorage.getItem('token');
        const response = await wishlistService.getWishDetail(wishId, token);
        
        setWish(response);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching wish detail:', err);
        setError(t('wish.loadError') || 'Failed to load wish details');
        setIsLoading(false);
      }
    };

    fetchWishDetail();
  }, [wishId, t]);

  // Handle loading timeout for retry button
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowRetry(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoBack = () => {
    navigate(-1);
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

  // Loading state
  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">{t('wish.loading') || 'Loading wish details...'}</p>
        {showRetry && (
          <button onClick={handleRetry} className="retry-button">
            {t('wishlist.retry') || 'Retry'}
          </button>
        )}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button onClick={handleGoBack} className="btn-primary">
          {t('wish.back') || 'Go Back'}
        </button>
      </div>
    );
  }

  // No wish found
  if (!wish) {
    return (
      <div className="error-container">
        <p className="error-message">{t('wish.notFound') || 'Wish not found'}</p>
        <button onClick={handleGoBack} className="btn-primary">
          {t('wish.back') || 'Go Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="wish-detail-container">
      {/* Header with back button and share */}


      {/* Wish detail content */}
      <div className="wish-detail-content">

      <h1 className="wish-detail-title">{wish.wishlistTitle || 'WISH DETAILS'}</h1>
     
        {/* Main wish image */}
        <div className="wish-detail-image">
          {wish.imageUrl ? (
            <img src={wish.imageUrl} alt={wish.title} />
          ) : (
            <div className="no-image-placeholder">
              <Icon name="noImage" size={48} />
              <span>{t('wish.noImage') || 'No image available'}</span>
            </div>
          )}
        </div>

        {/* Wish information */}
        <div className="wish-detail-info">
          <h2 className="wish-name">{wish.title}</h2>
          
          {wish.price && (
            <div className="wish-price">
              {wish.price} {wish.currency || '₸'}
            </div>
          )}
          
          {wish.description && (
            <div className="wish-description">
              {wish.description}
            </div>
          )}
          
          {wish.link && (
            <button 
              className="view-link-button"
              onClick={() => openLink(wish.link)}
            >
              {t('wish.viewLink') || 'Site link'} <Icon name="externalLink" size={16} />
            </button>
          )}
        </div>
      </div>
      
      <ToastContainer position="bottom-center" autoClose={3000} />
    </div>
  );
};

export default WishDetail;
