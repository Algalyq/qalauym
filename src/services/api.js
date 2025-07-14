import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'https://api.qalauym.kz', // Using Vite proxy to avoid CORS and SSL certificate issues
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  }
});

// Authentication services
export const authService = {
  // Login function
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register function
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }
};

export default api;
