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
    fallbackLng: 'ru', // Use Russian as fallback
    supportedLngs: ['kz', 'ru'], // Only support Kazakh and Russian
    interpolation: {
      escapeValue: false // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
