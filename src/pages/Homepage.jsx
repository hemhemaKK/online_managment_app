// ... (rest of your import statements)
import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import FeatureCards from "./FeatursCards";

const videoUrl = "/bg1.mp4";

const HomePage = () => {
  const [premiumEvents, setPremiumEvents] = useState([]);
  const [normalEvents, setNormalEvents] = useState([]);
  const [expiredEvents, setExpiredEvents] = useState([]);
  const navigate = useNavigate();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchEvents = async () => {
      const snapshot = await getDocs(collection(db, "events"));
      const now = new Date();
      const premium = [];
      const normal = [];
      const expired = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        const eventDateTime = new Date(`${data.date}T${data.time}`);
        const event = { id: doc.id, ...data };

        if (eventDateTime < now) {
          expired.push(event);
        } else if (data.meetingType === "premium") {
          premium.push(event);
        } else {
          normal.push(event);
        }
      });

      setPremiumEvents(premium);
      setNormalEvents(normal);
      setExpiredEvents(expired);
    };

    fetchEvents();
  }, []);

  const renderEvents = (events, isPremium = false, isExpired = false) => {
    const containerStyle = isExpired
      ? {
        display: "flex",
        gap: "20px",
        padding: "10px 0",
        animation: "scrollLeft 60s linear infinite",
      }
      : {
        display: "flex",
        overflowX: "auto",
        gap: "20px",
        padding: "10px 0",
        scrollBehavior: "smooth",
      };

    return (
      <div
        style={{
          overflow: isExpired ? "hidden" : "auto",
          whiteSpace: isExpired ? "nowrap" : "normal",
        }}
      >
        <div style={containerStyle}>
          {events.map((event, index) => (
            <div
              key={event.id}
              style={{
                animation: "fadeInUp 0.5s ease forwards",
                animationDelay: `${index * 0.1}s`,
                opacity: 0,
                borderRadius: "12px",
                padding: "16px",
                width: "300px",
                flex: "0 0 auto",
                backgroundColor: isExpired
                  ? "#f1f1f1"
                  : isPremium
                    ? "#fff8e1"
                    : "#e3f2fd",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                transition: "transform 0.3s",
                position: "relative",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.transform = "translateY(-5px)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.transform = "translateY(0)")
              }
            >
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  backgroundColor: isPremium ? "#f57c00" : "#1976d2",
                  color: "white",
                  fontSize: "12px",
                  padding: "4px 8px",
                  borderRadius: "12px",
                  fontWeight: "bold",
                }}
              >
                {isPremium ? "Premium" : isExpired ? "Recent" : "Normal"}
              </span>
              <img
                src={event.posterUrl}
                alt={event.title}
                style={{
                  width: "100%",
                  height: "160px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  marginBottom: "10px",
                }}
              />
              <h3 style={{ color: "#333", marginBottom: "8px" }}>
                {event.title}
              </h3>
              <p style={{ color: "#666", margin: "4px 0" }}>
                📅 {event.date} &nbsp;&nbsp;⏰ {event.time}
              </p>
              <p style={{ color: "#444", fontSize: "14px", margin: "6px 0" }}>
                🎤 {event.speakerName}
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#555",
                  height: "50px",
                  overflow: "hidden",
                }}
              >
                {event.description}
              </p>

              {!isExpired && (
                <button
                  onClick={() => {
                    if (user) {
                      alert("✅ Registration successful! 🎟️");
                    } else {
                      navigate("/login");
                    }
                  }}
                  style={{
                    marginTop: "10px",
                    padding: "10px",
                    width: "100%",
                    backgroundColor: user ? "#4a148c" : "#003873",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  {user ? "Register" : "Login to Register"}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* 🔥 Background Video */}
      <div style={{ position: "relative", height: "500px", overflow: "hidden" }}>
        <video
          autoPlay
          loop
          muted
          style={{
            position: "absolute",
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
            top: 0,
            left: 0,
          }}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            textShadow: "2px 2px 5px white",
            fontWeight:"bold",
          }}
        >
          <h1 style={{ fontSize: "3.5rem", marginBottom: "10px" }}>
            🚀 Discover Events Effortlessly
          </h1>
          <p style={{ fontSize: "1.5rem" }}>
            Find the best talks, webinars, and activities curated for you.
          </p>
        </div>
      </div>

      <div
        style={{
          padding: "30px 20px",
          fontFamily: "'Segoe UI', sans-serif",
          overflowX: "hidden",
          maxWidth: "1300px",
          margin: "auto",
        }}
      >
        {/* 🔥 Extra Info Cards */}
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexWrap: "wrap",
            justifyContent: "center",
            marginBottom: "40px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffe5ffff",
              padding: "20px",
              borderRadius: "12px",
              width: "300px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            <h4 style={{ color: "#d81b60", marginBottom: "10px" }}>
              🧠 Learn & Grow
            </h4>
            <p style={{ color: "#444" }}>
              Attend expert-led sessions to boost your skills and knowledge.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#e8f5e9",
              padding: "20px",
              borderRadius: "12px",
              width: "300px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            <h4 style={{ color: "#388e3c", marginBottom: "10px" }}>
              🤝 Build Community
            </h4>
            <p style={{ color: "#444" }}>
              Network with like-minded people and make meaningful connections.
            </p>
          </div>

          <div
            style={{
              backgroundColor: "#fff3e0",
              padding: "20px",
              borderRadius: "12px",
              width: "300px",
              boxShadow: "0 2px 10px rgba(0,0,0,0.8)",
            }}
          >
            <h4 style={{ color: "#ef6c00", marginBottom: "10px" }}>
              🔔 Stay Updated
            </h4>
            <p style={{ color: "#444" }}>
              Get notified about upcoming events and exclusive sessions.
            </p>
          </div>
        </div>

        {/* 🔥 Event Sections */}
        <h2 style={{
          fontSize: "36px",
          fontWeight: "bold",
          textAlign: "center",
          backgroundColor: "#ffffff",
          padding: "10px",
          borderRadius: "10px",
          marginBottom: "20px",
          color: "#e65100",
        }}>
          🌟 Premium Events
        </h2>
        {renderEvents(premiumEvents, true)}


        <FeatureCards />
        <h2 style={{
          fontSize: "36px",
          fontWeight: "bold",
          textAlign: "center",
          backgroundColor: "#ffffff",
          padding: "10px",
          borderRadius: "10px",
          marginBottom: "20px",
          marginTop:"15px",
          color: "#002ee6ff",
        }}>
          🎫 Normal Events
        </h2>
        {renderEvents(normalEvents)}

        <h2
          style={{
            fontSize: "36px",
            fontWeight: "bold",
            textAlign: "center",
            backgroundColor: "#ffffff",
            padding: "10px",
            borderRadius: "10px",
            marginBottom: "20px",
            marginTop:'10px',
            color: "#4854f9ff",
          }}
        >
          📜 Past Events
        </h2>
        {renderEvents(expiredEvents, false, true)}

        {/* 🔥 About This App Box */}
        <div
          style={{
            backgroundColor: "#f3e5f5",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            margin: "50px 0",
            animation: "fadeInUp 1s ease-out",
          }}
        >
          <h1 style={{ fontSize:"25px", marginBottom: "10px", color: "#6a1b9a"}}>
            <center><b>💡 About This App</b></center>
          </h1>
          <p style={{ color: "#000" }}><center>
            EventEase is your one-stop solution for exploring premium and normal
            events happening around you. <br/>Get notified, register instantly, and
            never miss an opportunity to grow or network.</center>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scrollLeft {
          0%   { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        body {
          margin: 0;
          padding: 0;
          overflow-x: hidden;
        }
      `}</style>
    </div>
  );
};

export default HomePage;