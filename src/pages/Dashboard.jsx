import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isTokenExpired } from '../utils/authUtils';
import '../styles/dashboard/dashboard.css';
import wishlistService from '../services/wishlistService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Navbar from '../components/common/NavBar';
import QAddButton from '../components/common/Buttons/QAddButton';
import CreateWishlistModal from '../components/common/Modals/CreateWishlistModal';
import WishListScrollContent from '../components/common/Content/WishListScroolContent';
import EmptyWishlistContent from '../components/common/Content/EmptyWishlistContent';
import MobileOnlyMessage from '../components/common/MobileOnlyMessage';
import '../styles/common/typography.css';
import '../styles/common/modals.css';
import '../styles/common/mobileonly.css';

const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [wishlists, setWishlists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Mobile-only app, no need to check for mobile anymore

  const [newWishlist, setNewWishlist] = useState({
    title: '',
    description: '',
    visibility: 'PUBLIC'
  });
  const [isCreatingWishlist, setIsCreatingWishlist] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const menuRef = useRef(null);

  // Load wishlists from the API when component mounts
  useEffect(() => {
    const fetchWishlists = async () => {
      const token = localStorage.getItem('token');
      if (!token || isTokenExpired(token)) {
        setError(t('auth.sessionExpired'));
        navigate('/auth');
        return;
      }

      try {
        setIsLoading(true);
        const data = await wishlistService.getUserWishlists(token);
        console.log('Fetched wishlists:', data);
        setWishlists(data.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch wishlists:', err);
        setError(t('dashboard.failedToFetchWishlists'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlists();
  }, [t, navigate]);

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

  // No need to check for mobile device anymore, app is mobile-only

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewWishlist(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateWishlist = async (wishlistData) => {
    if (!wishlistData || !wishlistData.title || !wishlistData.title.trim()) {
      toast.error(t('dashboard.wishlistTitleRequired'));
      return;
    }
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (!token || isTokenExpired(token)) {
      toast.error(t('auth.sessionExpired'));
      navigate('/auth');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Creating wishlist with data:', wishlistData);

      const wishlistPayload = {
        title: wishlistData.title.trim(),
        description: wishlistData.description || '',
        visibility: wishlistData.visibility || 'PUBLIC'
      };

      console.log('Sending wishlist data:', wishlistPayload);

      const response = await wishlistService.createWishlist(
        wishlistPayload,
        token // Using the token from localStorage
      );

      console.log('Wishlist created:', response);

      // The response might be the wishlist data directly or in a data property
      const createdWishlist = response.data || response;

      if (!createdWishlist) {
        throw new Error('No wishlist data returned from server');
      }

      // Add the new wishlist to the list
      setWishlists(prev => [createdWishlist, ...prev]);

      // Reset the form
      setNewWishlist({ title: '', description: '', visibility: 'PUBLIC' });

      // Close the modal
      closeModal();

      // Show success notification
      toast.success(t('dashboard.wishlistCreatedSuccessfully'));

      // Store the newly created wishlist in localStorage
      if (createdWishlist.id) {
        localStorage.setItem('recentWishlist', JSON.stringify(createdWishlist));

      }
    } catch (err) {
      console.error('Failed to create wishlist:', err);
      toast.error(t('dashboard.failedToCreateWishlist'));
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Check if we have wishlists to display
  const hasWishlists = wishlists && wishlists.length > 0;

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

      {/* Mobile-only components */}
      {hasWishlists ? (
        <WishListScrollContent
          wishlists={wishlists}
          onSelectWishlist={(wishlist) => {
            // Handle wishlist selection if needed
            navigate(`/wishlist/${wishlist.id}`);
          }}
          onCreateWishlist={openModal}
          onShareWishlist={(wishlist) => { /* handle share logic */ }}
        />
      ) : (
        <EmptyWishlistContent />
      )}

      {/* QAddButton and Navbar for mobile dashboard */}
      <div className="create-wishlist-section">
        <QAddButton onClick={openModal} />
      </div>
      <Navbar />
      <CreateWishlistModal
        isOpen={isModalOpen}
        onClose={closeModal}
        newWishlist={newWishlist}
        onInputChange={handleInputChange}
        onSubmit={handleCreateWishlist}
      />
        
    


    </div>
  );
};

export default Dashboard;