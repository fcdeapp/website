// app/adminCorrections/page.tsx
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import axios from 'axios';
import styles from '../../styles/pages/AdminCorrections.module.css';

interface Category {
  id: string;
  name: string;
}

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
}

const EMPTY: Correction = {
  ruleId: '',
  type: 'grammar',
  pattern: '',
  suggestion: '',
  description: '',
  issueType: '',
  category: { id: '', name: '' },
  languageCode: '',
  importanceScore: 0,
  difficultyScore: 0,
};

export default function AdminCorrectionsPage() {
  const [items, setItems] = useState<Correction[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Correction>(EMPTY);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  // fetch list
  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Correction[]>('/api/corrections');
      setItems(res.data);
    } catch (e) {
      console.error(e);
      setError('Failed to load corrections');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  // handle input change
  const onChange = (k: keyof Correction) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const val = e.target.value;
    setForm(f => ({
      ...f,
      [k]: (k === 'importanceScore' || k === 'difficultyScore')
        ? Number(val)
        : val,
    } as Correction));
  };

  // submit create or update
  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingRuleId) {
        await axios.put(`/api/corrections/${editingRuleId}`, form);
      } else {
        await axios.post('/api/corrections', form);
      }
      setForm(EMPTY);
      setEditingRuleId(null);
      fetchAll();
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.error || 'Save failed');
    }
  };

  // start editing
  const onEdit = (item: Correction) => {
    setForm(item);
    setEditingRuleId(item.ruleId);
  };

  // delete
  const onDelete = async (ruleId: string) => {
    if (!confirm(`Delete ${ruleId}?`)) return;
    try {
      await axios.delete(`/api/corrections/${ruleId}`);
      fetchAll();
    } catch (e) {
      console.error(e);
      setError('Delete failed');
    }
  };

  // cancel form
  const onCancel = () => {
    setForm(EMPTY);
    setEditingRuleId(null);
    setError('');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Admin Corrections</h1>

      <button
        className={styles.newBtn}
        onClick={() => { setForm(EMPTY); setEditingRuleId(null); setError(''); }}
      >
        + New Correction
      </button>

      {(editingRuleId !== null || form.ruleId === '') && (
        <form className={styles.form} onSubmit={onSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.row}>
            <label>Rule ID</label>
            <input
              type="text"
              value={form.ruleId}
              onChange={onChange('ruleId')}
              disabled={!!editingRuleId}
              required
            />
          </div>
          <div className={styles.row}>
            <label>Type</label>
            <select value={form.type} onChange={onChange('type')}>
              <option value="grammar">Grammar</option>
              <option value="expression">Expression</option>
            </select>
          </div>
          <div className={styles.row}>
            <label>Pattern</label>
            <input type="text" value={form.pattern} onChange={onChange('pattern')} />
          </div>
          <div className={styles.row}>
            <label>Suggestion</label>
            <input type="text" value={form.suggestion} onChange={onChange('suggestion')} required />
          </div>
          <div className={styles.row}>
            <label>Description</label>
            <input type="text" value={form.description} onChange={onChange('description')} required />
          </div>
          <div className={styles.row}>
            <label>Issue Type</label>
            <input type="text" value={form.issueType} onChange={onChange('issueType')} />
          </div>
          <div className={styles.row}>
            <label>Category ID</label>
            <input type="text" value={form.category.id} onChange={e => setForm(f => ({ 
              ...f, category: { ...f.category, id: e.target.value } 
            }))} required />
          </div>
          <div className={styles.row}>
            <label>Category Name</label>
            <input type="text" value={form.category.name} onChange={e => setForm(f => ({ 
              ...f, category: { ...f.category, name: e.target.value } 
            }))} required />
          </div>
          <div className={styles.row}>
            <label>Language Code</label>
            <input type="text" value={form.languageCode} onChange={onChange('languageCode')} required />
          </div>
          <div className={styles.row}>
            <label>Importance (0–10)</label>
            <input
              type="number" min={0} max={10}
              value={form.importanceScore}
              onChange={onChange('importanceScore')}
            />
          </div>
          <div className={styles.row}>
            <label>Difficulty (0–10)</label>
            <input
              type="number" min={0} max={10}
              value={form.difficultyScore}
              onChange={onChange('difficultyScore')}
            />
          </div>
          <div className={styles.actions}>
            <button type="submit" className={styles.saveBtn}>
              {editingRuleId ? 'Update' : 'Create'}
            </button>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <p className={styles.loader}>Loading…</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Rule ID</th>
              <th>Type</th><th>Suggestion</th><th>Category</th>
              <th>Lang</th><th>Imp</th><th>Diff</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(i => (
              <tr key={i.ruleId}>
                <td>{i.ruleId}</td>
                <td>{i.type}</td>
                <td>{i.suggestion}</td>
                <td>{i.category.id}/{i.category.name}</td>
                <td>{i.languageCode}</td>
                <td>{i.importanceScore}</td>
                <td>{i.difficultyScore}</td>
                <td className={styles.actionsCell}>
                  <button onClick={() => onEdit(i)} className={styles.editBtn}>✎</button>
                  <button onClick={() => onDelete(i.ruleId)} className={styles.delBtn}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
