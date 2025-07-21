import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [eventCount, setEventCount] = useState(0);
  const [registrationCount, setRegistrationCount] = useState(0);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const [enquiryCount, setEnquiryCount] = useState(0);

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      fetchDashboardData(user.uid);
    }
  }, []);

  const fetchDashboardData = async (uid) => {
    try {
      const eventsQuery = query(collection(db, "events"), where("creatorUid", "==", uid));
      const eventsSnap = await getDocs(eventsQuery);
      setEventCount(eventsSnap.size);

      let totalRegs = 0;
      for (const doc of eventsSnap.docs) {
        const event = doc.data();
        if (event.registeredUsers) {
          totalRegs += event.registeredUsers.length;
        }
      }
      setRegistrationCount(totalRegs);

      const feedbackQuery = query(collection(db, "feedbacks"), where("eventCreatorUid", "==", uid));
      const feedbackSnap = await getDocs(feedbackQuery);
      setFeedbackCount(feedbackSnap.size);

      const enquiryQuery = query(collection(db, "enquiries"), where("eventCreatorUid", "==", uid));
      const enquirySnap = await getDocs(enquiryQuery);
      setEnquiryCount(enquirySnap.size);
    } catch (error) {
      console.error("Dashboard fetch error:", error);
    }
  };

  const barChartData = {
    labels: ["Events", "Registrations", "Feedbacks", "Enquiries"],
    datasets: [
      {
        label: "Counts",
        data: [eventCount, registrationCount, feedbackCount, enquiryCount],
        backgroundColor: ["#4caf50", "#2196f3", "#ff9800", "#e91e63"],
        borderColor: ["#388e3c", "#1976d2", "#f57c00", "#c2185b"],
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Registrations",
        data: [5, 10, registrationCount, registrationCount], // Simulated trend
        fill: false,
        borderColor: "#2196f3",
        backgroundColor: "#bbdefb",
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📊 Dashboard Overview</h2>
      <div style={styles.cardContainer}>
        <div style={styles.card}><h3>{eventCount}</h3><p>Events Created</p></div>
        <div style={styles.card}><h3>{registrationCount}</h3><p>Event Registrations</p></div>
        <div style={styles.card}><h3>{feedbackCount}</h3><p>Feedback Received</p></div>
        <div style={styles.card}><h3>{enquiryCount}</h3><p>Enquiries Received</p></div>
      </div>

      <div style={styles.chartRow}>
        <div style={styles.chartBox}>
          <h3 style={styles.chartHeading}>📊 Bar Chart</h3>
          <Bar data={barChartData} options={chartOptions} />
        </div>
        <div style={styles.chartBox}>
          <h3 style={styles.chartHeading}>📈 Registration Trend</h3>
          <Line data={lineChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: "30px",
    maxWidth: "1100px",
    margin: "100px 0 0 280px",
  },
  heading: {
    fontSize: "26px",
    marginBottom: "20px",
    fontWeight:"bold",
  },
  cardContainer: {
    display: "flex",
    gap: "20px",
    flexWrap: "wrap",
    marginBottom: "40px",
  },
  card: {
    flex: "1 1 200px",
    padding: "20px",
    background: "#ffffffff",
    borderRadius: "10px",
    textAlign: "center",
    boxShadow: "0 2px 5px rgba(0,0,0,0.7)",
  },
  chartRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "30px",
    justifyContent: "space-between",
  },
  chartBox: {
    flex: "1 1 45%",
    background: "#ffffff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.7)",
  },
  chartHeading: {
    fontSize: "20px",
    marginBottom: "15px",
    textAlign: "center",
    fontWeight:"bold",
  },
};

export default Dashboard;
