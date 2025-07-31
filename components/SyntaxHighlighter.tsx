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

  // Initialize with translated content only once
  React.useEffect(() => {
    if (!isInitialized) {
      setLanguageCode(t("sampleCode.newLanguageSample"));
      setShikiConfig(
        '{\n  "name": "my-language",\n  "displayName": "My Language",\n  "patterns": [\n    {\n      "name": "keyword.control",\n      "match": "\\\\b(function|return|if|else)\\\\b"\n    },\n    {\n      "name": "string.quoted.double",\n      "match": "\\"[^\\"].*?\\""\n    },\n    {\n      "name": "comment.line.double-slash",\n      "match": "//.*$"\n    }\n  ]\n}'
      );
      setIsInitialized(true);
    }
  }, [t, isInitialized]);

  // Handle locale changes - update default content if and only if untouched
  React.useEffect(() => {
    // 厳密に「初期状態」のみ書き換え（空 or 現在の言語の初期サンプルのみ）
    const defaultSamples = [
      t("sampleCode.newLanguageSample"),
      t("sampleCode.myLanguageSample"),
    ];
    const isDefaultContent =
      languageCode === "" || defaultSamples.includes(languageCode);

    if (isDefaultContent && isInitialized) {
      setLanguageCode(t("sampleCode.newLanguageSample"));
    }
    // それ以外（ユーザーが編集済み）は絶対に上書きしない
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
        saveLanguageRef.current(
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
      console.error("Failed to create new language:", error);
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
        // Find existing saved language
        const existingSaved = savedLanguagesRef.current.find(
          (lang: SavedLanguage) => lang.id === currentLanguageId
        );

        // Auto-save only existing languages
        if (existingSaved) {
          // Update name if displayName has changed
          const displayName =
            currentShikiConfig.displayName || currentShikiConfig.name;
          const shouldUpdateName =
            displayName && displayName !== existingSaved.name;
          const name = shouldUpdateName ? displayName : existingSaved.name;

          saveLanguageRef.current(
            currentLanguageId,
            name,
            currentLanguageConfig,
            currentShikiConfig,
            languageCode
          );
        }
      }, 500); // 500ms後に自動保存

      return () => clearTimeout(timeoutId);
    }
  }, [
    currentLanguageConfig,
    currentShikiConfig,
    currentLanguageId,
    languageCode,
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
      console.error("Failed to parse shiki config:", error);
    }
  }, [shikiConfig, currentLanguageId]);

  // Restore the last selected language on initialization
  React.useEffect(() => {
    if (savedLanguages.length > 0 && !currentLanguageId) {
      const lastLanguageId = getCurrentLanguageId();
      if (lastLanguageId) {
        const lastLanguage = savedLanguages.find(
          (lang) => lang.id === lastLanguageId
        );
        if (lastLanguage) {
          setCurrentLanguageId(lastLanguageId);
          setLanguageCode(lastLanguage.sampleCode);
          setShikiConfig(JSON.stringify(lastLanguage.shikiConfig, null, 2));
          setCurrentLanguageConfig(lastLanguage.languageConfig);
          setCurrentShikiConfig(lastLanguage.shikiConfig);
        }
      }
    }
  }, [savedLanguages, currentLanguageId, getCurrentLanguageId]); // Execute after savedLanguages is loaded

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
                },
                quickSuggestions: {
                  other: true,
                  comments: false,
                  strings: true,
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
};

export default SyntaxHighlighter;
