import { useState, useEffect, useCallback } from 'react';
import { translations, defaultLocale } from '../i18n';
import { Translations } from '../types/i18n';

const LOCALE_STORAGE_KEY = 'syntax-studio-locale';

export const useI18n = () => {
  const [currentLocale, setCurrentLocale] = useState<string>(defaultLocale);
  
  // Debug: Log locale changes
  // デバッグログ削除済み

  // Load locale from localStorage on mount
  useEffect(() => {
    try {
      const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
      if (savedLocale && translations[savedLocale]) {
        setCurrentLocale(savedLocale);
      }
    } catch (error) {
      // Failed to load locale from localStorage, will use default
    }
  }, []);

  // Save locale to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, currentLocale);
    } catch (error) {
      // Failed to save locale to localStorage
    }
  }, [currentLocale]);

  const changeLocale = useCallback((locale: string) => {
    if (translations[locale]) {
      setCurrentLocale(locale);
    }
  }, []);

  const t = useCallback((key: string, params?: Record<string, string>): string => {
    const translation = translations[currentLocale] || translations[defaultLocale];
    const keys = key.split('.');
    let value: any = translation;

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    // Replace parameters in the translation
    if (params) {
      return Object.entries(params).reduce((str, [param, val]) => {
        return str.replace(new RegExp(`\\{${param}\\}`, 'g'), val);
      }, value);
    }

    return value;
  }, [currentLocale]);

  return {
    currentLocale,
    changeLocale,
    t,
    translations: translations[currentLocale] || translations[defaultLocale],
  };
};
