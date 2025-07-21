import React, { useEffect, useState } from "react";
import { auth, db } from "../services/firebase";
import {
  FaCalendarPlus,
  FaListAlt,
  FaUsers,
  FaChartBar,
  FaComments,
  FaLifeRing,
} from "react-icons/fa";
import "../styles/user.css";
import UserPage from "../components/UserDashboard";
import UserRegisteredEvents from "../components/UserRegisterList";
import EventEnquiryForm from "../components/EnquiryForm";
import VIP from "../components/VIP";

const UserDashboard = () => {
  const [activeView, setActiveView] = useState("welcome");

  const renderContent = () => {
    switch (activeView) {
      case "all-event":
        return <UserPage/>;
      case "register":
        return <UserRegisteredEvents/>;
      case "enquiry":
        return <EventEnquiryForm/>;
      case "vip":
        return <VIP/>;
      default:
        return <UserPage/>
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveView("all-event")}
            className={`sidebar-button ${activeView === "all-event" ? "active" : ""}`}
          >
            <FaCalendarPlus /> New Events
          </button>
          <button
            onClick={() => setActiveView("register")}
            className={`sidebar-button ${activeView === "register" ? "active" : ""}`}
          >
            <FaUsers /> Registered Events
          </button>
          <button
            onClick={() => setActiveView("enquiry")}
            className={`sidebar-button ${activeView === "enquiry" ? "active" : ""}`}
          >
            <FaComments /> Enquiry
          </button>
          <button
            onClick={() => setActiveView("vip")}
            className={`sidebar-button ${activeView === "vip" ? "active" : ""}`}
          >
            <FaLifeRing /> VIP Register
          </button>
        </nav>
      </aside>


      {/* Main Content */}
      <main className="flex-1 p-10">{renderContent()}</main>
    </div>
  );
};

export default UserDashboard;
