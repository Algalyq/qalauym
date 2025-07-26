import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard/dashboard.css';
import LanguageSelector from '../components/common/LanguageSelector';
import wishlistService from '../services/wishlistService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/common/NavBar';

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
      if (!currentUser || !currentUser.data.accessToken || !currentUser.data.refreshToken) return;
      
      try {
        setIsLoading(true);
        const data = await wishlistService.getUserWishlists(currentUser.data.accessToken);
        setWishlists(data.data);
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
        currentUser.data.accessToken
      );
      
      // Add the new wishlist to the list
      setWishlists(prev => [createdWishlist, ...prev]);
      
      // Reset the form
      setNewWishlist({ title: '', description: '', visibility: 'PUBLIC' });
      setIsCreatingWishlist(false);
      
      console.log("Wish list id:", createdWishlist.data.id)

      // Show success notification
      toast.success(t('dashboard.wishlistCreatedSuccessfully'));
      
      // Store the newly created wishlist in localStorage to ensure it's available
      // even before the API has fully processed it
      if (createdWishlist.data) {
        localStorage.setItem('recentWishlist', JSON.stringify(createdWishlist.data));
      }
      
      // Delay navigation slightly to allow toast to be visible
      setTimeout(() => {
        navigate(`/wishlist/${createdWishlist.data.id}`);
      }, 2000);
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
         <Navbar />
    </div>
  );
};

export default Dashboard;
