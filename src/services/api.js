import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  // baseURL: 'http://localhost:8080',
  baseURL: 'https://api.qalauym.kz',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: true  // Important for cookies/sessions
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
// Store pending requests that should be retried after token refresh
let failedQueue = [];

// Helper function to process the queue of failed requests
const processQueue = (error, token = null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor to add access token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // If error is unauthorized and we haven't tried to refresh token for this request yet
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, add this request to the queue
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, logout user
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          // window.location.href = '/auth'; // Redirect to auth page
          return Promise.reject(error);
        }
        
        // Call the refresh token endpoint
        const response = await api.post('/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        
        // Store the new tokens
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        
        // Update the original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        
        // Process all the requests in the queue
        processQueue(null, accessToken);
        isRefreshing = false;
        
        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        
        // Clear auth data and redirect to auth page
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // window.location.href ='/auth'; // Redirect to auth page
        
        return Promise.reject(refreshError);
      }
    }
    
    // If error is not 401 or we already tried refreshing, just reject
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  // Login function
  login: async (username, password) => {
    try {
      const response = await api.post('/auth/login', {
        username,
        password
      });
      console.log("Login response:", response)
      // Store tokens in localStorage
      if (response.data.accessToken) {
        localStorage.setItem('accessToken', response.data.accessToken);
      }
      if (response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  // Register function
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  // Refresh token function
  refreshToken: async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await api.post('/auth/refresh', { refreshToken });
      
      // Store new tokens
      localStorage.setItem('accessToken', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
      
      return response.data;
    } catch (error) {
      console.error('Token refresh error:', error);
      // Clear tokens on refresh failure
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw error;
    }
  },
  
  // Logout function
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    // You might want to call a logout endpoint here if needed
  },


  googleLogin: async (code) => {
    try {
      const response = await api.post('/login/oauth2/code/google', { code });
      // The response should contain the JWT token
      const { token } = response.data;
      
      // Store the token in localStorage
      localStorage.setItem('token', token);
      
      // Return the response data which includes the token and any user info
      return response.data;
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  }
};

// Update user profile
export const updateProfile = async (profileData) => {
  try {
    const response = await api.put('/user/profile', profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

export default api;
