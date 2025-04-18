"use client";

import React, { useEffect, useState, FocusEvent } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import { useTranslation } from 'react-i18next';
import PostMain from '../../components/PostMain';
import BuddySearchItem from '../../components/BuddySearchItem';
import FriendSearchItem from '../../components/FriendSearchItem';
import LoginDecisionOverlay from '../../overlays/LoginDecisionOverlay';
import styles from '../../styles/pages/MyActivity.module.css';

type ItemType = 'review' | 'meeting' | 'report' | 'buddy' | 'friend' | '';

interface MyActivityData {
  pastMeetings: any[];
  reportedPosts: any[];
  buddyGroups: any[];
  friends: any[];
  review: any[];
  reportInquiries: any[];
  userPosts: any[];
  userBuddyPosts: any[];
  region?: string;
  userId: string;
}

const MyActivityPage: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [userData, setUserData] = useState<MyActivityData | null>(null);
  const [noDataSections, setNoDataSections] = useState<string[]>([]);
  const [downloadFormat, setDownloadFormat] = useState<'json'|'csv'|'xml'|'pdf'>('json');
  const [isDownloadModalVisible, setDownloadModalVisible] = useState(false);
  const [loginOverlayVisible, setLoginOverlayVisible] = useState(false);

  // 1) Fetch user activity
  const fetchUserData = async() => {
    try {
      const resp = await axios.get<MyActivityData>('/my-activity/all', { withCredentials: true });
      const data = resp.data;
      setUserData(data);

      const noData: string[] = [];
      if (!data.pastMeetings?.length) noData.push(t('myActivity.pastMeetings'));
      if (!data.reportedPosts?.length) noData.push(t('myActivity.reportedPosts'));
      if (!data.buddyGroups?.length) noData.push(t('myActivity.buddyGroups'));
      if (!data.friends?.length) noData.push(t('myActivity.friends'));
      if (!data.review?.length) noData.push(t('myActivity.reviews'));
      if (!data.userPosts?.length) noData.push(t('myActivity.hostedPosts'));
      if (!data.userBuddyPosts?.length) noData.push(t('myActivity.hostedBuddyPosts'));
      setNoDataSections(noData);
    } catch(err) {
      console.error(err);
      alert(t('fetch_user_data_error'));
    }
  };

  useEffect(() => { fetchUserData() }, []);

  // 2) Convert helpers
  const convertToCSV = (data: any) => {
    const headers = Object.keys(data).join(',');
    const values = Object.values(data).map(v =>
      Array.isArray(v) ? `"${JSON.stringify(v)}"` : String(v)
    ).join(',');
    return `${headers}\n${values}`;
  };
  const convertToXML = (data: any) => {
    const recurse = (o: any): string =>
      Object.entries(o).map(([k,v]) =>
        `<${k}>${ typeof v==='object' && v!==null ? recurse(v) : v }</${k}>`
      ).join('');
    return `<?xml version="1.0" encoding="UTF-8"?><root>${recurse(data)}</root>`;
  };

  // 3) PDF generator
  const generatePDF = (data: any) => {
    const pdf = new jsPDF();
    pdf.setFontSize(14);
    pdf.text(t('myActivity.pdfTitle'), 10, 10);
    pdf.setFontSize(10);
    Object.entries(data).forEach(([k,v], i) =>
      pdf.text(`${k}: ${JSON.stringify(v)}`, 10, 20 + i*10)
    );
    pdf.save('user_data.pdf');
  };

  // 4) Download handler
  const handleDownloadData = () => {
    if (!userData) {
      alert(t('noDataToDownload'));
      return;
    }
    let blob: Blob;
    if (downloadFormat==='json') {
      blob = new Blob([JSON.stringify(userData, null,2)], { type:'application/json' });
    } else if (downloadFormat==='csv') {
      blob = new Blob([convertToCSV(userData)], { type:'text/csv' });
    } else if (downloadFormat==='xml') {
      blob = new Blob([convertToXML(userData)], { type:'application/xml' });
    } else {
      setDownloadModalVisible(false);
      return generatePDF(userData);
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `user_data.${downloadFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloadModalVisible(false);
    alert(t('dataDownloaded', { format: downloadFormat.toUpperCase() }));
  };

  // 5) Handle delete
  const handleDelete = (type: ItemType, idx: number) => {
    if (!confirm(t('deleteConfirmationMessage'))) return;
    axios.delete('/my-activity/delete', {
      data: { type, index: idx },
      withCredentials: true
    })
    .then(() => {
      alert(t('itemDeletedSuccessfully'));
      fetchUserData();
    })
    .catch(() => alert(t('failedToDeleteItem')));
  };

  // 6) Handle reason edit on blur
  const handleReasonEdit = (idx: number, newReason: string) => {
    const report = userData!.reportInquiries[idx];
    axios.put('/my-activity/report/edit', { reportId: report._id, reason: newReason }, { withCredentials: true })
      .then(()=> {
        alert(t('reportUpdatedSuccessfully'));
        fetchUserData();
      })
      .catch(()=> alert(t('failedToUpdateReport')));
  };

  // 7) Login check
  const ensureLogin = async() => {
    // cookie-based; try a ping endpoint
    try {
      await axios.get('/auth/check', { withCredentials: true });
      return true;
    } catch {
      setLoginOverlayVisible(true);
      return false;
    }
  };

  // 8) Navigate to QnA
  const goQnA = async() => {
    if (await ensureLogin()) router.push('/qna');
  };

  return (
    <>
      <Head><title>{t('myActivity.title')}</title></Head>
      <div className={styles.container}>
        <header className={styles.header}>
          <button onClick={()=>router.back()} className={styles.backBtn}/>
          <h1 className={styles.title}>{t('myActivity.title')}</h1>
        </header>

        <div className={styles.compliance}>
          <p>{t('myActivity.complianceText')}</p>
          <p>{t('myActivity.dataTransferInstruction')}</p>
          <p>{t('myActivity.dataRegion')}: {userData?.region || t('myActivity.unknownRegion')}</p>
          <button className={styles.downloadBtn} onClick={()=>setDownloadModalVisible(true)}>
            {t('myActivity.downloadDataButton')}
          </button>
        </div>

        <main>
          { !userData ? (
            <div className={styles.loading}>{t('loading')}</div>
          ) : (
            <>
              {/* Past Meetings */}
              {userData.pastMeetings.length>0 && (
                <section>
                  <h2>{t('myActivity.pastMeetings')}</h2>
                  {userData.pastMeetings.map((m,i)=>(
                    <div key={i} className={styles.itemCard}>
                      <PostMain {...m} isBuddyPost={false}/>
                      <div className={styles.actions}>
                        <button onClick={()=>handleDelete('meeting', i)} className={styles.deleteBtn}>
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Reported Posts */}
              {userData.reportedPosts.length>0 && (
                <section>
                  <h2>{t('myActivity.reportedPosts')}</h2>
                  {userData.reportedPosts.map((p,i)=>(
                    <div key={i} className={styles.itemCard}>
                      <PostMain {...p} isBuddyPost={false}/>
                      <div className={styles.actions}>
                        <button onClick={()=>handleDelete('report', i)} className={styles.deleteBtn}>
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Buddy Groups */}
              {userData.buddyGroups.length>0 && (
                <section>
                  <h2>{t('myActivity.buddyGroups')}</h2>
                  {userData.buddyGroups.map((b,i)=>(
                    <BuddySearchItem key={i} {...b} />
                  ))}
                </section>
              )}

              {/* Friends */}
              {userData.friends.length>0 && (
                <section>
                  <h2>{t('myActivity.friends')}</h2>
                  <p className={styles.subtitle}>{t('myActivity.friendsHint')}</p>
                  {userData.friends.map(f=>(
                    <FriendSearchItem
                        key={f.userId}
                        friend={f}
                        userId={userData.userId}
                        isFriend={true}
                        hasSentRequest={false}
                        hasReceivedRequest={false}
                    />
                  ))}
                </section>
              )}

              {/* Reviews */}
              {userData.review.length>0 && (
                <section>
                  <h2>{t('myActivity.reviews')}</h2>
                  {userData.review.map((r,i)=>(
                    <div key={i} className={styles.itemCard}>
                      <p><strong>{t('myActivity.rating', { rating: r.rating })}</strong></p>
                      <p>{r.content}</p>
                      <div className={styles.actions}>
                        <button onClick={()=>handleDelete('review', i)} className={styles.deleteBtn}>
                          {t('delete')}
                        </button>
                      </div>
                    </div>
                  ))}
                </section>
              )}

              {/* Reports/Inquiries */}
              {userData.reportInquiries.length>0 && (
                <section>
                  <h2>{t('myActivity.reportsInquiries')}</h2>
                  {userData.reportInquiries.map((ri,i)=>(
                    <div key={ri._id||i} className={styles.itemCard}>
                      <div className={styles.row}>
                        <span>{ri.type==='report' ? '[REPORT]' : '[INQUIRY]'}</span>
                        <button onClick={()=>handleDelete('report', i)} className={styles.deleteBtn}>
                          {t('delete')}
                        </button>
                      </div>
                      {ri.postId && <p>Post: {ri.postId.title}</p>}
                      <textarea
                        className={styles.textarea}
                        value={ri.reason}
                        onChange={e=>{
                          const arr=[...userData.reportInquiries];
                          arr[i].reason=e.target.value;
                          setUserData({...userData, reportInquiries:arr});
                        }}
                        onBlur={()=>handleReasonEdit(i, ri.reason)}
                      />
                      <p>{t('myActivity.date')}: {new Date(ri.reportedAt).toLocaleString()}</p>
                      {ri.updatedAt && <p>{t('myActivity.lastUpdated')}: {new Date(ri.updatedAt).toLocaleString()}</p>}
                    </div>
                  ))}
                </section>
              )}

              {/* Hosted Posts */}
              {userData.userPosts.length>0 && (
                <section>
                  <h2>{t('myActivity.hostedPosts')}</h2>
                  {userData.userPosts.map(p=>(
                    <PostMain key={p._id} {...p} isBuddyPost={false}/>
                  ))}
                </section>
              )}

              {/* Hosted Buddy Posts */}
              {userData.userBuddyPosts.length>0 && (
                <section>
                  <h2>{t('myActivity.hostedBuddyPosts')}</h2>
                  {userData.userBuddyPosts.map(bp=>(
                    <PostMain key={bp._id} {...bp} isBuddyPost={true}/>
                  ))}
                </section>
              )}

              {/* No Data */}
              {noDataSections.length>0 && (
                <section className={styles.noData}>
                  <h3>{t('myActivity.noDataHeader')}</h3>
                  {noDataSections.map((sec,i)=>(
                    <p key={i}>{t('myActivity.noDataFor', { section: sec })}</p>
                  ))}
                </section>
              )}
            </>
          )}
        </main>

        <button className={styles.qnaBtn} onClick={goQnA}>
          {t('qna.helpNeeded')}
        </button>

        {isDownloadModalVisible && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h4>{t('myActivity.chooseDownloadFormat')}</h4>
              <select
                value={downloadFormat}
                onChange={e=>setDownloadFormat(e.target.value as any)}
                className={styles.picker}
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
                <option value="pdf">PDF</option>
              </select>
              <div className={styles.modalActions}>
                <button onClick={handleDownloadData}>{t('download')}</button>
                <button onClick={()=>setDownloadModalVisible(false)}>{t('cancel')}</button>
              </div>
            </div>
          </div>
        )}

        {loginOverlayVisible && (
          <LoginDecisionOverlay
            visible
            onLogin={()=>{ router.push('/signin'); }}
            onBrowse={()=>setLoginOverlayVisible(false)}
          />
        )}
      </div>
    </>
  );
};

export default MyActivityPage;
