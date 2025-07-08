import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';

// App wrapper with AuthProvider
function AppWithAuth() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// Main app content with conditional rendering based on auth state
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
      {currentUser ? <Dashboard /> : <Auth />}
    </div>
  );
}

export default AppWithAuth;
