'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { useConfig } from '../../context/ConfigContext';
import PasswordOTPRequestModal from '../../components/PasswordOTPRequestModal';
import PasswordChangeModal from '../../components/PasswordChangeModal';
import EmailUpdateModal from '../../components/EmailUpdateModal';
import schoolData from '../../constants/school.json';

import styles from '../../styles/pages/Account.module.css';

type RootStackParamList = {
  SignInLogIn: undefined;
  MyActivity: undefined;
  UpgradePlan: undefined;
  FriendList: undefined;
  BuddyList: undefined;
};

interface MyConfig {
  SERVER_URL: string;
  extra?: {
    enableSubscription?: boolean;
  };
}

const AccountPage: React.FC = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const config = useConfig() as Partial<MyConfig>;
  const SERVER_URL = config.SERVER_URL ?? 'https://fcde.app';
  const enableSubscription = config.extra?.enableSubscription ?? false;

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [showEmailDesc, setShowEmailDesc] = useState(false);
  const [isUsernameVisible, setUsernameVisible] = useState(false);
  const [isEmailVisible, setEmailVisible] = useState(false);

  const [otpModal, setOtpModal] = useState(false);
  const [pwChangeModal, setPwChangeModal] = useState(false);
  const [emailUpdateModal, setEmailUpdateModal] = useState(false);
  const [devicePermModal, setDevicePermModal] = useState(false);

  // Helper to mask
  const getMasked = (s: string) =>
    s.length <= 2 ? '*'.repeat(s.length) : '*'.repeat(s.length - 2) + s.slice(-2);
  const getMaskedEmail = (e: string) => {
    const [l, d] = e.split('@');
    if (!d) return e;
    return '*'.repeat(Math.max(0, l.length - 2)) + l.slice(-2) + '@' + d;
  };

  // Find school by domain
  const findSchoolByEmailDomain = (e: string) => {
    const parts = e.split('@');
    if (parts.length !== 2) return '';
    const domain = parts[1].toLowerCase();
    const all = Object.values(schoolData).flat();
    const found = (all as any[]).find(s => s.domain.toLowerCase() === domain);
    return found?.name ?? '';
  };

  // Fetch user on mount
  useEffect(() => {
    axios
      .get(`${SERVER_URL}/users/me`)
      .then(res => {
        setUsername(res.data.username);
        const em = res.data.email ?? t('no_email_provided');
        setEmail(em);
        if (res.data.email) {
          setSchoolName(findSchoolByEmailDomain(res.data.email));
        }
      })
      .catch(() => {
        alert(t('fetch_user_data_error'));
        router.replace('/signInLogIn');
      });
  }, [SERVER_URL, router, t]);

  // Logout / cache clear / delete
  const handleLogout = () => {
    if (confirm(t('confirm_logout'))) {
      localStorage.clear();
      router.replace('/signInLogIn');
    }
  };
  const handleClearCache = () => {
    if (confirm(t('confirm_clear_cache'))) {
      localStorage.clear();
      router.replace('/signInLogIn');
    }
  };
  const handleDeleteAccount = () => {
    if (!confirm(t('confirm_delete_account'))) return;
    axios
      .delete(`${SERVER_URL}/delete-account`)
      .catch(console.error)
      .finally(() => {
        router.replace('/signInLogIn');
      });
  };

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={styles.backIcon}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <h1 className={styles.title}>{t('account_management')}</h1>
        </header>

        <main className={styles.main}>
          {/* User Info */}
          <section className={styles.section}>
            <button
              type="button"
              className={styles.item}
              onClick={() => setUsernameVisible(v => !v)}
            >
              <span className={styles.label}>{t('username')}</span>
              <span className={styles.value}>
                {isUsernameVisible ? username : getMasked(username)}
              </span>
            </button>

            <button
              type="button"
              className={styles.item}
              onClick={() => setShowEmailDesc(v => !v)}
            >
              <span className={styles.label}>{t('email')}</span>
              <span className={styles.value}>
                {email !== t('no_email_provided')
                  ? isEmailVisible
                    ? email
                    : getMaskedEmail(email)
                  : t('no_email_provided')}
                {schoolName ? ` (${schoolName})` : ''}
              </span>
            </button>

            {showEmailDesc && (
              <div className={styles.description}>
                <p className={styles.descriptionText}>
                  {email !== t('no_email_provided')
                    ? t('email_description')
                    : t('email_not_set')}
                </p>
              </div>
            )}

            <button
              type="button"
              className={styles.item}
              onClick={() => setEmailUpdateModal(true)}
            >
              <span className={styles.label}>{t('update_email')}</span>
              <span className={styles.chevron}>›</span>
            </button>

            <button
              type="button"
              className={styles.item}
              onClick={() => setOtpModal(true)}
            >
              <span className={styles.label}>{t('password')}</span>
              <span className={styles.value}>{t('change')}</span>
            </button>
          </section>

          {/* Device & Activity */}
          <section className={styles.section}>
            <button
              type="button"
              className={styles.item}
              onClick={() => router.push('/my-activity')}
            >
              <span className={styles.label}>{t('my_activity')}</span>
              <span className={styles.chevron}>›</span>
            </button>
            {enableSubscription && (
              <button
                type="button"
                className={styles.item}
                onClick={() => router.push('/upgrade-plan')}
              >
                <span className={styles.label}>{t('premium_subscription')}</span>
                <span className={styles.chevron}>›</span>
              </button>
            )}
            <button
              type="button"
              className={styles.item}
              onClick={() => router.push('/friend-list')}
            >
              <span className={styles.label}>{t('friend_list')}</span>
              <span className={styles.chevron}>›</span>
            </button>
            <button
              type="button"
              className={styles.item}
              onClick={() => router.push('/buddy-list')}
            >
              <span className={styles.label}>{t('buddy_list')}</span>
              <span className={styles.chevron}>›</span>
            </button>
          </section>

          {/* Actions */}
          <section className={styles.section}>
            <button
              type="button"
              className={styles.item}
              onClick={handleLogout}
            >
              <span className={styles.label}>{t('logout')}</span>
            </button>
            <button
              type="button"
              className={styles.item}
              onClick={handleClearCache}
            >
              <span className={styles.label}>{t('clear_cache')}</span>
            </button>
            <button
              type="button"
              className={styles.item}
              onClick={handleDeleteAccount}
            >
              <span className={styles.label}>{t('delete_account')}</span>
            </button>
          </section>
        </main>

        {/* Modals */}
        <PasswordOTPRequestModal
          visible={otpModal}
          onClose={() => setOtpModal(false)}
          onVerified={() => setPwChangeModal(true)}
        />
        <PasswordChangeModal
          visible={pwChangeModal}
          onClose={() => setPwChangeModal(false)}
        />
        <EmailUpdateModal
          visible={emailUpdateModal}
          onClose={() => setEmailUpdateModal(false)}
        />
      </div>
    </div>
  );
};

export default AccountPage;
