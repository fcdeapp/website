'use client'

import React, { useState, useRef, useEffect } from 'react'
import { useConfig } from '../../context/ConfigContext'
import styles from '../../styles/pages/Analyze.module.css'

interface Result {
  country: string
  percentage: number
  reason: string
}

export default function Analyze() {
  const { SERVER_URL } = useConfig()
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [results, setResults] = useState<Result[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // clean up preview URL when file changes
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0]
    if (picked) {
      setFile(picked)
      const url = URL.createObjectURL(picked)
      setPreviewUrl(url)
      setResults(null)
      setError(null)
    }
  }

  const openFilePicker = () => {
    inputRef.current?.click()
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

      const res = await fetch(
        `${SERVER_URL}/api/userAnalysis/analyze-user-image-only`,
        {
          method: 'POST',
          body: formData,
        }
      )

      if (!res.ok) {
        const txt = await res.text()
        throw new Error(txt || res.statusText)
      }

      const data = await res.json()
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

  const handleClose = () => setResults(null)

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
        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />

        {/* Preview or placeholder */}
        <div
          className={styles.previewContainer}
          onClick={openFilePicker}
          title="Click to select or change image"
        >
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Preview"
              className={styles.previewImage}
            />
          ) : (
            <div className={styles.previewPlaceholder}>
              Click to choose an image
            </div>
          )}
        </div>

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
          <div
            className={styles.modal}
            onClick={(e) => e.stopPropagation()}
          >
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
