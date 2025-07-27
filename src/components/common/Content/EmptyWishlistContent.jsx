
import { useTranslation } from 'react-i18next';
import plane from "../../../assets/images/dashboard_plane.svg";
import '../../../styles/dashboard/dashboard.css';
import '../../../styles/common/typography.css'

const EmptyWishlistContent = () => {
    const { t } = useTranslation();
    return (
              <div className="dashboard-content">
                {/* Hero Section */}
                <div className="dashboard-hero">
                  <div className="hero-content">
                    <div className="hero-illustration">
                      <img src={plane} alt="Plane" className="plane-image" />
                    </div>
                    <h1 className="subtitle1">
                      {t('dashboard.welcomeTitle')}
                    </h1>
                    <p className="hero-description">
                      {t('dashboard.welcomeDescription')}
                    </p>
                  </div>
                </div>
        
              </div>
    )
}

export default EmptyWishlistContent;