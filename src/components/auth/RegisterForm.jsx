import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import LanguageSelector from '../common/LanguageSelector';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import '../../styles/auth/register-form.css';

const RegisterForm = ({ onToggleForm }) => {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [birthday, setBirthday] = useState('');
  const [gender, setGender] = useState('M');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const { register } = useAuth();
  
  // Check if current language is Russian or Kazakh
  const isRuOrKz = i18n.language === 'ru' || i18n.language === 'kz';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password || !confirmPassword || !birthday) {
      setError(t('auth.errors.fillAllFields'));
      return;
    }
    
    if (password !== confirmPassword) {
      setError(t('auth.errors.passwordsDoNotMatch'));
      return;
    }
    
    try {
      setLoading(true);
      const userData = {
        username,
        password,
        birthday,
        gender
      };
      await register(userData);
      // Registration successful, no need to redirect as the AuthContext will handle the user state
    } catch (err) {
      setError(t('auth.errors.failedToRegister'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="register-container">
      <div className="form-header">
        <h2 className={`form-title ${isRuOrKz ? 'ru-kz' : ''}`}>
          {t('auth.register')}
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

        <div className="form-group">
          <label htmlFor="confirm-password" 
            className={`form-label ${isRuOrKz ? 'ru-kz' : ''}`}
          >
            {t('auth.confirmPassword')}
          </label>
          <div className="input-container">
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`form-input ${isRuOrKz ? 'ru-kz' : ''}`}
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility}
              className="password-toggle"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>
        
        <div className="two-column">
          <div className="form-group">
            <label htmlFor="birthday" 
              className={`form-label ${isRuOrKz ? 'ru-kz' : ''}`}
            >
              {t('auth.birthday')}
            </label>
            <div className="input-container">
              <input
                id="birthday"
                type="date"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className={`form-input ${isRuOrKz ? 'ru-kz' : ''}`}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="gender" 
              className={`form-label ${isRuOrKz ? 'ru-kz' : ''}`}
            >
              {t('auth.gender')}
            </label>
            <div className="input-container">
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={`form-select ${isRuOrKz ? 'ru-kz' : ''}`}
              >
                <option value="M">{t('auth.male')}</option>
                <option value="F">{t('auth.female')}</option>
              </select>
            </div>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`button-primary ${isRuOrKz ? 'ru-kz' : ''}`}
        >
          {loading ? t('auth.creatingAccount') : t('auth.registerButton')}
        </button>
        
        <div className="divider">
          <div className="divider-line"></div>
          <div className={`divider-text ${isRuOrKz ? 'ru-kz' : ''}`}>
            {t('auth.orRegisterWith')}
          </div>
          <div className="divider-line"></div>
        </div>
        
        <div className="social-buttons">
          <button
            type="button"
            className="social-button google"
          >
            <FcGoogle size={24} />
          </button>
        </div>
      </form>
      
      <div className="login-link">
        <p className={`login-text ${isRuOrKz ? 'ru-kz' : ''}`}>
          {t('auth.alreadyHaveAccount')}
          <button 
            onClick={onToggleForm}
            className={`login-button ${isRuOrKz ? 'ru-kz' : ''}`}
          >
            {t('auth.loginHere')}
          </button>
        </p>
      </div>
    </div>
  );
};

export default RegisterForm;
