import Head from "next/head";
import dynamic from "next/dynamic";

const SyntaxHighlighter = dynamic(
  () => import("../components/SyntaxHighlighter"),
  {
    ssr: false,
  }
);

export default function Home() {
  return (
    <>
      <Head>
        <title>Syntax Studio</title>
        <meta
          name="description"
          content="Create custom syntax highlighting for your languages"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <SyntaxHighlighter />
    </>
  );
}
