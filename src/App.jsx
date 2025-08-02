import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import WishlistDetails from './pages/WishlistDetails';
import SharedWishlist from './pages/SharedWishlist';
import AddWishes from './pages/AddWishes';
import OAuthCallback from './pages/OAuthCallback';
import { isTokenExpired } from './utils/authUtils';
import MobileOnlyMessage from './components/common/MobileOnlyMessage';
import './styles/common/mobileonly.css';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  // Check if token doesn't exist OR if it exists but is expired
  if (!token && !isTokenExpired(token)) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function AppWithAuth() {
  return (
      <AuthProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
  );
}

// Main app content with routes
function AppContent() {
  const token = localStorage.getItem('token');
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 512);
  // Check if token doesn't exist OR if it exists but is expired
  const isTrue = (!token && !isTokenExpired(token));
  
  // Check if device is mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 512);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial load

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Apply background color to body
  useEffect(() => {
    document.body.classList.add('bg-background');
    return () => {
      document.body.classList.remove('bg-background');
    };
  }, []);

  // If not on mobile device, show mobile only message
  if (!isMobile) {
    return (
      <div className="min-h-screen">
        <MobileOnlyMessage />
      </div>
    );
  }

  // Otherwise show normal app content for mobile users
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/wishlist/:id" element={
          <ProtectedRoute>
            <WishlistDetails />
          </ProtectedRoute>
        } />
        <Route path="/addwishes/:id" element={
          <ProtectedRoute>
            <AddWishes />
          </ProtectedRoute>
        } />
        {/* Public route for shared wishlists - no authentication required */}
        <Route path="/shared/wishlist/:id" element={<SharedWishlist />} />
        
        {/* OAuth callback route */}
        <Route path="/oauth2/redirect" element={<OAuthCallback />} />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to={isTrue ? "/auth" : "/dashboard"} replace />} />
      </Routes>
    </div>
  );
}

export default AppWithAuth;
