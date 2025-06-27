'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import { useConfig } from "../../context/ConfigContext";
import styles from '../../styles/pages/AdminCorrections.module.css';

/*──────── Types ────────*/
interface Category { id: string; name: string; }
interface Correction {
  _id?: string;
  ruleId: string;
  type: 'grammar' | 'expression';
  pattern: string;
  suggestion: string;
  description: string;
  issueType: string;
  category: Category;
  languageCode: string;
  importanceScore: number;
  difficultyScore: number;
  originalSentence: string; 
  correctedSentence: string;
}
const EMPTY: Correction = {
  ruleId: '', type: 'grammar', pattern: '',
  suggestion: '', description: '', issueType: '',
  category: { id: '', name: '' },
  languageCode: '',
  importanceScore: 0, difficultyScore: 0,
  originalSentence: '',
  correctedSentence: '',
};

/*──────── Component ────────*/
export default function AdminCorrections() {
  const { SERVER_URL } = useConfig();
  const [items, setItems] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Correction>(EMPTY);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkJson, setBulkJson] = useState('[]');
  const [bulkResp, setBulkResp] = useState<any>(null);

  /*──── fetch list ────*/
  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Correction[]>(`${SERVER_URL}/api/corrections`);
      setItems(res.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  /*──── form change ────*/
  const onChange = (k: keyof Correction) => (e: any) => {
    const v = e.target.value;
    setForm(f => ({ ...f, [k]: (k==='importanceScore'||k==='difficultyScore')?Number(v):v }));
  };

  /*──── save (create/update) ────*/
  const save = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) await axios.put(`${SERVER_URL}/api/corrections/${editingId}`, form);
      else           await axios.post(`${SERVER_URL}/api/corrections`, form);
      setForm(EMPTY); setEditingId(null); setError('');
      load();
    } catch (e:any) {
      setError(e.response?.data?.error || 'Save failed');
    }
  };

  /*──── delete ────*/
  const del = async (id: string) => {
    if (!confirm('Delete?')) return;
    await axios.delete(`${SERVER_URL}/api/corrections/${id}`);
    load();
  };

  /*──── bulk upload ────*/
  const sendBulk = async () => {
    setBulkResp(null); setError('');
    try {
      const parsed = JSON.parse(bulkJson);
      const res = await axios.post(`${SERVER_URL}/api/corrections/bulk`, parsed);
      setBulkResp(res.data);
      load();
    } catch (e:any) {
      setError(e.message);
    }
  };

  /*──────── render ────────*/
  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Admin – Corrections</h1>

      <div className={styles.topBar}>
        <button className={styles.newBtn} onClick={() => {
          setBulkMode(false); setForm(EMPTY); setEditingId(null); setError('');
        }}>+ New</button>

        <button className={styles.jsonBtn} onClick={() => { setBulkMode(!bulkMode); setError(''); }}>
          {bulkMode ? '← Back to form' : '⇪ Bulk JSON'}
        </button>
      </div>

      {/*──── Bulk JSON pane ────*/}
      {bulkMode && (
        <div className={styles.jsonCard}>
          <textarea
            className={styles.jsonArea}
            value={bulkJson}
            onChange={e=>setBulkJson(e.target.value)}
            placeholder='[ { "ruleId": "...", "type": "grammar", ... }, ... ]'
          />
          <div className={styles.actions}>
            <button className={styles.saveBtn} onClick={sendBulk}>Upload JSON</button>
          </div>
          {bulkResp && (
            <pre className={styles.jsonResp}>{JSON.stringify(bulkResp,null,2)}</pre>
          )}
          {error && <div className={styles.error}>{error}</div>}
        </div>
      )}

      {/*──── Individual form ────*/}
      {!bulkMode && (
        <form className={styles.form} onSubmit={save}>
          {error && <div className={styles.error}>{error}</div>}
          {[
            { label:'Rule ID', key:'ruleId', disabled:!!editingId },
            { label:'Pattern', key:'pattern' },
            { label:'Suggestion', key:'suggestion' },
            { label:'Description', key:'description' },
            { label:'Issue Type', key:'issueType' },
            { label:'Category ID', key:'category.id' },
            { label:'Category Name', key:'category.name' },
            { label:'Language Code', key:'languageCode' },
            { label:'Original Sentence', key:'originalSentence' },
            { label:'Corrected Sentence', key:'correctedSentence' },
          ].map(({label,key,disabled})=>{
            const [k1,k2] = key.split('.');
            const val = k2? (form as any)[k1][k2] : (form as any)[k1];
            return (
              <div className={styles.row} key={key}>
                <label>{label}</label>
                <input
                  value={val}
                  disabled={disabled}
                  onChange={e=>{
                    if(k2) setForm(f=>({ ...f, [k1]:{... (f as any)[k1], [k2]:e.target.value} }));
                    else onChange(k1 as keyof Correction)(e);
                  }}
                  required={['ruleId','suggestion','description','category.id','category.name','languageCode','originalSentence','correctedSentence'].includes(key)}
                />
              </div>
            );
          })}
          <div className={styles.row}>
            <label>Type</label>
            <select value={form.type} onChange={onChange('type')}>
              <option value="grammar">Grammar</option>
              <option value="expression">Expression</option>
            </select>
          </div>
          <div className={styles.row}>
            <label>Importance</label>
            <input type="number" min={0} max={10} value={form.importanceScore} onChange={onChange('importanceScore')} />
          </div>
          <div className={styles.row}>
            <label>Difficulty</label>
            <input type="number" min={0} max={10} value={form.difficultyScore} onChange={onChange('difficultyScore')} />
          </div>
          <div className={styles.actions}>
            <button className={styles.saveBtn} type="submit">{editingId ? 'Update' : 'Create'}</button>
            <button className={styles.cancelBtn} type="button" onClick={()=>{setForm(EMPTY);setEditingId(null);}}>Cancel</button>
          </div>
        </form>
      )}

      {/*──── Table ────*/}
      {loading ? (
        <p className={styles.loader}>Loading…</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Type</th><th>Suggestion</th>
              <th>Category</th><th>Lang</th>
              <th>Imp</th><th>Diff</th><th>⋯</th>
            </tr>
          </thead>
          <tbody>
            {items.map(it=>(
              <tr key={it.ruleId}>
                <td>{it.ruleId}</td>
                <td>{it.type}</td>
                <td>{it.suggestion}</td>
                <td>{it.category.id}/{it.category.name}</td>
                <td>{it.languageCode}</td>
                <td>{it.importanceScore}</td>
                <td>{it.difficultyScore}</td>
                <td className={styles.actionsCell}>
                  <button className={styles.editBtn} onClick={()=>{setForm(it);setEditingId(it.ruleId);setBulkMode(false);}}>✎</button>
                  <button className={styles.delBtn} onClick={()=>del(it.ruleId)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
