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


const AddWishes = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams(); 
  const fileInputRef = useRef(null);
  
  const [wish, setWish] = useState({
    wishListId: id,
    title: '',
    price: '',
    url: '',
    description: ''
  });
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageURL, setSelectedImageURL] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [wishTitle, setWishTitle] = useState('');

  // Fetch wishlist metadata to get title
  useEffect(() => {
    const fetchWishlistMetadata = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await wishlistService.getWishlistMetadata(id, token);
        
        // Extract title from response
        if (response && response.data && response.data.title) {
          setWishTitle(response.data.title);
        }
      } catch (error) {
        console.error('Error fetching wishlist metadata:', error);
      }
    };

    if (id) {
      fetchWishlistMetadata();
    }
  }, [id]);

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
    setSelectedImageURL(URL.createObjectURL(file));
    setIsUploading(true);

    try {
      const result = await uploadImage({ file }, 'wish');
      setWish(prev => ({
        ...prev,
        imageUrl: result.url
      }));

      const token = localStorage.getItem('token');
      await collageService.generateAndUpdateCollage(id, token);
      setIsUploading(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(t('wishlist.uploadError') || 'Failed to upload image');
      setIsUploading(false);
      setSelectedImage(null);
      setSelectedImageURL('');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setSelectedImageURL('');
    setWish(prev => ({
      ...prev,
      imageUrl: ''
    }));
    // Reset file input
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
      
      // Add wish to the wishlist
      await wishlistService.addWishToWishlist(wish, token);
      
      toast.success(t('wishlist.wishAddedSuccess') || 'Wish added successfully');
      navigate(`/wishlist/${id}`);
    } catch (error) {
      console.error('Error adding wish:', error);
      toast.error(t('wishlist.wishAddError') || 'Failed to add wish');
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <h1>{t('wishlist.addNewGift')}</h1>
      </header>

      <main className="add-wish-form">
        <div className="wish-title">{wishTitle}</div>
        
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
            {isSubmitting ? 
              (t('wishlist.adding') || 'Қалауды қосу...') : 
              (t('wishlist.addGift') || 'Қалауды қосу')}
          </button>
        </form>
      </main>
    </div>
  );
};

export default AddWishes;