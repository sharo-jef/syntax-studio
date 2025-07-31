import Head from "next/head";
import dynamic from "next/dynamic";
import { useI18n } from "../i18n/I18nProvider";

const SyntaxHighlighter = dynamic(
  () => import("../components/SyntaxHighlighter"),
  {
    ssr: false,
  }
);

export default function Home() {
  const { t } = useI18n();

  return (
    <>
      <Head>
        <title>{t("app.title")}</title>
        <meta name="description" content={t("app.description")} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SyntaxHighlighter />
    </>
  );
}
