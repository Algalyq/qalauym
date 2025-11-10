import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdClose } from 'react-icons/md';
import { uploadImage } from '../services/s3service';
import wishlistService from '../services/wishlistService';
import Icon from '../components/common/Icon/Icon';
import '../styles/dashboard/wishlist-details.css';
import '../styles/dashboard/add-wishes.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import addWishes from '../assets/icons/add_img_wishes.svg';
import collageService from '../services/collageService';

// Memoized file validation function
const validateFile = (file, t) => {
  if (!file.type.startsWith('image/')) {
    toast.error(t('wishlist.invalidImageType') || 'Please select a valid image file');
    return false;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error(t('wishlist.imageTooLarge') || 'Image size should be less than 5MB');
    return false;
  }

  return true;
};

// Memoized image upload handler
const useImageUpload = (t) => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadWishImage = useCallback(async (file, onSuccess) => {
    if (!validateFile(file, t)) return false;

    setIsUploading(true);
    try {
      const result = await uploadImage({ file }, 'wish');
      onSuccess(result.url);
      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('wishlist.uploadError') || 'Failed to upload image');
      return false;
    } finally {
      setIsUploading(false);
    }
  }, [t]);

  return { isUploading, uploadWishImage };
};

const AddEditWish = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id, wishToEditId } = useParams(); 
  const fileInputRef = useRef(null);

  const isEditMode = !!wishToEditId;

  // Optimized state management
  const [wish, setWish] = useState({
    wishListId: id,
    title: '',
    price: '',
    url: '',
    description: '',
    imageUrl: ''
  });
  
  const [selectedImageURL, setSelectedImageURL] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wishlistTitle, setWishlistTitle] = useState('');

  const { isUploading, uploadWishImage } = useImageUpload(t);

  // Memoized translations
  const translations = useMemo(() => ({
    headerTitle: isEditMode ? 
      t('wishlists.editGift') : 
      t('wishlists.addNewGift'),
    buttonText: isEditMode ? 
      t('wishlists.saveChanges') : 
      t('wishlists.addGift'),
    submittingText: isEditMode ?
      t('wishlists.saving') :
      t('wishlists.adding')
  }), [isEditMode, t]);

  // Optimized data fetching
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!id) return;

    const fetchData = async () => {
      try {
        // Fetch wishlist metadata
        const [metadataResponse, wishResponse] = await Promise.all([
          wishlistService.getWishlistMetadata(id, token),
          isEditMode ? wishlistService.getWishDetail(wishToEditId, token) : Promise.resolve(null)
        ]);

        if (metadataResponse?.data?.title) {
          setWishlistTitle(metadataResponse.data.title);
        }

        if (isEditMode && wishResponse?.data) {
          const existingWish = wishResponse.data;
          setWish({
            wishListId: existingWish.wishListId,
            title: existingWish.title || '',
            price: existingWish.price || '',
            url: existingWish.url || '',
            description: existingWish.description || '',
            imageUrl: existingWish.imageUrl || ''
          });
          
          if (existingWish.imageUrl) {
            setSelectedImageURL(existingWish.imageUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        if (isEditMode) {
          toast.error(t('wishlist.loadWishError') || 'Failed to load wish details for editing.');
        }
      }
    };

    fetchData();
  }, [id, wishToEditId, isEditMode, t]);

  // Optimized handlers with useCallback
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setWish(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleImageChange = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview immediately
    const objectUrl = URL.createObjectURL(file);
    setSelectedImageURL(objectUrl);

    // Upload image
    const success = await uploadWishImage(file, (imageUrl) => {
      setWish(prev => ({ ...prev, imageUrl }));
    });

    if (!success) {
      setSelectedImageURL(wish.imageUrl || '');
      URL.revokeObjectURL(objectUrl); // Clean up blob URL
    }
  }, [uploadWishImage, wish.imageUrl]);

  const removeImage = useCallback(() => {
    setSelectedImageURL('');
    setWish(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleGoBack = useCallback(() => {
    navigate(`/wishlist/${id}`);
  }, [navigate, id]);

  // Alternative collage generation methods
  const generateCollageOptimized = useCallback(async (wishlistId, token) => {
    try {
      // Use low priority instead of async to ensure it starts properly
      await collageService.generateCollageLowPriority(wishlistId, token);
    } catch (error) {
      console.warn('Collage generation failed:', error);
      // Don't throw - collage failure shouldn't block wish creation
    }
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!wish.title.trim()) {
      toast.error(t('wishlist.titleRequired') || 'Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      if (isEditMode) {
        await wishlistService.updateWish({ ...wish, id: wishToEditId }, token);
        toast.success(t('wishlist.wishUpdatedSuccess') || 'Wish updated successfully');
        
        // Regenerate collage for edit mode too, in case images changed
        setTimeout(() => {
          collageService.generateCollageAsync(wish.wishListId, token)
            .catch(console.error);
        }, 100);
      } else {
        // First add the wish
        await wishlistService.addWishToWishlist(wish, token);
        toast.success(t('wishlist.wishAddedSuccess') || 'Wish added successfully');
        
        // Use a short delay to ensure wish is saved before generating collage
        setTimeout(() => {
          collageService.generateCollageAsync(wish.wishListId, token)
            .catch(console.error);
        }, 100);
      }
      
      // Navigate immediately without waiting for collage
      navigate(`/wishlist/${wish.wishListId}`);
    } catch (error) {
      console.error('Error submitting wish:', error);
      const errorMessage = isEditMode ? 
        t('wishlist.wishUpdateError') : 
        t('wishlist.wishAddError');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [wish, isEditMode, wishToEditId, t, navigate, generateCollageOptimized]);

  // Memoized form fields to prevent unnecessary re-renders
  const formFields = useMemo(() => [
    {
      id: 'title',
      name: 'title',
      type: 'text',
      label: t('wishlist.giftTitle'),
      placeholder: 'Apple watch',
      required: true
    },
    {
      id: 'price',
      name: 'price',
      type: 'text',
      label: t('wishlist.price'),
      placeholder: '120.000 - 150.000',
      required: false
    },
    {
      id: 'url',
      name: 'url',
      type: 'url',
      label: t('wishlist.url'),
      placeholder: t('wishlist.urlPlaceholder'),
      required: false
    }
  ], [t]);

  if (!id) {
    return <div>Error: Wishlist ID is required</div>;
  }

  return (
    <div className="wishlist-details-container">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover
      />
      
      <header className="wishlist-header-wishes">
        <div className="back-button" onClick={handleGoBack}>
          <Icon name="back" size={18} />
        </div>
        <h1>{translations.headerTitle}</h1>
      </header>

      <main className="add-wish-form">
        <div className="wish-title">{wishlistTitle}</div>
        
        <div className="wish-image-section">
          {selectedImageURL && (
            <div className="additional-image-slot">
              <button
                type="button"
                className="upload-photo-btn additional-upload"
                onClick={triggerFileInput}
                aria-label="Upload additional photo"
              >
                <img className="add-wish-upload" src={addWishes} alt="Upload additional photo" />
              </button>
            </div>
          )}
          
          <div className="wish-image-container">
            <div className="wish-image-box">
              {selectedImageURL ? (
                <div className="image-preview">
                  <img className="add-wish-cover" src={selectedImageURL} alt="Selected wish" />
                  <button
                    type="button"
                    className="remove-photo-btn"
                    onClick={removeImage}
                    aria-label="Remove uploaded image"
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="upload-photo-btn"
                  onClick={triggerFileInput}
                  aria-label="Upload photo"
                >
                  <img className="add-wish-upload" src={addWishes} alt="Upload wish photo" />
                </button>
              )}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {formFields.map(field => (
            <div key={field.id} className="form-field">
              <label htmlFor={field.id}>{field.label}</label>
              <input
                type={field.type}
                id={field.id}
                name={field.name}
                placeholder={field.placeholder}
                value={wish[field.name]}
                onChange={handleInputChange}
                required={field.required}
              />
            </div>
          ))}

          <div className="form-field">
            <label htmlFor="description">{t('wishlist.description')}</label>
            <textarea
              id="description"
              name="description"
              placeholder={t('wishlist.descriptionPlaceholder')}
              value={wish.description}
              onChange={handleInputChange}
            />
          </div>

          <button 
            type="submit" 
            className="add-wish-btn"
            disabled={isSubmitting || isUploading}
          >
            {isSubmitting ? translations.submittingText : translations.buttonText}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddEditWish;