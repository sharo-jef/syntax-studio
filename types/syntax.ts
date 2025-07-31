export interface LanguageConfig {
  id: string;
  name: string;
  extensions: string[];
  aliases?: string[];
  configuration?: {
    comments?: {
      lineComment?: string;
      blockComment?: [string, string];
    };
    brackets?: [string, string][];
    autoClosingPairs?: { open: string; close: string }[];
    surroundingPairs?: { open: string; close: string }[];
  };
  tokenizer?: {
    root: TokenRule[];
    [stateName: string]: TokenRule[];
  };
  shikiConfig?: ShikiConfig;
}

export interface TokenRule {
  regex: string;
  action: string | { token: string; next?: string };
}

export interface ShikiConfig {
  name: string;
  displayName?: string;
  aliases?: string[];
  patterns: Pattern[];
  repository?: {
    [key: string]: {
      patterns: Pattern[];
    };
  };
}

export interface Pattern {
  name?: string;
  match?: string;
  begin?: string;
  end?: string;
  include?: string;
  patterns?: Pattern[];
}

export interface TabData {
  id: string;
  title: string;
  type: 'language' | 'shiki-config';
  languageId?: string;
  content: string;
  isActive: boolean;
}

export interface SavedLanguage {
  id: string;
  name: string;
  languageConfig: LanguageConfig;
  shikiConfig: ShikiConfig;
  sampleCode: string;
  createdAt: string;
  updatedAt: string;
}
