import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import {
    collection,
    doc,
    getDocs,
    updateDoc,
    arrayUnion,
    query,
    where,
} from "firebase/firestore";

const UserDashboard = () => {
    const [premiumEvents, setPremiumEvents] = useState([]);
    const [normalEvents, setNormalEvents] = useState([]);
    const [expiredEvents, setExpiredEvents] = useState([]);
    const [registeredEventIds, setRegisteredEventIds] = useState([]);
    const [registeredEvents, setRegisteredEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notified, setNotified] = useState([]);
    const [userRole, setUserRole] = useState(null);

    const user = auth.currentUser;

    useEffect(() => {
        const fetchUserRole = async () => {
            if (!user) return;
            try {
                const q = query(collection(db, "users"), where("uid", "==", user.uid));
                const snapshot = await getDocs(q);
                snapshot.forEach((doc) => {
                    setUserRole(doc.data().userType?.toLowerCase() || "user");
                });
            } catch (err) {
                console.error("Error fetching user role", err);
            }
        };

        fetchUserRole();
    }, [user]);

    useEffect(() => {
        const fetchEvents = async () => {
            const snapshot = await getDocs(collection(db, "events"));
            const now = new Date();
            const premium = [];
            const normal = [];
            const expired = [];
            const registeredIds = [];
            const registeredData = [];

            snapshot.forEach((docSnap) => {
                const data = { id: docSnap.id, ...docSnap.data() };
                const isRegistered =
                    data.registeredUsers &&
                    data.registeredUsers.some((u) => u.uid === user?.uid);
                if (isRegistered) {
                    registeredIds.push(data.id);
                    registeredData.push(data);
                }

                const eventDate = new Date(`${data.date} ${data.time}`);
                const isExpired = eventDate < now;

                if (isExpired) expired.push(data);
                else if (data.meetingType === "premium") premium.push(data);
                else normal.push(data);
            });

            setPremiumEvents(premium);
            setNormalEvents(normal);
            setExpiredEvents(expired);
            setRegisteredEventIds(registeredIds);
            setRegisteredEvents(registeredData);
            setLoading(false);
        };

        fetchEvents();
    }, [user]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            registeredEvents.forEach((event) => {
                const eventTime = new Date(`${event.date} ${event.time}`);
                if (
                    !notified.includes(event.id) &&
                    Math.abs(eventTime - now) < 60000
                ) {
                    beepAndNotify(event.title);
                    setNotified((prev) => [...prev, event.id]);
                }
            });
        }, 10000);

        return () => clearInterval(interval);
    }, [registeredEvents, notified]);

    const beepAndNotify = (title) => {
        const audio = new Audio("https://www.soundjay.com/buttons/beep-07.mp3");
        audio.play();
        alert(`🔔 Reminder: "${title}" is starting now!`);
    };

    const handleRegister = async (event) => {
        if (!user) {
            alert("Please login to register.");
            return;
        }

        const isExpired = new Date(`${event.date} ${event.time}`) < new Date();
        if (isExpired) return;

        if (event.meetingType === "premium" && userRole !== "vip") {
            alert("🔒 Only VIP users can register for premium events.");
            return;
        }

        const registerUser = async () => {
            const eventRef = doc(db, "events", event.id);
            await updateDoc(eventRef, {
                registeredUsers: arrayUnion({
                    uid: user.uid,
                    email: user.email,
                    registeredAt: new Date().toISOString(),
                }),
            });
            setRegisteredEventIds((prev) => [...prev, event.id]);
            setRegisteredEvents((prev) => [...prev, event]);
        };

        if (event.meetingType === "premium") {
            const price = event.price || 199;
            const options = {
                key: "rzp_test_VGdiUsSDKJWAWe",
                amount: price * 100,
                currency: "INR",
                name: "EventZone Premium",
                description: event.title,
                handler: async function () {
                    await registerUser();
                    alert("✅ Payment successful and registered!");
                },
                prefill: {
                    name: user.displayName || "VIP User",
                    email: user.email,
                },
                theme: {
                    color: "#4f46e5",
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } else {
            await registerUser();
            alert("🎉 Registered for event!");
        }
    };

    const cardStyle = {
        flex: "0 0 auto",
        width: "200px",
        padding: "10px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        marginTop: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.7)",
    };

    const renderCard = (event, isExpired = false) => {
        const isRegistered = registeredEventIds.includes(event.id);
        const isVipLocked =
            event.meetingType === "premium" && userRole !== "vip";
        const disabled = isRegistered || isExpired || isVipLocked;

        return (
            <div key={event.id} style={cardStyle}>
                <img
                    src={event.posterUrl}
                    alt={event.title}
                    style={{ width: "100%", height: "210px", borderRadius: "6px" }}
                />
                <h4>
                    <center>
                        <b>{event.title}</b>
                    </center>
                </h4>
                <p>
                    <strong>Date:</strong> {event.date}
                </p>
                <p>
                    <strong>Time:</strong> {event.time}
                </p>
                <p>
                    <strong>Speaker:</strong> {event.speakerName || "N/A"}
                </p>
                <p>
                    <strong>Description:</strong> {event.description}
                </p>
                {event.meetingType === "premium" && (
                    <p>
                        <strong>Price:</strong> ₹{event.price || 99}
                    </p>
                )}
                <button
                    onClick={() => handleRegister(event)}
                    disabled={disabled}
                    style={{
                        marginTop: "8px",
                        padding: "6px 10px",
                        backgroundColor:
                            disabled
                                ? "#aaa"
                                : event.meetingType === "premium"
                                    ? "#4f46e5"
                                    : "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        cursor: disabled ? "not-allowed" : "pointer",
                    }}
                >
                    {isExpired
                        ? "Expired"
                        : isRegistered
                            ? "Registered"
                            : isVipLocked
                                ? "🔒 VIP Only"
                                : event.meetingType === "premium"
                                    ? "Register & Pay"
                                    : "Register Free"}
                </button>
            </div>
        );
    };

    if (loading || userRole === null) return <p>Loading events...</p>;

    return (
        <div
            style={{
                position: "fixed",
                top: "80px",
                left: "250px",
                right: 0,
                bottom: 0,
                overflowY: "auto",
                backgroundColor: "#f5f5f5",
                padding: "20px",
            }}
        >
            <h2 style={{ fontSize: "24px", top: 0, backgroundColor: "#f5f5f5", zIndex: 10, padding: "10px 0" }}>
                <b>🌟 Premium Events</b>
            </h2>
            <div style={{ display: "flex", overflowX: "auto", gap: "10px", padding: "10px 0" }}>{premiumEvents.map((e) => renderCard(e))}</div>

            <h2 style={{ fontSize: "24px", top: 0, backgroundColor: "#f5f5f5", zIndex: 10, padding: "10px 0" }}>
                <b>🆓 Normal Events</b>
            </h2>
            <div style={{ display: "flex", overflowX: "auto", gap: "10px", padding: "10px 0" }}>{normalEvents.map((e) => renderCard(e))}</div>

            <h2 style={{ fontSize: "24px", position: "sticky", top: 0, backgroundColor: "#f5f5f5", zIndex: 10, padding: "10px 0" }}>
                <b>⛔ Recents Events</b>
            </h2>
            <div style={{ overflowX: "hidden", width: "100%" }}>
                <div style={{ display: "flex", gap: "15px", whiteSpace: "nowrap", animation: "scroll-left 20s linear infinite" }}>
                    {expiredEvents.map((e) => renderCard(e, true))}
                </div>
            </div>

            <style>{`
                @keyframes scroll-left {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
};

export default UserDashboard;