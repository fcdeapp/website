// app/video-production/page.tsx
'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useConfig } from '../../context/ConfigContext';
import styles from '../../styles/pages/VideoProductionPage.module.css';

type Scene = {
  sceneNumber: number;
  dialogues: string[];
  scenePrompt: string;
};

type Article = {
  title: string;
  url: string;
  source: { name: string };
};

type ScenarioResult = {
  scenario: string;
  scenes: Scene[];
  newsArticles?: Article[];
};

const VideoProductionPage: React.FC = () => {
  const router = useRouter();
  const { SERVER_URL } = useConfig();

  const [taskId,    setTaskId]    = useState<string | null>((router.query.taskId as string) || null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading,     setLoading]     = useState<boolean>(false);
  const [error,       setError]       = useState<string>('');

  // Step 0 form
  const [selectedCountry, setSelectedCountry] = useState<string>('Canada');
  const [conceptMode,     setConceptMode]     = useState<'News'|'Custom'>('Custom');
  const [conceptInput,    setConceptInput]    = useState<string>('');
  const [sceneCount,      setSceneCount]      = useState<number>(3);

  const [imageSource, setImageSource] = useState<string>('DREAMSTUDIO');

  // Results
  const [scenarioResult, setScenarioResult] = useState<ScenarioResult | null>(null);
  const [editedScenario, setEditedScenario] = useState<ScenarioResult | null>(null);
  const [isEditing,      setIsEditing]      = useState<boolean>(false);
  const [audioClips,     setAudioClips]     = useState<string[]>([]);
  const [sceneImages,    setSceneImages]    = useState<string[]>([]);
  const [videoClips,     setVideoClips]     = useState<string[]>([]);
  const [finalVideo,     setFinalVideo]     = useState<string>('');

  const resetError = () => setError('');

  // CREATE new task
  useEffect(() => {
    if (taskId) return;
    (async () => {
      setLoading(true);
      try {
        const resp = await axios.post(`${SERVER_URL}/api/video-tasks`, null, { withCredentials: true });
        setTaskId(resp.data.task._id);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [SERVER_URL, taskId]);

  // LOAD existing task
  useEffect(() => {
    if (!taskId) return;
    (async () => {
      setLoading(true);
      try {
        const resp = await axios.get(`${SERVER_URL}/api/video-tasks/${taskId}`, { withCredentials: true });
        const t = resp.data.task;
        if (t.scenario) {
          setScenarioResult(t.scenario);
          setEditedScenario(t.scenario);
        }
        setAudioClips(t.audioUrls || []);
        setSceneImages(t.sceneImages || []);
        setVideoClips(t.videoUrls || []);
        setFinalVideo(t.finalVideoUrl || '');
        setCurrentStep(t.currentStep || 0);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [SERVER_URL, taskId]);

  // Step 0 → generate scenario
  const handleGenerateScenario = async () => {
    resetError(); setLoading(true);
    try {
      const resp = await axios.post(
        `${SERVER_URL}/api/video-production`,
        {
          action: 'generate-scenario',
          country: selectedCountry,
          conceptMode,
          concept: conceptMode === 'Custom' ? conceptInput : '',
          sceneCount,
          taskId
        },
        { withCredentials: true }
      );
      const { scenario, newsArticles = [] } = resp.data;
      setScenarioResult({ ...scenario, newsArticles });
      setEditedScenario({ ...scenario, newsArticles });
      setCurrentStep(1);
    } catch (e: any) {
      setError(e.message || 'Failed to generate scenario.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1 → TTS
  const handleTTS = async () => {
    resetError(); setLoading(true);
    try {
      if (!editedScenario) throw new Error('No scenario.');
      const urls = await Promise.all(
        editedScenario.scenes.map(async s => {
          const resp = await axios.post(
            `${SERVER_URL}/api/video-production`,
            { action: 'generate-tts', text: s.dialogues[0], taskId },
            { withCredentials: true }
          );
          return resp.data.audio_url as string;
        })
      );
      setAudioClips(urls);
      setCurrentStep(2);
    } catch (e: any) {
      setError(e.message || 'TTS failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2 → Image generation
  const handleImageGen = async () => {
    resetError(); setLoading(true);
    try {
      if (!scenarioResult) throw new Error('No scenario.');
      const urls = await Promise.all(
        scenarioResult.scenes.map(async (s) => {
          const resp = await axios.post(
            `${SERVER_URL}/api/video-production`,
            {
              action: 'generate-image',
              prompt: `${s.scenePrompt} in 9:16 aspect ratio for a reel video`,
              source: imageSource,
              taskId
            },
            { withCredentials: true }
          );
          return resp.data.image_url as string;
        })
      );
      setSceneImages(urls);
      setCurrentStep(3);
    } catch (e: any) {
      setError(e.message || 'Image gen failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3 → Video clip gen
  const handleVideoGen = async () => {
    resetError(); setLoading(true);
    try {
      if (!scenarioResult) throw new Error('No scenario.');
      const urls = await Promise.all(
        scenarioResult.scenes.map(async (_s, i) => {
          const body = imageSource === 'SKIP'
            ? {
                action: 'generate-video',
                videoMode: 'text',
                prompt: scenarioResult.scenes[i].scenePrompt,
                duration: '5',
                ratio: '9:16',
                model: 'kling-video/v1.6/standard/text-to-video',
                taskId
              }
            : {
                action: 'generate-video',
                videoMode: 'image',
                image: sceneImages[i],
                prompt: scenarioResult.scenes[i].scenePrompt,
                duration: '5',
                ratio: '9:16',
                model: 'kling-video/v1.6/standard/image-to-video',
                taskId
              };
          const resp = await axios.post(
            `${SERVER_URL}/api/video-production`,
            body,
            { withCredentials: true }
          );
          return resp.data.video_url as string;
        })
      );
      setVideoClips(urls);
      setCurrentStep(4);
    } catch (e: any) {
      setError(e.message || 'Video clip gen failed.');
    } finally {
      setLoading(false);
    }
  };

  // Step 4 → Merge
  const handleMerge = async () => {
    resetError(); setLoading(true);
    try {
      if (audioClips.length !== videoClips.length) throw new Error('Mismatch clips.');
      const resp = await axios.post(
        `${SERVER_URL}/api/video-production`,
        { action: 'merge-video', videoUrls: videoClips, audioUrls: audioClips, taskId },
        { withCredentials: true }
      );
      setFinalVideo(resp.data.mergedVideoUrl as string);
      setCurrentStep(5);
    } catch (e: any) {
      setError(e.message || 'Merge failed.');
    } finally {
      setLoading(false);
    }
  };

  // Upload
  const handleUpload = async (platform: string) => {
    resetError(); setLoading(true);
    try {
      await axios.post(
        `${SERVER_URL}/api/video-production`,
        { action: 'upload-final-video', taskId, platform },
        { withCredentials: true }
      );
      alert(`Uploaded to ${platform}!`);
      setCurrentStep(6);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  // Download/Share
  const handleShare = async () => {
    if (!finalVideo) return alert('No video.');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Final Video', url: finalVideo });
      } catch (e: any) {
        alert(e.message);
      }
    } else {
      // fallback: 다운로드 링크 생성
      const a = document.createElement('a');
      a.href = finalVideo;
      a.download = 'video.mp4';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // 렌더링
  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className={styles.formContainer}>
            <label className={styles.formLabel}>Select Country:</label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className={styles.picker}
            >
              <option value="">None</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="United Kingdom">United Kingdom</option>
            </select>

            <label className={styles.formLabel}>Select Concept Mode:</label>
            <select
              value={conceptMode}
              onChange={(e) => setConceptMode(e.target.value as 'News' | 'Custom')}
              className={styles.picker}
            >
              <option value="News">News</option>
              <option value="Custom">Custom</option>
            </select>

            {conceptMode === 'Custom' && (
              <>
                <label className={styles.formLabel}>Concept (opt.):</label>
                <textarea
                  className={styles.textInput}
                  placeholder="e.g., funny, surprising"
                  maxLength={100}
                  value={conceptInput}
                  onChange={(e) => setConceptInput(e.target.value)}
                />
              </>
            )}

            <label className={styles.formLabel}>Number of Scenes:</label>
            <select
              value={sceneCount}
              onChange={(e) => setSceneCount(Number(e.target.value))}
              className={styles.picker}
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>

            <button className={styles.button} onClick={handleGenerateScenario}>
              <span className={styles.buttonText}>Generate Scenario</span>
            </button>
          </div>
        );

      case 1:
        return (
          <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Scenario Result</h2>
            {editedScenario ? (
              <div className={styles.resultContainer}>
                <p className={styles.resultText}>Overall: {editedScenario.scenario}</p>
                {editedScenario.scenes.map((s, i) => (
                  <div key={i} className={styles.sceneContainer}>
                    <h3 className={styles.sceneHeader}>Scene {s.sceneNumber}</h3>
                    <label className={styles.subLabel}>Dialogues:</label>
                    {isEditing
                      ? s.dialogues.map((d, j) => (
                          <textarea
                            key={j}
                            className={styles.textInput}
                            maxLength={1000}
                            value={editedScenario.scenes[i].dialogues[j]}
                            onChange={(e) => {
                              const copy = { ...editedScenario };
                              copy.scenes[i].dialogues[j] = e.target.value;
                              setEditedScenario(copy);
                            }}
                          />
                        ))
                      : s.dialogues.map((d, j) => (
                          <p key={j} className={styles.resultText}>
                            - {d}
                          </p>
                        ))}
                    <label className={styles.subLabel}>Prompt:</label>
                    {isEditing ? (
                      <textarea
                        className={styles.textInput}
                        maxLength={1000}
                        value={editedScenario.scenes[i].scenePrompt}
                        onChange={(e) => {
                          const copy = { ...editedScenario };
                          copy.scenes[i].scenePrompt = e.target.value;
                          setEditedScenario(copy);
                        }}
                      />
                    ) : (
                      <p className={styles.resultText}>{s.scenePrompt}</p>
                    )}
                  </div>
                ))}
                {scenarioResult?.newsArticles?.length! > 0 && (
                  <>
                    <h3 className={styles.stepTitle}>Source Articles</h3>
                    {scenarioResult!.newsArticles!.map((a, i) => (
                      <div key={i} className={styles.sceneContainer}>
                        <p className={styles.subLabel}>{a.title}</p>
                        <p className={styles.resultText}>{a.source.name}</p>
                        <a
                          className={styles.resultText}
                          style={{ color: 'blue' }}
                          href={a.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Read full article
                        </a>
                      </div>
                    ))}
                  </>
                )}
              </div>
            ) : (
              <p className={styles.infoText}>No scenario yet.</p>
            )}

            <div className={styles.editButtonContainer}>
              <button
                className={styles.button}
                onClick={() => {
                  if (isEditing && scenarioResult) setEditedScenario(scenarioResult);
                  setIsEditing(!isEditing);
                }}
              >
                <span className={styles.buttonText}>
                  {isEditing ? 'Cancel Edit' : 'Edit Scenario'}
                </span>
              </button>
              {isEditing && (
                <button
                  className={styles.button}
                  onClick={() => {
                    if (editedScenario) {
                      setScenarioResult(editedScenario);
                      setIsEditing(false);
                    }
                  }}
                >
                  <span className={styles.buttonText}>Save Changes</span>
                </button>
              )}
              <button className={styles.button} onClick={handleTTS}>
                <span className={styles.buttonText}>Next: Convert to Speech</span>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Step 2: TTS Conversion</h2>
            <div className={styles.resultContainer}>
              {audioClips.map((u, i) => (
                <p key={i} className={styles.resultText}>
                  Audio Clip {i + 1}: {u}
                </p>
              ))}
            </div>

            <label className={styles.formLabel}>Select Image Source:</label>
            <select
              value={imageSource}
              onChange={(e) => setImageSource(e.target.value)}
              className={styles.picker}
            >
              <option value="DREAMSTUDIO">DreamStudio</option>
              <option value="DALL-E">DALL·E 3</option>
              <option value="LoRA">LoRA</option>
              <option value="SKIP">Skip</option>
            </select>

            <div className={styles.buttonContainerImages}>
              {imageSource === 'SKIP' ? (
                <button
                  className={styles.button}
                  onClick={() => {
                    setSceneImages([]);
                    setCurrentStep(3);
                  }}
                >
                  <span className={styles.buttonText}>Next: Skip Image Generation</span>
                </button>
              ) : (
                <button className={styles.button} onClick={handleImageGen}>
                  <span className={styles.buttonText}>Next: Generate Images</span>
                </button>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Step 3: Scene Images</h2>
            <div className={styles.resultContainer}>
              {sceneImages.map((url, i) => (
                <div key={i} className={styles.sceneContainer}>
                  <h3 className={styles.sceneHeader}>
                    Scene {editedScenario?.scenes[i].sceneNumber}
                  </h3>
                  <img src={url} className={styles.imagePreview} alt={`scene ${i + 1}`} />
                  <p className={styles.subLabel}>Dialogues:</p>
                  {editedScenario?.scenes[i].dialogues.map((d, j) => (
                    <p key={j} className={styles.resultText}>
                      - {d}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.button} onClick={handleVideoGen}>
                <span className={styles.buttonText}>Next: Generate Video Clips</span>
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Step 4: Video Clips</h2>
            <div className={styles.resultContainer}>
              {videoClips.map((url, i) => (
                <div key={i} className={styles.sceneContainer}>
                  <h3 className={styles.sceneHeader}>
                    Scene {editedScenario?.scenes[i].sceneNumber}
                  </h3>
                  <video
                    src={url}
                    controls
                    style={{ width: '100%', height: 250, borderRadius: 10, marginBottom: 5 }}
                  />
                  <p className={styles.subLabel}>Dialogues:</p>
                  {editedScenario?.scenes[i].dialogues.map((d, j) => (
                    <p key={j} className={styles.resultText}>
                      - {d}
                    </p>
                  ))}
                </div>
              ))}
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.button} onClick={handleMerge}>
                <span className={styles.buttonText}>Next: Merge Video</span>
              </button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className={styles.stepContainer}>
            <h2 className={styles.stepTitle}>Step 5: Final Video</h2>
            {finalVideo ? (
              <video
                src={finalVideo}
                controls
                autoPlay
                style={{ width: '100%', height: 250, borderRadius: 10, marginBottom: 5 }}
              />
            ) : (
              <p className={styles.infoText}>No merged video yet.</p>
            )}
            <div className={styles.buttonContainerVertical}>
              {['Instagram','Facebook','TikTok','Twitter','YouTube'].map((p) => (
                <button key={p} className={styles.buttonWide} onClick={() => handleUpload(p)}>
                  <span className={styles.buttonText}>Upload to {p}</span>
                </button>
              ))}
              <button className={styles.button} onClick={() => handleUpload('ALL')}>
                <span className={styles.buttonText}>Upload All</span>
              </button>
            </div>
            <div className={styles.buttonContainer}>
              <button className={styles.button} onClick={handleShare}>
                <span className={styles.buttonText}>Download/Share Video</span>
              </button>
              <button className={styles.button} onClick={() => router.back()}>
                <span className={styles.buttonText}>Back to Settings</span>
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.scrollContent}>
        <h1 className={styles.pageTitle}>Video Production Workflow</h1>
        {renderStep()}
        {error && <p className={styles.errorText}>{error}</p>}
        {loading && (
          <div className={styles.loader}>
            <div className={styles.spinner} />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoProductionPage;
