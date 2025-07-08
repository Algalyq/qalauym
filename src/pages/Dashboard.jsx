import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import '../styles/dashboard/dashboard.css';
import logo from '../assets/images/logo_q.jpg';

const Dashboard = () => {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [newItem, setNewItem] = useState({ name: '', description: '', url: '' });
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // Load wishlist items from localStorage on component mount
  useEffect(() => {
    const savedItems = localStorage.getItem(`wishlist_${currentUser?.id}`);
    if (savedItems) {
      setWishlistItems(JSON.parse(savedItems));
    }
  }, [currentUser]);
  
  // Save wishlist items to localStorage whenever they change
  useEffect(() => {
    if (currentUser && wishlistItems.length > 0) {
      localStorage.setItem(`wishlist_${currentUser.id}`, JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, currentUser]);
  
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
    setNewItem(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleAddItem = (e) => {
    e.preventDefault();
    
    if (!newItem.name.trim()) return;
    
    const item = {
      id: Date.now().toString(),
      ...newItem,
      createdAt: new Date().toISOString()
    };
    
    setWishlistItems(prev => [item, ...prev]);
    setNewItem({ name: '', description: '', url: '' });
    setIsAddingItem(false);
  };
  
  const handleDeleteItem = (id) => {
    setWishlistItems(prev => prev.filter(item => item.id !== id));
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
                  <span>GiftList</span>
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
                  <span>Logout</span>
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
          <button className="profile-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      </header>
      
      <main className="main-content">
        <h1 className="page-title">Менің қалауым</h1>
        
        <section className="section">
          {isAddingItem ? (
            <div className="card">
              <h2 className="card-title">{t('dashboard.addNewWish')}</h2>
              <form onSubmit={handleAddItem}>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    {t('dashboard.giftName')}*
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={newItem.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('dashboard.whatWouldYouLike')}
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
                    value={newItem.description}
                    onChange={handleInputChange}
                    className="form-input form-textarea"
                    placeholder={t('dashboard.addDetails')}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="url" className="form-label">
                    {t('dashboard.url')}
                  </label>
                  <input
                    type="url"
                    id="url"
                    name="url"
                    value={newItem.url}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder={t('dashboard.linkPlaceholder')}
                  />
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="btn-primary">
                    {t('dashboard.addToWishlist')}
                  </button>
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => setIsAddingItem(false)}
                  >
                    {t('dashboard.cancel')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setIsAddingItem(true)} 
              className="add-wish-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Тілектер тізімін жасау</span>
            </button>
          )}
        </section>
        
        <section>
          {wishlistItems.length === 0 ? (
            <div className="empty-list">
              <p className="empty-message">{t('dashboard.emptyWishlist')}</p>
            </div>
          ) : (
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <div key={item.id} className="wishlist-item">
                  <div className="item-header">
                    <h3 className="item-title">{item.name}</h3>
                    <button 
                      onClick={() => handleDeleteItem(item.id)}
                      className="delete-button"
                      aria-label={t('dashboard.delete')}
                    >
                      <span className="sr-only">{t('dashboard.delete')}</span>
                      <span>×</span>
                    </button>
                  </div>
                  
                  {item.description && (
                    <p className="item-description">{item.description}</p>
                  )}
                  
                  {item.url && (
                    <div className="item-link">
                      <a 
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="link"
                      >
                        {t('dashboard.viewItem')}
                      </a>
                    </div>
                  )}
                  
                  <div className="item-date">
                    {t('dashboard.added')}: {new Date(item.createdAt).toLocaleDateString()}
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
