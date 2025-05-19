'use client'

import React, { useState, useRef } from 'react'
import styles from '../../styles/pages/Analyze.module.css'

interface Result {
  country: string
  percentage: number
  reason: string
}

export default function Analyze() {
  const [file, setFile] = useState<File | null>(null)
  const [results, setResults] = useState<Result[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0])
  }

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please select an image.')
      return
    }
    setError(null)
    setLoading(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const res = await fetch('/api/userAnalysis/analyze-user-image-only', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || res.statusText)
      }

      const data = await res.json()
      // endpoint returns { analysis: { results: [...] } }
      const parsed: Result[] =
        data.analysis.results ?? (data.analysis as Result[])
      setResults(parsed)
    } catch (err) {
      console.error(err)
      setError('Analysis failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setResults(null)
  }

  const handleShare = () => {
    if (!results) return
    const text = JSON.stringify(results, null, 2)
    if (navigator.share) {
      navigator.share({
        title: 'Abrody Popularity Analysis',
        text,
      })
    } else {
      navigator.clipboard.writeText(text)
      alert('Results copied to clipboard.')
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Analyze Profile Image</h1>

      <div className={styles.form}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={styles.analyzeButton}
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </div>

      {results && (
        <div className={styles.backdrop} onClick={handleClose}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Popularity Prediction</h2>

            <div className={styles.modalBody}>
              {results.map((item, i) => (
                <div key={i} className={styles.row}>
                  <span className={styles.country}>{item.country}</span>
                  <div className={styles.barBg}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <span className={styles.pct}>{item.percentage}%</span>
                  <p className={styles.reason}>{item.reason}</p>
                </div>
              ))}
            </div>

            <div className={styles.btnRow}>
              <button
                onClick={handleShare}
                className={`${styles.btn} ${styles.btnPrimary}`}
              >
                Share
              </button>
              <button
                onClick={handleClose}
                className={`${styles.btn} ${styles.btnSecondary}`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
