import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import PrivateRoute from "./components/PrivateRoute";
import NavBar from "./components/NavBar";
import CreatorDashboard from "./pages/Creator_Dashboard";
import UserDashboard from "./pages/User_Dashboard";
import HomePage from "./pages/Homepage";
import Footer from "./pages/Footer";
import "./App.css";
import AddEventForm from "./components/AddEvent";

const App = () => {
  const location = useLocation();

  // Routes where Footer should be hidden
  const hideFooterRoutes = ["/creatordashboard", "/userdashboard", "/add-event"];
  const shouldHideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div>
      <NavBar />

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/creatordashboard"
          element={
            <PrivateRoute>
              <CreatorDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/userdashboard"
          element={
            <PrivateRoute>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-event"
          element={
            <PrivateRoute>
              <AddEventForm />
            </PrivateRoute>
          }
        />

        {/* ✅ Redirect any unknown route to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

      {!shouldHideFooter && <Footer />}
    </div>
  );
};

export default App;
