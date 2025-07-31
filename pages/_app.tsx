import type { AppProps } from "next/app";
import "../styles/globals.css";
import { I18nProvider } from "../i18n/I18nProvider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <I18nProvider>
      <Component {...pageProps} />
    </I18nProvider>
  );
}
