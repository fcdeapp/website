"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/Login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [focused, setFocused] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const rules = [
    { label: 'Min 8 characters', valid: password.length >= 8 },
    { label: 'Uppercase letter', valid: /[A-Z]/.test(password) },
    { label: 'Lowercase letter', valid: /[a-z]/.test(password) },
    { label: 'Number', valid: /\d/.test(password) },
    { label: 'Special character', valid: /[^A-Za-z0-9]/.test(password) },
  ];

  const strength = Math.round((rules.filter(r => r.valid).length / rules.length) * 100);
  const valid = username.length >= 6 && strength === 100;

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={e => e.preventDefault()}>
        <h1 className={styles.title}>Sign In to Facade</h1>

        <label className={styles.label}>Username</label>
        <input
          className={styles.input}
          value={username}
          onChange={e => setUsername(e.target.value)}
        />

        <label className={styles.label}>Password</label>
        <div className={styles.passwordWrapper}>
          <input
            className={styles.input}
            type={showPwd ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button
            type="button"
            className={styles.toggleBtn}
            onClick={() => setShowPwd(prev => !prev)}
          >
            {showPwd ? 'Hide' : 'Show'}
          </button>
        </div>

        {focused && (
          <ul className={styles.rules}>
            {rules.map(r => (
              <li key={r.label} className={r.valid ? styles.rulePass : styles.ruleFail}>
                {r.label}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.strengthBar}>
          <div className={styles.strengthFill} style={{ width: `${strength}%` }} />
        </div>

        <button type="submit" className={styles.submit} disabled={!valid}>
          Login
        </button>

        <p className={styles.footer}>
          Don’t have an account? <Link href="/signup">Sign Up</Link>
        </p>
      </form>
    </main>
  );
}
