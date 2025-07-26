import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import WishlistDetails from './pages/WishlistDetails';
import SharedWishlist from './pages/SharedWishlist';
import OAuthCallback from './pages/OAuthCallback';


const ProtectedRoute = ({ children }) => {

  if(localStorage.getItem('token') == null){
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
  const { currentUser } = useAuth();
  
  // Apply background color to body
  useEffect(() => {
    document.body.classList.add('bg-background');
    return () => {
      document.body.classList.remove('bg-background');
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/auth" element={currentUser ? <Navigate to="/dashboard" replace /> : <Auth />} />
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
        {/* Public route for shared wishlists - no authentication required */}
        <Route path="/shared/wishlist/:id" element={<SharedWishlist />} />
        
        {/* OAuth callback route */}
        <Route path="/oauth2/redirect" element={<OAuthCallback />} />
        
        {/* Default route */}
        <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/auth"} replace />} />
      </Routes>
    </div>
  );
}

export default AppWithAuth;
