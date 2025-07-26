import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import '../../styles/common/language-selector.css';

const LanguageSelector = () => {
  const { t, i18n: i18nInstance } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18nInstance.changeLanguage(lng);
  };

  const currentLanguage = i18nInstance.language || 'ru';
  const isRuOrKz = currentLanguage === 'ru' || currentLanguage === 'kz';
  
  return (
    <div className="language-selector">
      <button
        onClick={() => changeLanguage('kz')}
        className={`language-button ${currentLanguage === 'kz' ? 'active' : 'inactive'} ${isRuOrKz ? 'ru-kz' : ''}`}
        aria-label="Қазақша тіл"
      >
        KZ
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`language-button ${currentLanguage === 'ru' ? 'active' : 'inactive'} ${isRuOrKz ? 'ru-kz' : ''}`}
        aria-label="Русский язык"
      >
        RU
      </button>
    </div>
  );
};

export default LanguageSelector;
