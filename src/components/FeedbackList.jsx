import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { onAuthStateChanged } from "firebase/auth";

const ViewFeedbacks = () => {
  const [events, setEvents] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!user) return;
      const querySnapshot = await getDocs(collection(db, "events"));
      const filteredEvents = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdBy === user.uid && data.feedbacks && data.feedbacks.length > 0) {
          filteredEvents.push({
            id: doc.id,
            title: data.title || "Untitled Event",
            date: data.date || "",
            time: data.time || "",
            feedbacks: data.feedbacks,
          });
        }
      });

      setEvents(filteredEvents);
    };

    fetchEvents();
  }, [user]);

  const styles = {
    container: {
      marginLeft: "250px",
      marginTop: "60px",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    eventBlock: {
      marginBottom: "40px",
      border: "1px solid #ccc",
      borderRadius: "8px",
      padding: "20px",
      backgroundColor: "#ffffffff",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
    eventTitle: {
      fontSize: "18px",
      fontWeight: "bold",
      marginBottom: "10px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
      marginTop: "10px",
    },
    th: {
      backgroundColor: "#eaeaea",
      padding: "10px",
      borderBottom: "2px solid #ccc",
      textAlign: "left",
    },
    td: {
      padding: "10px",
      borderBottom: "1px solid #ddd",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={{fontSize:"24px", marginBottom:"10px", marginTop:"20px"}}><b>📝 Feedbacks for Your Events</b></h2>
      {events.length === 0 ? (
        <p>No feedbacks found for your events.</p>
      ) : (
        events.map((event) => (
          <div key={event.id} style={styles.eventBlock}>
            <div style={styles.eventTitle}>
              📌 {event.title} ({event.date} at {event.time})
            </div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Feedback</th>
                  <th style={styles.th}>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {event.feedbacks.map((fb, idx) => (
                  <tr key={idx}>
                    <td style={styles.td}>{fb.email || "N/A"}</td>
                    <td style={styles.td}>{fb.feedback || "N/A"}</td>
                    <td style={styles.td}>
                      {fb.timestamp
                        ? new Date(fb.timestamp).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewFeedbacks;
