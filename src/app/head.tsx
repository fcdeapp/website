// src/app/head.tsx
export default function Head() {
    return (
      <>
        <title>Abrody – AI Conversational Language Learning</title>
        <meta name="description" content="Personalized quizzes generated from your own conversations." />
  
        {/* Open Graph */}
        <meta property="og:type"        content="website" />
        <meta property="og:title"       content="Abrody – AI Conversational Language Learning" />
        <meta property="og:description" content="Personalized quizzes generated from your own conversations." />
        <meta property="og:image"       content="https://website.fcde.app/og-image.jpg" />
        <meta property="og:image:width"  content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:url"         content="https://website.fcde.app/" />
  
        {/* Twitter Card */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Abrody – AI Conversational Language Learning" />
        <meta name="twitter:description" content="Personalized quizzes generated from your own conversations." />
        <meta name="twitter:image"       content="https://website.fcde.app/og-image.jpg" />
        <meta name="twitter:image:alt"   content="Abrody – AI Conversational Language Learning" />
      </>
    );
  }
  