import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { wishlistService } from '../services/wishlistService';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import { MdArrowBack } from 'react-icons/md';

const SharedWishlist = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlist, setWishlist] = useState(null);
  const [wishes, setWishes] = useState([]);

  useEffect(() => {
    const loadSharedWishlist = async () => {
      try {
        setLoading(true);
        const response = await wishlistService.getSharedWishlist(id);
        console.log("Shared wishlist response:", response.data);
        if (response.data) {
          setWishlist(response.data.wishlist);
          setWishes(response.data.wishes);
        } else {
          setError('Unable to load wishlist');
        }
      } catch (err) {
        console.error('Error loading shared wishlist:', err);
        setError('This wishlist is not available or has been set to private');
      } finally {
        setLoading(false);
      }
    };

    loadSharedWishlist();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <AiOutlineLoading3Quarters className="animate-spin text-primary w-12 h-12 mb-4" />
        <p className="text-gray-600">Loading wishlist...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4 text-error">Wishlist Unavailable</h2>
          <p className="text-gray-600 text-center mb-6">{error}</p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-all flex items-center"
            >
              <MdArrowBack className="mr-2" /> Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with basic navigation */}
        <div className="mb-6 flex justify-between items-center">
          <button 
            onClick={() => navigate('/')} 
            className="flex items-center text-primary hover:underline"
          >
            <MdArrowBack className="mr-1" /> Home
          </button>
        </div>

        {/* Wishlist header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{wishlist?.title}</h1>
              <p className="text-gray-600">
                <span className="bg-primary bg-opacity-10 text-primary px-2 py-1 rounded-md text-sm font-medium">
                  Shared Wishlist
                </span>
              </p>
            </div>
          </div>
          {wishlist?.description && (
            <p className="text-gray-600 mb-4">{wishlist.description}</p>
          )}
        </div>

        {/* Wishes/Gifts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishes.length > 0 ? (
            wishes.map((wish) => (
              <div key={wish.id} className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
                {wish.imageUrl && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={wish.imageUrl}
                      alt={wish.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-4 flex-grow">
                  <h3 className="font-bold text-lg mb-2">{wish.name}</h3>
                  {wish.description && (
                    <p className="text-gray-600 text-sm mb-3">{wish.description}</p>
                  )}
                  {wish.link && (
                    <a
                      href={wish.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline text-sm block mb-3"
                    >
                      View Gift Link
                    </a>
                  )}
                  {wish.price && (
                    <p className="text-gray-800 font-medium">
                      Price: {wish.price}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              <p className="text-gray-500 text-lg">This wishlist has no gifts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharedWishlist;
