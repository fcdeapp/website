"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../styles/Login.module.css';

type PasswordRules = { label: string; regex: RegExp };

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
  const [showPassword, setShowPassword] = useState(false);

  // 비밀번호가 몇 개 규칙을 충족하는지 계산
  const completedCount = RULES.filter(rule => rule.regex.test(password)).length;

  // username 6자 이상 + 모든 RULES 충족 시 valid = true
  useEffect(() => {
    setValid(username.length >= 6 && completedCount === RULES.length);
  }, [username, completedCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    // TODO: 실제 로그인 처리 로직
    alert('로그인 로직 실행!');
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
        <div className={styles.passwordWrapper}>
          <input
            className={styles.input}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
          <button
            type="button"
            className={styles.toggleButton}
            onClick={() => setShowPassword(prev => !prev)}
          >
            {showPassword ? 'Hide Password' : 'Show Password'}
          </button>
        </div>

        {/* 포커스 중일 때만 규칙 리스트 노출 */}
        {focused && (
          <ul className={styles.rules}>
            {RULES.map(rule => (
              <li
                key={rule.label}
                className={rule.regex.test(password) ? styles.rulePass : styles.ruleFail}
              >
                {rule.label}
              </li>
            ))}
          </ul>
        )}

        {/* 비밀번호 규칙 충족 개수에 따라 클래스가 strength0~strength5 로 변경 */}
        <div className={styles.strengthBar}>
          <div className={styles[`strength${completedCount}`]} />
        </div>

        <button
          type="submit"
          className={styles.submit}
          disabled={!valid}
        >
          Login
        </button>

        <p className={styles.footer}>
          Don’t have an account?{' '}
          <Link href="/signup">Sign Up</Link>
        </p>
      </form>
    </main>
  );
}
