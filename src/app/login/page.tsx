"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/Login.module.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
  const [valid, setValid] = useState(false);

  useEffect(() => {
    const newErrors: any = {};
    if (username && username.length < 6) newErrors.username = 'Username must be at least 6 characters';
    const pwdViolations: string[] = [];
    if (password.length < 8) pwdViolations.push('Min 8 characters');
    if (!/[A-Z]/.test(password)) pwdViolations.push('Uppercase letter');
    if (!/[a-z]/.test(password)) pwdViolations.push('Lowercase letter');
    if (!/[0-9]/.test(password)) pwdViolations.push('Number');
    if (!/[^A-Za-z0-9]/.test(password)) pwdViolations.push('Special char');
    if (pwdViolations.length) newErrors.password = pwdViolations.join(', ');
    setErrors(newErrors);
    setValid(
        Object.keys(newErrors).length === 0 &&
        username.length > 0 &&
        password.length > 0
      );
  }, [username, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // TODO: POST /api/auth/login
  };

  return (
    <main className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h1 className={styles.title}>Sign In to Facade</h1>
        <div className={styles.field}>
          <label>Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
          {errors.username && <p className={styles.error}>{errors.username}</p>}
        </div>
        <div className={styles.field}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
          {errors.password && <p className={styles.error}>{errors.password}</p>}
        </div>
        <button type="submit" className={styles.submit} disabled={!valid}>Login</button>
        <p className={styles.footerText}>
          Don’t have an account? <Link href="/signup"><a>Sign Up</a></Link>
        </p>
      </form>
    </main>
  );
}