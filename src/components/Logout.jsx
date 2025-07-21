import React from "react";
import { useDispatch } from "react-redux";
import { db } from "../services/firebase";
import { signOut } from "firebase/auth";
import { logoutUser } from "../store/slices/authSlice";

function Logout() {
  const dispatch = useDispatch();

  const handleLogout = async () => {
    await signOut(db);
    dispatch(logoutUser());
    alert("Logged out successfully!");
  };

  return <button onClick={handleLogout}>Logout</button>;
}

export default Logout;
