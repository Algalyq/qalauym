import api from './api';

export const wishlistService = {
  // Create a new wishlist
  createWishlist: async (wishlistData, token) => {
    try {
      const response = await api.post('/wishlists', wishlistData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Create wishlist error:', error);
      throw error;
    }
  },

  // Get wishlists for current user
  getUserWishlists: async (token) => {
    try {
      const response = await api.get('/wishlists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get wishlists error:', error);
      throw error;
    }
  },

  // Get a specific wishlist by ID
  getWishlistById: async (wishlistId, token) => {
    try {
      const response = await api.get(`/wishes/list/${wishlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get wishlist error:', error);
      throw error;
    }
  },

  // Add a gift/wish to a wishlist
  addWishToWishlist: async (wishData, token) => {
    try {
      const response = await api.post('/wishes', wishData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Add wish error:', error);
      throw error;
    }
  },

  getWishlistMetadata: async (wishlistId, token) => {
    try {
      const response = await api.get(`/wishlists/${wishlistId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get wishlist metadata error:', error);
      throw error;
    }
  },

  // Get a shared wishlist by ID (no authentication required)
  getSharedWishlist: async (wishlistId) => {
    try {
      const response = await api.get(`/wishlists/share/${wishlistId}`);
      return response.data;
    } catch (error) {
      console.error('Get shared wishlist error:', error);
      throw error;
    }
  },

};

export default wishlistService;
