"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { useConfig } from "../../context/ConfigContext";
import styles from "../../styles/pages/Events.module.css";

interface Event {
  _id?: string;
  eventName: string;
  description?: string;
  category?: string;
  officialLink?: string;
  source: { name: string; url?: string };
  openingHours: { startTime?: string; endTime?: string };
  eventPeriod: { startDate: string; endDate: string };
  venue: {
    name?: string;
    address?: string;
    city?: string;
    provinceOrState?: string;
    country: "Canada" | "Australia" | "United Kingdom" | "South Korea";
  };
  location: { coordinates: [number, number] };
  tags: string[];
  images: string[];
  organizer: { name?: string; website?: string };
  verified: boolean;
}

const REGIONS = [
  { code: "ca-central-1", label: "Canada" },
  { code: "ap-southeast-2", label: "Australia" },
  { code: "eu-west-2", label: "United Kingdom" },
  { code: "ap-northeast-2", label: "South Korea" },
];

export default function EventsPage() {
  const { SERVER_URL } = useConfig();
  const [jsonModalOpen, setJsonModalOpen] = useState(false);
  const [jsonContent, setJsonContent] = useState<string>("");
  const [region, setRegion] = useState<string>(REGIONS[0].code);
  const [events, setEvents] = useState<Event[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<Event>({
    eventName: "",
    description: "",
    category: "",
    officialLink: "",
    source: { name: "", url: "" },
    openingHours: { startTime: "", endTime: "" },
    eventPeriod: { startDate: "", endDate: "" },
    venue: { name: "", address: "", city: "", provinceOrState: "", country: "Canada" },
    location: { coordinates: [0, 0] },
    tags: [],
    images: [],
    organizer: { name: "", website: "" },
    verified: false,
  });

  useEffect(() => {
    fetchEvents();
  }, [region]);

  async function fetchEvents() {
    try {
      const res = await axios.get<Event[]>(`${SERVER_URL}/api/events/events/${region}`);
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  function handleRegionChange(e: ChangeEvent<HTMLSelectElement>) {
    setRegion(e.target.value);
  }

  function openNew() {
    setEditing(null);
    setForm({
      eventName: "",
      description: "",
      category: "",
      officialLink: "",
      source: { name: "", url: "" },
      openingHours: { startTime: "", endTime: "" },
      eventPeriod: { startDate: "", endDate: "" },
      venue: { name: "", address: "", city: "", provinceOrState: "", country: "Canada" },
      location: { coordinates: [0, 0] },
      tags: [],
      images: [],
      organizer: { name: "", website: "" },
      verified: false,
    });
    setModalOpen(true);
  }

  function openEdit(ev: Event) {
    setEditing(ev);
    setForm({ ...ev, location: { coordinates: ev.location.coordinates } } as Event);
    setModalOpen(true);
  }

  async function handleDelete(id?: string) {
    if (!id) return;
    await axios.delete(`${SERVER_URL}/api/events/events/${region}/${id}`);
    fetchEvents();
  }

  function openJson(ev: Event) {
    setJsonContent(JSON.stringify(ev, null, 2));
    setJsonModalOpen(true);
  }

  function handleChange<K extends keyof Event>(field: K, value: Event[K]) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleNestedChange<T>(parent: keyof Event, child: keyof T, value: any) {
    setForm(f => ({
      ...f,
      [parent]: { ...((f as any)[parent] || {}), [child]: value },
    }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      if (editing?._id) {
        await axios.put(`${SERVER_URL}/api/events/events/${region}/${editing._id}`, form);
      } else {
        await axios.post(`${SERVER_URL}/api/events/events/${region}`, form);
      }
      setModalOpen(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Region:{" "}
          <select value={region} onChange={handleRegionChange}>
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>
        </h1>
        <button onClick={openNew} className={styles.addButton}>+ New Event</button>
      </header>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th><th>Period</th><th>Venue</th><th>Verified</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map(ev => (
            <tr key={ev._id}>
              <td>{ev.eventName}</td>
              <td>{new Date(ev.eventPeriod.startDate).toLocaleDateString()} — {new Date(ev.eventPeriod.endDate).toLocaleDateString()}</td>
              <td>{ev.venue.name}</td>
              <td>{ev.verified ? "✔️" : "❌"}</td>
              <td>
                <button onClick={() => openEdit(ev)} className={styles.editBtn}>Edit</button>
                <button onClick={() => handleDelete(ev._id)} className={styles.delBtn}>Delete</button>
                <button onClick={() => openJson(ev)} className={styles.jsonBtn}>JSON</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {modalOpen && (
        <div className={styles.modalBackdrop}>
          <form className={styles.modal} onSubmit={handleSubmit}>
            <h2>{editing ? "Edit Event" : "New Event"}</h2>
            <label>
              Name:
              <input
                value={form.eventName}
                onChange={e => handleChange("eventName", e.target.value)}
                required
              />
            </label>
            <label>
              Description:
              <textarea
                value={form.description}
                onChange={e => handleChange("description", e.target.value)}
              />
            </label>
            <label>
              Category:
              <input
                value={form.category}
                onChange={e => handleChange("category", e.target.value)}
              />
            </label>
            <label>
              Official Link:
              <input
                value={form.officialLink}
                onChange={e => handleChange("officialLink", e.target.value)}
              />
            </label>
            <label>
              Source Name:
              <input
                value={form.source.name}
                onChange={e => handleNestedChange("source", "name", e.target.value)}
                required
              />
            </label>
            <label>
              Source URL:
              <input
                value={form.source.url}
                onChange={e => handleNestedChange("source", "url", e.target.value)}
              />
            </label>
            <label>
              Start Date:
              <input
                type="date"
                value={form.eventPeriod.startDate.slice(0,10)}
                onChange={e => handleNestedChange("eventPeriod", "startDate", e.target.value)}
                required
              />
            </label>
            <label>
              End Date:
              <input
                type="date"
                value={form.eventPeriod.endDate.slice(0,10)}
                onChange={e => handleNestedChange("eventPeriod", "endDate", e.target.value)}
                required
              />
            </label>
            <label>
              Venue Name:
              <input
                value={form.venue.name}
                onChange={e => handleNestedChange("venue", "name", e.target.value)}
              />
            </label>
            <label>
              Venue Address:
              <input
                value={form.venue.address}
                onChange={e => handleNestedChange("venue", "address", e.target.value)}
              />
            </label>
            <label>
              City:
              <input
                value={form.venue.city}
                onChange={e => handleNestedChange("venue", "city", e.target.value)}
              />
            </label>
            <label>
              Province/State:
              <input
                value={form.venue.provinceOrState}
                onChange={e => handleNestedChange("venue", "provinceOrState", e.target.value)}
              />
            </label>
            <label>
              Country:
              <select
                value={form.venue.country}
                onChange={e => handleNestedChange("venue", "country", e.target.value as any)}
              >
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="South Korea">South Korea</option>
              </select>
            </label>
            <label>
              Coordinates (lng,lat):
              <input
                value={form.location.coordinates.join(",")}
                onChange={e => {
                  const [lng, lat] = e.target.value.split(",").map(v => parseFloat(v));
                  handleNestedChange("location", "coordinates", [lng, lat]);
                }}
              />
            </label>
            <label>
              Tags (comma separated):
              <input
                value={form.tags.join(",")}
                onChange={e => handleChange("tags", e.target.value.split(",").map(t => t.trim()))}
              />
            </label>
            <label>
              Images (comma separated URLs):
              <input
                value={form.images.join(",")}
                onChange={e => handleChange("images", e.target.value.split(",").map(u => u.trim()))}
              />
            </label>
            <label>
              Organizer Name:
              <input
                value={form.organizer.name}
                onChange={e => handleNestedChange("organizer", "name", e.target.value)}
              />
            </label>
            <label>
              Organizer Website:
              <input
                value={form.organizer.website}
                onChange={e => handleNestedChange("organizer", "website", e.target.value)}
              />
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={form.verified}
                onChange={e => handleChange("verified", e.target.checked)}
              />
              Verified
            </label>
            <div className={styles.modalButtons}>
              <button type="submit" className={styles.saveBtn}>Save</button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

     {jsonModalOpen && (
       <div className={styles.modalBackdrop}>
         <div className={styles.modal}>
           <h2>Event JSON</h2>
           <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-all", maxHeight: "60vh", overflowY: "auto" }}>
             {jsonContent}
           </pre>
           <div className={styles.modalButtons}>
             <button onClick={() => setJsonModalOpen(false)} className={styles.cancelBtn}>
               Close
             </button>
           </div>
         </div>
       </div>
     )}

    </div>
  );
}
