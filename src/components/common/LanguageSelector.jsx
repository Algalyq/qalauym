import { useTranslation } from 'react-i18next';
import '../../styles/common/language-selector.css';

const LanguageSelector = () => {
  const { i18n } = useTranslation();
  
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const isRuOrKz = i18n.language === 'ru' || i18n.language === 'kz';
  
  return (
    <div className="language-selector">
      <button
        onClick={() => changeLanguage('kz')}
        className={`language-button ${i18n.language === 'kz' ? 'active' : 'inactive'} ${isRuOrKz ? 'ru-kz' : ''}`}
        aria-label="Қазақша тіл"
      >
        KZ
      </button>
      <button
        onClick={() => changeLanguage('ru')}
        className={`language-button ${i18n.language === 'ru' ? 'active' : 'inactive'} ${isRuOrKz ? 'ru-kz' : ''}`}
        aria-label="Русский язык"
      >
        RU
      </button>
    </div>
  );
};

export default LanguageSelector;
