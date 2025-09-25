import api from './api';

/**
 * Service for handling user profile related operations
 */
const userService = {
  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile data
   */
  getUserProfile: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param {Object} profileData - User profile data to update
   * @returns {Promise<Object>} Updated user profile
   */
  updateUserProfile: async (profileData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.put('/user/profile', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Update user avatar
   * @param {string} avatarUrl - URL of the uploaded avatar image
   * @returns {Promise<Object>} Updated user profile with new avatar
   */
  updateUserAvatar: async (avatarUrl) => {
    try {
      const response = await api.patch('/user/profile/avatar', { avatarUrl });
      return response.data;
    } catch (error) {
      console.error('Error updating user avatar:', error);
      throw error;
    }
  },

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Response data
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await api.post('/user/password', { 
        currentPassword, 
        newPassword 
      });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }
};

export default userService;
