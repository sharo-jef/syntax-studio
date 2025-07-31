import React, { useState, useCallback } from "react";
import { MonacoEditor } from "../components/MonacoEditor";
import { Sidebar } from "../components/Sidebar";
import { useLocalStorage, generateId } from "../hooks/useLocalStorage";
import { LanguageConfig, ShikiConfig, SavedLanguage } from "../types/syntax";

const SyntaxHighlighter: React.FC = () => {
  const [languageCode, setLanguageCode] = useState<string>(
    '// 新しい言語のサンプルコード\nfunction hello() {\n  return "Hello, World!";\n}'
  );
  const [shikiConfig, setShikiConfig] = useState<string>(
    '{\n  "name": "my-language",\n  "displayName": "My Language",\n  "patterns": [\n    {\n      "name": "keyword.control",\n      "match": "\\\\b(function|return|if|else)\\\\b"\n    },\n    {\n      "name": "string.quoted.double",\n      "match": "\\"[^\\"].*?\\""\n    },\n    {\n      "name": "comment.line.double-slash",\n      "match": "//.*$"\n    }\n  ]\n}'
  );

  const [currentLanguageConfig, setCurrentLanguageConfig] = useState<
    LanguageConfig | undefined
  >();
  const [currentShikiConfig, setCurrentShikiConfig] = useState<
    ShikiConfig | undefined
  >();
  const [currentLanguageId, setCurrentLanguageId] = useState<string>("");

  const {
    savedLanguages,
    saveLanguage,
    deleteLanguage,
    loadLanguage,
    saveCurrentLanguageId,
    getCurrentLanguageId,
  } = useLocalStorage();

  // 関数の参照を安定化
  const saveLanguageRef = React.useRef(saveLanguage);
  const savedLanguagesRef = React.useRef(savedLanguages);

  React.useEffect(() => {
    saveLanguageRef.current = saveLanguage;
    savedLanguagesRef.current = savedLanguages;
  }, [saveLanguage, savedLanguages]);

  const handleNewLanguage = () => {
    const id = generateId();
    const newLanguageCode =
      '// 新しい言語のサンプルコード\nfunction hello() {\n  return "Hello, World!";\n}';
    const newShikiConfig =
      '{\n  "name": "my-language",\n  "displayName": "My Language",\n  "patterns": [\n    {\n      "name": "keyword.control",\n      "match": "\\\\b(function|return|if|else)\\\\b"\n    },\n    {\n      "name": "string.quoted.double",\n      "match": "\\"[^\\"].*?\\""\n    },\n    {\n      "name": "comment.line.double-slash",\n      "match": "//.*$"\n    }\n  ]\n}';

    try {
      // Parse the config immediately
      const parsedShikiConfig = JSON.parse(newShikiConfig);
      const languageConfig: LanguageConfig = {
        id: id,
        name:
          parsedShikiConfig.displayName ||
          parsedShikiConfig.name ||
          "My Language",
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

      // 現在の言語IDを保存
      saveCurrentLanguageId(id);

      // Auto-save the new language
      const name = `新しい言語 ${new Date().toLocaleTimeString()}`;
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

  // 自動保存機能: コードまたは設定が変更されたら自動で保存
  React.useEffect(() => {
    if (
      currentLanguageConfig &&
      currentShikiConfig &&
      currentLanguageId &&
      currentLanguageId !== ""
    ) {
      // debounce効果のため少し遅延を追加
      const timeoutId = setTimeout(() => {
        // 既存の保存された言語を探す
        const existingSaved = savedLanguagesRef.current.find(
          (lang: SavedLanguage) => lang.id === currentLanguageId
        );

        // 既存の言語のみ自動保存
        if (existingSaved) {
          // displayNameが変更された場合は名前も更新
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

    // 現在の言語IDを保存
    saveCurrentLanguageId(language.id);
  };

  const handleDeleteLanguage = (id: string) => {
    // 削除される言語が現在選択中の場合、一つ上の言語を選択
    if (id === currentLanguageId) {
      const currentIndex = savedLanguages.findIndex((lang) => lang.id === id);
      let nextLanguage: SavedLanguage | null = null;

      if (currentIndex > 0) {
        // 一つ上の言語を選択
        nextLanguage = savedLanguages[currentIndex - 1];
      } else if (savedLanguages.length > 1) {
        // 最初の言語を削除する場合は次の言語を選択
        nextLanguage = savedLanguages[1];
      }

      // 言語を削除
      deleteLanguage(id);

      if (nextLanguage) {
        // 一つ上（または次）の言語を読み込み
        handleLoadLanguage(nextLanguage);
      } else {
        // 他に言語がない場合はデフォルト状態に戻す
        setCurrentLanguageId("");
        setCurrentLanguageConfig(undefined);
        setCurrentShikiConfig(undefined);
        setLanguageCode(
          '// 新しい言語のサンプルコード\nfunction hello() {\n  return "Hello, World!";\n}'
        );
        setShikiConfig(
          '{\n  "name": "my-language",\n  "displayName": "My Language",\n  "patterns": [\n    {\n      "name": "keyword.control",\n      "match": "\\\\b(function|return|if|else)\\\\b"\n    },\n    {\n      "name": "string.quoted.double",\n      "match": "\\"[^\\"].*?\\""\n    },\n    {\n      "name": "comment.line.double-slash",\n      "match": "//.*$"\n    }\n  ]\n}'
        );
        saveCurrentLanguageId("");
        setTimeout(() => {
          updateConfigs();
        }, 0);
      }
    } else {
      // 選択中でない言語を削除する場合は単純に削除
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

      // 現在編集中の言語の場合は状態も更新
      if (id === currentLanguageId) {
        setCurrentLanguageConfig(updatedLanguageConfig);
        setCurrentShikiConfig(updatedShikiConfig);
      }
    }
  };

  const updateConfigs = useCallback(() => {
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
          "Custom Language",
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

  // 初期化時に最後に選択していた言語を復元
  React.useEffect(() => {
    const lastLanguageId = getCurrentLanguageId();
    if (lastLanguageId && savedLanguages.length > 0) {
      const lastLanguage = savedLanguages.find(
        (lang) => lang.id === lastLanguageId
      );
      if (lastLanguage) {
        handleLoadLanguage(lastLanguage);
      }
    }
  }, [savedLanguages]); // savedLanguagesが読み込まれた後に実行

  // 初期化時に設定を更新（一度だけ実行）
  React.useEffect(() => {
    if (shikiConfig) {
      updateConfigs();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // shikiConfigが変更された時のみ設定を更新
  React.useEffect(() => {
    updateConfigs();
  }, [shikiConfig, currentLanguageId]); // updateConfigsは除外

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
            <div style={styles.panelHeader}>サンプルコード</div>
            <MonacoEditor
              value={languageCode}
              onChange={setLanguageCode}
              language={currentLanguageConfig?.id || "javascript"}
              languageConfig={currentLanguageConfig}
            />
          </div>

          <div style={styles.rightPanel}>
            <div style={styles.panelHeader}>Shiki設定（JSON）</div>
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
