import React from "react";

const FeatureCards = () => {
  const cardData = [
    {
      title: "🛠 Customize Experience",
      description: "Get event suggestions tailored to your interests.",
      video: "/v1.mp4", // Place inside public/videos/
    },
    {
      title: "🔍 Explore Archives",
      description: "Access recordings of past events at your convenience.",
      video: "/v3.mp4",
    },
    {
      title: "🎯 Personalized Dashboard",
      description: "Track your upcoming events in one easy place.",
      video: "/v2.mp4",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        padding: "40px 20px",
        flexWrap: "wrap",
        backgroundColor: "#ffffffff",
        borderRadius:"10px"
      }}
    >
      {cardData.map((card, index) => (
        <div
          key={index}
          style={{
            position: "relative",
            width: "390px",
            height: "200px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.8)",
            backgroundColor: "#000",
          }}
        >
          <video
            src={card.video}
            autoPlay
            muted
            loop
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.85,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              color: "white",
              padding: "16px",
              background: "rgba(0, 0, 0, 0.4)",
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              textAlign: "center",
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>{card.title}</h3>
            <p style={{ fontSize: "14px" }}>{card.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FeatureCards;
