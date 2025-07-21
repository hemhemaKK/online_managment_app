import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { auth, db } from "../services/firebase";
import { logout } from "../store/slices/authSlice";
import { FaSignOutAlt } from "react-icons/fa";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom"; // ✅ Added for redirect
import Login from "./Login";
import Register from "./Register";

const NavBar = () => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate(); // ✅ Hook to redirect

  const [profile, setProfile] = useState({ username: "", photo: "" });
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const userRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(userRef);
          const data = docSnap.exists() ? docSnap.data() : {};
          setProfile({
            username: data.username || user.displayName || user.email,
            photo: data.profilePhotoURL || user.photoURL || "https://i.pravatar.cc/100"
          });
        } catch (err) {
          console.error("Failed to fetch profile:", err);
        }
      }
    };
    fetchProfile();
  }, [user]);

  // ✅ Auto close modal after successful login/register
  useEffect(() => {
    if (user) {
      setShowLogin(false);
      setShowRegister(false);
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(logout());
      navigate("/"); // ✅ Redirect to homepage after logout
    } catch (err) {
      console.error("Logout Error:", err);
    }
  };

  return (
    <>
      <nav style={styles.nav}>
        <img src="/logo1.png" alt="logo" style={{ height: "60px" }} />
        <div style={styles.links}>
          {user ? (
            <>
              <div style={styles.profileBox}>
                <img src={profile.photo} alt="User" style={styles.avatar} />
                <div>
                  <span style={styles.username}>{profile.username}</span><br />
                  <small style={styles.userType}>{user.userType?.toUpperCase() || "USER"}</small>
                </div>
              </div>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <FaSignOutAlt />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setShowLogin(true)} style={styles.link}>Login</button>
              <button onClick={() => setShowRegister(true)} style={styles.link}>Register</button>
            </>
          )}
        </div>
      </nav>

      {/* Login Modal */}
      {showLogin && (
        <div style={styles.modalOverlay} onClick={() => setShowLogin(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowLogin(false)}>×</button>
            <Login />
          </div>
        </div>
      )}

      {/* Register Modal */}
      {showRegister && (
        <div style={styles.modalOverlay} onClick={() => setShowRegister(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeBtn} onClick={() => setShowRegister(false)}>×</button>
            <Register />
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  nav: {
    position: "fixed",
    top: "0px",
    left: 0,
    right: 0,
    zIndex: 1000,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#ffffff",
    color: "#000",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    height: "80px"
  },
  links: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  link: {
    textDecoration: "none",
    backgroundColor: "#060034ff",
    padding: "10px 16px",
    borderRadius: "8px",
    color: "#fff",
    fontWeight: "bold",
    border: "none",
    cursor: "pointer"
  },
  profileBox: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "200px",
    background: "#eaeaea",
    padding: "5px 10px",
    borderRadius: "20px",
    marginRight: "20px"
  },
  avatar: {
    width: "45px",
    height: "45px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  username: {
    fontWeight: "600",
    fontSize: "14px",
  },
  userType: {
    fontSize: "12px",
    color: "#555",
  },
  logoutBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: "20px",
    color: "#000",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2000,
  },
  modalContent: {
    background: "#fff",
    padding: "30px",
    borderRadius: "10px",
    width: "350px",
    height: "450px",
    position: "relative",
    boxShadow: "0 4px 12px rgba(255, 255, 255, 0.9)"
  },
  closeBtn: {
    position: "absolute",
    top: "10px",
    right: "15px",
    background: "none",
    border: "none",
    fontSize: "24px",
    color: "#555",
    cursor: "pointer"
  }
};

export default NavBar;
