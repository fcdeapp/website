import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Basic Meta Tags */}
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Personalized quizzes generated from your own conversations." />

          {/* Open Graph */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content="Abrody – AI Conversational Language Learning" />
          <meta property="og:description" content="Personalized quizzes generated from your own conversations." />
          <meta property="og:image" content="https://website.fcde.app/og-image.jpg" />
          <meta property="og:url" content="https://website.fcde.app/" />

          {/* Twitter Card */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Abrody – AI Conversational Language Learning" />
          <meta name="twitter:description" content="Personalized quizzes generated from your own conversations." />
          <meta name="twitter:image" content="https://website.fcde.app/og-image.jpg" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;