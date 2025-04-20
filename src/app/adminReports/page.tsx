"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import styles from "../../styles/pages/AdminReports.module.css";

// --- 타입 정의 ---
interface ErrorLog {
  _id: string;
  message: string;
  createdAt: string;
}
interface ReportItem {
  _id: string;
  type: "report" | "inquiry";
  message: string;
  createdAt: string;
  userId: string;
}
interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  image?: string;
  type: string;
  sendTo?: string;
  createdAt: string;
}
interface DisabledUser {
  _id: string;
  nickname: string;
  email: string;
}
interface RegionGroup<T> {
  region: string;
  errorLogs?: ErrorLog[];
  reports?: ReportItem[];
  inquiries?: ReportItem[];
  disabledUsers?: DisabledUser[];
}

interface CountRow {
    region: string;
    errorLogs: number;
    reports: number;
    inquiries: number;
    notifications: number;
    disabledUsers: number;
  }

const ITEMS_PER_PAGE = 8;
const DEFAULT_REGIONS = ["ap-northeast-2", "ap-southeast-2", "ca-central-1", "eu-west-2"];

export default function AdminReports() {
  const { SERVER_URL } = useConfig();

  // 로딩 / 필터 상태
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<"error"|"report"|"inquiry"|"notifications"|"disabledUsers">("error");
  const [region, setRegion] = useState<string>("all");
  const [isGrouped, setIsGrouped] = useState(false);

  // 데이터 상태
  const [regionData, setRegionData] = useState<RegionGroup<any>[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [disabledUsersData, setDisabledUsersData] = useState<RegionGroup<DisabledUser>[]>([]);
  const [counts, setCounts] = useState<CountRow[]>([]);

  // 페이징
  const [page, setPage] = useState(1);

  // 모달 상태
  const [responseModalOpen, setResponseModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // 응답/생성 폼
  const [responseTarget, setResponseTarget] = useState<ReportItem|ErrorLog|null>(null);
  const [editingNotif, setEditingNotif] = useState<NotificationItem|null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formMessage, setFormMessage] = useState("");

  // --- 데이터 불러오기 ---
  useEffect(() => {
    setPage(1);
    setLoading(true);

    (async () => {
      try {
        if (["error","report","inquiry"].includes(category)) {
          const res = await axios.get<{ regions: RegionGroup<any>[] }>(
            `${SERVER_URL}/api/admin/reports`,
            { withCredentials: true }
          );
          setRegionData(res.data.regions || []);
        } else if (category === "notifications") {
          const res = await axios.get<NotificationItem[]>(
            `${SERVER_URL}/api/admin/nl/adminOnlyNotifications?region=${region}`,
            { withCredentials: true }
          );
          setNotifications(res.data || []);
        } else if (category === "disabledUsers") {
          const res = await axios.get<{ regions: RegionGroup<DisabledUser>[] }>(
            `${SERVER_URL}/api/admin/users/disabled`,
            { withCredentials: true }
          );
          setDisabledUsersData(res.data.regions || []);
        }
      } catch (e) {
        console.error("Fetch error", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [category, region, SERVER_URL]);

  // 데이터 불러오기 useEffect 에서 추가:
    useEffect(() => {
    axios.get<{ counts: CountRow[] }>(
        `${SERVER_URL}/api/admin/reports/counts`, { withCredentials: true }
    ).then(res => setCounts(res.data.counts))
    .catch(err => console.error(err));
    }, [SERVER_URL]);

  // --- 지역 옵션 계산 ---
  const regionOptions: string[] = (() => {
    if (category === "notifications") {
      return ["all"];
    }
    if (category === "disabledUsers") {
      const regs = disabledUsersData.map(r => r.region);
      return ["all", ...regs];
    }
    const regs = regionData.map(r => r.region);
    return ["all", ...(regs.length ? regs : DEFAULT_REGIONS)];
  })();

  // --- 현재 보여줄 아이템(flat list) 생성 ---
  let items: any[] = [];
  if (["error","report","inquiry"].includes(category)) {
    regionData.forEach(rg => {
      if (region === "all" || rg.region === region) {
        if (category === "error") items.push(...(rg.errorLogs || []));
        if (category === "report") items.push(...(rg.reports || []).filter(x => x.type === "report"));
        if (category === "inquiry") items.push(...(rg.reports || []).filter(x => x.type === "inquiry"));
      }
    });
  } else if (category === "notifications") {
    items = region === "all" ? notifications : notifications.filter(n => n.sendTo === region);
  } else /* disabledUsers */ {
    disabledUsersData.forEach(rg => {
      if (region === "all" || rg.region === region) {
        items.push(...(rg.disabledUsers || []));
      }
    });
  }

  // --- 에러로그 그룹화 ---
  const grouped =
    category === "error" && isGrouped
      ? Object.values(
          (items as ErrorLog[]).reduce((acc, log) => {
            if (!acc[log.message]) acc[log.message] = { message: log.message, count: 0, example: log };
            acc[log.message].count++;
            return acc;
          }, {} as Record<string, { message: string; count: number; example: ErrorLog }>)
        )
      : null;

  // --- 페이지네이션 ---
  const totalItems = (grouped || items).length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const display = (grouped || items).slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // --- 핸들러들 ---
  const openResponse = (it: ReportItem|ErrorLog) => {
    setResponseTarget(it);
    setFormTitle("");
    setFormMessage("");
    setResponseModalOpen(true);
  };
  const submitResponse = async () => {
    if (!formTitle || !formMessage || !responseTarget) return;
    try {
      await axios.post(
        `${SERVER_URL}/api/admin/nl/postNotifications`,
        {
          title: formTitle,
          message: formMessage,
          sendTo: (responseTarget as any).userId || null,
          type: "Individual",
          region,
        },
        { withCredentials: true }
      );
      alert("Notification sent");
      setResponseModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed to send");
    }
  };

  const openCreate = (notif?: NotificationItem) => {
    if (notif) {
      setEditingNotif(notif);
      setFormTitle(notif.title);
      setFormMessage(notif.message);
    } else {
      setEditingNotif(null);
      setFormTitle("");
      setFormMessage("");
    }
    setCreateModalOpen(true);
  };

  const submitCreate = async () => {
    try {
      const url = editingNotif
        ? `${SERVER_URL}/api/admin/nl/editNotifications/${editingNotif._id}`
        : `${SERVER_URL}/api/admin/nl/postNotifications`;
      await axios.post(
        url,
        {
          ...(editingNotif ? { id: editingNotif._id } : {}),
          title: formTitle,
          message: formMessage,
          sendTo: region === "all" ? null : region,
          type: "All",
          region,
          // → 관리자 전용 플래그 추가
          isAdminNotification: true,
        },
        { withCredentials: true }
      );
      alert("Saved");
      setCreateModalOpen(false);
    } catch (e) {
      console.error(e);
      alert("Failed");
    }
  };

  const deleteNotif = async (id: string) => {
    if (!confirm("Delete this notification?")) return;
    try {
      await axios.delete(
        `${SERVER_URL}/api/admin/nl/deleteNotifications/${id}`,
        {
          data: { region }, // region 필수
          withCredentials: true,
        }
      );
      setNotifications(n => n.filter(x => x._id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Admin Reports</h1>

      <table className={styles.countTable}>
        <thead>
            <tr>
            <th>Region</th>
            <th>Error Logs</th>
            <th>Reports</th>
            <th>Inquiries</th>
            <th>Notifications</th>
            <th>Disabled Users</th>
            </tr>
        </thead>
        <tbody>
            {counts.map(row => (
            <tr key={row.region}>
                <td>{row.region}</td>
                <td>{row.errorLogs}</td>
                <td>{row.reports}</td>
                <td>{row.inquiries}</td>
                <td>{row.notifications}</td>
                <td>{row.disabledUsers}</td>
            </tr>
            ))}
        </tbody>
        </table>

      <div className={styles.filterRow}>
        <select value={category} onChange={e => setCategory(e.target.value as any)}>
          <option value="error">Error Logs</option>
          <option value="report">Reports</option>
          <option value="inquiry">Inquiries</option>
          <option value="notifications">Notifications</option>
          <option value="disabledUsers">Disabled Users</option>
        </select>

        <select value={region} onChange={e => setRegion(e.target.value)}>
          <option value="all">All Regions</option>
          {regionOptions.filter(r => r !== "all").map(r => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>

        {category === "error" && (
          <button
            className={styles.toggleBtn}
            onClick={() => setIsGrouped(g => !g)}
          >
            {isGrouped ? "Individual View" : "Group by Message"}
          </button>
        )}

        {category === "notifications" && (
          <button
            className={styles.createBtn}
            onClick={() => openCreate()}
          >
            + Create Notification
          </button>
        )}
      </div>

      {loading ? (
        <div className={styles.loader}>Loading…</div>
      ) : (
        <>
          <ul className={styles.list}>
            {display.map((it, idx) => (
              <li key={idx} className={styles.listItem}>
                {category === "error" && isGrouped ? (
                  <>
                    <strong>{(it as any).message}</strong>
                    <span>({(it as any).count} occurrences)</span>
                  </>
                ) : category === "error" ? (
                  <>
                    <span>{(it as ErrorLog).message}</span>
                    <small>{new Date(it.createdAt).toLocaleString()}</small>
                  </>
                ) : category === "report" || category === "inquiry" ? (
                  <>
                    <span>{(it as ReportItem).message}</span>
                    <small>{new Date(it.createdAt).toLocaleString()}</small>
                    <button
                      className={styles.respondBtn}
                      onClick={() => openResponse(it)}
                    >
                      Respond
                    </button>
                  </>
                ) : category === "notifications" ? (
                  <>
                    <div>
                      <strong>{(it as NotificationItem).title}</strong>
                      <p>{(it as NotificationItem).message}</p>
                      <small>{new Date(it.createdAt).toLocaleString()}</small>
                    </div>
                    <div className={styles.crudBtns}>
                      <button onClick={() => openCreate(it as NotificationItem)}>Edit</button>
                      <button onClick={() => deleteNotif((it as NotificationItem)._id)}>Delete</button>
                    </div>
                  </>
                ) : /* disabledUsers */ (
                  <>
                    <span>{(it as DisabledUser).nickname}</span>
                    <small>{(it as DisabledUser).email}</small>
                  </>
                )}
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
              <span>{page} / {totalPages}</span>
              <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          )}
        </>
      )}

      {/* Respond Modal */}
      {responseModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setResponseModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>Send Response</h3>
            <input
              placeholder="Title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
            />
            <textarea
              placeholder="Message"
              value={formMessage}
              onChange={e => setFormMessage(e.target.value)}
            />
            <div className={styles.modalBtns}>
              <button onClick={submitResponse}>Send</button>
              <button onClick={() => setResponseModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Create/Edit Notification Modal */}
      {createModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setCreateModalOpen(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h3>{editingNotif ? "Edit" : "Create"} Notification</h3>
            <input
              placeholder="Title"
              value={formTitle}
              onChange={e => setFormTitle(e.target.value)}
            />
            <textarea
              placeholder="Message"
              value={formMessage}
              onChange={e => setFormMessage(e.target.value)}
            />
            <div className={styles.modalBtns}>
              <button onClick={submitCreate}>{editingNotif ? "Save" : "Create"}</button>
              <button onClick={() => setCreateModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
