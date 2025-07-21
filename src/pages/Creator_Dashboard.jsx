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
import "../styles/creator.css";
import AddEventForm from "../components/AddEvent";
import EventList from "../components/EventList";
import Dashboard from "../components/Dashboard";
import RegisteredList from "../components/RegisteredList";
import ViewFeedbacks from "../components/FeedbackList";
import CreatorEnquiriesList from "../components/CreatorEnquiryList";

const CreatorDashboard = () => {
  const [activeView, setActiveView] = useState("welcome");

  const renderContent = () => {
    switch (activeView) {
      case "dashboard-event":
        return <Dashboard/>;
      case "add-event":
        return <AddEventForm />;
      case "manage-events":
        return <EventList/>;
      case "users":
        return <RegisteredList/>;
      case "feedback":
        return <ViewFeedbacks/>;
      case "support":
        return <CreatorEnquiriesList/>;
      default:
        return <Dashboard/>
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <button
            onClick={() => setActiveView("dashboard-event")}
            className={`sidebar-button ${activeView === "dashboard-event" ? "active" : ""}`}
          >
            <FaCalendarPlus /> Dashboard
          </button>
          <button
            onClick={() => setActiveView("add-event")}
            className={`sidebar-button ${activeView === "add-event" ? "active" : ""}`}
          >
            <FaCalendarPlus /> Add Event
          </button>
          <button
            onClick={() => setActiveView("manage-events")}
            className={`sidebar-button ${activeView === "manage-events" ? "active" : ""}`}
          >
            <FaListAlt /> Manage Events
          </button>
          <button
            onClick={() => setActiveView("users")}
            className={`sidebar-button ${activeView === "users" ? "active" : ""}`}
          >
            <FaUsers /> Registered Users
          </button>
          <button
            onClick={() => setActiveView("feedback")}
            className={`sidebar-button ${activeView === "feedback" ? "active" : ""}`}
          >
            <FaComments /> Feedback
          </button>
          <button
            onClick={() => setActiveView("support")}
            className={`sidebar-button ${activeView === "support" ? "active" : ""}`}
          >
            <FaLifeRing /> Support
          </button>
        </nav>
      </aside>


      {/* Main Content */}
      <main className="flex-1 p-10">{renderContent()}</main>
    </div>
  );
};

export default CreatorDashboard;
