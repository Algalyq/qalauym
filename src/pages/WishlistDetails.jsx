import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import wishlistService from '../services/wishlistService';
import { uploadImage } from '../services/s3service';
// import LanguageSelector from '../components/common/LanguageSelector'; // Not used
// import Toast from '../components/common/Toast'; // Not used
import { MdShare, MdImage, MdClose } from 'react-icons/md';
import '../styles/dashboard/wishlist-details.css';
import '../styles/common/loading.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Icon from '../components/common/Icon/Icon';
import WishDetailModal from '../components/modals/WishDetailModal';

const WishlistDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams(); // id is the wishlistId
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [selectedWishId, setSelectedWishId] = useState(null);
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  
  // NOTE: Remove unused state related to old toast/wish adding form
  const [isAddingWish, setIsAddingWish] = useState(false);

  const fileInputRef = useRef(null);

  // --- WISH FETCHING LOGIC ---

  // 1. Create a stable function to fetch all data
  const fetchWishlistData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      // Fetch wishlist metadata (Title/Cover)
      try {
        const wishlistMetadata = await wishlistService.getWishlistMetadata(id, token);
        setWishlist(wishlistMetadata.data);
      } catch (metadataErr) {
        console.error('Error fetching wishlist metadata:', metadataErr);
      }
      
      // Fetch wishes for the wishlist
      const wishesData = await wishlistService.getWishlistById(id, token);
      
      if (wishesData && wishesData.data) {
        setWishes(wishesData.data);
      } else {
        setWishes([]);
      }
      
    } catch (err) {
      console.error('Error fetching wishlist data:', err);
      setError(t('wishlist.failedToLoadWishlist'));
    } finally {
      setIsLoading(false);
      setShowRetry(false); // Hide retry on success/final loading state
    }
  }, [id, t]);

  // 2. Call the fetch function on component mount/ID change
  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]); // Dependency on stable fetch function

  // 3. Callback function for the modal after a wish is deleted
  const handleWishDeletedAndRefresh = () => {
    // This is called by the modal after a successful delete API call
    fetchWishlistData(); // Re-fetch the entire list from the server
  };

  // --- HANDLERS ---
  
  const handleAddWish = () => {
    // You can remove setIsAddingWish(true) as it's not strictly necessary here
    navigate(`/add-wishes/${id}`);
  };

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleWishClick = (wishId) => {
    setSelectedWishId(wishId);
    setIsWishModalOpen(true);
  };

  const closeWishModal = () => {
    setIsWishModalOpen(false);
    // Reset selected wish after modal is closed with slight delay for transition
    setTimeout(() => setSelectedWishId(null), 300);
  };
  
  const handleShareWishlist = () => {
    const shareableLink = `${window.location.origin}/shared/wishlist/${id}`;
    
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        toast.success(t('wishlist.linkCopied') || 'Link copied to clipboard! 🔗');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        toast.error(t('wishlist.copyFailed') || 'Failed to copy link');
      });
  };
  
  // Add useEffect to show retry button after 2 seconds of loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        setShowRetry(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);
  
  const handleRetry = () => {
    fetchWishlistData(); // Call the fetch function again
  };
  
  // --- CONDITIONAL RENDERING ---

  if (isLoading && !wishlist) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p className="loading-text">{t('wishlist.loading')}</p>
        {showRetry && (
          <button onClick={handleRetry} className="retry-button">
            {t('wishlist.retry')}
          </button>
        )}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <p className="error-message">{error}</p>
        <button onClick={handleGoBack} className="btn-primary">
          {t('wishlist.backToDashboard')}
        </button>
      </div>
    );
  }
  
  if (!wishlist) {
    return (
      <div className="not-found-container">
        <p>{t('wishlist.notFound')}</p>
        <button onClick={handleGoBack} className="btn-primary">
          {t('wishlist.backToDashboard')}
        </button>
      </div>
    );
  }

  // --- RENDER ---
  return (
    <div className="wishlist-details-container">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
      />
      <header className="dashboard-header">
        <div className="header-container">
          <button onClick={handleGoBack} className="back-button">
            <Icon name="back" size={18} />
          </button>
          <h3 className="body1">{wishlist.title}</h3>
          <div className="header-actions" onClick={handleShareWishlist}>
            <Icon name="share" size={24} />
          </div>
        </div>
      </header>
      
      <main className="wishes-container">
        <div className="wishes-grid">
          {/* Add New Wish Card */}
          <div className="wish-card add-wish-card" onClick={handleAddWish}>
            <div className="add-wish-icon">
              <Icon name="plus" size={16} />
            </div>
            <div className="subbody3">
              {t('wishlist.addNewGift') || 'Қалауды толықтыру'}
            </div>
          </div>
          
          {/* Display Wishes */}
          {wishes.map((wish) => (
            <div key={wish.id} className="wish-item" onClick={() => handleWishClick(wish.id)}>
              <div className="wish-card">
                {wish.imageUrl ? (
                  <div 
                    className="wish-image" 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      backgroundImage: `url(${wish.imageUrl})`, 
                      backgroundSize: 'cover', 
                      backgroundPosition: 'center' 
                    }}
                  />
                ) : (
                  <div className="wish-image placeholder-image">
                    <Icon name="gift" size={32} />
                  </div>
                )}
              </div>
              <div className="subbody3">
                {wish.title}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Wish Detail Modal */}
      <WishDetailModal 
        // CORRECTED: Pass the ID string, not the object.
        wishListId={id} 
        wishId={selectedWishId}
        isOpen={isWishModalOpen}
        onClose={closeWishModal}
        // CORRECTED: Pass the refresh handler
        onWishDeleted={handleWishDeletedAndRefresh} 
      />
    </div>
  );
};

export default WishlistDetails;