// src/pages/owl-videos.tsx
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

  // 전체 비디오 리스트
  const [videos, setVideos] = useState<OwlVideo[]>([]);

  // 생성용 state
  const [userId, setUserId] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [newScenes, setNewScenes] = useState<NewScene[]>([
    { image: null, audio: null, video: null, prompt: "" },
  ]);

  // 편집용 state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCountry, setEditCountry] = useState<string>("");
  const [editDescription, setEditDescription] = useState<string>("");
  const [editScenes, setEditScenes] = useState<NewScene[]>([]);

  // 씬별 AI 생성
  const [scenePrompts, setScenePrompts] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});

  // 초기 로드
  useEffect(() => {
    fetchVideos();
    const stored = localStorage.getItem("userId");
    if (stored) setUserId(stored);
  }, []);

  async function fetchVideos() {
    try {
      const res = await axios.get<OwlVideo[]>(
        `${SERVER_URL}/owl-videos?region=${region}`,
        { withCredentials: true }
      );
      setVideos(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to fetch videos");
    }
  }

  // ============ Create ============
  function addNewScene() {
    setNewScenes((prev) => [
      ...prev,
      { image: null, audio: null, video: null, prompt: "" },
    ]);
  }
  function removeNewScene(idx: number) {
    setNewScenes((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateNewSceneField(
    idx: number,
    field: keyof NewScene,
    value: File | string | null
  ) {
    setNewScenes((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }

  async function handleCreate() {
    if (!userId || !country) {
      alert("User ID, country required.");
      return;
    }
    const form = new FormData();
    form.append("userId", userId);
    form.append("country", country);
    form.append("description", description);
    form.append("region", region);

    newScenes.forEach((scene) => {
      if (scene.image) form.append("images", scene.image, scene.image.name);
      if (scene.audio) form.append("audios", scene.audio, scene.audio.name);
      if (scene.video) form.append("videos", scene.video, scene.video.name);
      form.append("prompts", scene.prompt);
    });

    try {
      await axios.post(`${SERVER_URL}/owl-videos`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setCountry("");
      setDescription("");
      setNewScenes([{ image: null, audio: null, video: null, prompt: "" }]);
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert("Failed to create video");
    }
  }

  // ============ Edit ============
  function enterEditMode(video: OwlVideo) {
    setEditingId(video._id);
    setEditCountry(video.country);
    setEditDescription(video.description);
    setEditScenes(
      video.scenes.map((s) => ({
        image: null,
        audio: null,
        video: null,
        prompt: scenePrompts[`${video._id}-${s.sceneNumber}`] || "",
      }))
    );
  }
  function exitEditMode() {
    setEditingId(null);
  }
  function addEditScene() {
    setEditScenes((prev) => [
      ...prev,
      { image: null, audio: null, video: null, prompt: "" },
    ]);
  }
  function removeEditScene(idx: number) {
    setEditScenes((prev) => prev.filter((_, i) => i !== idx));
  }
  function updateEditSceneField(
    idx: number,
    field: keyof NewScene,
    value: File | string | null
  ) {
    setEditScenes((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  }

  async function handleSave(video: OwlVideo) {
    if (!editCountry) {
      alert("Country required.");
      return;
    }
    const form = new FormData();
    form.append("country", editCountry);
    form.append("description", editDescription);
    form.append("region", region);

    editScenes.forEach((scene) => {
      if (scene.image) form.append("images", scene.image, scene.image.name);
      if (scene.audio) form.append("audios", scene.audio, scene.audio.name);
      if (scene.video) form.append("videos", scene.video, scene.video.name);
      form.append("prompts", scene.prompt);
    });

    try {
      await axios.put(`${SERVER_URL}/owl-videos/${video._id}`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      exitEditMode();
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert("Failed to save edits");
    }
  }

  // ============ Patch Media & Generate ============
  async function handlePatchMedia(
    videoId: string,
    sceneNumber: number,
    field: "image" | "audio" | "video",
    file: File
  ) {
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
      console.error(err);
      alert(`Failed to update ${field}`);
    }
  }
  async function handleGenerateVideo(videoId: string, sceneNumber: number) {
    const key = `${videoId}-${sceneNumber}`;
    setGenerating((prev) => ({ ...prev, [key]: true }));
    try {
      const prompt = scenePrompts[key] || "";
      await axios.post(
        `${SERVER_URL}/owl-videos/${videoId}/scenes/${sceneNumber}/generate-video`,
        { region, prompt },
        { withCredentials: true }
      );
      alert("Video generation started.");
    } catch (err) {
      console.error(err);
      alert("Failed to start video generation");
    } finally {
      setGenerating((prev) => ({ ...prev, [key]: false }));
    }
  }

  // ============ Delete ============
  async function handleDeleteVideo(videoId: string) {
    if (!confirm("진짜 삭제하시겠습니까?")) return;
    try {
      await axios.delete(
        `${SERVER_URL}/owl-videos/${videoId}?region=${region}`,
        { withCredentials: true }
      );
      fetchVideos();
    } catch (err) {
      console.error(err);
      alert("Failed to delete video");
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Owl Videos Management</h1>
      </header>
      <main className={styles.main}>

        {/* — Create New Owl Video — */}
        <section className={styles.createSection}>
          <h2 className={styles.sectionTitle}>Create New Owl Video</h2>

          <div className={styles.formRow}>
            <input
              className={styles.input}
              type="text"
              placeholder="User ID"
              value={userId}
              readOnly
            />
            <select
              className={styles.select}
              value={country}
              onChange={(e) => setCountry(e.target.value)}
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
              className={styles.textarea}
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className={styles.sceneGrid}>
            {newScenes.map((scene, idx) => (
              <div key={idx} className={styles.sceneCard}>
                <h3>Scene {idx + 1}</h3>
                <div className={styles.mediaRow}>
                  <div className={styles.mediaBox}>
                    <button className={styles.fileBtn}>
                      {scene.image?.name || "Select Image"}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateNewSceneField(idx, "image", e.target.files?.[0] || null)
                        }
                      />
                    </button>
                  </div>
                  <div className={styles.mediaBox}>
                    <button className={styles.fileBtnLight}>
                      {scene.audio?.name || "Select Audio"}
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) =>
                          updateNewSceneField(idx, "audio", e.target.files?.[0] || null)
                        }
                      />
                    </button>
                  </div>
                  <div className={styles.mediaBox}>
                    <button className={styles.fileBtn}>
                      {scene.video?.name || "Select Video"}
                      <input
                        type="file"
                        accept="video/*"
                        onChange={(e) =>
                          updateNewSceneField(idx, "video", e.target.files?.[0] || null)
                        }
                      />
                    </button>
                  </div>
                </div>
                <input
                  className={styles.promptInput}
                  type="text"
                  placeholder="Scene prompt"
                  value={scene.prompt}
                  onChange={(e) =>
                    updateNewSceneField(idx, "prompt", e.target.value)
                  }
                />
                {newScenes.length > 1 && (
                  <button
                    className={styles.removeScene}
                    onClick={() => removeNewScene(idx)}
                  >
                    Remove Scene
                  </button>
                )}
              </div>
            ))}
          </div>

          <button className={styles.addScene} onClick={addNewScene}>
            <span className={styles.plus}>＋</span> Add Scene
          </button>
          <button className={styles.buttonPrimary} onClick={handleCreate}>
            Create Owl Video
          </button>
        </section>

        {/* — Existing Owl Videos — */}
        <section className={styles.listSection}>
          <h2 className={styles.sectionTitle}>Existing Owl Videos</h2>
          {videos.length === 0 && <p>No videos found.</p>}
          <div className={styles.videoGrid}>
            {videos.map((v) => (
              <div key={v._id} className={styles.videoCard}>
                {/* Edit / Cancel / Save */}
                {editingId !== v._id ? (
                  <button
                    className={styles.buttonPrimary}
                    onClick={() => enterEditMode(v)}
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button className={styles.removeScene} onClick={exitEditMode}>
                      Cancel
                    </button>
                    <button className={styles.buttonPrimary} onClick={() => handleSave(v)}>
                      Save
                    </button>
                  </>
                )}

                {/* Country / Description */}
                {editingId === v._id ? (
                  <div className={styles.formRow}>
                    <input
                      className={styles.input}
                      value={editCountry}
                      onChange={(e) => setEditCountry(e.target.value)}
                    />
                    <textarea
                      className={styles.textarea}
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                ) : (
                  <div className={styles.cardHeader}>
                    <div>
                      <strong>Country:</strong> {v.country} &nbsp;|&nbsp;
                      <strong>Uploaded:</strong>{" "}
                      {new Date(v.uploadedAt).toLocaleString()}
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteVideo(v._id)}
                    >
                      Delete Video
                    </button>
                  </div>
                )}

                {/* Description (readonly) */}
                {editingId !== v._id && (
                  <p className={styles.description}>{v.description}</p>
                )}

                {/* Scenes */}
                <div className={styles.sceneGrid}>
                  {editingId === v._id ? (
                    <>
                      {/* ① 원본 장면 개수 표시 */}
                      <div className={styles.editInfo}>
                        <p>Original scenes: {v.scenes.length}</p>
                      </div>
                      {/* ② 편집 모드: scene map */}
                      {editScenes.map((s, idx) => {
                        const orig = v.scenes[idx];
                        const sceneNumber = orig ? orig.sceneNumber : idx + 1;
                        return (
                          <div key={idx} className={styles.sceneCard}>
                            <h3>Scene {sceneNumber}</h3>
                            {orig && (
                              <div className={styles.mediaRow}>
                                <div className={styles.mediaBox}>
                                <img
                                    src={orig.imageUrl}
                                    alt={`scene ${sceneNumber}`}
                                    className={styles.previewImage}
                                />
                                </div>
                                <div className={styles.mediaBox}>
                                <audio
                                    controls
                                    src={orig.audioUrl}
                                    className={styles.audioPlayer}
                                />
                                </div>
                                <div className={styles.mediaBox}>
                                <video
                                    controls
                                    src={orig.videoUrl}
                                    className={styles.videoPlayer}
                                />
                                </div>
                            </div>
                            )}

                            {/* 교체용 파일 선택 버튼 */}
                            <div className={styles.mediaRow}>
                              <button className={styles.fileBtn}>
                              {s.image?.name || (orig?.imageUrl ? "Existing Image" : "Change Image")}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) =>
                                    updateEditSceneField(
                                      idx,
                                      "image",
                                      e.target.files?.[0] || null
                                    )
                                  }
                                />
                              </button>
                              <button className={styles.fileBtnLight}>
                              {s.audio?.name || (orig?.audioUrl ? "Existing Audio" : "Change Audio")}
                                <input
                                  type="file"
                                  accept="audio/*"
                                  onChange={(e) =>
                                    updateEditSceneField(
                                      idx,
                                      "audio",
                                      e.target.files?.[0] || null
                                    )
                                  }
                                />
                              </button>
                              <button className={styles.fileBtn}>
                              {s.video?.name || (orig?.videoUrl ? "Existing Video" : "Change Video")}
                                <input
                                  type="file"
                                  accept="video/*"
                                  onChange={(e) =>
                                    updateEditSceneField(
                                      idx,
                                      "video",
                                      e.target.files?.[0] || null
                                    )
                                  }
                                />
                              </button>
                            </div>

                            {/* 프롬프트 */}
                            <input
                              className={styles.promptInput}
                              value={s.prompt}
                              onChange={(e) =>
                                updateEditSceneField(idx, "prompt", e.target.value)
                              }
                            />

                            {/* 장면 제거 버튼 */}
                            {editScenes.length > 1 && (
                              <button
                                className={styles.removeScene}
                                onClick={() => removeEditScene(idx)}
                              >
                                Remove Scene
                              </button>
                            )}
                          </div>
                        );
                    })}
                  </>
                ) : (
                  v.scenes.map((s) => (
                        <div key={s.sceneNumber} className={styles.sceneCard}>
                          <h3>Scene {s.sceneNumber}</h3>
                          <img
                            className={styles.previewImage}
                            src={s.imageUrl}
                            alt={`scene ${s.sceneNumber}`}
                          />
                          <div className={styles.mediaRow}>
                            <div className={styles.mediaBox}>
                              <audio
                                className={styles.audioPlayer}
                                controls
                                src={s.audioUrl}
                              />
                            </div>
                            <div className={styles.mediaBox}>
                              <video
                                className={styles.videoPlayer}
                                controls
                                src={s.videoUrl}
                              />
                            </div>
                          </div>
                          <label className={styles.patchLabel}>
                            Change Image
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) =>
                                e.target.files?.[0] &&
                                handlePatchMedia(
                                  v._id,
                                  s.sceneNumber,
                                  "image",
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>
                          <label className={styles.patchLabel}>
                            Change Audio
                            <input
                              type="file"
                              accept="audio/*"
                              onChange={(e) =>
                                e.target.files?.[0] &&
                                handlePatchMedia(
                                  v._id,
                                  s.sceneNumber,
                                  "audio",
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>
                          <label className={styles.patchLabel}>
                            Change Video
                            <input
                              type="file"
                              accept="video/*"
                              onChange={(e) =>
                                e.target.files?.[0] &&
                                handlePatchMedia(
                                  v._id,
                                  s.sceneNumber,
                                  "video",
                                  e.target.files[0]
                                )
                              }
                            />
                          </label>
                        </div>
                      )))}
                </div>

                {/* edit 모드에서 씬 추가 */}
                {editingId === v._id && (
                  <button className={styles.addScene} onClick={addEditScene}>
                    <span className={styles.plus}>＋</span> Add Scene
                  </button>
                )}

                {/* AI Generate */}
                {v.scenes.map((s) => (
                  <div key={s.sceneNumber} className={styles.sceneCard}>
                    <input
                      className={styles.input}
                      type="text"
                      placeholder="Enter generation prompt"
                      value={scenePrompts[`${v._id}-${s.sceneNumber}`] || ""}
                      onChange={(e) =>
                        setScenePrompts((prev) => ({
                          ...prev,
                          [`${v._id}-${s.sceneNumber}`]: e.target.value,
                        }))
                      }
                    />
                    <button
                      className={styles.generateButton}
                      disabled={generating[`${v._id}-${s.sceneNumber}`]}
                      onClick={() => handleGenerateVideo(v._id, s.sceneNumber)}
                    >
                      {generating[`${v._id}-${s.sceneNumber}`]
                        ? "Generating..."
                        : "Generate Video"}
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
