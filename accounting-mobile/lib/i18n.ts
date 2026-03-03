import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from '../locales/en.json';
import tr from '../locales/tr.json';
import de from '../locales/de.json';

const resources = {
    en: { translation: en },
    tr: { translation: tr },
    de: { translation: de }
};

const initI18n = async () => {
    const savedLanguage = await AsyncStorage.getItem('user-language');
    const deviceLanguage = getLocales()[0]?.languageCode || 'en';
    const initialLang = savedLanguage || deviceLanguage;

    i18n
        .use(initReactI18next)
        .init({
            compatibilityJSON: 'v3',
            resources,
            lng: initialLang, // default language to use
            fallbackLng: 'en', // use en if translation is missing
            interpolation: {
                escapeValue: false // not needed for react as it escapes by default
            }
        });
};

initI18n();

export default i18n;
