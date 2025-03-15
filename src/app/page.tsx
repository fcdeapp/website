// pages/index.tsx
import React from 'react';
import styles from '../styles/Home.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <div className={styles.heroOverlay}>
          <h1 className={styles.title}>Welcome to Facade</h1>
          <p className={styles.subtitle}>Connecting People and Cultures Abroad</p>
        </div>
      </header>
      <main className={styles.main}>
        <p className={styles.description}>
          Discover events, meet new people, and explore opportunities worldwide.
        </p>
      </main>
      <footer className={styles.footer}>
        © {new Date().getFullYear()} Facade. All rights reserved.
      </footer>
    </div>
  );
}
