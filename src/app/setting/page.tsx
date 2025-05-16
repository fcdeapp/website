// app/setting/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useConfig } from "../../context/ConfigContext";
import Licenses from '../../components/Licenses';
import OTPRequestModal from '../../components/OTPRequestModal';
import TermsModal from '../../components/TermsModal';
import ReportOverlay from '../../components/ReportOverlay';

import styles from '../../styles/pages/Setting.module.css';

type TermsType = 'service' | 'privacy' | 'community';

const SettingPage: React.FC = () => {
  const { SERVER_URL } = useConfig();
  const router = useRouter();
  const { t } = useTranslation();

  const [isAdmin, setIsAdmin] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [newMsgEnabled, setNewMsgEnabled] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [externalReportOpen, setExternalReportOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const [showContact, setShowContact] = useState(false);

  const [termsOpen, setTermsOpen] = useState(false);
  const [termsType, setTermsType] = useState<TermsType>('service');

  const [licensesOpen, setLicensesOpen] = useState(false);
  const [adminOtpOpen, setAdminOtpOpen] = useState(false);

  const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

  // 1) 유저 정보 불러오기
  useEffect(() => {
    fetch(`${SERVER_URL}/users/me`, { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        setIsAdmin(data.isAdmin);
        setPushEnabled(data.pushNotificationEnabled);
        setNewMsgEnabled(data.newMessageEnabled);
      })
      .catch(console.error);
  }, []);

  // 2) 설정 변경
  const updateSettings = () =>
    fetch('/api/users/settings', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        pushNotificationEnabled: pushEnabled,
        newMessageEnabled: newMsgEnabled
      })
    });

  const togglePush = async () => {
    setPushEnabled(v => !v);
    await updateSettings();
  };
  const toggleNewMsg = async () => {
    setNewMsgEnabled(v => !v);
    await updateSettings();
  };

  // 3) 신고 안내 모달
  const openReport = () => {
    fetch('/api/contact-info', { credentials: 'include' })
      .then(r => r.json())
      .then(setContactInfo)
      .catch(() => setContactInfo({ email: 'support@fcde.app', phone: '+1 000-000-0000' }));
    setReportOpen(true);
  };
  const closeReport = () => setReportOpen(false);

  const handleReportNow = () => {
    setReportOpen(false);
    setExternalReportOpen(true);
  };
  const submitExternalReport = async (reason: string) => {
    if (!reason.trim()) { alert(t('report_reason_required')); return; }
    const res = await fetch('/api/report/post', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    if (res.ok) {
      alert(t('report_success_message'));
      setExternalReportOpen(false);
    } else {
      alert(t('report_error'));
    }
  };

  // 4) 약관 모달
  const openTerms = (type: TermsType) => {
    setTermsType(type);
    setTermsOpen(true);
  };
  const closeTerms = () => setTermsOpen(false);

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
          <h1 className={styles.title}>{t('settings')}</h1>
        </header>

        {/* Main content */}
        <main className={styles.main}>
          {/* 계정 관리 */}
          <section className={styles.section}>
            <button
              className={styles.item}
              onClick={() => router.push('/account')}
            >
              {t('account_management')}
              <span className={styles.chevron}>›</span>
            </button>
          </section>

          {/* 알림 설정 */}
          <section className={styles.section}>
            <label className={styles.item}>
              {t('push_notifications')}
              <input
                type="checkbox"
                checked={pushEnabled}
                onChange={togglePush}
              />
            </label>
            <label className={styles.item}>
              {t('receive_new_messages')}
              <input
                type="checkbox"
                checked={newMsgEnabled}
                onChange={toggleNewMsg}
              />
            </label>
          </section>

          {/* 신고 · 문의 */}
          <section className={styles.section}>
            <button className={styles.link} onClick={openReport}>
              {t('report_issue')}
            </button>
            <button className={styles.link} onClick={() => router.push('/qna')}>
              {t('make_inquiry')}
            </button>
          </section>

          {/* 약관 */}
          <section className={styles.section}>
            <button className={styles.link} onClick={() => openTerms('service')}>
              {t('terms_of_service')}
            </button>
            <button className={styles.link} onClick={() => openTerms('privacy')}>
              {t('privacy_policy')}
            </button>
            <button className={styles.link} onClick={() => openTerms('community')}>
              {t('community_rules')}
            </button>
          </section>

          {/* 앱 정보 */}
          <section className={styles.section}>
            <div className={styles.item}>
              {t('app_version')}
              <span>{APP_VERSION}</span>
            </div>
            <button className={styles.link} onClick={() => setLicensesOpen(true)}>
              {t('license')}
            </button>
          </section>

          {/* 관리자 메뉴 */}
          {isAdmin ? (
            <section className={styles.section}>
              <button className={styles.item} onClick={() => router.push('/financial')}>
                Financial<span className={styles.chevron}>›</span>
              </button>
              <button className={styles.item} onClick={() => router.push('/admin/dashboard')}>
                Dashboard<span className={styles.chevron}>›</span>
              </button>
              <button className={styles.item} onClick={() => router.push('/admin/reports')}>
                Control Panel<span className={styles.chevron}>›</span>
              </button>
              <button className={styles.link} onClick={() => router.push('/video-task-list')}>
                {t('create_promotional_video')}
              </button>
            </section>
          ) : (
            <button className={styles.link} onClick={() => setAdminOtpOpen(true)}>
              {t('request_admin_access')}
            </button>
          )}
        </main>

        {/* 신고 안내 모달 */}
        <AnimatePresence>
          {reportOpen && (
            <motion.div
              className={styles.backdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className={styles.modal}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
              >
                <h2>{t('how_to_report')}</h2>
                <p>{t('report_instructions')}</p>
                <div className={styles.actionButtons}>
                  <button onClick={handleReportNow}>{t('report_now')}</button>
                  <button onClick={() => setShowContact(v => !v)}>{t('contact_now')}</button>
                </div>
                {showContact && (
                  <div className={styles.contactInfo}>
                    <p>{t('email')}: {contactInfo.email}</p>
                    <p>{t('phone')}: {contactInfo.phone}</p>
                  </div>
                )}
                <button className={styles.closeBtn} onClick={closeReport}>
                  {t('close')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 외부 신고 모달 */}
        <AnimatePresence>
          {externalReportOpen && (
            <ReportOverlay
              visible={externalReportOpen}
              onClose={() => setExternalReportOpen(false)}
              onSubmit={submitExternalReport}
            />
          )}
        </AnimatePresence>

        {/* 관리자 OTP 모달 */}
        <AnimatePresence>
          {adminOtpOpen && (
            <OTPRequestModal
              visible={adminOtpOpen}
              onClose={() => setAdminOtpOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* 약관 모달 */}
        <AnimatePresence>
          {termsOpen && (
            <TermsModal
              visible={termsOpen}
              type={termsType}
              onClose={closeTerms}
            />
          )}
        </AnimatePresence>

        {/* 라이선스 모달 */}
        <AnimatePresence>
          {licensesOpen && (
            <Licenses onClose={() => setLicensesOpen(false)} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SettingPage;
