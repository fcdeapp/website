"use client";

import React, { useEffect, useRef, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import styles from '../../styles/pages/About.module.css';

type AnimatedSectionProps = {
  children: React.ReactNode;
};

const AnimatedSection: React.FC<AnimatedSectionProps> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, []);

  return (
    <div ref={ref} className={`${styles.animatedSection} ${isVisible ? styles.visible : ""}`}>
      {children}
    </div>
  );
};

export default function About() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>About Facade | Our Team & Business Overview</title>
      </Head>
      <div className={styles.container}>
        {/* Hero Section */}
        <header className={styles.hero}>
          <div className={styles.heroOverlay}>
            <h1 className={styles.heroTitle}>About Facade</h1>
            <p className={styles.heroSubtitle}>Connecting Cultures, Empowering Communities</p>
          </div>
        </header>

        {/* Main Content */}
        <main className={styles.main}>
          <AnimatedSection>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Our Vision</h2>
              <p className={styles.sectionText}>
                Facade is committed to breaking cultural barriers and overcoming the isolation experienced by
                international students and workers around the world. We strive to build a platform where global
                citizens can foster meaningful, face-to-face connections and embrace new cultures.
              </p>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Our Business</h2>
              <p className={styles.sectionText}>
                As a next-generation social networking service, Facade offers personalized event recommendations,
                a secure meetup system, and local buddy groups designed specifically for international communities.
                Our innovative platform bridges the gap between foreigners and local cultures through technology and
                human-centric design.
              </p>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Our Team</h2>
              <p className={styles.sectionText}>
                Facade is led by a passionate team of international entrepreneurs, designers, and developers. With
                diverse backgrounds spanning software engineering, digital design, and global marketing, our team
                leverages firsthand experience with the challenges of living abroad to create a truly impactful
                platform that brings people together.
              </p>
              <p className={styles.sectionText}>
                We pride ourselves on our commitment to innovation, transparency, and community. Our collaborative
                culture enables us to continuously evolve Facade and ensure that every feature is designed with our
                users in mind.
              </p>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Our Strategy & Growth</h2>
              <p className={styles.sectionText}>
                Our business strategy is rooted in extensive market research and a deep understanding of global
                cultural dynamics. Starting from a robust MVP and successful beta testing, we are poised for rapid
                growth. With plans to expand into multiple international markets, Facade will continue to evolve
                its user experience, drive engagement, and foster community.
              </p>
              <p className={styles.sectionText}>
                We are focused on scalability, seamless integration across platforms, and continuous innovation, all
                while ensuring top-level security and privacy for our users.
              </p>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <section className={styles.section}>
              <h2 className={styles.sectionTitle}>Our Future</h2>
              <p className={styles.sectionText}>
                Looking ahead, Facade aims to be the leading platform for bridging cultural divides and nurturing
                global communities. We plan to expand our service footprint, forge new partnerships, and invest in
                innovative marketing strategies to captivate our target audience. By remaining agile and
                customer-focused, we will continuously enhance our offerings to meet the evolving needs of our users.
              </p>
            </section>
          </AnimatedSection>
        </main>

        {/* Footer */}
        <footer className={styles.footer}>
          <p className={styles.footerNote}>© {new Date().getFullYear()} Facade. All rights reserved.</p>
          <p className={styles.footerNote}>
            For more information, please <Link href="/contact"><a>contact us</a></Link>.
          </p>
        </footer>
      </div>
    </>
  );
}
