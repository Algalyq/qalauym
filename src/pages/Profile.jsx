import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '../components/common/LanguageSelector';
import userService from '../services/userService';
import NavBar from '../components/common/NavBar';
import EditProfileModal from '../components/common/Modals/EditProfileModal';
import '../styles/profile/profile.css'; // Import the CSS file

// Helper function to generate a consistent random color CLASS NAME
const getRandomColorClass = (username) => {
  if (!username) return 'gray';
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = ['rose', 'blue', 'green', 'purple', 'yellow'];
  return colors[Math.abs(hash) % colors.length];
};

const Profile = () => {
  const { t, i18n } = useTranslation();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  

  const navigate = useNavigate();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    // The language will be saved to localStorage automatically by i18next
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await userService.getUserProfile();
        setProfile(userProfile);
      } catch (err) {
        setError(t('profile.loadError'));
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [t]);

  const avatarBgColorClass = useMemo(() => profile?.username ? getRandomColorClass(profile.username) : 'gray', [profile?.username]);

  const refreshProfile = async () => {
    const userProfile = await userService.getUserProfile();
    setProfile(userProfile);
  };

  if (loading) return <div className="centeredMessage">{t('profile.loading')}</div>;
  if (error) return <div className="centeredMessage errorMessage">{error}</div>;
  if (!profile) return null;

  const showTextAvatar = !profile.avatarUrl;


  const handleLogout = () => {
    // Clear all localStorage data
    localStorage.clear();
    
    // Navigate to main/home page
    navigate('/');
  };

  return (
    <div className="profilePage">


      <div className="language-switcher"> 
        <LanguageSelector />
      </div> 
      <div className="profileContainer">
        <div className="headerBackground">
          <div className="avatarWrapper">
            {showTextAvatar ? (
              <div className={`avatarFallback ${avatarBgColorClass}`}>
                {profile.username ? profile.username.charAt(0) : '?'}
              </div>
            ) : (
              <img src={profile.avatarUrl} alt="User Avatar" className="avatarImage" />
            )}
          </div>
        </div>

        <div className="profileInfo">
          <h1>{profile.firstName || ''} {profile.lastName || ''}</h1>
          <p>@{profile.username}</p>
          <div className="actionButtons">
            {/* <button className="actionButton">
              {/* Share Icon SVG */}
              {/* <span>{t('profile.share')}</span> */}
            {/* </button>  */}
            <button onClick={() => setIsEditModalOpen(true)} className="actionButton">
              {/* Edit Icon SVG */}
              <span>{t('profile.editProfile')}</span>
            </button>
            <button onClick={handleLogout} className="actionButton logoutButton">
              {/* Logout Icon SVG */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>{t('profile.logout')}</span>
            </button>
          </div>
        </div>

        <div className="aboutSection">
          <h2>{t('profile.aboutMe')}</h2>
          <div className="aboutDetails">
            <div><span>{t('profile.birthday')}:</span> {profile.birthday}</div>
            <div><span>{t('profile.phoneNumber')}:</span> {profile.phone || t('profile.notProvided')}</div>
          </div>
        </div>

        <div className="listsSection">
          <h2>{t('profile.lists', { count: profile.wishes ? profile.wishes.length : 0 })}</h2>
          {profile.wishes && profile.wishes.length > 0 ? (
            <div className="listsGrid">
              {profile.wishes.map((wish) => (
                <div key={wish.id} className="listCard">
                  <img src={wish.imageUrl} alt={wish.title} className="listCardImage" />
                  <div className="listCardContent">
                    <h3>{wish.title}</h3>
                    <p>{new Date(wish.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="createListPrompt">
              <button>
                {/* Plus Icon SVG */}
                <span>{t('profile.createAList')}</span>
              </button>
            </div>
          )}
        </div>

        <NavBar/>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSave={refreshProfile}
        />
      )}
    </div>
  );
};

export default Profile;