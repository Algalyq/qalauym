import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import wishlistService from '../services/wishlistService';
import LanguageSelector from '../components/common/LanguageSelector';
import '../styles/dashboard/wishlist-details.css'; // We'll create this CSS file next

const WishlistDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newWish, setNewWish] = useState({
    wishListId: id,
    title: '',
    description: '',
    url: '',
    imageUrl: ''
  });
  const [isAddingWish, setIsAddingWish] = useState(false);

  // Fetch wishlist details and wishes
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.token) {
        navigate('/auth');
        return;
      }
      
      try {
        setIsLoading(true);
        // Fetch wishlist details
        const wishlistData = await wishlistService.getWishlistById(id, currentUser.token);
        setWishlist(wishlistData);
        
        // Fetch wishes for this wishlist
        const wishesData = await wishlistService.getWishesForWishlist(id, currentUser.token);
        setWishes(wishesData);
        
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
  
  const handleAddWish = async (e) => {
    e.preventDefault();
    
    if (!newWish.title.trim()) return;
    
    try {
      const createdWish = await wishlistService.addWishToWishlist(newWish, currentUser.token);
      
      // Add the new wish to the list
      setWishes(prev => [createdWish, ...prev]);
      
      // Reset the form
      setNewWish({
        wishListId: id,
        title: '',
        description: '',
        url: '',
        imageUrl: ''
      });
      setIsAddingWish(false);
    } catch (err) {
      console.error('Failed to add wish:', err);
      setError(t('wishlist.failedToAddWish'));
    }
  };
  
  const handleGoBack = () => {
    navigate('/dashboard');
  };
  
  if (isLoading) {
    return (
      <div className="loading-container">
        <p>{t('wishlist.loading')}</p>
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
      <header className="header">
        <div className="header-content">
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
          <span className={`visibility-badge ${wishlist.visibility.toLowerCase()}`}>
            {wishlist.visibility === 'PUBLIC' ? t('wishlist.public') : t('wishlist.private')}
          </span>
          {wishlist.description && (
            <p className="wishlist-description">{wishlist.description}</p>
          )}
          <p className="wishlist-date">
            {t('wishlist.created')}: {new Date(wishlist.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        <section className="section">
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
