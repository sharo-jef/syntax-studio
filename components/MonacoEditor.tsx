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
      // Configure JSON language service with Shiki schema
      const jsonDiagnosticsOptions = {
        validate: true,
        allowComments: false,
        schemaValidation: "error" as const,
        enableSchemaRequest: true,
        schemas: [
          {
            uri: "http://shiki-schema.json",
            fileMatch: ["*"],
            schema: shikiJsonSchema,
          },
        ],
      };

      monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions(
        jsonDiagnosticsOptions
      );

      // Register completion item provider for enhanced Shiki JSON completion
      const completionProvider =
        monacoInstance.languages.registerCompletionItemProvider("json", {
          provideCompletionItems: (model, position) => {
            const textUntilPosition = model.getValueInRange({
              startLineNumber: 1,
              startColumn: 1,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            });

            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn,
            };

            // Determine context
            const isInPatterns = textUntilPosition.includes('"patterns"');
            const isInMatch = textUntilPosition.includes('"match"');
            const isInName = textUntilPosition.includes('"name"');
            const lineText = model.getLineContent(position.lineNumber);
            const beforeCursor = lineText.substring(0, position.column - 1);

            let suggestions: any[] = [];

            // Provide regex pattern suggestions when editing "match" field
            if (
              isInMatch &&
              (beforeCursor.includes('"match"') ||
                beforeCursor.includes('"begin"') ||
                beforeCursor.includes('"end"'))
            ) {
              suggestions = commonRegexPatterns.map((pattern) => ({
                label: pattern.name,
                kind: monacoInstance.languages.CompletionItemKind.Snippet,
                insertText: pattern.pattern,
                documentation: pattern.description,
                range: range,
              }));
            }

            // Provide scope name suggestions when editing "name" field
            if (isInName && beforeCursor.includes('"name"')) {
              const scopeNames = [
                "keyword.control",
                "keyword.operator",
                "keyword.other",
                "string.quoted.single",
                "string.quoted.double",
                "string.quoted.triple",
                "string.unquoted",
                "string.interpolated",
                "string.regexp",
                "comment.line.double-slash",
                "comment.line.number-sign",
                "comment.line",
                "comment.block",
                "comment.documentation",
                "constant.numeric",
                "constant.numeric.integer",
                "constant.numeric.float",
                "constant.numeric.hex",
                "constant.numeric.octal",
                "constant.numeric.binary",
                "constant.language",
                "constant.language.boolean",
                "constant.language.null",
                "constant.character",
                "constant.character.escape",
                "variable.parameter",
                "variable.language",
                "variable.other",
                "support.function",
                "support.class",
                "support.type",
                "support.constant",
                "entity.name.function",
                "entity.name.class",
                "entity.name.type",
                "entity.name.namespace",
                "entity.name.tag",
                "entity.other.attribute-name",
                "invalid.illegal",
                "invalid.deprecated",
                "storage.type",
                "storage.modifier",
                "punctuation.definition.string",
                "punctuation.definition.comment",
                "punctuation.separator",
                "punctuation.terminator",
                "punctuation.accessor",
                "meta.brace.round",
                "meta.brace.square",
                "meta.brace.curly",
                "meta.function-call",
                "meta.class",
                "meta.import",
                "meta.export",
              ];

              suggestions = scopeNames.map((scopeName) => ({
                label: scopeName,
                kind: monacoInstance.languages.CompletionItemKind.Value,
                insertText: scopeName,
                documentation: `TextMate scope name: ${scopeName}`,
                range: range,
              }));
            }

            // Provide structure suggestions for JSON objects
            if (!isInMatch && !isInName) {
              suggestions = shikiCompletionItems.map((item) => ({
                label: item.label,
                kind: monacoInstance.languages.CompletionItemKind.Snippet,
                insertText: item.insertText,
                insertTextRules:
                  monacoInstance.languages.CompletionItemInsertTextRule
                    .InsertAsSnippet,
                documentation: item.documentation,
                range: range,
              }));
            }

            return { suggestions };
          },
        });

      return completionProvider;
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
      setupShikiJsonCompletion(monacoInstance);
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
        ...options,
      }}
    />
  );
};
