import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import wishlistService from '../services/wishlistService';
// import { uploadImage } from '../services/s3service';
import LanguageSelector from '../components/common/LanguageSelector';
import Toast from '../components/common/Toast';
import { MdShare, MdImage, MdClose } from 'react-icons/md';
import '../styles/dashboard/wishlist-details.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const WishlistDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRetry, setShowRetry] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [newWish, setNewWish] = useState({
    wishListId: id,
    title: '',
    description: '',
    url: '',
    imageUrl: ''
  });
  const [selectedImage, setSelectedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isAddingWish, setIsAddingWish] = useState(false);

  // Fetch wishlist details and wishes
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.data.accessToken) {
        navigate('/auth');
        return;
      }
      
      try {
        setIsLoading(true);
        
        // First, fetch wishlist metadata (we'll need to add this API endpoint)
        try {
          // If you have a separate endpoint for wishlist details, uncomment below
          const wishlistMetadata = await wishlistService.getWishlistMetadata(id, currentUser.data.accessToken);
          console.log("Wishlist metadata:", wishlistMetadata.data)
          setWishlist(wishlistMetadata.data);
          
        } catch (metadataErr) {
          console.error('Error fetching wishlist metadata:', metadataErr);
          // Continue execution to fetch wishes
        }
        
        // Fetch wishes for the wishlist
        const wishesData = await wishlistService.getWishlistById(id, currentUser.data.accessToken);
        
        // Check if the response has the expected structure
        if (wishesData && wishesData.data) {
          console.log('Wishes data:', wishesData.data);
          setWishes(wishesData.data); // This now correctly contains the array of wishes
        } else {
          // If no wishes in response, set empty array
          setWishes([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching wishlist data:', err);
        setError(t('wishlist.failedToLoadWishlist'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id, currentUser, navigate, t]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWish(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      toast.error(t('wishlist.invalidImageType') || 'Please select a valid image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('wishlist.imageTooLarge') || 'Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setIsUploading(true);

    try {
      // const result = await uploadImage({ file }, 'wish');
      setNewWish(prev => ({
        ...prev,
        imageUrl: result.url
      }));
      toast.success(t('wishlist.imageUploaded') || 'Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('wishlist.uploadFailed') || 'Failed to upload image');
      setSelectedImage(null);
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setNewWish(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };
  
  const handleAddWish = async (e) => {
    e.preventDefault();
    
    if (!newWish.title.trim()) {
      toast.error(t('wishlist.titleRequired') || 'Title is required');
      return;
    }
    
    if (isUploading) {
      toast.warning(t('wishlist.uploadInProgress') || 'Please wait for image upload to complete');
      return;
    }
    
    try {
      const createdWish = await wishlistService.addWishToWishlist(newWish, currentUser.data.accessToken);
      
      // Add the new wish to the list
      if (createdWish && createdWish.data) {
        setWishes(prevWishes => [...prevWishes, createdWish.data]);
      }

      // Reset the form
      setNewWish({
        wishListId: id,
        title: '',
        description: '',
        url: '',
        imageUrl: ''
      });
      setIsAddingWish(false);
      
      // Refresh the wish list after adding a new wish
      const refreshedWishesData = await wishlistService.getWishlistById(id, currentUser.data.accessToken);
      if (refreshedWishesData && refreshedWishesData.data) {
        setWishes(refreshedWishesData.data);
      }
    } catch (err) {
      console.error('Failed to add wish:', err);
      setError(t('wishlist.failedToAddWish'));
    }
  };
  
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  const handleShareWishlist = () => {
    // Generate the shareable link for the wishlist

    const shareableLink = `${window.location.origin}/shared/wishlist/${id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareableLink)
      .then(() => {
        toast.success(t('wishlist.linkCopied') || 'Link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy link:', err);
        toast.error(t('wishlist.copyFailed') || 'Failed to copy link');

      });
  };
  
  const handleCloseToast = () => {
    setShowToast(false);
  };
  
  // Add useEffect to show retry button after 2 seconds of loading
  useEffect(() => {
    // If still loading after 2 seconds, show retry button
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
  
  // Conditional rendering based on component state
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>{t('wishlist.loading')}</p>
        {showRetry && (
          <button onClick={handleRetry} className="btn-primary">
            {t('wishlist.retry')}
          </button>
        )}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="error-container">
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
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7"></path>
            </svg>
          </button>
          <h1 className="wishlist-title">{wishlist.title}</h1>
          <div className="header-actions">
            <LanguageSelector />
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <div className="wishlist-info">
          <div className="wishlist-header-actions">
            <span className={`visibility-badge ${wishlist.visibility.toLowerCase()}`}>
              {wishlist.visibility === 'PUBLIC' ? t('wishlist.public') : t('wishlist.private')}
            </span>
            
            {/* Share button - only enabled for PUBLIC wishlists */}
            {wishlist.visibility === 'PUBLIC' && (
              <div className="share-button-container">
              <button 
                onClick={handleShareWishlist} 
                className="share-button"
                aria-label="Share wishlist"
              >
                {t('wishlist.share') || 'Share'}
                <MdShare size={18} /> {/* Adjusted icon size for balance */}
              </button>
            </div>
            )}
          </div>
          
          {wishlist.description && (
            <p className="wishlist-description">{wishlist.description}</p>
          )}
          <p className="wishlist-date">
            {t('wishlist.created')}: {new Date(wishlist.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <section className="section-wishlist">
          {isAddingWish ? (
            <div className="card">
              <h2 className="card-title">{t('wishlist.addNewGift')}</h2>
              <form onSubmit={handleAddWish}>
              
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    {t('wishlist.giftTitle')}*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newWish.title}
                    onChange={handleInputChange}
                    className="form-input-wish"
                    placeholder={t('wishlist.giftTitlePlaceholder')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    {t('wishlist.description')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newWish.description}
                    onChange={handleInputChange}
                    className="form-input-wish form-textarea"
                    placeholder={t('wishlist.giftDescriptionPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    {t('wishlist.image')}
                  </label>
                  <div className="image-upload-container">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageChange}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    {selectedImage ? (
                      <div className="image-preview">
                        <img 
                          src={URL.createObjectURL(selectedImage)} 
                          alt="Preview" 
                          className="preview-image"
                        />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={removeImage}
                          disabled={isUploading}
                        >
                          <MdClose size={20} />
                        </button>
                        {isUploading && (
                          <div className="upload-progress">
                            {t('wishlist.uploading') || 'Uploading...'}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div 
                        className="image-upload-placeholder"
                        onClick={triggerFileInput}
                      >
                        <MdImage size={32} className="upload-icon" />
                        <span>{t('wishlist.uploadImage') || 'Upload an image'}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="url" className="form-label">
                    {t('wishlist.url')}
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={newWish.url}
                    onChange={handleInputChange}
                    className="form-input-wish"
                    placeholder={t('wishlist.urlPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="imageUrl" className="form-label">
                    {t('wishlist.imageUrl')}
                  </label>
                  <input
                    type="url"
                    id="imageUrl"
                    name="imageUrl"
                    value={newWish.imageUrl}
                    onChange={handleInputChange}
                    className="form-input-wish"
                    placeholder={t('wishlist.imageUrlPlaceholder')}
                  />
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="btn-primary">
                    {t('wishlist.addGift')}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setIsAddingWish(false)}
                  >
                    {t('wishlist.cancel')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingWish(true)} 
              className="add-wish-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>{t('wishlist.addNewGift')}</span>
            </button>
          )}
        </section>
        
        <section className="gifts-section">
          <h2 className="section-title">{t('wishlist.gifts')}</h2>
          {wishes.length === 0 ? (
            <div className="empty-list">
              <p className="empty-message">{t('wishlist.noGiftsYet')}</p>
            </div>
          ) : (
            <div className="gifts-grid">
              {wishes.map((wish) => (
                <div key={wish.id} className="gift-item">
                  {wish.imageUrl && (
                    <div className="gift-image">
                      <img src={wish.imageUrl} alt={wish.title} />
                    </div>
                  )}
                  <div className="gift-content">
                    <h3 className="gift-title">{wish.title}</h3>
                    {wish.description && (
                      <p className="gift-description">{wish.description}</p>
                    )}
                    {wish.url && (
                      <div className="gift-link">
                        <a 
                          href={wish.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link"
                        >
                          {t('wishlist.viewItem')}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default WishlistDetails;
