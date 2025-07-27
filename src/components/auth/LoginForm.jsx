import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../common/LanguageSelector';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import '../../styles/auth/login-form.css';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const LoginForm = ({ onToggleForm }) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { login } = useAuth();
  
  // Check if current language is Russian or Kazakh
  const isRuOrKz = i18n.language === 'ru' || i18n.language === 'kz';
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError(t('auth.errors.fillAllFields'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(username, password);
      // Navigate to dashboard after successful login
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Login error:', err);
      setError(t('auth.errors.failedToLogin'));
    } finally {
      setLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleLogin = () => {
    try {
      // Construct the OAuth URL with the correct redirect_uri using api's baseURL
      const oauthUrl = new URL('/oauth2/authorization/google', api.defaults.baseURL);
      
      // The backend should be configured to redirect to this URL after successful authentication
      const frontendCallbackUrl = `${window.location.origin}/login/oauth2/code/google`;
      // Add the redirect_uri as a query parameter
      oauthUrl.searchParams.append('redirect_uri', frontendCallbackUrl);
      
      // For Google OAuth2, it's better to use a full page redirect
      // rather than making an AJAX request
      window.location.href = oauthUrl.toString();
      
    } catch (error) {
      console.error('Error initiating Google login:', error);
      setError(t('auth.errors.googleLoginFailed'));
    }
  };

  return (
    <div className="login-container">
      <div className="form-header">
        <h2 className={`form-title ${isRuOrKz ? 'ru-kz' : ''}`}>
          {t('auth.login')}
        </h2>
        <LanguageSelector />
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="username" 
            className={`form-label ${isRuOrKz ? 'ru-kz' : ''}`}
          >
            {t('auth.username')}
          </label>
          <div className="input-container">
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`form-input ${isRuOrKz ? 'ru-kz' : ''}`}
            />
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="password" 
            className={`form-label ${isRuOrKz ? 'ru-kz' : ''}`}
          >
            {t('auth.password')}
          </label>
          <div className="input-container">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`form-input ${isRuOrKz ? 'ru-kz' : ''}`}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`button-primary ${isRuOrKz ? 'ru-kz' : ''}`}
        >
          {loading ? t('auth.loggingIn') : t('auth.loginButton')}
        </button>
        
        <div className="divider">
          <div className="divider-line"></div>
          <div className={`divider-text ${isRuOrKz ? 'ru-kz' : ''}`}>
            {t('auth.orLoginWith')}
          </div>
          <div className="divider-line"></div>
        </div>
        
        <div className="social-buttons">
          <button
            type="button"
            className="social-button google"
            onClick={handleGoogleLogin}
          >
            <FcGoogle size={24} />
          </button>
        </div>
      </form>
      
      <div className="register-link">
        <p className={`register-text ${isRuOrKz ? 'ru-kz' : ''}`}>
          {t('auth.dontHaveAccount')}
          <button 
            onClick={onToggleForm}
            className={`register-button ${isRuOrKz ? 'ru-kz' : ''}`}
          >
            {t('auth.registerHere')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
