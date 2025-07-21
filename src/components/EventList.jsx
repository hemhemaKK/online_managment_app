import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where
} from "firebase/firestore";
import { db, auth } from "../services/firebase";

const EventList = () => {
  const [premiumEvents, setPremiumEvents] = useState([]);
  const [normalEvents, setNormalEvents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const user = auth.currentUser;
      if (user) {
        setCurrentUserId(user.uid);
        await fetchEvents(user.uid);
      }
    };
    fetchUser();
  }, []);

  const fetchEvents = async (uid) => {
    const q = query(collection(db, "events"), where("createdBy", "==", uid));
    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const premium = list.filter(e => e.meetingType === "premium");
    const normal = list.filter(e => e.meetingType !== "premium");

    // Sort by time (latest first)
    premium.sort((a, b) => parseTime(b.time) - parseTime(a.time));
    normal.sort((a, b) => parseTime(b.time) - parseTime(a.time));

    setPremiumEvents(premium);
    setNormalEvents(normal);
  };

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      await deleteDoc(doc(db, "events", id));
      setPremiumEvents(prev => prev.filter(event => event.id !== id));
      setNormalEvents(prev => prev.filter(event => event.id !== id));
    }
  };

  const handleEdit = (event) => {
    setEditingId(event.id);
    setEditData({ ...event });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditData({});
  };

  const handleSave = async () => {
    const eventRef = doc(db, "events", editingId);
    await updateDoc(eventRef, editData);
    setEditingId(null);
    fetchEvents(currentUserId);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Demo_product_upload_image");

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dbftgtgs9/image/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setEditData(prev => ({ ...prev, posterUrl: data.secure_url }));
    } catch (err) {
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const renderCard = (event) => (
    <li key={event.id} style={styles.card}>
      <img src={event.posterUrl} alt="Poster" style={styles.poster} />
      {editingId === event.id ? (
        <div style={styles.form}>
          <input style={styles.input} name="title" value={editData.title} onChange={handleChange} />
          <input style={styles.input} type="file" accept="image/*" onChange={handleImageUpload} />
          {uploading && <p>Uploading...</p>}
          <img src={editData.posterUrl} alt="Preview" style={styles.preview} />
          <input style={styles.input} name="date" value={editData.date} onChange={handleChange} />
          <input style={styles.input} name="time" value={editData.time} onChange={handleChange} />
          <input style={styles.input} name="videoLink" value={editData.videoLink} onChange={handleChange} />
          <textarea style={styles.input} name="description" value={editData.description} onChange={handleChange} />
          <input style={styles.input} name="speakerName" value={editData.speakerName} onChange={handleChange} />
          <div>
            <button onClick={handleSave} style={styles.save}>💾 Save</button>
            <button onClick={handleCancel} style={styles.cancel}>❌ Cancel</button>
          </div>
        </div>
      ) : (
        <div>
          <h3><strong>{event.title}</strong></h3>
          <p><strong>Speaker:</strong> {event.speakerName}</p>
          <p><strong>Date:</strong> {event.date}</p>
          <p><strong>Time:</strong> {event.time}</p>
          <p><strong>Link:</strong> {event.videoLink}</p>
          <p><strong>Description:</strong> {event.description}</p>
          <button onClick={() => handleEdit(event)} style={styles.edit}>✏️ Edit</button>
          <button onClick={() => handleDelete(event.id)} style={styles.delete}>🗑 Delete</button>
        </div>
      )}
    </li>
  );

  return (
    <div style={styles.container}>
      <h2 style={{fontSize:"28px"}}><b>Your Events (Premium & Normal)</b></h2>
      <div style={styles.grid}>
        <div>
          <h3 style={styles.columnTitle}>🌟 Premium Events</h3>
          {premiumEvents.length === 0 ? <p>No premium events</p> : <ul style={styles.list}>{premiumEvents.map(renderCard)}</ul>}
        </div>
        <div>
          <h3 style={styles.columnTitle}>📝 Normal Events</h3>
          {normalEvents.length === 0 ? <p>No normal events</p> : <ul style={styles.list}>{normalEvents.map(renderCard)}</ul>}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    margin: "70px 0px 0px 350px",
    padding: "20px",
    maxWidth: "1500px",
    position:"relative"
  },
  grid: {
    display: "flex",
    gap: "100px",
  },
  columnTitle: {
    background: "#f0f0f0",
    padding: "10px 15px",
    borderRadius: "10px",
    fontWeight:"bold",
    fontSize:"28px"
  },
  list: {
    listStyle: "none",
    padding: 0,
  },
  card: {
    display: "flex",
    gap: "20px",
    padding: "15px",
    marginBottom: "15px",
    border: "1px solid #ccc",
    borderRadius: "10px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
  },
  poster: {
    width: "150px",
    height: "190px",
    objectFit: "cover",
    borderRadius: "10px",
  },
  preview: {
    width: "100px",
    height: "100px",
    objectFit: "cover",
    borderRadius: "10px",
    marginTop: "10px",
  },
  edit: {
    backgroundColor: "#210054",
    color: "#fff",
    padding: "6px 12px",
    border: "none",
    borderRadius: "5px",
    marginTop: "10px",
    cursor: "pointer",
  },
  delete: {
    backgroundColor: "#dc3545",
    color: "#fff",
    padding: "6px 12px",
    border: "none",
    borderRadius: "5px",
    marginLeft: "10px",
    cursor: "pointer",
  },
  save: {
    backgroundColor: "#2bff00",
    padding: "6px 12px",
    border: "none",
    borderRadius: "5px",
    marginTop: "10px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  cancel: {
    backgroundColor: "#666",
    color: "#fff",
    padding: "6px 12px",
    border: "none",
    borderRadius: "5px",
    marginLeft: "10px",
    cursor: "pointer",
  },
  form: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "10px"
  },
  input: {
    padding: "5px",
    borderRadius: "10px",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
  },
};

export default EventList;
