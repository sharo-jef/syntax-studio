# Syntax Studio

A web application for creating and editing custom language syntax highlighting. Using Monaco Editor and Shiki, you can visually create and test syntax definitions for your own programming languages.

## Features

- 🎨 **Real-time Preview**: Instantly see results while editing code and syntax configurations simultaneously
- 📝 **Monaco Editor Integration**: Advanced code editor experience
- 🎯 **Shiki Support**: TextMate grammar-based syntax highlighting
- 💾 **Local Storage**: Automatic saving of created language configurations
- 🗂️ **Sidebar Management**: Manage and quickly access saved languages
- 🌍 **Internationalization**: Multi-language support (English/Japanese)
- 📱 **Responsive Design**: Desktop and mobile compatible

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Editor**: Monaco Editor
- **Syntax Highlighting**: Shiki
- **UI**: React Icons, React DnD
- **Styling**: CSS Modules

## Project Structure

```
components/
├── LanguageSwitcher.tsx  # Language switcher component
├── MonacoEditor.tsx      # Monaco Editor component
├── Sidebar.tsx           # Sidebar (language management)
├── SyntaxHighlighter.tsx # Main application
└── TabBar.tsx           # Tab bar component

data/
├── sampleConfigs.ts     # Sample language configurations
└── shikiSchema.ts       # Shiki JSON schema and completion data

hooks/
├── useAutoSave.ts       # Auto-save hook
├── useI18n.ts           # Internationalization hook
└── useLocalStorage.ts   # Local storage management

i18n/
├── en.ts               # English translations
├── I18nProvider.tsx    # I18n context provider
├── index.ts            # I18n configuration
└── ja.ts               # Japanese translations

pages/
├── _app.tsx            # Next.js application configuration
├── _document.tsx       # HTML document configuration
└── index.tsx           # Main page

styles/
├── globals.css         # Global styles
└── globals.module.css  # CSS modules

types/
├── i18n.ts             # I18n type definitions
└── syntax.ts           # Syntax type definitions
```

## Setup

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sharo-jef/syntax-studio.git
cd syntax-studio

# Install dependencies
npm install
```

### Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser to access the application.

### Build

```bash
npm run build
```

### Production

```bash
npm run start
```

## Usage

### 1. Creating a New Language

1. Click the "New Language" button in the sidebar
2. Edit sample code in the left editor
3. Edit Shiki configuration (JSON) in the right editor
4. Syntax highlighting is applied in real-time

### 2. Enhanced JSON Editor Features

The Shiki configuration editor provides comprehensive auto-completion:

- **Schema Validation**: Real-time validation of JSON structure against Shiki schema
- **Property Suggestions**: Auto-complete for all Shiki configuration properties (`name`, `displayName`, `patterns`, etc.)
- **Scope Name Completion**: Built-in suggestions for TextMate scope names (e.g., `keyword.control`, `string.quoted.double`)
- **Regex Pattern Snippets**: Pre-defined common regex patterns for matching keywords, strings, comments, numbers, etc.
- **Structure Templates**: Quick insertion of pattern templates (simple match, begin/end blocks, includes)
- **Context-Aware Suggestions**: Different completions based on cursor position and surrounding JSON structure

#### Using Auto-Completion

- Press `Ctrl+Space` to trigger suggestions manually
- Suggestions appear automatically while typing
- Use arrow keys to navigate suggestions, `Enter` to accept
- `Tab` key for snippet field navigation

### 3. Language Settings

- Use the language switcher in the top-right corner to switch between English and Japanese
- Language preference is automatically saved to local storage

### 4. Saving and Managing Language Configurations

- Configurations are automatically saved to local storage
- Select or delete saved languages from the sidebar
- Click language names to load them, use trash icon to delete

### 5. Example Shiki Configuration

```json
{
  "name": "my-language",
  "displayName": "My Language",
  "patterns": [
    {
      "name": "keyword.control",
      "match": "\\b(function|return|if|else)\\b"
    },
    {
      "name": "string.quoted.double",
      "match": "\"[^\"]*\""
    },
    {
      "name": "comment.line.double-slash",
      "match": "//.*$"
    }
  ]
}
```

## Type Definitions

### LanguageConfig

Basic structure for language configuration:

```typescript
interface LanguageConfig {
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
```

### ShikiConfig

Shiki grammar configuration:

```typescript
interface ShikiConfig {
  name: string;
  displayName?: string;
  aliases?: string[];
  patterns: Pattern[];
  repository?: { [key: string]: Pattern };
}
```

## Development Guide

### Adding New Components

1. Create a new file in the `components/` directory
2. Use TypeScript and React
3. Add type definitions to `types/syntax.ts` if needed

### Adding New Hooks

1. Create a new file in the `hooks/` directory
2. Follow custom hook best practices

### Adding New Translations

1. Add translation keys to `i18n/en.ts` and `i18n/ja.ts`
2. Use the `useI18n` hook to access translations in components
3. Follow the existing translation structure

### Using Internationalization

```typescript
import { useI18n } from "../hooks/useI18n";

const MyComponent = () => {
  const { t } = useI18n();

  return <div>{t("common.save")}</div>;
};
```

### Editing Styles

- Global styles: `styles/globals.css`
- Component-specific: Use CSS Modules
