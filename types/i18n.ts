export interface Locale {
  id: string;
  name: string;
  flag: string;
}

export interface Translations {
  // App General
  app: {
    title: string;
    description: string;
  };
  
  // Sidebar
  sidebar: {
    newLanguage: string;
    collapse: string;
    expand: string;
    noSavedLanguages: string;
    createNewLanguage: string;
    updated: string;
    delete: string;
    deleteLanguage: string;
    deleteConfirmMessage: string;
    deleteConfirmSubmessage: string;
    cancel: string;
    deleteAction: string;
  };
  
  // Panel headers
  panels: {
    sampleCode: string;
    shikiConfig: string;
  };
  
  // Sample code
  sampleCode: {
    newLanguageSample: string;
    myLanguageSample: string;
    hello: string;
    world: string;
    fibonacci: string;
    calculate: string;
    greet: string;
    mainProgram: string;
    shouldOutput: string;
  };
  
  // Language names
  languages: {
    newLanguage: string;
    myLanguage: string;
    customLanguage: string;
  };
  
  // Language switcher
  languageSwitcher: {
    changeLanguage: string;
  };
}
