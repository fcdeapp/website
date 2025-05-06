"use client";

import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import styles from "../../styles/pages/OwlVideos.module.css";

interface SceneMedia {
  sceneNumber: number;
  imageUrl: string;
  audioUrl: string;
  videoUrl: string;
}

interface OwlVideo {
  _id: string;
  userId: string;
  uploadedAt: string;
  country: string;
  description: string;
  scenes: SceneMedia[];
}

interface NewScene {
  image: File | null;
  audio: File | null;
  video: File | null;
  prompt: string;
}

export default function OwlVideosPage() {
  const { SERVER_URL } = useConfig();
  const region = "ap-northeast-2";

  const [videos, setVideos] = useState<OwlVideo[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [scenePrompts, setScenePrompts] = useState<Record<string, string>>({});

  // 신규 생성 폼용 동적 씬 배열
  const [newScenes, setNewScenes] = useState<NewScene[]>([
    { image: null, audio: null, video: null, prompt: "" },
  ]);

  // 기존 영상 불러오기
  useEffect(() => {
    fetchVideos();
  }, []);

  // 로컬스토리지에서 userId 로드
  useEffect(() => {
    const stored = localStorage.getItem("userId");
    if (stored) setUserId(stored);
  }, []);

  const fetchVideos = async () => {
    try {
      const res = await axios.get<OwlVideo[]>(
        `${SERVER_URL}/owl-videos?region=${region}`,
        { withCredentials: true }
      );
      setVideos(res.data);
    } catch (err) {
      console.error("Error fetching owl videos", err);
    }
  };

  // 새 영상 생성
  const handleCreate = async () => {
    if (!userId || !country || newScenes.some(s => !s.image || !s.audio || !s.video)) {
      alert("User ID, country, and all scene files are required.");
      return;
    }
    const form = new FormData();
    form.append("userId", userId);
    form.append("country", country);
    form.append("description", description);
    form.append("region", region);
    // 씬별로 이미지/오디오/비디오/프롬프트 append
    newScenes.forEach(scene => {
      form.append("images", scene.image as Blob, scene.image!.name);
      form.append("audios", scene.audio as Blob, scene.audio!.name);
      form.append("videos", scene.video as Blob, scene.video!.name);
      form.append("prompts", scene.prompt);
    });
    try {
      await axios.post(
        `${SERVER_URL}/owl-videos`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      // 초기화
      setCountry("");
      setDescription("");
      setNewScenes([{ image: null, audio: null, video: null, prompt: "" }]);
      fetchVideos();
    } catch (err) {
      console.error("Error creating owl video", err);
      alert("Failed to create.");
    }
  };

  // 씬별 미디어 PATCH
  const handlePatchMedia = async (
    videoId: string,
    sceneNumber: number,
    field: "image" | "audio" | "video",
    file: File
  ) => {
    const form = new FormData();
    form.append("region", region);
    form.append(field, file);
    try {
      await axios.patch(
        `${SERVER_URL}/owl-videos/${videoId}/scenes/${sceneNumber}/${field}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" }, withCredentials: true }
      );
      fetchVideos();
    } catch (err) {
      console.error(`Error updating ${field}`, err);
      alert(`Failed to update ${field}.`);
    }
  };

  // 씬별 AI 비디오 생성 요청
  const handleGenerateVideo = async (videoId: string, sceneNumber: number) => {
    const key = `${videoId}-${sceneNumber}`;
    setGenerating(prev => ({ ...prev, [key]: true }));
    try {
      const prompt = scenePrompts[key] || "";
      await axios.post(
        `${SERVER_URL}/owl-videos/${videoId}/scenes/${sceneNumber}/generate-video`,
        { region, prompt },
        { withCredentials: true }
      );
      alert("Video generation started.");
    } catch (err) {
      console.error("Error generating video", err);
      alert("Failed to start video generation.");
    } finally {
      setGenerating(prev => ({ ...prev, [key]: false }));
    }
  };

  // 영상 전체 삭제
  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Delete this video entirely?")) return;
    try {
      await axios.delete(
        `${SERVER_URL}/owl-videos/${videoId}?region=${region}`,
        { withCredentials: true }
      );
      fetchVideos();
    } catch (err) {
      console.error("Error deleting owl video", err);
      alert("Failed to delete.");
    }
  };

  // 신규 씬 추가/삭제/업데이트
  const addScene = () =>
    setNewScenes(prev => [...prev, { image: null, audio: null, video: null, prompt: "" }]);
  const removeScene = (idx: number) =>
    setNewScenes(prev => prev.filter((_, i) => i !== idx));
  const updateSceneField = (
    idx: number,
    field: keyof NewScene,
    value: File | string | null
  ) =>
    setNewScenes(prev =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Owl Videos Management</h1>
      </header>
      <main className={styles.main}>

        {/* — Create New Owl Video — */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Create New Owl Video</h2>
          <div className={styles.formRow}>
            <input
              type="text"
              placeholder="User ID"
              value={userId}
              readOnly
              className={styles.input}
            />
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className={styles.input}
            >
              <option value="">Select country</option>
              <option value="Canada">Canada</option>
              <option value="Australia">Australia</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="South Korea">South Korea</option>
            </select>
          </div>
          <div className={styles.formRow}>
            <textarea
              placeholder="Description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className={styles.textarea}
            />
          </div>

          {newScenes.map((scene, idx) => (
            <div key={idx} className={styles.sceneCard}>
              <h3>New Scene {idx + 1}</h3>
              <div className={styles.mediaRow}>
                <div className={styles.mediaBox}>
                  <label className={styles.fileLabel}>
                    Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSceneField(idx, "image", e.target.files?.[0] || null)
                      }
                      className={styles.fileInput}
                    />
                  </label>
                </div>
                <div className={styles.mediaBox}>
                  <label className={styles.fileLabel}>
                    Audio
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSceneField(idx, "audio", e.target.files?.[0] || null)
                      }
                      className={styles.fileInput}
                    />
                  </label>
                </div>
                <div className={styles.mediaBox}>
                  <label className={styles.fileLabel}>
                    Video
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e: ChangeEvent<HTMLInputElement>) =>
                        updateSceneField(idx, "video", e.target.files?.[0] || null)
                      }
                      className={styles.fileInput}
                    />
                  </label>
                </div>
              </div>
              <input
                type="text"
                placeholder="Scene prompt"
                value={scene.prompt}
                onChange={e => updateSceneField(idx, "prompt", e.target.value)}
                className={styles.input}
              />
              {newScenes.length > 1 && (
                <button
                  onClick={() => removeScene(idx)}
                  className={styles.removeButton}
                >
                  Remove Scene
                </button>
              )}
            </div>
          ))}

          <button onClick={addScene} className={styles.button}>
            + Add Scene
          </button>
          <button onClick={handleCreate} className={styles.button}>
            Create Owl Video
          </button>
        </section>

        {/* — Existing Owl Videos — */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Existing Owl Videos</h2>
          {videos.length === 0 && <p>No videos found.</p>}
          {videos.map(v => (
            <div key={v._id} className={styles.videoCard}>
              <div className={styles.cardHeader}>
                <div>
                  <strong>Country:</strong> {v.country} &nbsp;|&nbsp;
                  <strong>Uploaded:</strong>{" "}
                  {new Date(v.uploadedAt).toLocaleString()}
                </div>
                <button
                  onClick={() => handleDeleteVideo(v._id)}
                  className={styles.deleteButton}
                >
                  Delete Video
                </button>
              </div>
              <p className={styles.description}>{v.description}</p>
              <div className={styles.scenesContainer}>
                {v.scenes.map(s => (
                  <div key={s.sceneNumber} className={styles.sceneCard}>
                    <h3>Scene {s.sceneNumber}</h3>
                    <div className={styles.mediaRow}>
                      <div className={styles.mediaBox}>
                        <img
                          src={s.imageUrl}
                          alt={`scene ${s.sceneNumber}`}
                          className={styles.previewImage}
                        />
                        <label className={styles.patchLabel}>
                          Change Image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e =>
                              e.target.files?.[0] &&
                              handlePatchMedia(
                                v._id,
                                s.sceneNumber,
                                "image",
                                e.target.files[0]
                              )
                            }
                            className={styles.fileInput}
                          />
                        </label>
                      </div>
                      <div className={styles.mediaBox}>
                        <audio
                          controls
                          src={s.audioUrl}
                          className={styles.audioPlayer}
                        />
                        <label className={styles.patchLabel}>
                          Change Audio
                          <input
                            type="file"
                            accept="audio/*"
                            onChange={e =>
                              e.target.files?.[0] &&
                              handlePatchMedia(
                                v._id,
                                s.sceneNumber,
                                "audio",
                                e.target.files[0]
                              )
                            }
                            className={styles.fileInput}
                          />
                        </label>
                      </div>
                      <div className={styles.mediaBox}>
                        <video
                          controls
                          src={s.videoUrl}
                          className={styles.videoPlayer}
                        />
                        <label className={styles.patchLabel}>
                          Change Video
                          <input
                            type="file"
                            accept="video/*"
                            onChange={e =>
                              e.target.files?.[0] &&
                              handlePatchMedia(
                                v._id,
                                s.sceneNumber,
                                "video",
                                e.target.files[0]
                              )
                            }
                            className={styles.fileInput}
                          />
                        </label>
                      </div>
                    </div>

                    {s.imageUrl && (
                      <>
                        <input
                          type="text"
                          placeholder="Enter generation prompt"
                          value={scenePrompts[`${v._id}-${s.sceneNumber}`] || ""}
                          onChange={e =>
                            setScenePrompts(prev => ({
                              ...prev,
                              [`${v._id}-${s.sceneNumber}`]: e.target.value
                            }))
                          }
                          className={styles.input}
                        />
                        <button
                          onClick={() => handleGenerateVideo(v._id, s.sceneNumber)}
                          disabled={generating[`${v._id}-${s.sceneNumber}`]}
                          className={styles.generateButton}
                        >
                          {generating[`${v._id}-${s.sceneNumber}`]
                            ? "Generating..."
                            : "Generate Video"}
                        </button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
