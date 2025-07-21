import React, { useState } from "react";
import { useSelector } from "react-redux";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";

const CLOUD_NAME = "dbftgtgs9";
const CLOUDINARY_UPLOAD_PRESET = "Demo_product_upload_image";
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

const AddEventForm = () => {
  const user = useSelector((state) => state.auth.user);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    videoLink: "",
    speakerName: "",
    speakerImageUrl: "",
    meetingType: "normal",
    date: "",
    time: "",
    price: "",
    posterFile: null,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "posterFile") {
      setFormData((prev) => ({ ...prev, posterFile: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const uploadToCloudinary = async (file) => {
    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: uploadData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.uid) return alert("Please login first");
    if (!formData.posterFile) return alert("Please upload an event poster");

    setLoading(true);
    try {
      const posterUrl = await uploadToCloudinary(formData.posterFile);

      const newEvent = {
        title: formData.title,
        description: formData.description,
        videoLink: formData.videoLink,
        speakerName: formData.speakerName,
        meetingType: formData.meetingType,
        price: formData.meetingType === "premium" ? parseFloat(formData.price || 0) : 0,
        date: formData.date,
        time: formData.time,
        posterUrl,
        createdBy: user.uid,
        username: user.username || user.displayName || "",
        email: user.email || "",
        profilePhotoURL: user.profilePhotoURL || user.photoURL || "",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "events"), newEvent);

      alert("✅ Event created successfully");
      setFormData({
        title: "",
        description: "",
        videoLink: "",
        speakerName: "",
        meetingType: "normal",
        date: "",
        time: "",
        price: "",
        posterFile: null,
      });
    } catch (error) {
      console.error("❌ Error uploading or saving event:", error);
      alert("❌ Failed to upload or save event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h1 style={{ fontSize: "26px" }}><b>Create Event</b></h1>

      <input type="text" name="title" placeholder="Event Title" value={formData.title} onChange={handleChange} style={styles.input} required />
      <input type="date" name="date" value={formData.date} onChange={handleChange} style={styles.input} min={new Date().toISOString().split("T")[0]} required />
      <input type="time" name="time" value={formData.time} onChange={handleChange} style={styles.input} required />
      <input type="text" name="videoLink" placeholder="Video / Meeting Link" value={formData.videoLink} onChange={handleChange} style={styles.input} />
      <input type="text" name="speakerName" placeholder="Speaker Name" value={formData.speakerName} onChange={handleChange} style={styles.input} />
      <textarea name="description" placeholder="Event Description" value={formData.description} onChange={handleChange} style={styles.textarea} required />

      <label style={styles.label}>Meeting Type:</label>
      <select name="meetingType" value={formData.meetingType} onChange={handleChange} style={styles.input}>
        <option value="normal">Normal</option>
        <option value="premium">Premium</option>
      </select>

      {/* Show price field if premium is selected */}
      {formData.meetingType === "premium" && (
        <input
          type="number"
          name="price"
          placeholder="Price in ₹"
          value={formData.price}
          onChange={handleChange}
          style={styles.input}
          required
        />
      )}

      <label style={styles.label}>Upload Poster Image:</label>
      <input type="file" name="posterFile" accept="image/*" onChange={handleChange} style={styles.input} required />

      <button type="submit" disabled={loading} style={styles.button}>
        {loading ? "Uploading..." : "Create Event"}
      </button>
    </form>
  );
};

const styles = {
  form: {
    maxWidth: "1000px",
    margin: "100px 0 0 250px",
    padding: "20px",
    backgroundColor: "#d6d6d6ff",
    borderRadius: "10px",
    boxShadow: "0 0 8px rgba(0,0,0,0.6)",
    position: "fixed",
  },
  input: {
    width: "45%",
    padding: "10px",
    margin: "10px 10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    backgroundColor: "#ffffffff",
    boxShadow: "0 0 8px rgba(0,0,0,0.3)",
  },
  textarea: {
    width: "94%",
    padding: "10px",
    margin: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    backgroundColor: "#ffffffff",
    boxShadow: "0 0 8px rgba(0,0,0,0.3)",
  },
  label: {
    fontWeight: "bold",
    marginTop: "10px",
    display: "block",
    marginLeft: "10px",
  },
  button: {
    width: "30%",
    padding: "12px",
    marginLeft: "10px",
    backgroundColor: "#002042ff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default AddEventForm;
