import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Create the context
const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Login function that can be used for both email/password and OAuth
// Login function that can be used for both email/password and OAuth
const login = async (usernameOrData, password, isOAuth = false) => {
  try {
    let user;
    if (isOAuth) {
      // For OAuth, usernameOrData is the user data object
      user = usernameOrData;
      localStorage.setItem('profile', JSON.stringify(user));
    } else {
      // For email/password login, usernameOrData is the username string
      const response = await authService.login(usernameOrData, password);
      localStorage.setItem('profile', JSON.stringify(response.data.userProfile));
      localStorage.setItem('token', response.data.accessToken);
    }
    
    setCurrentUser(user);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

  // Real registration function using API
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      // Store user data in localStorage
      const user = { ...userData, ...response };
      localStorage.setItem('profile', JSON.stringify(user));
      localStorage.setItem('token', response.token || response.accessToken || '');
      setCurrentUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('profile');
    localStorage.removeItem('token');
    setCurrentUser(null);
    return Promise.resolve();
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('profile');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Value object to be provided to consumers
  const value = {
    currentUser,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  return useContext(AuthContext);
}
