import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import wishlistService from '../services/wishlistService';
import { uploadImage } from '../services/s3service';
import LanguageSelector from '../components/common/LanguageSelector';
import Toast from '../components/common/Toast';
import { MdShare, MdImage, MdClose } from 'react-icons/md';
import '../styles/dashboard/wishlist-details.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Icon from '../components/common/Icon/Icon';


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
      // if (!currentUser || !currentUser.token) {
      //   navigate('/auth');
      //   return;
      // }
      
      try {
        setIsLoading(true);
        
        // First, fetch wishlist metadata (we'll need to add this API endpoint)
        try {
          console.log(currentUser);
          // If you have a separate endpoint for wishlist details, uncomment below
          const wishlistMetadata = await wishlistService.getWishlistMetadata(id, localStorage.getItem('token'));
          console.log("Wishlist metadata:", wishlistMetadata.data)
          setWishlist(wishlistMetadata.data);
          
        } catch (metadataErr) {
          console.error('Error fetching wishlist metadata:', metadataErr);
          // Continue execution to fetch wishes
        }
        
        // Fetch wishes for the wishlist
        const wishesData = await wishlistService.getWishlistById(id, localStorage.getItem('token'));
        
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
      const result = await uploadImage({ file }, 'wish');
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
  
  // Navigate to the AddWishes page
  const handleAddWish = () => {
    navigate(`/addwishes/${id}`);
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
          <div className="wish-card add-wish-card" onClick={() => handleAddWish(wishlist.id)}>
            <div className="add-wish-icon">
              <Icon name="plus" size={16} />
            </div>
            <div className="caption-medium">
              {t('wishlist.addNewGift') || 'Қалауды толықтыру'}
            </div>
          </div>
          
          {/* Display Wishes */}
          {wishes.map((wish) => (
            <div>
              <div key={wish.id} className="wish-card">
                {wish.imageUrl ? (
                  <div className="wish-image" style={{ width: '100%', height: '100%', backgroundImage: `url(${wish.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                
                  </div>
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
    </div>
  );
};

export default WishlistDetails;
