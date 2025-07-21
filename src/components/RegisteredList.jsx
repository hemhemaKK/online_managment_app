import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { auth, db } from "../services/firebase";

const RegisteredList = () => {
    const [events, setEvents] = useState([]);

    const isEventExpired = (eventDate, eventTime) => {
        if (!eventDate || !eventTime) return false;
        const eventDateTime = new Date(`${eventDate} ${eventTime}`);
        return eventDateTime < new Date();
    };

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                try {
                    const snapshot = await getDocs(collection(db, "events"));
                    const eventList = snapshot.docs.map((doc) => ({
                        id: doc.id,
                        ...doc.data(),
                    }));

                    const myCreatedEvents = eventList.filter(
                        (event) => event.createdBy === currentUser.uid
                    ).sort((a, b) => {
                        const aExpired = isEventExpired(a.date, a.time);
                        const bExpired = isEventExpired(b.date, b.time);
                        return aExpired - bExpired; // Active first, expired later
                    });

                    setEvents(myCreatedEvents);
                } catch (err) {
                    console.error("Error fetching events:", err);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <div style={{ padding: "20px", marginLeft: "250px", marginTop: "80px" }}>
            <h2 style={{ marginBottom: "30px", fontWeight: "bold", fontSize: "20px" }}>
                📋 Your Created Events & Registered Users
            </h2>
            {events.length === 0 ? (
                <p>You haven't created any events.</p>
            ) : (
                events.map((event) => {
                    const expired = isEventExpired(event.date, event.time);
                    return (
                        <div
                            key={event.id}
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                marginBottom: "30px",
                                border: "1px solid #ccc",
                                borderRadius: "10px",
                                padding: "20px",
                                backgroundColor: expired ? "#ffe0e0" : "#f9f9f9",
                                opacity: expired ? 0.6 : 1,
                            }}
                        >
                            {/* Left side: Event info */}
                            <div style={{ flex: "1", minWidth: "250px", paddingRight: "20px" }}>
                                <h3 style={{ color: expired ? "#dc2626" : "#2563eb" }}>
                                    {event.title || "Untitled Event"}{" "}
                                    {expired && <span style={{ fontSize: "14px" }}>(Expired)</span>}
                                </h3>
                                <p><strong>Date:</strong> {event.date}</p>
                                <p><strong>Time:</strong> {event.time}</p>
                                <p><strong>Description:</strong> {event.description}</p>
                                <p><strong>Speaker:</strong> {event.speakerName}</p>
                            </div>

                            {/* Right side: Registered users table */}
                            <div
                                style={{
                                    flex: "2",
                                    minWidth: "250px",
                                    maxHeight: "200px",
                                    overflowY: "auto",
                                    borderLeft: "1px solid #ddd",
                                    paddingLeft: "20px",
                                }}
                            >
                                <h4 style={{ fontWeight: "bold", marginBottom: "10px" }}>✅ Registered Users</h4>
                                {event.registeredUsers && event.registeredUsers.length > 0 ? (
                                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr style={{ backgroundColor: "#e0e7ff" }}>
                                                <th style={tableCellStyle}>S.No</th>
                                                <th style={tableCellStyle}>Email</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {event.registeredUsers.map((user, index) => (
                                                <tr key={index}>
                                                    <td style={tableCellStyle}>{index + 1}</td>
                                                    <td style={tableCellStyle}>{user.email || "N/A"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : (
                                    <p>No users registered for this event.</p>
                                )}
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

const tableCellStyle = {
    border: "1px solid #cbd5e0",
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#fff",
};

export default RegisteredList;
