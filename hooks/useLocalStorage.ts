import { useState, useEffect } from 'react';
import { SavedLanguage, LanguageConfig, ShikiConfig } from '../types/syntax';

const STORAGE_KEY = 'my-syntax-languages';
const CURRENT_LANGUAGE_KEY = 'my-syntax-current-language';

export const useLocalStorage = () => {
  const [savedLanguages, setSavedLanguages] = useState<SavedLanguage[]>([]);

  useEffect(() => {
    loadFromStorage();
  }, []);

  const loadFromStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSavedLanguages(Array.isArray(parsed) ? parsed : []);
      }
    } catch (error) {
      setSavedLanguages([]);
    }
  };

  const saveToStorage = (languages: SavedLanguage[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(languages));
      setSavedLanguages(languages);
    } catch (error) {
      // Failed to save to localStorage
    }
  };

  const saveLanguage = (
    id: string,
    name: string,
    languageConfig: LanguageConfig,
    shikiConfig: ShikiConfig,
    sampleCode: string
  ) => {
    const existing = savedLanguages.find(lang => lang.id === id);
    const now = new Date().toISOString();
    
    let updatedLanguages: SavedLanguage[];
    
    if (existing) {
      updatedLanguages = savedLanguages.map(lang =>
        lang.id === id
          ? {
              ...lang,
              name,
              languageConfig,
              shikiConfig,
              sampleCode,
              updatedAt: now,
            }
          : lang
      );
    } else {
      const newLanguage: SavedLanguage = {
        id,
        name,
        languageConfig,
        shikiConfig,
        sampleCode,
        createdAt: now,
        updatedAt: now,
      };
      updatedLanguages = [...savedLanguages, newLanguage];
    }
    
    saveToStorage(updatedLanguages);
  };

  const deleteLanguage = (id: string) => {
    const updatedLanguages = savedLanguages.filter(lang => lang.id !== id);
    saveToStorage(updatedLanguages);
  };

  const loadLanguage = (id: string): SavedLanguage | undefined => {
    return savedLanguages.find(lang => lang.id === id);
  };

  const saveCurrentLanguageId = (id: string) => {
    try {
      localStorage.setItem(CURRENT_LANGUAGE_KEY, id);
    } catch (error) {
      // Failed to save current language ID
    }
  };

  const getCurrentLanguageId = (): string | null => {
    try {
      return localStorage.getItem(CURRENT_LANGUAGE_KEY);
    } catch (error) {
      return null;
    }
  };

  return {
    savedLanguages,
    saveLanguage,
    deleteLanguage,
    loadLanguage,
    saveCurrentLanguageId,
    getCurrentLanguageId,
    refresh: loadFromStorage,
  };
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
