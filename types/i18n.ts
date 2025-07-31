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
  
  // Save status
  saveStatus: {
    saved: string;
    failed: string;
  };
  
  // Help modal
  help: {
    title: string;
    openHelp: string;
    basicUsage: {
      title: string;
      description: string;
    };
    grammarPatterns: {
      title: string;
      match: string;
      matchDescription: string;
      beginEnd: string;
      beginEndDescription: string;
      include: string;
      includeDescription: string;
    };
    commonScopes: {
      title: string;
      keywordControl: string;
      stringDouble: string;
      commentLine: string;
      commentBlock: string;
      constantNumeric: string;
      variableOther: string;
      entityFunction: string;
      supportType: string;
    };
    regexPatterns: {
      title: string;
      wordBoundary: string;
      doubleQuotedString: string;
      lineComment: string;
      blockComment: string;
      number: string;
      identifier: string;
    };
    advancedFeatures: {
      title: string;
      repository: string;
      repositoryDescription: string;
      captures: string;
      capturesDescription: string;
      while: string;
      whileDescription: string;
    };
    tips: {
      title: string;
      escapeRegex: string;
      testPatterns: string;
      orderMatters: string;
      useMonaco: string;
    };
  };
}
