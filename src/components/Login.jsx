import React, { useState } from "react";
import { auth, db } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useDispatch } from "react-redux";
import { loginSuccess, loginFailure, loginStart } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const q = query(collection(db, "users"), where("uid", "==", user.uid));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error("User data not found");
      }

      const userData = querySnapshot.docs[0].data();

      dispatch(
        loginSuccess({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || "",
          userType: userData.userType || "user",
        })
      );

      alert("Login successful!");

      if (userData.userType === "creator") {
        navigate("/creatordashboard");
      }else{
        navigate("/userdashboard")
      }
    } catch (err) {
      dispatch(loginFailure(err.message));
      alert("Login failed: " + err.message);
    }
  };

  const formStyle = {
    width: "350px",
    margin: "80px auto",
    marginTop:"-50px",
    padding: "30px",
    borderRadius: "10px",
    backgroundColor: "#ffffffff",
    fontFamily: "Arial, sans-serif",
    boxShadow: "0 0 10px rgba(255, 255, 255, 0.9)",
  };

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "5px",
    border: "1px solid #aaa",
    fontSize: "16px",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#2a264cff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
  };
  const containerStyle = {
    position: "relative",
    height: "80vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-start", // Align items from the top
    justifyContent: "center",
    paddingTop: "80px", // Push form slightly down from top
  };
  const titleStyle = {
    textAlign: "center",
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "20px",
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={formStyle}>
        <h2 style={titleStyle}><b>Login</b></h2>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          required
          style={inputStyle}
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>Login</button>
      </form>
    </div>
  );
};

export default Login;
