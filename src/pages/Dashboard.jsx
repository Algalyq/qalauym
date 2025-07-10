import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard/dashboard.css';
import LanguageSelector from '../components/common/LanguageSelector';
import wishlistService from '../services/wishlistService';
import logo from '../assets/images/logo_q.jpg';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [wishlists, setWishlists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [newWishlist, setNewWishlist] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC'
  });
  const [isCreatingWishlist, setIsCreatingWishlist] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Load wishlists from the API when component mounts
  useEffect(() => {
    const fetchWishlists = async () => {
      if (!currentUser || !currentUser.token) return;
      
      try {
        setIsLoading(true);
        const data = await wishlistService.getUserWishlists(currentUser.token);
        setWishlists(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch wishlists:', err);
        setError(t('dashboard.failedToFetchWishlists'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchWishlists();
  }, [currentUser, t]);
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          !event.target.classList.contains('menu-button')) {
        setIsMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWishlist(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCreateWishlist = async (e) => {
    e.preventDefault();
    
    if (!newWishlist.title.trim()) return;
    
    try {
      const createdWishlist = await wishlistService.createWishlist(
        newWishlist,
        currentUser.token
      );
      
      // Add the new wishlist to the list
      setWishlists(prev => [createdWishlist, ...prev]);
      
      // Reset the form
      setNewWishlist({ title: '', description: '', visibility: 'PUBLIC' });
      setIsCreatingWishlist(false);
      
      // Navigate to the wishlist details page
      navigate(`/wishlist/${createdWishlist.id}`);
    } catch (err) {
      console.error('Failed to create wishlist:', err);
      setError(t('dashboard.failedToCreateWishlist'));
    }
  };
  
  const handleNavigateToWishlist = (id) => {
    navigate(`/wishlist/${id}`);
  };
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  return (
    <div className="dashboard">
      {/* Side Menu */}
      {isMenuOpen && (
        <div className="side-menu" ref={menuRef}>
          <div className="side-menu-header">
            <div className="logo">
              <img src={logo} alt="Logo" className="logo_q" />
              <span>Qalauym</span>
            </div>
            <button className="close-button" onClick={() => setIsMenuOpen(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <nav className="side-menu-nav">
            <ul>
              <li>
                <a href="#" className="menu-item active">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                  <span>{t('dashboard.myWishlist')}</span>
                </a>
              </li>
              <li>
                <a href="#" className="menu-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                  <span>FAQ</span>
                </a>
              </li>
              <li>
                <button onClick={logout} className="menu-item logout">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  <span>{t('dashboard.logout')}</span>
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
      <header className="dashboard-header">
        <div className="header-container">
          <button className="menu-button" onClick={toggleMenu}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          <div className="language-selector">
            <LanguageSelector />
          <button className="profile-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
          </div>
        </div>
      </header>
      
      <main className="main-content">
        <h1 className="page-title">{t('dashboard.myWishlist')}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <section className="section">
          {isCreatingWishlist ? (
            <div className="card">
              <h2 className="card-title">{t('dashboard.createNewWishlist')}</h2>
              <form onSubmit={handleCreateWishlist}>
                <div className="form-group">
                  <label htmlFor="title" className="form-label">
                    {t('dashboard.wishlistTitle')}*
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={newWishlist.title}
                    onChange={handleInputChange}
                    className="form-input-dash"
                    placeholder={t('dashboard.wishlistTitlePlaceholder')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="description" className="form-label">
                    {t('dashboard.description')}
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={newWishlist.description}
                    onChange={handleInputChange}
                    className="form-input-dash form-textarea"
                    placeholder={t('dashboard.wishlistDescriptionPlaceholder')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="visibility" className="form-label">
                    {t('dashboard.visibility')}*
                  </label>
                  <select
                    id="visibility"
                    name="visibility"
                    value={newWishlist.visibility}
                    onChange={handleInputChange}
                    className="form-input-dash"
                    required
                  >
                    <option value="PUBLIC">{t('dashboard.public')}</option>
                    <option value="PRIVATE">{t('dashboard.private')}</option>
                  </select>
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="btn-primary">
                    {t('dashboard.createWishlist')}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setIsCreatingWishlist(false)}
                  >
                    {t('dashboard.cancel')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setIsCreatingWishlist(true)} 
              className="add-wish-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>{t('dashboard.createNewWishlist')}</span>
            </button>
          )}
        </section>
        
        <section>
          {isLoading ? (
            <div className="loading">
              <p>{t('dashboard.loadingWishlists')}</p>
            </div>
          ) : wishlists.length === 0 ? (
            <div className="empty-list">
              <p className="empty-message">{t('dashboard.emptyWishlists')}</p>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlists.map((wishlist) => (
                <div key={wishlist.id} className="wishlist-item" onClick={() => handleNavigateToWishlist(wishlist.id)}>
                  <div className="item-header">
                    <h3 className="item-title">{wishlist.title}</h3>
                    <span className={`visibility-badge ${wishlist.visibility.toLowerCase()}`}>
                      {wishlist.visibility === 'PUBLIC' ? t('dashboard.public') : t('dashboard.private')}
                    </span>
                  </div>
                  
                  {wishlist.description && (
                    <p className="item-description">{wishlist.description}</p>
                  )}
                  
                  <div className="item-date">
                    {t('dashboard.created')}: {new Date(wishlist.createdAt).toLocaleDateString()}
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

export default Dashboard;
