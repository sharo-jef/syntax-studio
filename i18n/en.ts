import { Translations } from '../types/i18n';

export const enTranslations: Translations = {
  app: {
    title: 'Syntax Studio',
    description: 'Create custom syntax highlighting for your languages',
  },
  
  sidebar: {
    newLanguage: 'New Language',
    collapse: 'Collapse',
    expand: 'Expand',
    noSavedLanguages: 'No saved languages',
    createNewLanguage: 'Create a new language',
    updated: 'Updated',
    delete: 'Delete',
    deleteLanguage: 'Delete Language',
    deleteConfirmMessage: 'Do you want to delete "{name}"?',
    deleteConfirmSubmessage: 'This action cannot be undone.',
    cancel: 'Cancel',
    deleteAction: 'Delete',
  },
  
  panels: {
    sampleCode: 'Source code',
    shikiConfig: 'Shiki Configuration (JSON)',
  },
  
  sampleCode: {
    newLanguageSample: '// New language sample code\nfunction hello() {\n  return "Hello, World!";\n}',
    myLanguageSample: '// MyLang Sample Code',
    hello: 'Hello',
    world: 'World',
    fibonacci: 'fibonacci',
    calculate: 'calculate',
    greet: 'greet',
    mainProgram: '// Main program',
    shouldOutput: '// This should output 55',
  },
  
  languages: {
    newLanguage: 'New Language',
    myLanguage: 'My Language',
    customLanguage: 'Custom Language',
  },
  
  languageSwitcher: {
    changeLanguage: 'Change Language',
  },
};
