import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../services/firebase";
import { useDispatch } from "react-redux";
import { loginSuccess, loginFailure, loginStart } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";

// Cloudinary config
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dbftgtgs9/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "Demo_product_upload_image";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [userType, setUserType] = useState("user");
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const uploadImageToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const res = await fetch(CLOUDINARY_URL, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.secure_url;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    dispatch(loginStart());

    try {
      setUploading(true);
      let profilePhotoURL = "";

      if (profilePhotoFile) {
        profilePhotoURL = await uploadImageToCloudinary(profilePhotoFile);
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username,
        userType,
        profilePhotoURL,
      });

      dispatch(
        loginSuccess({
          uid: user.uid,
          email: user.email,
          username,
          userType,
          profilePhotoURL,
        })
      );

      alert("Registration successful!");

      if (userType === "creator") {
        navigate("/creatordashboard");
      }else{
        navigate("/userdashboard")
      }
    } catch (err) {
      dispatch(loginFailure(err.message));
      alert("Registration failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const containerStyle = {
    position: "relative",
    height: "80vh",
    overflow: "hidden",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    paddingTop: "60px",
  };

  const formStyle = {
    width: "400px",
    padding: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(255, 255, 255, 0.9)",
    zIndex: 1,
    marginTop:"-80px",
  };

  const inputStyle = {
    width: "90%",
    padding: "10px",
    margin: "10px 10px 0 20px",
    borderRadius: "5px",
    border: "1px solid #aaa",
    fontSize: "16px",
    boxShadow: "0 0 10px rgba(0,0,0,0.2)",
  };

  const buttonStyle = {
    width: "90%",
    padding: "12px",
    backgroundColor: "#221e49ff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    marginTop: "10px",
    marginLeft:"20px",
  };

  const titleStyle = {
    textAlign: "center",
    fontSize: "24px",
    color: "#2c3e50",
    marginBottom: "20px",
  };

  return (
    <div style={containerStyle}>
     
      <form onSubmit={handleRegister} style={formStyle}>
        <h2 style={titleStyle}><b>Register</b></h2>
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

        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          placeholder="Username"
          required
          style={inputStyle}
        />

        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          style={inputStyle}
        >
          <option value="user">User</option>
          <option value="creator">Creator</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setProfilePhotoFile(e.target.files[0])}
          style={inputStyle}
        />

        {uploading && <p style={{ color: "red" }}>Uploading photo...</p>}

        <button type="submit" style={buttonStyle} disabled={uploading}>
          {uploading ? "Registering..." : "Register"}
        </button>
      </form>
    </div>
  );
};

export default Register;
