import React from "react";
import { useI18n } from "../i18n/I18nProvider";
import { MonacoEditor } from "./MonacoEditor";
import styles from "../styles/ShikiHelpModal.module.css";

interface ShikiHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShikiHelpModal: React.FC<ShikiHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useI18n();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>{t("help.title")}</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3>{t("help.basicUsage.title")}</h3>
            <p>{t("help.basicUsage.description")}</p>
            <div className={styles.codeExample}>
              <MonacoEditor
                value={`{
  "name": "my-language",
  "displayName": "My Language",
  "patterns": [
    {
      "name": "keyword.control",
      "match": "\\\\b(function|return|if|else)\\\\b"
    },
    {
      "name": "string.quoted.double",
      "match": "\\"[^\\"]*\\""
    }
  ]
}`}
                onChange={() => {}} // Read-only
                language="json"
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 16,
                  lineNumbers: "on",
                  folding: true,
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  wordWrap: "off",
                  renderLineHighlight: "all",
                  selectionHighlight: true,
                  occurrencesHighlight: "off",
                  cursorStyle: "line-thin",
                  hideCursorInOverviewRuler: true,
                  overviewRulerBorder: false,
                  fixedOverflowWidgets: true,
                }}
              />
            </div>
          </div>

          <div className={styles.section}>
            <h3>{t("help.grammarPatterns.title")}</h3>
            <ul>
              <li>
                <strong>{t("help.grammarPatterns.match")}</strong>:{" "}
                {t("help.grammarPatterns.matchDescription")}
              </li>
              <li>
                <strong>{t("help.grammarPatterns.beginEnd")}</strong>:{" "}
                {t("help.grammarPatterns.beginEndDescription")}
              </li>
              <li>
                <strong>{t("help.grammarPatterns.include")}</strong>:{" "}
                {t("help.grammarPatterns.includeDescription")}
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3>{t("help.commonScopes.title")}</h3>
            <div className={styles.scopeList}>
              <div className={styles.scopeItem}>
                <code>keyword.control</code>
                <span>{t("help.commonScopes.keywordControl")}</span>
              </div>
              <div className={styles.scopeItem}>
                <code>string.quoted.double</code>
                <span>{t("help.commonScopes.stringDouble")}</span>
              </div>
              <div className={styles.scopeItem}>
                <code>comment.line.double-slash</code>
                <span>{t("help.commonScopes.commentLine")}</span>
              </div>
              <div className={styles.scopeItem}>
                <code>comment.block</code>
                <span>{t("help.commonScopes.commentBlock")}</span>
              </div>
              <div className={styles.scopeItem}>
                <code>constant.numeric</code>
                <span>{t("help.commonScopes.constantNumeric")}</span>
              </div>
              <div className={styles.scopeItem}>
                <code>variable.other</code>
                <span>{t("help.commonScopes.variableOther")}</span>
              </div>
              <div className={styles.scopeItem}>
                <code>entity.name.function</code>
                <span>{t("help.commonScopes.entityFunction")}</span>
              </div>
              <div className={styles.scopeItem}>
                <code>support.type</code>
                <span>{t("help.commonScopes.supportType")}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3>{t("help.regexPatterns.title")}</h3>
            <ul>
              <li>
                <code>\\b(word1|word2)\\b</code> -{" "}
                {t("help.regexPatterns.wordBoundary")}
              </li>
              <li>
                <code>"[^"]*"</code> -{" "}
                {t("help.regexPatterns.doubleQuotedString")}
              </li>
              <li>
                <code>//.*$</code> - {t("help.regexPatterns.lineComment")}
              </li>
              <li>
                <code>/\\*[\\s\\S]*?\\*/</code> -{" "}
                {t("help.regexPatterns.blockComment")}
              </li>
              <li>
                <code>\\d+(\\.\\d+)?</code> - {t("help.regexPatterns.number")}
              </li>
              <li>
                <code>[a-zA-Z_][a-zA-Z0-9_]*</code> -{" "}
                {t("help.regexPatterns.identifier")}
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3>{t("help.advancedFeatures.title")}</h3>
            <ul>
              <li>
                <strong>{t("help.advancedFeatures.repository")}</strong>:{" "}
                {t("help.advancedFeatures.repositoryDescription")}
              </li>
              <li>
                <strong>{t("help.advancedFeatures.captures")}</strong>:{" "}
                {t("help.advancedFeatures.capturesDescription")}
              </li>
              <li>
                <strong>{t("help.advancedFeatures.while")}</strong>:{" "}
                {t("help.advancedFeatures.whileDescription")}
              </li>
            </ul>
          </div>

          <div className={styles.section}>
            <h3>{t("help.tips.title")}</h3>
            <ul>
              <li>{t("help.tips.escapeRegex")}</li>
              <li>{t("help.tips.testPatterns")}</li>
              <li>{t("help.tips.useMonaco")}</li>
              <li>{t("help.tips.orderMatters")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
