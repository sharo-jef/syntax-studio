import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { LanguageConfig } from "../types/syntax";
import {
  shikiJsonSchema,
  shikiCompletionItems,
  commonRegexPatterns,
} from "../data/shikiSchema";

// Monaco types for type safety
type Monaco = typeof import("monaco-editor");
type MonacoEditor = import("monaco-editor").editor.IStandaloneCodeEditor;

interface MonacoEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  theme?: string;
  options?: import("monaco-editor").editor.IStandaloneEditorConstructionOptions;
  languageConfig?: LanguageConfig;
}

export const MonacoEditor: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  language = "plaintext",
  theme = "vs-dark",
  options = {},
  languageConfig,
}) => {
  const editorRef = useRef<MonacoEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [isEditorMounted, setIsEditorMounted] = React.useState(false);

  const convertShikiTokenToMonaco = React.useCallback(
    (shikiTokenName: string) => {
      // Convert Shiki token names to Monaco token names
      const mapping: { [key: string]: string } = {
        "keyword.control": "keyword",
        "keyword.operator": "operator",
        "string.quoted.double": "string",
        "string.quoted.single": "string",
        "comment.line.double-slash": "comment",
        "comment.line": "comment",
        "comment.block": "comment",
        "constant.numeric": "number",
        "constant.language": "keyword",
        "variable.parameter": "variable",
        "support.function": "identifier",
        "entity.name.function": "identifier",
        "entity.name.type": "type",
      };

      return mapping[shikiTokenName] || "identifier";
    },
    []
  );

  const setupShikiJsonCompletion = React.useCallback(
    (monacoInstance: Monaco) => {
      console.log("Setting up Shiki JSON completion...");
      console.log(
        "Monaco languages:",
        monacoInstance.languages.getLanguages().map((l) => l.id)
      );

      // Use only schema-based completions - no custom provider needed
      const jsonDiagnosticsOptions = {
        validate: true,
        allowComments: false,
        schemaValidation: "error" as const,
        enableSchemaRequest: false,
        schemas: [
          {
            uri: "http://shiki-schema",
            fileMatch: ["*"],
            schema: shikiJsonSchema,
          },
        ],
      };

      monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions(
        jsonDiagnosticsOptions
      );

      // No custom completion provider needed - schema does everything
    },
    []
  );

  const convertShikiToMonarch = React.useCallback(
    (shikiConfig: any) => {
      const monarchTokens: any = {
        tokenizer: {
          root: [],
        },
      };

      if (shikiConfig.patterns) {
        shikiConfig.patterns.forEach((pattern: any) => {
          if (pattern.match) {
            // Simple regex match - 文字列として直接使用
            const tokenType = convertShikiTokenToMonaco(pattern.name);
            let regexPattern = pattern.match;

            // ダブルエスケープを修正
            regexPattern = regexPattern.replace(/\\\\/g, "\\");

            // RegExpオブジェクトを作らず、文字列として直接使用
            monarchTokens.tokenizer.root.push([regexPattern, tokenType]);
          } else if (pattern.begin && pattern.end) {
            // Begin/end pattern for multiline
            const tokenType = convertShikiTokenToMonaco(pattern.name);
            let beginPattern = pattern.begin.replace(/\\\\/g, "\\");
            let endPattern = pattern.end.replace(/\\\\/g, "\\");
            const stateName = pattern.name.replace(/\./g, "_");

            monarchTokens.tokenizer.root.push([
              beginPattern,
              { token: tokenType, next: `@${stateName}` },
            ]);

            monarchTokens.tokenizer[stateName] = [
              [endPattern, { token: tokenType, next: "@pop" }],
              [/./, tokenType],
            ];
          }
        });
      }

      return monarchTokens;
    },
    [convertShikiTokenToMonaco]
  );

  const registerCustomLanguage = React.useCallback(
    (config: LanguageConfig, monacoInstance: Monaco) => {
      try {
        // Register language (always register/re-register)
        monacoInstance.languages.register({
          id: config.id,
          extensions: config.extensions,
          aliases: config.aliases,
        });

        // Set language configuration (always set/update)
        if (config.configuration) {
          monacoInstance.languages.setLanguageConfiguration(
            config.id,
            config.configuration
          );
        }

        // Convert Shiki patterns to Monaco tokenizer (always set/update)
        if (config.shikiConfig) {
          const monarchTokens = convertShikiToMonarch(config.shikiConfig);
          monacoInstance.languages.setMonarchTokensProvider(
            config.id,
            monarchTokens
          );
        }
      } catch (error) {
        // Failed to register custom language, will continue with default highlighting
      }
    },
    [convertShikiToMonarch]
  );

  // Re-register language when languageConfig changes
  React.useEffect(() => {
    if (
      isEditorMounted &&
      editorRef.current &&
      monacoRef.current &&
      languageConfig
    ) {
      registerCustomLanguage(languageConfig, monacoRef.current);
      const model = editorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelLanguage(model, languageConfig.id);
      }
    }
  }, [languageConfig, isEditorMounted, registerCustomLanguage]);

  const handleEditorDidMount = (
    editor: MonacoEditor,
    monacoInstance: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;
    setIsEditorMounted(true);

    // Register custom language if provided
    if (languageConfig) {
      registerCustomLanguage(languageConfig, monacoInstance);
      const model = editor.getModel();
      if (model) {
        monacoInstance.editor.setModelLanguage(model, languageConfig.id);
      }
    }

    // Enhanced JSON completion for shiki config files
    if (language === "json") {
      console.log("Language is JSON, setting up completion for:", language);
      setupShikiJsonCompletion(monacoInstance);
    } else {
      console.log("Language is not JSON, skipping completion setup:", language);
    }

    // Add paste event handling
    editor.onDidPaste(() => {
      const currentValue = editor.getValue();
      setTimeout(() => {
        onChange(currentValue);
      }, 100);
    });

    // Add handling for when editor loses focus
    editor.onDidBlurEditorText(() => {
      const currentValue = editor.getValue();
      onChange(currentValue);
    });
  };

  const handleChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={languageConfig ? languageConfig.id : language}
      language={languageConfig ? languageConfig.id : language}
      value={value}
      theme={theme}
      onChange={handleChange}
      onMount={handleEditorDidMount}
      options={{
        automaticLayout: true,
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: "on",
        renderWhitespace: "selection",
        tabSize: 2,
        insertSpaces: true,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        // Selection related options to ensure proper selection display
        selectOnLineNumbers: true,
        selectionHighlight: true,
        occurrencesHighlight: "singleFile",
        renderLineHighlight: "line",
        cursorBlinking: "blink",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        // Code folding
        folding: true,
        showFoldingControls: "mouseover",
        // Ensure text selection is enabled
        readOnly: false,
        domReadOnly: false,
        // Mouse and selection behavior
        mouseWheelZoom: false,
        multiCursorModifier: "ctrlCmd",
        // Auto-completion settings
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnCommitCharacter: false, // Prevent accidental selection with Enter
        acceptSuggestionOnEnter: "smart", // Only accept on Enter when explicitly intended
        quickSuggestions: {
          other: false, // Don't show quick suggestions for general typing
          comments: false,
          strings: false, // Don't show in strings to avoid interference
        },
        quickSuggestionsDelay: 300, // Longer delay to reduce unwanted triggers
        wordBasedSuggestions: "off", // Turn off word-based suggestions to prioritize our custom ones
        suggest: {
          showIcons: true,
          showSnippets: true,
          showWords: false, // Disable word suggestions
          showColors: false,
          showFiles: false,
          showReferences: false,
          showFolders: false,
          showTypeParameters: false,
          showIssues: false,
          showUsers: false,
          showValues: true,
          showMethods: true,
          showFunctions: true,
          showConstructors: true,
          showFields: true,
          showVariables: true,
          showClasses: true,
          showStructs: true,
          showInterfaces: true,
          showModules: true,
          showProperties: true,
          showEvents: true,
          showOperators: true,
          showUnits: true,
          showKeywords: true,
          showConstants: true,
          showEnums: true,
          showEnumMembers: true,
        },
        ...options,
      }}
    />
  );
};
