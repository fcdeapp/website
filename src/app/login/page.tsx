"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/Login.module.css';

type PasswordRules = {
  label: string;
  regex: RegExp;
};

const RULES: PasswordRules[] = [
  { label: 'Min 8 characters', regex: /^.{8,}$/ },
  { label: 'Uppercase letter', regex: /[A-Z]/ },
  { label: 'Lowercase letter', regex: /[a-z]/ },
  { label: 'Number', regex: /\d/ },
  { label: 'Special character', regex: /[^A-Za-z0-9]/ }
];

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [valid, setValid] = useState(false);
  const [focused, setFocused] = useState(false);
  const completedCount = RULES.filter(rule => rule.regex.test(password)).length;

  useEffect(() => {
    setValid(username.length >= 6 && completedCount === RULES.length);
  }, [username, completedCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // TODO: submit
  };

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>Sign In to Facade</h1>

        <label className={styles.label}>Username</label>
        <input
          className={styles.input}
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <label className={styles.label}>Password</label>
        <input
          className={styles.input}
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {focused && (
          <ul className={styles.rules}>
            {RULES.map(rule => (
              <li key={rule.label} className={completedCount && rule.regex.test(password) ? styles.rulePass : styles.ruleFail}>
                {rule.label}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.strengthBar}>
          <div className={styles[`strength${completedCount}`]} />
        </div>

        <button type="submit" className={styles.submit} disabled={!valid}>
          Login
        </button>

        <p className={styles.footer}>
          Don’t have an account? <Link href="/signup"><a>Sign Up</a></Link>
        </p>
      </form>
    </main>
  );
}
