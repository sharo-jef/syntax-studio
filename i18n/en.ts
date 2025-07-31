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
  
  saveStatus: {
    saved: 'Saved',
    failed: 'Save failed',
    noContent: 'No content to save',
  },
  
  help: {
    title: 'Shiki Help',
    openHelp: 'Open Help',
    basicUsage: {
      title: 'Basic Usage',
      description: 'Shiki configuration is written in JSON format containing language name, display name, and patterns. Patterns consist of regular expressions paired with scope names.',
    },
    grammarPatterns: {
      title: 'Grammar Pattern Types',
      match: 'match',
      matchDescription: 'Used for single-line pattern matching',
      beginEnd: 'begin/end',
      beginEndDescription: 'Used for multi-line patterns (like comment blocks)',
      include: 'include',
      includeDescription: 'Reference other patterns or external repositories',
    },
    commonScopes: {
      title: 'Common Scope Names',
      keywordControl: 'Control structures (if, for, return, etc.)',
      stringDouble: 'Double-quoted strings',
      commentLine: 'Single line comments (// style)',
      commentBlock: 'Block comments (/* */ style)',
      constantNumeric: 'Numeric constants',
      variableOther: 'Variable names',
      entityFunction: 'Function names',
      supportType: 'Supported type names',
    },
    regexPatterns: {
      title: 'Common Regex Patterns',
      wordBoundary: 'Exact word match with word boundaries',
      doubleQuotedString: 'Double-quoted strings',
      lineComment: 'Single-line comment to end of line',
      blockComment: 'Block comment (non-greedy match)',
      number: 'Integer or decimal number',
      identifier: 'Identifier (variable names, function names, etc.)',
    },
    advancedFeatures: {
      title: 'Advanced Features',
      repository: 'repository',
      repositoryDescription: 'Define reusable patterns that can be referenced with include',
      captures: 'captures',
      capturesDescription: 'Apply different scopes to specific parts within a pattern',
      while: 'while',
      whileDescription: 'Specify continuation conditions for begin/end patterns',
    },
    tips: {
      title: 'Tips and Tricks',
      escapeRegex: 'Escape special regex characters (., *, +, ?, etc.) with backslashes',
      testPatterns: 'Test your patterns by entering sample code in the left editor',
      orderMatters: 'Pattern order matters - place more specific patterns first',
      useMonaco: 'Use Monaco Editor\'s auto-completion to quickly insert scope names and structure templates',
    },
  },
};
