import React from "react";
import { useI18n } from "../i18n/I18nProvider";

interface ThemeSelectorProps {
  currentTheme: string;
  onThemeChange: (theme: string) => void;
  style?: React.CSSProperties;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
  style,
}) => {
  const { t } = useI18n();

  const themes = [
    { value: "vs-dark", label: t("themes.dark") || "Dark" },
    { value: "vs", label: t("themes.light") || "Light" },
    { value: "hc-black", label: t("themes.highContrast") || "High Contrast" },
  ];

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    onThemeChange(event.target.value);
  };

  const selectorStyle: React.CSSProperties = {
    padding: "4px 8px",
    border: "1px solid #444",
    borderRadius: "4px",
    backgroundColor: "#2d2d30",
    color: "#cccccc",
    fontSize: "12px",
    cursor: "pointer",
    outline: "none",
    ...style,
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <label
        style={{
          fontSize: "12px",
          color: "#cccccc",
          whiteSpace: "nowrap",
        }}
      >
        {t("themes.theme") || "Theme"}:
      </label>
      <select
        value={currentTheme}
        onChange={handleChange}
        style={selectorStyle}
      >
        {themes.map((theme) => (
          <option key={theme.value} value={theme.value}>
            {theme.label}
          </option>
        ))}
      </select>
    </div>
  );
};
