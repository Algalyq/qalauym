import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import logo from '../assets/images/logo_q.jpg';
import '../styles/auth/auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for error in URL parameters
    const errorParam = searchParams.get('error');
    if (errorParam === 'authentication_failed') {
      setError('Authentication failed. Please try again.');
      // Clear the error from URL
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [searchParams]);

  const toggleForm = () => {
    setError(''); // Clear any error when toggling forms
    setIsLogin(!isLogin);
  };

  return (
    <div className="container">
      <img src={logo} alt="Logo" className="logo" />
      <div className="w-full max-w-sm sm:max-w-md mt-4">
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {isLogin ? (
          <LoginForm onToggleForm={toggleForm} />
        ) : (
          <RegisterForm onToggleForm={toggleForm} />
        )}
      </div>
    </div>
  );
};

export default Auth;