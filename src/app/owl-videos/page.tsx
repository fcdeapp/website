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

export default function OwlVideosPage() {
  const { SERVER_URL } = useConfig();
  const region = "ap-northeast-2";

  const [videos, setVideos] = useState<OwlVideo[]>([]);
  const [userId, setUserId] = useState<string>("");
  const [country, setCountry] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [scenePrompts, setScenePrompts] = useState<Record<string,string>>({});

  const [newImages, setNewImages] = useState<FileList | null>(null);
  const [newAudios, setNewAudios] = useState<FileList | null>(null);
  const [newVideos, setNewVideos] = useState<FileList | null>(null);

   const handleGenerateVideo = async (videoId: string, sceneNumber: number) => {
     const key = `${videoId}-${sceneNumber}`;
     setGenerating(prev => ({ ...prev, [key]: true }));
     try {
       const key = `${videoId}-${sceneNumber}`;
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

  useEffect(() => {
    fetchVideos();
  }, []);

  // load userId from localStorage
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

  const handleCreate = async () => {
    if (!userId || !country || !newImages || !newAudios || !newVideos) {
      alert("userId, country, and at least one file of each type are required.");
      return;
    }
    const form = new FormData();
    form.append("userId", userId);
    form.append("country", country);
    form.append("description", description);
    form.append("region", region);
    Array.from(newImages).forEach((file) => form.append("images", file));
    Array.from(newAudios).forEach((file) => form.append("audios", file));
    Array.from(newVideos).forEach((file) => form.append("videos", file));

    try {
      await axios.post(`${SERVER_URL}/owl-videos`, form, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setUserId("");
      setCountry("");
      setDescription("");
      setNewImages(null);
      setNewAudios(null);
      setNewVideos(null);
      fetchVideos();
    } catch (err) {
      console.error("Error creating owl video", err);
      alert("Failed to create.");
    }
  };

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
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      fetchVideos();
    } catch (err) {
      console.error(`Error updating ${field}`, err);
      alert(`Failed to update ${field}.`);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!confirm("Delete this video entirely?")) return;
    try {
      await axios.delete(`${SERVER_URL}/owl-videos/${videoId}?region=${region}`, {
        withCredentials: true,
      });
      fetchVideos();
    } catch (err) {
      console.error("Error deleting owl video", err);
      alert("Failed to delete.");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Owl Videos Management</h1>
      </header>

      <main className={styles.main}>
        {/* Create New Video */}
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
              onChange={(e) => setCountry(e.target.value)}
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
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
            />
          </div>
          <div className={styles.formRow}>
            <label className={styles.fileLabel}>
              Images
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewImages(e.target.files)
                }
                className={styles.fileInput}
              />
            </label>
            <label className={styles.fileLabel}>
              Audios
              <input
                type="file"
                multiple
                accept="audio/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewAudios(e.target.files)
                }
                className={styles.fileInput}
              />
            </label>
            <label className={styles.fileLabel}>
              Videos
              <input
                type="file"
                multiple
                accept="video/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNewVideos(e.target.files)
                }
                className={styles.fileInput}
              />
            </label>
          </div>
          <button onClick={handleCreate} className={styles.button}>
            Create Owl Video
          </button>
        </section>

        {/* List and Edit Videos */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Existing Owl Videos</h2>
          {videos.length === 0 && <p>No videos found.</p>}
          {videos.map((v) => (
            <div key={v._id} className={styles.videoCard}>
              <div className={styles.cardHeader}>
                <div>
                  <strong>Country:</strong> {v.country} &nbsp;|
                  &nbsp;<strong>Uploaded:</strong>{" "}
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
                {v.scenes.map((s) => (
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
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handlePatchMedia(
                                  v._id,
                                  s.sceneNumber,
                                  "image",
                                  e.target.files[0]
                                );
                              }
                            }}
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
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handlePatchMedia(
                                  v._id,
                                  s.sceneNumber,
                                  "audio",
                                  e.target.files[0]
                                );
                              }
                            }}
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
                            onChange={(e) => {
                              if (e.target.files?.[0]) {
                                handlePatchMedia(
                                  v._id,
                                  s.sceneNumber,
                                  "video",
                                  e.target.files[0]
                                );
                              }
                            }}
                            className={styles.fileInput}
                          />
                        </label>
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter generation prompt"
                      value={scenePrompts[`${v._id}-${s.sceneNumber}`] || ""}
                      onChange={(e) =>
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
                      {generating[`${v._id}-${s.sceneNumber}`] ? "Generating..." : "Generate Video"}
                    </button>
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
