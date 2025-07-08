import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

// Create the context
const AuthContext = createContext();

// Create a provider component
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Real login function using API
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      // Store user data in localStorage
      const user = { username, ...response };
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', response.token || response.accessToken || '');
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
      localStorage.setItem('user', JSON.stringify(user));
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
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    return Promise.resolve();
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
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
