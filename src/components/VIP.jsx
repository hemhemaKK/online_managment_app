import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import dayjs from "dayjs"; // install with: npm install dayjs

const Vip = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [expiryDate, setExpiryDate] = useState(null);
  const [duration, setDuration] = useState("1");
  const [price, setPrice] = useState(199);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const sub = userSnap.data().subscription;
        if (sub && sub.startedAt && sub.duration) {
          const start = dayjs(sub.startedAt);
          const expiry = start.add(parseInt(sub.duration), "month");
          setExpiryDate(expiry.format("YYYY-MM-DD"));
          if (dayjs().isBefore(expiry)) {
            setIsSubscribed(true);
          }
        }
      }

      setLoading(false);
    };

    checkSubscription();
  }, []);

  useEffect(() => {
    // Update price when duration changes
    if (duration === "1") setPrice(199);
    else if (duration === "3") setPrice(499);
    else if (duration === "6") setPrice(899);
  }, [duration]);

  const handlePayment = async () => {
    const user = auth.currentUser;
    if (!user) return alert("Please log in");

    const options = {
      key: "rzp_test_VGdiUsSDKJWAWe", // replace with your Razorpay key
      amount: price * 100,
      currency: "INR",
      name: "EventZone VIP Pack",
      description: `VIP Subscription (${duration} Months)`,
      handler: async function (response) {
        const userRef = doc(db, "users", user.uid);
        const startedAt = new Date().toISOString();

        await updateDoc(userRef, {
          userType: "VIP",
          subscription: {
            status: "active",
            duration: duration,
            price: price,
            startedAt: startedAt,
            razorpayPaymentId: response.razorpay_payment_id,
          },
        });

        // ✅ Update UI state without reload
        setIsSubscribed(true);
        const newExpiry = dayjs(startedAt).add(parseInt(duration), "month");
        setExpiryDate(newExpiry.format("YYYY-MM-DD"));

        alert("🎉 Subscription Successful!");
      },
      prefill: {
        name: user.displayName || "VIP User",
        email: user.email,
      },
      theme: { color: "#4f46e5" },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <div style={{ padding: "40px", marginLeft: "250px", marginTop: "80px" }}>
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "20px" }}>
        🌟 Become a VIP Member
      </h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <label style={{ marginBottom: "10px", display: "block" }}>
            <strong>Select Duration:</strong>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{
                marginLeft: "10px",
                padding: "5px",
                fontSize: "16px",
                borderRadius: "4px",
              }}
              disabled={isSubscribed}
            >
              <option value="1">1 Month - ₹199</option>
              <option value="3">3 Months - ₹499</option>
              <option value="6">6 Months - ₹899</option>
            </select>
          </label>

          <p>
            <strong>Price:</strong> ₹{price}
          </p>

          {isSubscribed ? (
            <div style={{ backgroundColor: "white", padding: "10px" }}>
              <p style={{ marginTop: "10px", color: "green" }}>
                ✅ You are already a VIP member.
              </p>
              <p>
                🔒 Subscription valid until: <strong>{expiryDate}</strong>
              </p>
              <button
                disabled
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ccc",
                  color: "#777",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "not-allowed",
                  marginTop: "10px",
                }}
              >
                VIP Active
              </button>
            </div>
          ) : (
            <button
              onClick={handlePayment}
              style={{
                padding: "10px 20px",
                fontSize: "16px",
                backgroundColor: "#4f46e5",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                marginTop: "10px",
              }}
            >
              Subscribe to VIP
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Vip;
