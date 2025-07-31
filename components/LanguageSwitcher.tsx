import React, { useState } from "react";
import { VscGlobe } from "react-icons/vsc";
import { useI18n } from "../i18n/I18nProvider";
import { availableLocales } from "../i18n";

export const LanguageSwitcher: React.FC = () => {
  const { currentLocale, changeLocale, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const currentLocaleInfo = availableLocales.find(
    (locale) => locale.id === currentLocale
  );

  const handleLocaleChange = (localeId: string) => {
    console.log("LanguageSwitcher: handleLocaleChange called with:", localeId);
    changeLocale(localeId);
    setIsOpen(false);
  };

  return (
    <div style={switcherStyles.container}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={switcherStyles.button}
        title={t("languageSwitcher.changeLanguage")}
      >
        <VscGlobe style={switcherStyles.icon} />
        <span style={switcherStyles.currentLocale}>
          {currentLocaleInfo?.flag} {currentLocaleInfo?.name}
        </span>
      </button>

      {isOpen && (
        <div style={switcherStyles.dropdown}>
          {availableLocales.map((locale) => (
            <button
              key={locale.id}
              onClick={() => handleLocaleChange(locale.id)}
              style={{
                ...switcherStyles.option,
                ...(currentLocale === locale.id
                  ? switcherStyles.optionActive
                  : {}),
              }}
            >
              <span style={switcherStyles.flag}>{locale.flag}</span>
              <span>{locale.name}</span>
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div style={switcherStyles.overlay} onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

const switcherStyles = {
  container: {
    position: "relative" as const,
    display: "inline-block",
  },
  button: {
    background: "transparent",
    border: "none",
    color: "#cccccc",
    cursor: "pointer",
    padding: "6px 8px",
    borderRadius: "2px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    outline: "none",
    transition: "background-color 0.2s ease",
  },
  icon: {
    fontSize: "16px",
  },
  currentLocale: {
    fontSize: "12px",
  },
  dropdown: {
    position: "absolute" as const,
    top: "100%",
    right: 0,
    background: "#252526",
    border: "1px solid #464647",
    borderRadius: "2px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
    zIndex: 1000,
    minWidth: "150px",
    marginTop: "2px",
  },
  option: {
    background: "transparent",
    border: "none",
    color: "#cccccc",
    cursor: "pointer",
    padding: "8px 12px",
    fontSize: "12px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    width: "100%",
    textAlign: "left" as const,
    outline: "none",
    transition: "background-color 0.2s ease",
  },
  optionActive: {
    background: "#0e4775",
  },
  flag: {
    fontSize: "14px",
  },
  overlay: {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
};
