import React, { useState, useCallback } from "react";
import { MonacoEditor } from "../components/MonacoEditor";
import { Sidebar } from "../components/Sidebar";
import { useLocalStorage, generateId } from "../hooks/useLocalStorage";
import { useI18n } from "../i18n/I18nProvider";
import { LanguageConfig, ShikiConfig, SavedLanguage } from "../types/syntax";

const SyntaxHighlighter: React.FC = () => {
  const { t, currentLocale } = useI18n();
  const [languageCode, setLanguageCode] = useState<string>("");
  const [shikiConfig, setShikiConfig] = useState<string>("");
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>("");

  // Initialize with translated content only if no saved languages exist
  React.useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  // Handle locale changes - update default content only if no saved language is active
  React.useEffect(() => {
    // This will be handled by the restoration effect after currentLanguageId is available
    if (isInitialized) {
      const defaultSamples = [
        t("sampleCode.newLanguageSample"),
        t("sampleCode.myLanguageSample"),
      ];
      const isDefaultContent =
        languageCode === "" || defaultSamples.includes(languageCode);

      if (isDefaultContent) {
        setLanguageCode(t("sampleCode.newLanguageSample"));
      }
    }
  }, [currentLocale, t, languageCode, isInitialized]);

  const [currentLanguageConfig, setCurrentLanguageConfig] = useState<
    LanguageConfig | undefined
  >();
  const [currentShikiConfig, setCurrentShikiConfig] = useState<
    ShikiConfig | undefined
  >();

  const {
    savedLanguages,
    saveLanguage,
    deleteLanguage,
    loadLanguage,
    saveCurrentLanguageId,
    getCurrentLanguageId,
  } = useLocalStorage();

  // Initialize currentLanguageId with the stored value immediately
  const [currentLanguageId, setCurrentLanguageId] = useState<string>(() => {
    try {
      return getCurrentLanguageId() || "";
    } catch {
      return "";
    }
  });

  // 関数の参照を安定化
  const saveLanguageRef = React.useRef(saveLanguage);
  const savedLanguagesRef = React.useRef(savedLanguages);

  React.useEffect(() => {
    saveLanguageRef.current = saveLanguage;
    savedLanguagesRef.current = savedLanguages;
  }, [saveLanguage, savedLanguages]);

  const handleNewLanguage = () => {
    const id = generateId();
    const newLanguageCode = t("sampleCode.newLanguageSample");
    const myLanguageTranslation = t("languages.myLanguage");
    const newShikiConfig = `{\n  "name": "my-language",\n  "displayName": "${myLanguageTranslation}",\n  "patterns": [\n    {\n      "name": "keyword.control",\n      "match": "\\\\b(function|return|if|else)\\\\b"\n    },\n    {\n      "name": "string.quoted.double",\n      "match": "\\"[^\\"].*?\\""\n    },\n    {\n      "name": "comment.line.double-slash",\n      "match": "//.*$"\n    }\n  ]\n}`;

    try {
      // Parse the config immediately
      const parsedShikiConfig = JSON.parse(newShikiConfig);
      const languageConfig: LanguageConfig = {
        id: id,
        name:
          parsedShikiConfig.displayName ||
          parsedShikiConfig.name ||
          myLanguageTranslation,
        extensions: [`.${parsedShikiConfig.name || "custom"}`],
        aliases: parsedShikiConfig.aliases || [],
        shikiConfig: parsedShikiConfig,
        configuration: {
          comments: {
            lineComment: "//",
            blockComment: ["/*", "*/"],
          },
          brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
          ],
          autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ],
        },
      };

      // Set all states immediately
      setCurrentLanguageId(id);
      setLanguageCode(newLanguageCode);
      setShikiConfig(newShikiConfig);
      setCurrentLanguageConfig(languageConfig);
      setCurrentShikiConfig(parsedShikiConfig);

      // Save current language ID
      saveCurrentLanguageId(id);

      // Auto-save the new language
      const name = `${t(
        "languages.newLanguage"
      )} ${new Date().toLocaleTimeString()}`;
      setTimeout(() => {
        saveLanguage(
          id,
          name,
          { ...languageConfig, name },
          {
            ...parsedShikiConfig,
            name: name.toLowerCase().replace(/\s+/g, "-"),
            displayName: name,
          },
          newLanguageCode
        );
      }, 100);
    } catch (error) {
      // Language creation failed, but we'll continue silently
    }
  };

  // Auto-save functionality: automatically save when code or config changes
  React.useEffect(() => {
    if (
      currentLanguageConfig &&
      currentShikiConfig &&
      currentLanguageId &&
      currentLanguageId !== ""
    ) {
      // debounce効果のため少し遅延を追加
      const timeoutId = setTimeout(() => {
        // Find existing saved language using ref to get the latest value
        const existingSaved = savedLanguagesRef.current.find(
          (lang: SavedLanguage) => lang.id === currentLanguageId
        );

        // Auto-save only existing languages
        if (existingSaved) {
          // Check if there are actual changes to avoid unnecessary saves
          const displayName =
            currentShikiConfig.displayName || currentShikiConfig.name;
          const shouldUpdateName =
            displayName && displayName !== existingSaved.name;
          const name = shouldUpdateName ? displayName : existingSaved.name;

          // Check if content has actually changed
          const hasChanges =
            existingSaved.sampleCode !== languageCode ||
            JSON.stringify(existingSaved.shikiConfig) !==
              JSON.stringify(currentShikiConfig) ||
            existingSaved.name !== name;

          if (hasChanges) {
            try {
              saveLanguageRef.current(
                currentLanguageId,
                name,
                currentLanguageConfig,
                currentShikiConfig,
                languageCode
              );

              // Show save success notification
              setSaveStatus(t("saveStatus.saved"));
              setTimeout(() => setSaveStatus(""), 2000);
            } catch (error) {
              setSaveStatus(t("saveStatus.failed"));
              setTimeout(() => setSaveStatus(""), 2000);
            }
          }
        }
      }, 300); // 300ms後に自動保存（より高速な反応）

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentLanguageConfig,
    currentShikiConfig,
    currentLanguageId,
    languageCode,
    t,
  ]);

  const handleLoadLanguage = (language: SavedLanguage) => {
    setLanguageCode(language.sampleCode);
    setShikiConfig(JSON.stringify(language.shikiConfig, null, 2));
    setCurrentLanguageConfig(language.languageConfig);
    setCurrentShikiConfig(language.shikiConfig);
    setCurrentLanguageId(language.id);
    saveCurrentLanguageId(language.id);
  };

  const handleDeleteLanguage = (id: string) => {
    // If deleting the currently selected language, select the previous one
    if (id === currentLanguageId) {
      const currentIndex = savedLanguages.findIndex((lang) => lang.id === id);
      let nextLanguage: SavedLanguage | null = null;

      if (currentIndex > 0) {
        // Select the previous language
        nextLanguage = savedLanguages[currentIndex - 1];
      } else if (savedLanguages.length > 1) {
        // If deleting the first language, select the next one
        nextLanguage = savedLanguages[1];
      }

      // Delete the language
      deleteLanguage(id);

      if (nextLanguage) {
        // Load the previous (or next) language
        handleLoadLanguage(nextLanguage);
      } else {
        // If there are no other languages, reset to default state
        setCurrentLanguageId("");
        setCurrentLanguageConfig(undefined);
        setCurrentShikiConfig(undefined);
        setLanguageCode(t("sampleCode.newLanguageSample"));
        const defaultShikiConfig = `{\n  "name": "my-language",\n  "displayName": "${t(
          "languages.myLanguage"
        )}",\n  "patterns": [\n    {\n      "name": "keyword.control",\n      "match": "\\\\b(function|return|if|else)\\\\b"\n    },\n    {\n      "name": "string.quoted.double",\n      "match": "\\"[^\\"].*?\\""\n    },\n    {\n      "name": "comment.line.double-slash",\n      "match": "//.*$"\n    }\n  ]\n}`;
        setShikiConfig(defaultShikiConfig);
        saveCurrentLanguageId("");
        setTimeout(() => {
          updateConfigs();
        }, 0);
      }
    } else {
      // Simply delete if not the currently selected language
      deleteLanguage(id);
    }
  };

  const handleUpdateLanguageName = (id: string, newName: string) => {
    const language = savedLanguages.find((lang) => lang.id === id);
    if (language) {
      const updatedLanguageConfig = {
        ...language.languageConfig,
        name: newName,
      };
      const updatedShikiConfig = {
        ...language.shikiConfig,
        displayName: newName,
      };

      saveLanguage(
        id,
        newName,
        updatedLanguageConfig,
        updatedShikiConfig,
        language.sampleCode
      );

      // Also update state if this is the currently edited language
      if (id === currentLanguageId) {
        setCurrentLanguageConfig(updatedLanguageConfig);
        setCurrentShikiConfig(updatedShikiConfig);
        // Update the JSON string as well to reflect the name change
        setShikiConfig(JSON.stringify(updatedShikiConfig, null, 2));
      }
    }
  };

  const updateConfigs = useCallback(() => {
    // Don't try to parse empty or whitespace-only strings
    if (!shikiConfig || !shikiConfig.trim()) {
      return;
    }

    try {
      const parsedShikiConfig = JSON.parse(shikiConfig);
      setCurrentShikiConfig(parsedShikiConfig);

      // Auto-generate language config from shiki config
      const id = currentLanguageId || generateId();
      const languageConfig: LanguageConfig = {
        id: id,
        name:
          parsedShikiConfig.displayName ||
          parsedShikiConfig.name ||
          t("languages.customLanguage"),
        extensions: [`.${parsedShikiConfig.name || "custom"}`],
        aliases: parsedShikiConfig.aliases || [],
        shikiConfig: parsedShikiConfig,
        configuration: {
          comments: {
            lineComment: "//",
            blockComment: ["/*", "*/"],
          },
          brackets: [
            ["{", "}"],
            ["[", "]"],
            ["(", ")"],
          ],
          autoClosingPairs: [
            { open: "{", close: "}" },
            { open: "[", close: "]" },
            { open: "(", close: ")" },
            { open: '"', close: '"' },
            { open: "'", close: "'" },
          ],
        },
      };

      setCurrentLanguageConfig(languageConfig);
      if (!currentLanguageId) {
        setCurrentLanguageId(id);
      }
    } catch (error) {
      // Failed to parse shiki config, will use default
    }
  }, [shikiConfig, currentLanguageId]);

  // Restore the last selected language on initialization, or set default content
  React.useEffect(() => {
    if (isInitialized && savedLanguages.length > 0) {
      const lastLanguageId = getCurrentLanguageId();
      if (lastLanguageId && currentLanguageId === lastLanguageId) {
        const lastLanguage = savedLanguages.find(
          (lang) => lang.id === lastLanguageId
        );
        if (lastLanguage && languageCode === "") {
          // Use the existing handleLoadLanguage function which we know works
          handleLoadLanguage(lastLanguage);
          return; // Exit early if language was restored
        }
      }
    }

    // If no saved language to restore and not yet initialized with default content
    if (isInitialized && !currentLanguageId && languageCode === "") {
      setLanguageCode(t("sampleCode.newLanguageSample"));
      setShikiConfig(
        '{\n  "name": "my-language",\n  "displayName": "My Language",\n  "patterns": [\n    {\n      "name": "keyword.control",\n      "match": "\\\\b(function|return|if|else)\\\\b"\n    },\n    {\n      "name": "string.quoted.double",\n      "match": "\\"[^\\"].*?\\""\n    },\n    {\n      "name": "comment.line.double-slash",\n      "match": "//.*$"\n    }\n  ]\n}'
      );
    }
  }, [
    savedLanguages,
    currentLanguageId,
    getCurrentLanguageId,
    isInitialized,
    languageCode,
    t,
    handleLoadLanguage,
  ]);

  // Update configuration when shikiConfig changes and is not empty
  React.useEffect(() => {
    if (shikiConfig && shikiConfig.trim()) {
      updateConfigs();
    }
  }, [shikiConfig, currentLanguageId, updateConfigs]);

  return (
    <div style={styles.app}>
      <Sidebar
        savedLanguages={savedLanguages}
        onLoadLanguage={handleLoadLanguage}
        onDeleteLanguage={handleDeleteLanguage}
        onUpdateLanguageName={handleUpdateLanguageName}
        onNewLanguage={handleNewLanguage}
        currentLanguageId={currentLanguageId}
      />

      <div style={styles.mainContent}>
        {saveStatus && <div style={styles.saveNotification}>{saveStatus}</div>}
        <div style={styles.editorContainer}>
          <div style={styles.leftPanel}>
            <div style={styles.panelHeader}>{t("panels.sampleCode")}</div>
            <MonacoEditor
              value={languageCode}
              onChange={setLanguageCode}
              language={currentLanguageConfig?.id || "javascript"}
              languageConfig={currentLanguageConfig}
            />
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.panelHeader}>{t("panels.shikiConfig")}</div>
            <MonacoEditor
              value={shikiConfig}
              onChange={setShikiConfig}
              language="json"
              options={{
                suggest: {
                  showKeywords: true,
                  showSnippets: true,
                  showFields: true,
                  showFunctions: true,
                  showConstructors: true,
                  showClasses: true,
                  showStructs: true,
                  showInterfaces: true,
                  showModules: true,
                  showProperties: true,
                  showEvents: true,
                  showOperators: true,
                  showUnits: true,
                  showValues: true,
                  showConstants: true,
                  showEnums: true,
                  showEnumMembers: true,
                  showColors: true,
                  showFiles: true,
                  showReferences: true,
                  showFolders: true,
                  showTypeParameters: true,
                  showIssues: true,
                  showUsers: true,
                },
                quickSuggestions: {
                  other: true,
                  comments: true,
                  strings: true,
                },
                suggestOnTriggerCharacters: true,
                acceptSuggestionOnCommitCharacter: true,
                acceptSuggestionOnEnter: "on",
                tabCompletion: "on",
                wordBasedSuggestions: "allDocuments",
                // Enhanced JSON editing features
                autoIndent: "full",
                formatOnPaste: true,
                formatOnType: true,
                // Bracket matching and auto-closing
                autoClosingBrackets: "always",
                autoClosingQuotes: "always",
                autoSurround: "languageDefined",
                bracketPairColorization: {
                  enabled: true,
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  app: {
    display: "flex",
    height: "100vh",
    background: "#1e1e1e",
    color: "#d4d4d4",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    minWidth: 0,
  },
  editorContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "row" as const,
    minHeight: 0,
  },
  leftPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    borderRight: "1px solid #464647",
    minWidth: 0,
  },
  rightPanel: {
    flex: 1,
    display: "flex",
    flexDirection: "column" as const,
    minWidth: 0,
  },
  panelHeader: {
    padding: "8px 12px",
    background: "#252526",
    borderBottom: "1px solid #464647",
    fontSize: "12px",
    fontWeight: 500 as const,
    color: "#cccccc",
  },
  saveNotification: {
    position: "fixed" as const,
    bottom: "16px",
    right: "16px",
    color: "rgba(255, 255, 255, 0.6)",
    padding: "8px 12px",
    fontSize: "12px",
    zIndex: 1000,
  },
};

export default SyntaxHighlighter;
