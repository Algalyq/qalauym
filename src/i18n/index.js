import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import kzTranslations from './locales/kz.json';
import ruTranslations from './locales/ru.json';

// Initialize i18next
i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources: {
      kz: {
        translation: kzTranslations
      },
      ru: {
        translation: ruTranslations
      }
    },
    fallbackLng: 'kz', // Use Kazakh as fallback
    supportedLngs: ['kz', 'ru'], // Only support Kazakh and Russian
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng', // Explicitly set the localStorage key
      lookupFromPathIndex: 0,
      // Save language to localStorage when it changes
      caches: ['localStorage'],
      // This ensures the language is saved to localStorage
      saveMissing: true,
      // This will save the language to localStorage when changed
      onLanguageChanged: (lng) => {
        localStorage.setItem('i18nextLng', lng);
      }
    }
  });

export default i18n;
