import React, { useState, useEffect } from "react";
import {
  getAllEvents,
  addEnquiryToEvent,
  deleteUserEnquiry,
} from "../services/firestore";
import { auth } from "../services/firebase";

const EventEnquiryForm = () => {
  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({ eventId: "", subject: "", message: "" });
  const [userEnquiries, setUserEnquiries] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    const fetchEventsAndEnquiries = async () => {
      const data = await getAllEvents();
      setEvents(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, eventId: data[0].id }));
      }
      fetchAllUserEnquiries(data);
    };
    fetchEventsAndEnquiries();
  }, []);

  const fetchAllUserEnquiries = (eventsData) => {
    const userEmail = user?.email?.toLowerCase();
    const enquiries = [];

    eventsData.forEach((event) => {
      if (Array.isArray(event.enquiries)) {
        event.enquiries.forEach((enq) => {
          if (enq.email?.toLowerCase() === userEmail) {
            enquiries.push({
              ...enq,
              eventId: event.id,
              eventTitle: event.title,
            });
          }
        });
      }
    });

    enquiries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    setUserEnquiries(enquiries);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in to submit an enquiry.");
      return;
    }

    const enquiry = {
      email: user.email || "Unknown Email",
      subject: formData.subject,
      message: formData.message,
      timestamp: new Date().toISOString(),
    };

    await addEnquiryToEvent(formData.eventId, enquiry);
    alert("Enquiry submitted!");

    const updatedEvents = await getAllEvents();
    setEvents(updatedEvents);
    fetchAllUserEnquiries(updatedEvents);

    setFormData({ eventId: formData.eventId, subject: "", message: "" });
  };

  const handleDelete = async (eventId, timestamp) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      await deleteUserEnquiry(eventId, timestamp);
      const updatedEvents = await getAllEvents();
      setEvents(updatedEvents);
      fetchAllUserEnquiries(updatedEvents);
    }
  };

  const styles = {
    container: {
      margin: "90px 0 0 250px",
      display: "flex",
      gap: "40px",
      alignItems: "flex-start",
    },
    formBox: {
      flex: 1,
      padding: "30px",
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
      border: "1px solid #ddd",
      fontFamily: "Arial, sans-serif",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "16px",
    },
    input: {
      padding: "10px 12px",
      fontSize: "16px",
      borderRadius: "6px",
      border: "1px solid #ccc",
    },
    textarea: {
      padding: "10px 12px",
      fontSize: "16px",
      borderRadius: "6px",
      border: "1px solid #ccc",
      minHeight: "120px",
    },
    button: {
      backgroundColor: "#007bff",
      color: "#fff",
      padding: "12px",
      fontSize: "16px",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
    },
    messageBox: {
      flex: 1,
      background: "#f9f9f9",
      padding: "20px",
      borderRadius: "10px",
      border: "1px solid #ccc",
      maxHeight: "600px",
      overflowY: "auto",
    },
    message: {
      background: "#fff",
      borderRadius: "6px",
      padding: "10px",
      marginBottom: "12px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    },
    deleteBtn: {
      background: "#dc3545",
      color: "#fff",
      padding: "6px 10px",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
      fontSize: "14px",
      marginTop: "6px",
    },
    reply: {
      marginTop: "8px",
      padding: "10px",
      backgroundColor: "#ffffffff",
      borderLeft: "4px solid #007bff",
      borderRadius: "6px",
      fontStyle: "italic",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.formBox}>
        <h2>📩 Enquire About an Event</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <select
            name="eventId"
            value={formData.eventId}
            onChange={handleChange}
            style={styles.input}
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="subject"
            placeholder="Subject"
            value={formData.subject}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <textarea
            name="message"
            placeholder="Your enquiry message..."
            value={formData.message}
            onChange={handleChange}
            style={styles.textarea}
            required
          />

          <button type="submit" style={styles.button}>
            Submit Enquiry
          </button>
        </form>
      </div>

      <div style={styles.messageBox}>
        <h3>📬 Your Enquiries</h3>
        {userEnquiries.length === 0 ? (
          <p>No enquiries yet.</p>
        ) : (
          userEnquiries.map((enq, idx) => (
            <div key={idx} style={styles.message}>
              <p><strong>Event:</strong> {enq.eventTitle}</p>
              <p><strong>Subject:</strong> {enq.subject}</p>
              <p><strong>Message:</strong> {enq.message}</p>
              <p style={{ fontSize: "12px", color: "gray" }}>
                {new Date(enq.timestamp).toLocaleString()}
              </p>

              {enq.reply && (
                <div style={styles.reply}>
                  <strong>Reply:</strong> {enq.reply}
                </div>
              )}

              <button
                style={styles.deleteBtn}
                onClick={() => handleDelete(enq.eventId, enq.timestamp)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EventEnquiryForm;
