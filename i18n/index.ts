import { enTranslations } from './en';
import { jaTranslations } from './ja';
import { Locale, Translations } from '../types/i18n';

export const availableLocales: Locale[] = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'ja', name: '日本語', flag: '🇯🇵' },
];

export const translations: Record<string, Translations> = {
  en: enTranslations,
  ja: jaTranslations,
};

export const defaultLocale = 'en';
