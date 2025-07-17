import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import WishlistDetails from './pages/WishlistDetails';
import SharedWishlist from './pages/SharedWishlist';

// ProtectedRoute component to handle authentication
const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// App wrapper with AuthProvider and Router
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
        <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/auth"} replace />} />
      </Routes>
    </div>
  );
}

export default AppWithAuth;
