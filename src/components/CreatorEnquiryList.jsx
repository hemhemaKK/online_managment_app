import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, updateDoc, doc } from "firebase/firestore";
import { db, auth } from "../services/firebase";

const CreatorEnquiriesList = () => {
  const [groupedEnquiries, setGroupedEnquiries] = useState({});
  const [loading, setLoading] = useState(true);
  const [replyInputs, setReplyInputs] = useState({}); // To track replies per enquiry

  useEffect(() => {
    const fetchCreatorEnquiries = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        const q = query(collection(db, "events"), where("createdBy", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);

        const grouped = {};

        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          const enquiries = data.enquiries || [];

          if (enquiries.length > 0) {
            grouped[docSnap.id] = {
              title: data.title,
              enquiries: enquiries.map((enq, idx) => ({
                ...enq,
                enquiryIndex: idx,
              })),
            };
          }
        });

        setGroupedEnquiries(grouped);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching grouped enquiries:", error);
        setLoading(false);
      }
    };

    fetchCreatorEnquiries();
  }, []);

  const handleReplyChange = (eventId, index, value) => {
    setReplyInputs((prev) => ({
      ...prev,
      [`${eventId}-${index}`]: value,
    }));
  };

  const sendReply = async (eventId, index) => {
    const replyText = replyInputs[`${eventId}-${index}`];
    if (!replyText) return;

    try {
      const eventRef = doc(db, "events", eventId);
      const eventSnap = await getDocs(query(collection(db, "events"), where("__name__", "==", eventId)));
      if (!eventSnap.empty) {
        const existingEnquiries = eventSnap.docs[0].data().enquiries || [];

        existingEnquiries[index].reply = replyText;

        await updateDoc(eventRef, {
          enquiries: existingEnquiries,
        });

        alert("Reply sent successfully!");
        setReplyInputs((prev) => ({ ...prev, [`${eventId}-${index}`]: "" }));

        // Refresh enquiries after reply
        const updatedGrouped = { ...groupedEnquiries };
        updatedGrouped[eventId].enquiries[index].reply = replyText;
        setGroupedEnquiries(updatedGrouped);
      }
    } catch (err) {
      console.error("Error sending reply:", err);
    }
  };

  const styles = {
    container: {
      margin: "60px 0 0 250px",
      padding: "20px",
      fontFamily: "Arial, sans-serif",
    },
    section: {
      marginBottom: "40px",
      padding: "15px",
      backgroundColor: "#ffffffff",
      borderRadius: "8px",
    },
    heading: {
      fontSize: "22px",
      fontWeight: "bold",
      marginBottom: "10px",
      color: "#0c243bff",
      borderBottom: "2px solid #ccc",
      paddingBottom: "5px",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    th: {
      textAlign: "left",
      backgroundColor: "#ddd",
      padding: "10px",
      border: "1px solid #ccc",
    },
    td: {
      padding: "10px",
      border: "1px solid #ccc",
      verticalAlign: "top",
    },
    input: {
      width: "100%",
      padding: "6px",
      fontSize: "14px",
    },
    button: {
      marginTop: "5px",
      padding: "5px 10px",
      fontSize: "14px",
      cursor: "pointer",
    },
  };

  if (loading) return <p style={styles.container}>Loading enquiries...</p>;
  if (Object.keys(groupedEnquiries).length === 0) return <p style={styles.container}>No enquiries found.</p>;

  return (
    <div style={styles.container}>
      <h2 style={{ fontSize: "26px", fontWeight: "bold", marginBottom: "30px" }}>
        📋 Enquiries Grouped by Event
      </h2>

      {Object.entries(groupedEnquiries).map(([eventId, { title, enquiries }]) => (
        <div key={eventId} style={styles.section}>
          <h3 style={styles.heading}>{title}</h3>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>User Email</th>
                <th style={styles.th}>Subject</th>
                <th style={styles.th}>Message</th>
                <th style={styles.th}>Reply</th>
                <th style={styles.th}>Sent At</th>
              </tr>
            </thead>
            <tbody>
              {enquiries.map((enq, idx) => (
                <tr key={idx}>
                  <td style={styles.td}>{enq.email}</td>
                  <td style={styles.td}>{enq.subject}</td>
                  <td style={styles.td}>{enq.message}</td>
                  <td style={styles.td}>
                    {enq.reply ? (
                      <div><strong>Replied:</strong> {enq.reply}</div>
                    ) : (
                      <>
                        <input
                          type="text"
                          placeholder="Enter reply"
                          style={styles.input}
                          value={replyInputs[`${eventId}-${idx}`] || ""}
                          onChange={(e) => handleReplyChange(eventId, idx, e.target.value)}
                        />
                        <button
                          onClick={() => sendReply(eventId, idx)}
                          style={styles.button}
                        >
                          Send
                        </button>
                      </>
                    )}
                  </td>
                  <td style={styles.td}>
                    {enq.createdAt?.seconds
                      ? new Date(enq.createdAt.seconds * 1000).toLocaleString()
                      : "Unknown"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default CreatorEnquiriesList;
