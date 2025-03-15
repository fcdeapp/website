// src/app/terms/page.tsx
import React, { useEffect, useState } from "react";
import styles from "../../styles/Terms.module.css";

export default function TermsPage() {
  const [termsContent, setTermsContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [termsLanguage, setTermsLanguage] = useState("en");

  const fetchTerms = async (lang = "en", type = "privacy") => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/terms/${type}/${lang}`);
      if (!res.ok) {
        throw new Error("Failed to load terms");
      }
      const data = await res.json();
      setTermsContent(data.content);
    } catch (error) {
      console.error("Error fetching terms:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms(termsLanguage, "privacy");
  }, [termsLanguage]);

  const toggleLanguage = () => {
    setTermsLanguage((prev) => (prev === "en" ? "ko" : "en"));
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          {termsLanguage === "en" ? "Privacy Policy" : "개인정보처리방침"}
        </h1>
        <button onClick={toggleLanguage} className={styles.toggleButton}>
          {termsLanguage === "en" ? "View in Korean" : "View in English"}
        </button>
      </header>
      <main className={styles.main}>
        {isLoading ? (
          <p>Loading terms...</p>
        ) : (
          <section className={styles.content}>
            <p>{termsContent}</p>
          </section>
        )}
      </main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Facade. All rights reserved.
      </footer>
    </div>
  );
}
