import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MdArrowBack, MdClose } from 'react-icons/md';
import { uploadImage } from '../services/s3service';
import wishlistService from '../services/wishlistService';
import Icon from '../components/common/Icon/Icon';
import '../styles/dashboard/wishlist-details.css';
import '../styles/dashboard/add-wishes.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import addWishes from '../assets/icons/add_img_wishes.svg';
import collageService from '../services/collageService';

// Renaming the component to reflect its dual purpose
const AddEditWish = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  // id is the wishlistId
  // wishToEditId is the new parameter for the wish being edited (optional)
  const { id, wishToEditId } = useParams(); 
  const fileInputRef = useRef(null);

  // Determine the mode
  const isEditMode = !!wishToEditId;

  const [wish, setWish] = useState({
    wishListId: id,
    title: '',
    price: '',
    url: '',
    description: '',
    imageUrl: '' // Initialize imageUrl
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageURL, setSelectedImageURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wishlistTitle, setWishlistTitle] = useState('');

  // --- EFFECT: Fetch Wishlist Title & Existing Wish Details ---
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    // 1. Fetch Wishlist Metadata (Title)
    const fetchWishlistMetadata = async () => {
      try {
        const response = await wishlistService.getWishlistMetadata(id, token);
        if (response?.data?.title) {
          setWishlistTitle(response.data.title);
        }
      } catch (error) {
        console.error('Error fetching wishlist metadata:', error);
      }
    };

    // 2. Fetch Wish Details if in Edit Mode
    const fetchWishDetail = async () => {
        try {
            const response = await wishlistService.getWishDetail(wishToEditId, token);
            const existingWish = response?.data;
            
            if (existingWish) {
                // Populate the state with existing data
                setWish({
                    wishListId: existingWish.wishListId,
                    title: existingWish.title || '',
                    price: existingWish.price || '',
                    url: existingWish.url || '',
                    description: existingWish.description || '',
                    imageUrl: existingWish.imageUrl || '' // Use existing image URL
                });
                if (existingWish.imageUrl) {
                    // Set the image URL for preview without a new file object
                    setSelectedImageURL(existingWish.imageUrl);
                }
            }
        } catch (error) {
            console.error('Error fetching wish detail for edit:', error);
            toast.error(t('wishlist.loadWishError') || 'Failed to load wish details for editing.');
        }
    };

    if (id) {
      fetchWishlistMetadata();
      if (isEditMode) {
        fetchWishDetail();
      }
    }
  }, [id, wishToEditId, isEditMode, t]); // Added dependencies

  // --- HANDLERS ---
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setWish(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('wishlist.invalidImageType') || 'Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('wishlist.imageTooLarge') || 'Image size should be less than 5MB');
      return;
    }

    setSelectedImage(file);
    // Use the local URL for instant preview
    setSelectedImageURL(URL.createObjectURL(file)); 
    setIsUploading(true);

    try {
      // NOTE: Uploading immediately is fine, but for an edit, you might
      // consider only uploading on final submit to avoid orphaned files if
      // the user cancels the edit. Keeping the original logic for simplicity.
      const result = await uploadImage({ file }, 'wish');
      setWish(prev => ({
        ...prev,
        imageUrl: result.url // Store the S3 URL
      }));

      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('wishlist.uploadError') || 'Failed to upload image');
      setIsUploading(false);
      setSelectedImage(null);
      setSelectedImageURL(wish.imageUrl || ''); // Revert to old URL if it exists
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setSelectedImageURL('');
    setWish(prev => ({
      ...prev,
      imageUrl: '' // Clear the image URL
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleGoBack = () => {
    navigate(`/wishlist/${id}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wish.title.trim()) {
      toast.error(t('wishlist.titleRequired') || 'Title is required');
      return;
    }

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      
      let successMessage;

      if (isEditMode) {
        // --- EDIT MODE LOGIC ---
        const payload = { ...wish, id: wishToEditId }; // Include the wish ID for the update API
        await wishlistService.updateWish(payload, token);
        successMessage = t('wishlist.wishUpdatedSuccess') || 'Wish updated successfully';

      } else {
        // --- CREATE MODE LOGIC ---
        // Payload already contains wishListId
        await wishlistService.addWishToWishlist(wish, token);
        successMessage = t('wishlist.wishAddedSuccess') || 'Wish added successfully';

        await collageService.generateAndUpdateCollage(wish.wishListId, token);
      }
      navigate(`/wishlist/${wish.wishListId}`);
    } catch (error) {
      console.error('Error submitting wish:', error);
      const errorMessage = isEditMode ? 
        (t('wishlist.wishUpdateError') || 'Failed to update wish') : 
        (t('wishlist.wishAddError') || 'Failed to add wish');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- RENDER LOGIC ---
  const headerTitle = isEditMode ? 
    (t('wishlists.editGift') || 'Өтінімді өзгерту') : 
    (t('wishlists.addNewGift') || 'Жаңа сыйлық қосу');
    
  const buttonText = isEditMode ? 
    (t('wishlists.saveChanges') || 'Сақтау') : 
    (t('wishlists.addGift') || 'Қалауды қосу');

  const submittingText = isEditMode ?
    (t('wishlists.saving') || 'Сақталуда...') :
    (t('wishlists.adding') || 'Қалауды қосу...');

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
        <h1>{headerTitle}</h1> {/* Dynamic Header Title */}
      </header>

      <main className="add-wish-form">
        <div className="wish-title">{wishlistTitle}</div> {/* Renamed from wishTitle to wishlistTitle */}
        
        <div className="wish-image-section">
          {/* ... (Your existing image upload UI logic remains here) ... */}
          
          {/* This conditional rendering needs fixing based on your intent. 
              The original code was confusingly placing a second upload button 
              when an image was *already* selected. I'll keep the original 
              structure but note this is often simplified. */}
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
          <div className="form-field">
            <label htmlFor="title">
              {t('wishlist.giftTitle')}
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Apple watch"
              value={wish.title}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* ... (Other form fields: price, url, description) ... */}
          <div className="form-field">
            <label htmlFor="price">
              {t('wishlist.price')}
            </label>
            <input
              type="text"
              id="price"
              name="price"
              placeholder="120.000 - 150.000"
              value={wish.price}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="url">
              {t('wishlist.url')}
            </label>
            <input
              type="url"
              id="url"
              name="url"
              placeholder={t('wishlist.urlPlaceholder')}
              value={wish.url}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">
              {t('wishlist.description')}
            </label>
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
            {isSubmitting ? submittingText : buttonText} {/* Dynamic Button Text */}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddEditWish;