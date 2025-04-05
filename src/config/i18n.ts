import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import es from '../locales/es.json';
import zh from '../locales/zh.json';
import hi from '../locales/hi.json';
import fr from '../locales/fr.json';
import ko from '../locales/ko.json';
import ja from '../locales/ja.json';
import de from '../locales/de.json';
import ar from '../locales/ar.json';
import pt from '../locales/pt.json';
import ru from '../locales/ru.json';
import it from '../locales/it.json';
import 'intl-pluralrules';

let i18nInitialized = false;

export const initializeLanguage = async () => {
  // localStorage는 동기 방식이므로 바로 값을 읽습니다.
  const storedLanguage = localStorage.getItem('language');
  const language = storedLanguage || 'en';
  await i18n.changeLanguage(language); // Promise 반환, 기다림
  i18nInitialized = true;
};

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      es: { translation: es },
      zh: { translation: zh },
      hi: { translation: hi },
      fr: { translation: fr },
      ko: { translation: ko },
      ja: { translation: ja },
      de: { translation: de },
      ar: { translation: ar },
      pt: { translation: pt },
      ru: { translation: ru },
      it: { translation: it },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    initImmediate: false,
  }).then(initializeLanguage);

export const isI18nInitialized = () => i18nInitialized;

export default i18n;
