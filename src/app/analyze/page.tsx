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
      setPreviewUrl(URL.createObjectURL(picked))
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
      let arr: any = data.analysis?.results ?? data.analysis
      if (!Array.isArray(arr)) {
        console.error('Unexpected analysis payload:', data.analysis)
        throw new Error('Invalid analysis format received')
      }
      setResults(arr as Result[])
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
    <div className={styles.pageWrapper}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <button className={styles.backBtn} onClick={() => history.back()}>
            <img
              src="/icons/arrow-left.svg"
              alt="Back"
              className={styles.backIcon}
            />
          </button>
          <h1 className={styles.title}>Instant Popularity Snapshot</h1>
        </div>

        {/* Subtitle / Instructions */}
        <p className={styles.subtitle}>
          This quick test uses AI to predict in which countries you’d be most popular based <strong>only</strong> on your photo.  
          <strong> Note:</strong> Results are for entertainment purposes and may not reflect real outcomes.
        </p>

        <div className={styles.form}>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className={styles.fileInput}
          />

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
                Click here to choose your photo
              </div>
            )}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={styles.analyzeButton}
          >
            {loading ? 'Analyzing…' : 'Run Analysis'}
          </button>
          {error && <p className={styles.error}>{error}</p>}

          {/* More detailed analysis CTA */}
          {!results && !loading && (
            <div className={styles.moreInfo}>
              For deeper insights, complete your profile in the Abrody app:
              <div className={styles.storeButtons}>
                <a
                  href="https://apps.apple.com/app/abrody/id123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.storeButton}
                >
                  Download iOS
                </a>
                <a
                  href="https://play.google.com/store/apps/details?id=com.abrody.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.storeButton}
                >
                  Download Android
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Results Modal */}
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
    </div>
  )
}