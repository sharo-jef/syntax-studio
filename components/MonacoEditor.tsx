import React, { useRef } from "react";
import Editor from "@monaco-editor/react";
import { LanguageConfig } from "../types/syntax";
import {
  shikiJsonSchema,
  shikiCompletionItems,
  commonRegexPatterns,
} from "../data/shikiSchema";
import { Registry } from "monaco-textmate";
import { loadWASM } from "onigasm";

// Monaco types for type safety
type Monaco = typeof import("monaco-editor");
type MonacoEditor = import("monaco-editor").editor.IStandaloneCodeEditor;

// Global state for WASM initialization
let wasmInitialized = false;
let registry: Registry | null = null;

// Validate patterns to prevent infinite loops
const validatePatterns = (patterns: any[]): any[] => {
  return patterns.map((pattern) => {
    if (pattern.match) {
      // Check for potentially problematic patterns
      const match = pattern.match;

      // Fix common problematic patterns
      if (match === '"[^"]*?"' || match === '"[^"].*?"') {
        // Replace with safer string pattern
        return {
          ...pattern,
          match: '"[^"]*"',
        };
      }

      // Fix patterns that might not consume characters
      if (match === '"[^"]+"') {
        return {
          ...pattern,
          match: '"[^"]*"',
        };
      }

      // Ensure the pattern can advance
      if (match === ".*" || match === ".*?") {
        // These patterns can cause infinite loops
        return {
          ...pattern,
          match: ".+", // At least one character
        };
      }

      // Handle other potentially problematic patterns
      if (match === "^$" || match === "") {
        return {
          ...pattern,
          match: "\\S+", // At least one non-whitespace character
        };
      }
    }

    return pattern;
  });
};

// Initialize WASM and TextMate registry
const initializeTextMate = async () => {
  if (!wasmInitialized) {
    try {
      // Load onigasm WASM from public directory
      await loadWASM("/onigasm.wasm");
      wasmInitialized = true;

      // Create registry for TextMate grammars
      registry = new Registry({
        getGrammarDefinition: async (scopeName) => {
          // This will be overridden per language
          return {
            format: "json" as const,
            content: JSON.stringify({
              name: "default",
              scopeName,
              patterns: [],
            }),
          };
        },
      });
    } catch (error) {
      console.error("Failed to initialize TextMate:", error);
    }
  }
  return { wasmInitialized, registry };
};

// Register a custom language with TextMate support
const registerTextMateLanguage = async (
  monaco: Monaco,
  languageConfig: LanguageConfig
) => {
  const { wasmInitialized: isInitialized } = await initializeTextMate();

  if (!isInitialized || !languageConfig.shikiConfig) {
    return false;
  }

  try {
    const languageId = languageConfig.id;
    const shikiConfig = languageConfig.shikiConfig;

    // Register the language if not already registered
    const languages = monaco.languages.getLanguages();
    if (!languages.find((lang) => lang.id === languageId)) {
      monaco.languages.register({
        id: languageId,
        extensions: languageConfig.extensions,
        aliases: languageConfig.aliases,
        mimetypes: [`text/x-${languageId}`],
      });
    }

    // Create a grammar definition from Shiki config
    const grammarDefinition = {
      format: "json" as const,
      content: JSON.stringify({
        $schema:
          "https://raw.githubusercontent.com/martinring/tmlanguage/master/tmlanguage.json",
        scopeName: `source.${languageId}`,
        fileTypes: languageConfig.extensions.map((ext) => ext.replace(".", "")),
        patterns: validatePatterns(shikiConfig.patterns || []),
        repository: shikiConfig.repository || {},
        ...(shikiConfig.displayName && {
          displayName: shikiConfig.displayName,
        }),
      }),
    };

    // Create a new registry instance for this language
    const languageRegistry = new Registry({
      getGrammarDefinition: async (scopeName) => {
        if (scopeName === `source.${languageId}`) {
          return grammarDefinition;
        }
        return {
          format: "json" as const,
          content: JSON.stringify({
            name: "default",
            scopeName,
            patterns: [],
          }),
        };
      },
    });

    // Load the grammar
    const grammar = await languageRegistry.loadGrammar(`source.${languageId}`);

    if (grammar) {
      // Custom state class that implements IState
      class TextMateState {
        public ruleStack: any;
        public line: number;

        constructor(ruleStack: any, line: number) {
          this.ruleStack = ruleStack;
          this.line = line;
        }

        clone(): TextMateState {
          return new TextMateState(this.ruleStack, this.line);
        }

        equals(other: any): boolean {
          return (
            other instanceof TextMateState &&
            other.ruleStack === this.ruleStack &&
            other.line === this.line
          );
        }
      }

      // Set up tokenization using TextMate with safety measures
      monaco.languages.setTokensProvider(languageId, {
        getInitialState: () => new TextMateState(null, 0),
        tokenize: (line, state) => {
          try {
            const tmState = state as TextMateState;

            // Safety timeout to prevent infinite loops
            const startTime = Date.now();
            const TIMEOUT_MS = 100; // 100ms timeout per line

            let result;
            try {
              result = grammar.tokenizeLine(line, tmState.ruleStack);

              // Check if tokenization took too long
              if (Date.now() - startTime > TIMEOUT_MS) {
                console.warn("Tokenization timeout for line:", line);
                return {
                  tokens: [
                    {
                      startIndex: 0,
                      scopes: "source",
                    },
                  ],
                  endState: new TextMateState(null, tmState.line + 1),
                };
              }
            } catch (tokenizeError) {
              console.error("Grammar tokenization error:", tokenizeError);
              return {
                tokens: [
                  {
                    startIndex: 0,
                    scopes: "source",
                  },
                ],
                endState: new TextMateState(null, tmState.line + 1),
              };
            }

            // Check for infinite loop condition
            if (result.tokens.length === 0 && line.length > 0) {
              // If no tokens are produced for a non-empty line, create a default token
              // to prevent infinite loops
              return {
                tokens: [
                  {
                    startIndex: 0,
                    scopes: "source",
                  },
                ],
                endState: new TextMateState(null, tmState.line + 1),
              };
            }

            // Additional safety check: ensure tokens advance
            let hasAdvancement = false;
            let totalLength = 0;
            for (const token of result.tokens) {
              const tokenLength = token.endIndex - token.startIndex;
              totalLength += tokenLength;
              if (tokenLength > 0) {
                hasAdvancement = true;
              }
            }

            // If tokens don't cover the entire line or don't advance, force a safe token
            if (!hasAdvancement || totalLength === 0) {
              return {
                tokens: [
                  {
                    startIndex: 0,
                    scopes: "source",
                  },
                ],
                endState: new TextMateState(null, tmState.line + 1),
              };
            }

            const tokens = result.tokens.map((token) => {
              const scopesString = token.scopes.join(" ");
              const tokenType = mapTextMateTokenToMonaco(scopesString);

              // Debug log for token mapping (remove in production)
              if (process.env.NODE_ENV === "development") {
                console.log(
                  `Token: "${line.substring(
                    token.startIndex,
                    token.endIndex
                  )}" | Scopes: ${scopesString} | Mapped to: ${tokenType}`
                );
              }

              return {
                startIndex: token.startIndex,
                scopes: tokenType || "source",
              };
            });

            return {
              tokens,
              endState: new TextMateState(result.ruleStack, tmState.line + 1),
            };
          } catch (error) {
            console.error("Tokenization error:", error);
            return {
              tokens: [{ startIndex: 0, scopes: "source" }],
              endState: new TextMateState(
                null,
                (state as TextMateState).line + 1
              ),
            };
          }
        },
      });

      // Set up language configuration
      if (languageConfig.configuration) {
        monaco.languages.setLanguageConfiguration(languageId, {
          comments: languageConfig.configuration.comments,
          brackets: languageConfig.configuration.brackets,
          autoClosingPairs: languageConfig.configuration.autoClosingPairs,
          surroundingPairs: languageConfig.configuration.autoClosingPairs,
        });
      }

      return true;
    }
  } catch (error) {
    console.error("Failed to register TextMate language:", error);
  }

  return false;
};

// Map TextMate token scopes to Monaco token types
const mapTextMateTokenToMonaco = (scopes: string): string => {
  if (!scopes) return "source";

  const scopeList = scopes.split(" ");

  // Process scopes in order of priority
  for (const scope of scopeList) {
    // Keywords - high priority
    if (scope.includes("keyword")) {
      if (scope.includes("control")) return "keyword.control";
      if (scope.includes("operator")) return "keyword.operator";
      if (scope.includes("other")) return "keyword.other";
      return "keyword";
    }

    // Strings - high priority
    if (scope.includes("string")) {
      if (scope.includes("quoted.double")) return "string.quoted.double";
      if (scope.includes("quoted.single")) return "string.quoted.single";
      if (scope.includes("quoted")) return "string.quoted";
      if (scope.includes("template")) return "string.template";
      return "string";
    }

    // Comments - high priority
    if (scope.includes("comment")) {
      if (scope.includes("line.double-slash"))
        return "comment.line.double-slash";
      if (scope.includes("line")) return "comment.line";
      if (scope.includes("block")) return "comment.block";
      return "comment";
    }

    // Numbers - high priority
    if (scope.includes("constant.numeric") || scope.includes("number")) {
      if (scope.includes("integer")) return "constant.numeric.integer";
      if (scope.includes("float")) return "constant.numeric.float";
      return "constant.numeric";
    }

    // Functions - medium priority
    if (
      scope.includes("entity.name.function") ||
      scope.includes("support.function")
    ) {
      return "entity.name.function";
    }

    // Variables - medium priority
    if (scope.includes("variable")) {
      if (scope.includes("parameter")) return "variable.parameter";
      if (scope.includes("language")) return "variable.language";
      if (scope.includes("other")) return "variable.other";
      return "variable";
    }

    // Types - medium priority
    if (scope.includes("entity.name.type") || scope.includes("support.type")) {
      return "entity.name.type";
    }

    // Constants - medium priority
    if (scope.includes("constant")) {
      if (scope.includes("character")) return "constant.character";
      if (scope.includes("language")) return "constant.language";
      if (scope.includes("other")) return "constant.other";
      if (scope.includes("numeric")) return "constant.numeric";
      return "constant";
    }

    // Operators - medium priority
    if (scope.includes("operator")) {
      if (scope.includes("assignment")) return "keyword.operator.assignment";
      if (scope.includes("arithmetic")) return "keyword.operator.arithmetic";
      if (scope.includes("logical")) return "keyword.operator.logical";
      return "keyword.operator";
    }

    // Punctuation and delimiters - low priority
    if (scope.includes("punctuation")) {
      if (scope.includes("definition.string"))
        return "punctuation.definition.string";
      if (scope.includes("definition.comment"))
        return "punctuation.definition.comment";
      if (scope.includes("separator")) return "punctuation.separator";
      if (scope.includes("terminator")) return "punctuation.terminator";
      return "punctuation";
    }

    // Storage (class, function declarations)
    if (scope.includes("storage")) {
      if (scope.includes("type")) return "storage.type";
      if (scope.includes("modifier")) return "storage.modifier";
      return "storage";
    }

    // Support (built-in functions, classes)
    if (scope.includes("support")) {
      if (scope.includes("class")) return "support.class";
      if (scope.includes("function")) return "support.function";
      if (scope.includes("type")) return "support.type";
      return "support";
    }

    // Entity names
    if (scope.includes("entity.name")) {
      if (scope.includes("class")) return "entity.name.class";
      if (scope.includes("function")) return "entity.name.function";
      if (scope.includes("tag")) return "entity.name.tag";
      return "entity.name";
    }

    // Meta (structural elements)
    if (scope.includes("meta")) {
      if (scope.includes("function")) return "meta.function";
      if (scope.includes("class")) return "meta.class";
      if (scope.includes("block")) return "meta.block";
      return "meta";
    }
  }

  // Fallback handling
  if (scopes.includes("source")) {
    return "source";
  }

  // Return default for unrecognized scopes
  return "identifier";
};

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

  const setupShikiJsonCompletion = React.useCallback(
    (monacoInstance: Monaco) => {
      // Set up JSON schema validation and completion
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
    },
    []
  );

  // Register TextMate language when languageConfig changes
  React.useEffect(() => {
    if (
      isEditorMounted &&
      editorRef.current &&
      monacoRef.current &&
      languageConfig
    ) {
      registerTextMateLanguage(monacoRef.current, languageConfig).then(
        (success) => {
          if (success && editorRef.current && monacoRef.current) {
            const model = editorRef.current.getModel();
            if (model) {
              // Force language update
              monacoRef.current.editor.setModelLanguage(
                model,
                languageConfig.id
              );

              // Trigger re-tokenization
              model.setValue(model.getValue());
            }
          }
        }
      );
    }
  }, [languageConfig, isEditorMounted]);

  // Update theme when theme prop changes
  React.useEffect(() => {
    if (isEditorMounted && monacoRef.current) {
      const currentTheme = getThemeName(theme);
      monacoRef.current.editor.setTheme(currentTheme);
    }
  }, [theme, isEditorMounted]);

  const handleEditorDidMount = (
    editor: MonacoEditor,
    monacoInstance: Monaco
  ) => {
    editorRef.current = editor;
    monacoRef.current = monacoInstance;

    // Define enhanced dark theme
    monacoInstance.editor.defineTheme("enhanced-dark", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "569cd6", fontStyle: "bold" },
        { token: "keyword.control", foreground: "c586c0", fontStyle: "bold" },
        { token: "keyword.operator", foreground: "d4d4d4" },
        { token: "string", foreground: "ce9178" },
        { token: "string.quoted", foreground: "ce9178" },
        { token: "string.quoted.double", foreground: "ce9178" },
        { token: "string.quoted.single", foreground: "ce9178" },
        { token: "string.template", foreground: "ce9178" },
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "comment.line", foreground: "6a9955", fontStyle: "italic" },
        { token: "comment.block", foreground: "6a9955", fontStyle: "italic" },
        { token: "constant.numeric", foreground: "b5cea8" },
        { token: "constant.numeric.integer", foreground: "b5cea8" },
        { token: "constant.numeric.float", foreground: "b5cea8" },
        { token: "constant", foreground: "4fc1ff" },
        { token: "constant.language", foreground: "569cd6" },
        { token: "variable", foreground: "9cdcfe" },
        { token: "variable.parameter", foreground: "9cdcfe" },
        { token: "variable.language", foreground: "4fc1ff" },
        { token: "entity.name.function", foreground: "dcdcaa" },
        { token: "entity.name.class", foreground: "4ec9b0" },
        { token: "entity.name.type", foreground: "4ec9b0" },
        { token: "support.function", foreground: "dcdcaa" },
        { token: "support.class", foreground: "4ec9b0" },
        { token: "support.type", foreground: "4ec9b0" },
        { token: "storage", foreground: "569cd6" },
        { token: "storage.type", foreground: "569cd6" },
        { token: "storage.modifier", foreground: "569cd6" },
        { token: "punctuation", foreground: "d4d4d4" },
        { token: "punctuation.definition.string", foreground: "ce9178" },
        { token: "punctuation.definition.comment", foreground: "6a9955" },
        { token: "meta", foreground: "d4d4d4" },
        { token: "identifier", foreground: "d4d4d4" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
      },
    });

    // Define enhanced light theme
    monacoInstance.editor.defineTheme("enhanced-light", {
      base: "vs",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "0000ff", fontStyle: "bold" },
        { token: "keyword.control", foreground: "af00db", fontStyle: "bold" },
        { token: "keyword.operator", foreground: "000000" },
        { token: "string", foreground: "a31515" },
        { token: "string.quoted", foreground: "a31515" },
        { token: "string.quoted.double", foreground: "a31515" },
        { token: "string.quoted.single", foreground: "a31515" },
        { token: "string.template", foreground: "a31515" },
        { token: "comment", foreground: "008000", fontStyle: "italic" },
        { token: "comment.line", foreground: "008000", fontStyle: "italic" },
        { token: "comment.block", foreground: "008000", fontStyle: "italic" },
        { token: "constant.numeric", foreground: "098658" },
        { token: "constant.numeric.integer", foreground: "098658" },
        { token: "constant.numeric.float", foreground: "098658" },
        { token: "constant", foreground: "0070c1" },
        { token: "constant.language", foreground: "0000ff" },
        { token: "variable", foreground: "001080" },
        { token: "variable.parameter", foreground: "001080" },
        { token: "variable.language", foreground: "0070c1" },
        { token: "entity.name.function", foreground: "795e26" },
        { token: "entity.name.class", foreground: "267f99" },
        { token: "entity.name.type", foreground: "267f99" },
        { token: "support.function", foreground: "795e26" },
        { token: "support.class", foreground: "267f99" },
        { token: "support.type", foreground: "267f99" },
        { token: "storage", foreground: "0000ff" },
        { token: "storage.type", foreground: "0000ff" },
        { token: "storage.modifier", foreground: "0000ff" },
        { token: "punctuation", foreground: "000000" },
        { token: "punctuation.definition.string", foreground: "a31515" },
        { token: "punctuation.definition.comment", foreground: "008000" },
        { token: "meta", foreground: "000000" },
        { token: "identifier", foreground: "000000" },
      ],
      colors: {
        "editor.background": "#ffffff",
        "editor.foreground": "#000000",
      },
    });

    // Define high contrast theme
    monacoInstance.editor.defineTheme("enhanced-hc", {
      base: "hc-black",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "ffff00", fontStyle: "bold" },
        { token: "keyword.control", foreground: "ff00ff", fontStyle: "bold" },
        { token: "keyword.operator", foreground: "ffffff" },
        { token: "string", foreground: "00ff00" },
        { token: "string.quoted", foreground: "00ff00" },
        { token: "string.quoted.double", foreground: "00ff00" },
        { token: "string.quoted.single", foreground: "00ff00" },
        { token: "string.template", foreground: "00ff00" },
        { token: "comment", foreground: "7ca668", fontStyle: "italic" },
        { token: "comment.line", foreground: "7ca668", fontStyle: "italic" },
        { token: "comment.block", foreground: "7ca668", fontStyle: "italic" },
        { token: "constant.numeric", foreground: "00ffff" },
        { token: "constant.numeric.integer", foreground: "00ffff" },
        { token: "constant.numeric.float", foreground: "00ffff" },
        { token: "constant", foreground: "ffff00" },
        { token: "constant.language", foreground: "ffff00" },
        { token: "variable", foreground: "ffffff" },
        { token: "variable.parameter", foreground: "ffffff" },
        { token: "variable.language", foreground: "ffff00" },
        { token: "entity.name.function", foreground: "ffff00" },
        { token: "entity.name.class", foreground: "00ffff" },
        { token: "entity.name.type", foreground: "00ffff" },
        { token: "support.function", foreground: "ffff00" },
        { token: "support.class", foreground: "00ffff" },
        { token: "support.type", foreground: "00ffff" },
        { token: "storage", foreground: "ffff00" },
        { token: "storage.type", foreground: "ffff00" },
        { token: "storage.modifier", foreground: "ffff00" },
        { token: "punctuation", foreground: "ffffff" },
        { token: "punctuation.definition.string", foreground: "00ff00" },
        { token: "punctuation.definition.comment", foreground: "7ca668" },
        { token: "meta", foreground: "ffffff" },
        { token: "identifier", foreground: "ffffff" },
      ],
      colors: {
        "editor.background": "#000000",
        "editor.foreground": "#ffffff",
      },
    });

    // Apply the correct theme immediately after defining themes
    const currentTheme = getThemeName(theme);
    monacoInstance.editor.setTheme(currentTheme);

    setIsEditorMounted(true);

    // Register custom language if provided
    if (languageConfig) {
      registerTextMateLanguage(monacoInstance, languageConfig).then(
        (success) => {
          if (success) {
            const model = editor.getModel();
            if (model) {
              monacoInstance.editor.setModelLanguage(model, languageConfig.id);
              // Trigger re-tokenization
              model.setValue(model.getValue());
            }
          }
        }
      );
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

  // Helper function to map theme names to enhanced versions if available
  const getThemeName = (themeName: string): string => {
    switch (themeName) {
      case "vs-dark":
        return "enhanced-dark";
      case "vs":
      case "vs-light":
        return "enhanced-light";
      case "hc-black":
        return "enhanced-hc";
      default:
        // For custom or unknown themes, return as-is
        return themeName;
    }
  };

  const handleChange = (value: string | undefined) => {
    onChange(value || "");
  };

  return (
    <Editor
      height="100%"
      defaultLanguage={language}
      language={languageConfig ? languageConfig.id : language}
      value={value}
      theme={getThemeName(theme)}
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
        selectOnLineNumbers: true,
        selectionHighlight: true,
        occurrencesHighlight: "singleFile",
        renderLineHighlight: "line",
        cursorBlinking: "blink",
        cursorSmoothCaretAnimation: "on",
        smoothScrolling: true,
        folding: true,
        showFoldingControls: "mouseover",
        readOnly: false,
        domReadOnly: false,
        mouseWheelZoom: false,
        multiCursorModifier: "ctrlCmd",
        ...options,
      }}
    />
  );
};
