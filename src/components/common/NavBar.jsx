import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import '../../styles/common/navbar.css';
import Icon from './Icon/Icon';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('home');
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  // Set active tab based on current location
  useEffect(() => {
    if (location.pathname === '/dashboard') {
      setActiveTab('home');
    } else if (location.pathname === '/profile') {
      setActiveTab('account');
    }
  }, [location]);
  
  const navItems = [
    { id: 'home', translationKey: 'navbar.home', icon: 'home', path: '/dashboard' },
    // { id: 'capsules', translationKey: 'navbar.capsules', icon: 'list' },
    // { id: 'plans', translationKey: 'navbar.plans', icon: 'plus' },
    { id: 'account', translationKey: 'navbar.account', icon: 'profile', path: '/profile' }
  ];

  return (
    <nav className="navbar">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => {
            setActiveTab(item.id);
            if (item.path) {
              navigate(item.path);
            }
          }}
        >
          <div className="nav-icon">
            <Icon 
              name={item.icon} 
              size={24} 
              className={activeTab === item.id ? 'active' : ''} 
            />
          </div>
          <p className="nav-label">{t(item.translationKey)}</p>
        </div>
      ))}
    </nav>
  );
};

export default Navbar;