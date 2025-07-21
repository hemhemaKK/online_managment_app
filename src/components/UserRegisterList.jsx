import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { getAllEvents } from "../services/firestore";

const UserRegisteredEvents = () => {
  const [events, setEvents] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const allEvents = await getAllEvents();
      const registeredEvents = allEvents.filter((event) =>
        event.registeredUsers?.some((u) => u.uid === user.uid)
      );

      setEvents(registeredEvents);
    };

    fetchRegisteredEvents();
  }, []);

  const handleFeedbackSubmit = async (eventId) => {
    const feedbackText = feedbacks[eventId];
    const user = auth.currentUser;
    if (!feedbackText || !user) return;

    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, {
        feedbacks: arrayUnion({
          uid: user.uid,
          email: user.email, // ✅ store email
          feedback: feedbackText,
          timestamp: new Date().toISOString(),
        }),
      });

      alert("Feedback submitted!");
      setFeedbacks((prev) => ({ ...prev, [eventId]: "" }));
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const styles = {
    container: {
      padding: "20px",
      margin: "50px 0 0 250px",
    },
    title: {
      fontSize: "24px",
      marginBottom: "20px",
      fontWeight: "bold",
    },
    eventList: {
      display: "flex",
      flexWrap: "wrap",
      gap: "20px",
    },
    card: {
      width: "250px",
      padding: "16px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      backgroundColor: "#fff",
      boxShadow: "2px 4px 8px rgba(0,0,0,0.1)",
    },
    image: {
      width: "100%",
      height: "180px",
      objectFit: "cover",
      borderRadius: "6px",
      marginBottom: "10px",
      marginTop: "10px",
    },
    strong: { fontWeight: "bold" },
    input: {
      width: "100%",
      padding: "6px",
      marginTop: "10px",
      border: "1px solid #ccc",
      borderRadius: "4px",
    },
    button: {
      marginTop: "5px",
      padding: "6px 10px",
      backgroundColor: "#4CAF50",
      color: "white",
      border: "none",
      borderRadius: "4px",
      cursor: "pointer",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🎉 Your Registered Events</h2>
      <div style={styles.eventList}>
        {events.length === 0 ? (
          <p>You haven't registered for any events yet.</p>
        ) : (
          events.map((event) => {
            const eventDateTime = new Date(`${event.date}T${event.time}`);
            const now = new Date();
            const expiry = new Date(eventDateTime.getTime() + 45 * 60000);
            const isExpired = now > expiry;

            return (
              <div key={event.id} style={styles.card}>
                <h3><b>Title: </b>{event.title}</h3>
                <p><span style={styles.strong}>Date: </span> {event.date}</p>
                <p><span style={styles.strong}>Time: </span> {event.time}</p>
                <p><span style={styles.strong}>Speaker: </span> {event.speakerName}</p>
                {event.posterUrl && (
                  <img src={event.posterUrl} alt="poster" style={styles.image} />
                )}
                <p>
                  <span style={styles.strong}>Join Meeting: </span>
                  {now >= eventDateTime && now <= expiry ? (
                    <a
                      href={event.videoLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: "#2563eb", textDecoration: "underline" }}
                    >
                      {event.videoLink}
                    </a>
                  ) : now < eventDateTime ? (
                    <span style={{ color: "green" }}>
                      Available at <b>{event.time}</b>
                    </span>
                  ) : (
                    <span style={{ color: "red" }}>Expired</span>
                  )}
                </p>

                {isExpired && (
                  <div>
                    <textarea
                      placeholder="Leave feedback..."
                      value={feedbacks[event.id] || ""}
                      onChange={(e) =>
                        setFeedbacks((prev) => ({ ...prev, [event.id]: e.target.value }))
                      }
                      style={styles.input}
                    />
                    <button
                      style={styles.button}
                      onClick={() => handleFeedbackSubmit(event.id)}
                    >
                      Submit Feedback
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default UserRegisteredEvents;
