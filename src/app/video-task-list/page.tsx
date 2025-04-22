"use client";
// pages/video-task-list.tsx

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import styles from '../../styles/pages/VideoTaskList.module.css';
import { useConfig } from '../../context/ConfigContext';

const convertKoreaTime = (koreaDate: Date) => {
  const canadaTime = new Date(koreaDate.getTime() - 13 * 60 * 60 * 1000);
  const australiaTime = new Date(koreaDate.getTime() + 1 * 60 * 60 * 1000);
  const ukTime = new Date(koreaDate.getTime() - 9 * 60 * 60 * 1000);
  return { canadaTime, australiaTime, ukTime };
};

type ViewMode = 'tasks' | 'schedules';

const VideoTaskList: React.FC = () => {
  const { SERVER_URL } = useConfig();
  const router = useRouter();

  const [tasks, setTasks] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('tasks');
  const [modalMode, setModalMode] = useState<'main'|'auto'|'schedule'|'scheduleDetail'|null>(null);

  const [autoModeType, setAutoModeType] = useState<'Daily'|'Weekly'>('Daily');
  const [selectedHour, setSelectedHour] = useState<number>(12);
  const [selectedWeekday, setSelectedWeekday] = useState<string>('Monday');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${SERVER_URL}/api/video-tasks`, { withCredentials: true });
      setTasks(resp.data.tasks);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const resp = await axios.get(`${SERVER_URL}/api/task-schedules`, { withCredentials: true });
      setSchedules(resp.data.schedules);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  // initial load
  useEffect(() => { fetchTasks() }, []);

  // when viewMode flips
  useEffect(() => {
    viewMode === 'tasks' ? fetchTasks() : fetchSchedules();
  }, [viewMode]);

  const toggleViewMode = () => {
    setViewMode(m => m === 'tasks' ? 'schedules' : 'tasks');
  };

  const saveAutoSchedule = async () => {
    try {
      const payload = {
        type: 'auto',
        auto: {
          mode: autoModeType.toLowerCase(),
          hour: selectedHour,
          ...(autoModeType === 'Weekly' && { weekday: selectedWeekday })
        }
      };
      await axios.post(`${SERVER_URL}/api/task-schedules`, payload, { withCredentials: true });
      alert('Auto Pilot schedule saved successfully.');
      setModalMode('main');
      if (viewMode === 'schedules') fetchSchedules();
    } catch (e: any) {
      alert(`Failed to save auto schedule: ${e.message}`);
    }
  };

  const saveScheduledTask = async () => {
    try {
      const payload = {
        type: 'scheduled',
        scheduledFor: selectedDate.toISOString()
      };
      await axios.post(`${SERVER_URL}/api/task-schedules`, payload, { withCredentials: true });
      alert('Scheduled task saved successfully.');
      setModalMode('main');
      if (viewMode === 'schedules') fetchSchedules();
    } catch (e: any) {
      alert(`Failed to save scheduled task: ${e.message}`);
    }
  };

  const stopSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to stop this schedule?')) return;
    try {
      await axios.put(`${SERVER_URL}/api/task-schedules/${id}/stop`, {}, { withCredentials: true });
      alert('Schedule stopped successfully.');
      setModalMode(null);
      fetchSchedules();
    } catch (e: any) {
      alert(`Failed to stop schedule: ${e.message}`);
    }
  };

  const deleteSchedule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await axios.delete(`${SERVER_URL}/api/task-schedules/${id}`, { withCredentials: true });
      alert('Schedule deleted successfully.');
      setModalMode(null);
      fetchSchedules();
    } catch (e: any) {
      alert(`Failed to delete schedule: ${e.message}`);
    }
  };

  const renderTaskItem = (item: any) => (
    <div
      key={item._id}
      className={styles.card}
      onClick={() => router.push(`/video-production/${item._id}`)}
    >
      <h2 className={styles.taskTitle}>Task #{item._id.slice(-6)}</h2>
      <div className={styles.metaRow}>
        <span className={styles.status}>{item.status.toUpperCase()}</span>
        <span className={styles.step}>Step: {item.currentStep}</span>
      </div>
    </div>
  );

  const renderScheduleItem = (item: any) => {
    const scheduledTime = item.scheduledFor ? new Date(item.scheduledFor) : null;
    return (
      <div
        key={item._id}
        className={styles.card}
        onClick={() => { setSelectedSchedule(item); setModalMode('scheduleDetail'); }}
      >
        <h2 className={styles.taskTitle}>Schedule #{item._id.slice(-6)}</h2>
        <div className={styles.metaRow}>
          <span className={styles.status}>
            {item.type.toUpperCase()} {!item.active && '(STOPPED)'}
          </span>
          {scheduledTime && <span className={styles.step}>{scheduledTime.toLocaleString()}</span>}
          {item.auto && <span className={styles.step}>Mode: {item.auto.mode}</span>}
        </div>
      </div>
    );
  };

  const { canadaTime, australiaTime, ukTime } = convertKoreaTime(selectedDate);

  return (
    <div className={styles.container}>
      <div className={styles.headerContainer}>
        <h1 className={styles.header}>
          {viewMode === 'tasks' ? 'Existing Video Tasks' : 'Existing Schedules'}
        </h1>
        <button className={styles.toggleButton} onClick={toggleViewMode}>
          <span className={styles.toggleText}>
            {viewMode === 'tasks' ? 'Show Schedules' : 'Show Tasks'}
          </span>
        </button>
      </div>

      {loading
        ? <div className={styles.loader}><div className={styles.spinner} /></div>
        : viewMode === 'tasks'
          ? <div className={styles.list}>{tasks.map(renderTaskItem)}</div>
          : <div className={styles.list}>{schedules.map(renderScheduleItem)}</div>
      }

      {error && <div className={styles.error}>{error}</div>}

      <button className={styles.fab} onClick={() => setModalMode('main')}>
        <span className={styles.fabText}>+</span>
      </button>

      {modalMode && (
        <div className={styles.modalOverlay} onClick={() => setModalMode(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>

            {modalMode === 'main' && (
              <>
                <h2 className={styles.modalTitle}>Choose an Option</h2>
                <button className={styles.modalButton} onClick={() => setModalMode('auto')}>
                  <span className={styles.modalButtonText}>Auto Pilot Mode</span>
                </button>
                <button className={styles.modalButton} onClick={() => setModalMode('schedule')}>
                  <span className={styles.modalButtonText}>Schedule Task</span>
                </button>
                <button
                  className={styles.modalButton}
                  onClick={() => {
                    setModalMode(null);
                    router.push('/video-production');
                  }}
                >
                  <span className={styles.modalButtonText}>Create Manually</span>
                </button>
                <button className={styles.modalCancel} onClick={() => setModalMode(null)}>
                  <span className={styles.modalCancelText}>Cancel</span>
                </button>
              </>
            )}

            {modalMode === 'auto' && (
              <>
                <h2 className={styles.modalTitle}>Auto Pilot Mode</h2>
                <p className={styles.modalSubTitle}>Select mode:</p>
                <div className={styles.optionRow}>
                  {['Daily','Weekly'].map(m => (
                    <button
                      key={m}
                      className={`${styles.optionButton} ${autoModeType===m?styles.optionButtonSelected:''}`}
                      onClick={() => setAutoModeType(m as any)}
                    >
                      <span className={styles.optionButtonText}>{m}</span>
                    </button>
                  ))}
                </div>
                {autoModeType==='Weekly' && (
                  <>
                    <p className={styles.modalSubTitle}>Select weekday:</p>
                    <div className={styles.optionRow}>
                      {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(day=>(
                        <button
                          key={day}
                          className={`${styles.optionButton} ${selectedWeekday===day?styles.optionButtonSelected:''}`}
                          onClick={()=>setSelectedWeekday(day)}
                        >
                          <span className={styles.optionButtonText}>{day}</span>
                        </button>
                      ))}
                    </div>
                  </>
                )}
                <p className={styles.modalSubTitle}>Select Hour (KST):</p>
                <div className={styles.optionRow}>
                  {Array.from({length:24},(_,i)=>(i)).map(i=>(
                    <button
                      key={i}
                      className={`${styles.optionButton} ${selectedHour===i?styles.optionButtonSelected:''}`}
                      onClick={()=>setSelectedHour(i)}
                    >
                      <span className={styles.optionButtonText}>{i}</span>
                    </button>
                  ))}
                </div>
                <p className={styles.modalSubTitle}>Time Conversion:</p>
                <p className={styles.timeText}>KST: {new Date().setHours(selectedHour,0,0,0) && new Date().toLocaleTimeString()}</p>
                <p className={styles.timeText}>Canada: {canadaTime.toLocaleTimeString()}</p>
                <p className={styles.timeText}>Australia: {australiaTime.toLocaleTimeString()}</p>
                <p className={styles.timeText}>UK: {ukTime.toLocaleTimeString()}</p>
                <button className={styles.modalButton} onClick={saveAutoSchedule}>
                  <span className={styles.modalButtonText}>Save</span>
                </button>
                <button className={styles.modalCancel} onClick={()=>setModalMode('main')}>
                  <span className={styles.modalCancelText}>Back</span>
                </button>
              </>
            )}

            {modalMode === 'schedule' && (
              <>
                <h2 className={styles.modalTitle}>Schedule Task</h2>
                <button className={styles.modalButton} onClick={()=>setSelectedDate(new Date())}>
                  <span className={styles.modalButtonText}>Set to Now</span>
                </button>
                <p className={styles.modalSubTitle}>Selected (KST):</p>
                <p className={styles.timeText}>{selectedDate.toLocaleString()}</p>
                <p className={styles.modalSubTitle}>Time Conversion:</p>
                <p className={styles.timeText}>Canada: {canadaTime.toLocaleTimeString()}</p>
                <p className={styles.timeText}>Australia: {australiaTime.toLocaleTimeString()}</p>
                <p className={styles.timeText}>UK: {ukTime.toLocaleTimeString()}</p>
                <button className={styles.modalButton} onClick={saveScheduledTask}>
                  <span className={styles.modalButtonText}>Save</span>
                </button>
                <button className={styles.modalCancel} onClick={()=>setModalMode('main')}>
                  <span className={styles.modalCancelText}>Back</span>
                </button>
              </>
            )}

            {modalMode === 'scheduleDetail' && selectedSchedule && (
              <>
                <h2 className={styles.modalTitle}>Schedule Detail</h2>
                <p className={styles.modalSubTitle}>
                  {selectedSchedule.type.toUpperCase()}
                  {!selectedSchedule.active && ' (STOPPED)'}
                  {selectedSchedule.auto && (
                    <>
                      <br/>Mode: {selectedSchedule.auto.mode}
                      <br/>Hour: {selectedSchedule.auto.hour}
                      {selectedSchedule.auto.weekday && <><br/>Weekday: {selectedSchedule.auto.weekday}</>}
                    </>
                  )}
                </p>
                {selectedSchedule.scheduledFor && (
                  <p className={styles.timeText}>
                    Scheduled For: {new Date(selectedSchedule.scheduledFor).toLocaleString()}
                  </p>
                )}
                <button className={styles.modalButton} onClick={() => stopSchedule(selectedSchedule._id)}>
                  <span className={styles.modalButtonText}>Stop</span>
                </button>
                <button className={styles.modalButton} onClick={() => deleteSchedule(selectedSchedule._id)}>
                  <span className={styles.modalButtonText}>Delete</span>
                </button>
                <button className={styles.modalCancel} onClick={()=>setModalMode('main')}>
                  <span className={styles.modalCancelText}>Back</span>
                </button>
              </>
            )}

          </div>
        </div>
      )}

      <div className={styles.footer}>© 2025 Abrody</div>
    </div>
  );
};

export default VideoTaskList;
