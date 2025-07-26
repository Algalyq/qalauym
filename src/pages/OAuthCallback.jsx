import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OAuthCallback = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Extract token from URL
  const extractToken = () => {
    // First check URL search params
    const searchParams = new URLSearchParams(window.location.search);
    console.log('Current path:', window.location.pathname);
    let token = searchParams.get('token');
    const error = searchParams.get('error');
    
    // If no token in URL, check localStorage
    if (!token && !error) {
      token = localStorage.getItem('token');
      console.log('Using token from localStorage');
    }
    
    // Then check URL hash (for OAuth providers that use hash fragments)
    let accessToken = null;
    if (window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      accessToken = hashParams.get('access_token');
    }
    
    return { 
      token: token || accessToken,
      error
    };
  };

  useEffect(() => {
    let isMounted = true;
    
    const handleOAuthCallback = async () => {
      // If we're already on the dashboard and have a token, we're done
      if (window.location.pathname === '/dashboard' && localStorage.getItem('token')) {
        console.log('Already on dashboard with valid token, skipping OAuth callback');
        setLoading(false);
        return;
      }

      try {
        console.log('Handling OAuth callback...');
        
        // Extract token from URL or localStorage
        const { token, error: oauthError } = extractToken();
        console.log('Token from extractor:', token ? 'Token found' : 'No token');
        
        // Check for OAuth errors
        if (oauthError) {
          throw new Error(`OAuth error: ${oauthError}`);
        }
        
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        console.log('Token received from OAuth flow');
        
        // Store the token
        localStorage.setItem('token', token);
        
        // Clear URL parameters to prevent re-processing
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Only navigate if component is still mounted
        if (isMounted) {
          console.log('Navigating to /dashboard');
          // Force a full page reload to ensure proper navigation
          window.location.href = '/dashboard';
        }
        
      } catch (err) {
        console.error('OAuth callback error:', err);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setError(err.message || 'Authentication failed. Please try again.');
          
          // Redirect to login page with error
          navigate(`/auth?error=${encodeURIComponent(err.message || 'authentication_failed')}`, { 
            replace: true 
          });
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    handleOAuthCallback();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [navigate, login]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Completing authentication, please wait...</p>
        </div>
      </div>
    );
  }

  // Show error state (should be handled by navigation, but just in case)
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 max-w-md w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
              <div className="mt-4">
                <button
                  onClick={() => navigate('/auth', { replace: true })}
                  className="text-sm font-medium text-red-700 hover:text-red-600 transition duration-150 ease-in-out"
                >
                  Return to login
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Should never reach here due to navigation in the effect
  return null;
};

export default OAuthCallback;