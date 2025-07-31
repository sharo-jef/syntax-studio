import React, { createContext, useContext } from "react";
import { useI18n as useI18nHook } from "../hooks/useI18n";

const I18nContext = createContext<ReturnType<typeof useI18nHook> | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const i18n = useI18nHook();
  return <I18nContext.Provider value={i18n}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
};
