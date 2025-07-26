import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/common/navbar.css';
import Icon from './Icon/Icon';

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('home');

  const { t } = useTranslation();
  
  const navItems = [
    { id: 'home', translationKey: 'navbar.home', icon: 'home' },
    // { id: 'capsules', translationKey: 'navbar.capsules', icon: 'list' },
    { id: 'plans', translationKey: 'navbar.plans', icon: 'plus' },
    { id: 'account', translationKey: 'navbar.account', icon: 'profile' }
  ];

  return (
    <nav className="navbar">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
          onClick={() => setActiveTab(item.id)}
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