import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/common/typography.css';
import '../../styles/common/mobileonly.css';
import Icon from './Icon/Icon';

const MobileOnlyMessage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="mobile-only-container">
      <div className="mobile-only-content">
        <div className="mobile-only-icon">
          <Icon name="smartphone" size={64} />
        </div>
        <h2 className="mobile-only-title h2">
          {t('common.mobileOnly.title', 'This app is designed for mobile')}
        </h2>
        <p className="mobile-only-message">
          {t('common.mobileOnly.message', 'Please open this application on a mobile device for the best experience.')}
        </p>
      </div>
    </div>
  );
};

export default MobileOnlyMessage;
