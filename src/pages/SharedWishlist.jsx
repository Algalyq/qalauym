import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// NOTE: Removed useAuth as this is a public/shared view
import wishlistService from '../services/wishlistService';
// NOTE: Removed unused imports related to editing/uploading
import { MdClose } from 'react-icons/md'; 
import '../styles/dashboard/wishlist-details.css';
import '../styles/common/loading.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Icon from '../components/common/Icon/Icon';
import SharedWishDetailModal from '../components/modals/SharedWishDetailModal';

const SharedWishlist = () => {
  const { t } = useTranslation();
  const { id } = useParams(); // id is the wishlistId
  const navigate = useNavigate();
  
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [selectedWishId, setSelectedWishId] = useState(null);
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);
  
  // --- WISH FETCHING LOGIC (Using public service method from old code) ---

  const fetchWishlistData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Use the service method designed for public access (no token required)
      // Assuming wishlistService.getSharedWishlist(id) exists and returns { wishlist, wishes }
      const response = await wishlistService.getSharedWishlist(id);
      
      if (response && response.data) {
        // Assume the response structure is { data: { wishlist: {..}, wishes: [..] } }
        setWishlist(response.data.wishlist || {});
        setWishes(response.data.wishes || []);
      } else {
         setError(t('wishlist.failedToLoadWishlist') || 'Failed to load this shared wishlist.');
      }
      
    } catch (err) {
      console.error('Error fetching shared wishlist data:', err);
      setError(t('wishlist.notAvailablePublic') || 'This wishlist is not available or has been set to private.');
    } finally {
      setIsLoading(false);
      setShowRetry(false); 
    }
  }, [id, t]);

  // Call the fetch function on component mount/ID change
  useEffect(() => {
    fetchWishlistData();
  }, [fetchWishlistData]); 

  // --- HANDLERS (Read-Only) ---
  
  // Removed handleAddWish
  // Removed handleShareWishlist
  // Removed handleWishDeletedAndRefresh

  const handleGoBack = () => {
    // Navigate to the app's root/landing page for shared view
    navigate('/'); 
  };

  const handleWishClick = (wishId) => {
    setSelectedWishId(wishId);
    setIsWishModalOpen(true);
  };

  const closeWishModal = () => {
    setIsWishModalOpen(false);
    setTimeout(() => setSelectedWishId(null), 300);
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
  
  // --- CONDITIONAL RENDERING (Using design component's structure) ---

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
          {t('wishlist.backToHome') || 'Go to Home'}
        </button>
      </div>
    );
  }
  
  if (!wishlist) {
    return (
      <div className="not-found-container">
        <p>{t('wishlist.notFound')}</p>
        <button onClick={handleGoBack} className="btn-primary">
          {t('wishlist.backToHome') || 'Go to Home'}
        </button>
      </div>
    );
  }

  // --- RENDER (Using design component's JSX structure) ---
  return (
    <div className="wishlist-details-container shared-view">
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
          <h3 className="body1">{wishlist.title}</h3>
        </div>
      </header>
      
      <main className="wishes-container">
        {wishlist?.description && (
            <div className="shared-description-box">
                <p className="subbody2 text-center text-gray-600">
                    {wishlist.description}
                </p>
            </div>
        )}

        <div className="wishes-grid">
          {/* Removed Add New Wish Card */}
          
          {/* Display Wishes */}
          {wishes.length > 0 ? (
            wishes.map((wish) => (
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
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 text-lg">
                {t('wishlist.noWishesShared') || 'This wishlist is currently empty.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Wish Detail Modal */}
      <SharedWishDetailModal 
        wishData={wishes.find(wish => wish.id === selectedWishId)}
        isOpen={isWishModalOpen}
        onClose={closeWishModal}
      />
    </div>
  );
};

export default SharedWishlist;