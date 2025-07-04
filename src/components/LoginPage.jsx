import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const [roleToggle, setRoleToggle] = useState("employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState({ admins: [], employees: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const initializeDefaultUsers = async () => {
      try {
        const adminRef = doc(db, "roles", "admins");
        let adminSnap = await getDoc(adminRef);
        if (!adminSnap.exists()) {
          await setDoc(adminRef, {
            emails: ["thirupathip.aiml2023@citchennai.net"]
          });
          adminSnap = await getDoc(adminRef); 
        }

        const employeeRef = doc(db, "roles", "employees");
        let employeeSnap = await getDoc(employeeRef);
        if (!employeeSnap.exists()) {
          await setDoc(employeeRef, {
            emails: ["vengi@citchennai.net"]
          });
          employeeSnap = await getDoc(employeeRef); // re-fetch after set
        }

        // Defensive: check if data exists and is valid
        const adminData = adminSnap.data();
        const employeeData = employeeSnap.data();
        if (!adminData || !Array.isArray(adminData.emails) || !employeeData || !Array.isArray(employeeData.emails)) {
          throw new Error("Roles data missing or malformed in Firestore");
        }

        setAllowed({
          admins: adminData.emails,
          employees: employeeData.emails
        });
      } catch (error) {
        console.error("Error initializing default users:", error);
        setError("Failed to initialize user roles. Please try again.\n" + (error && error.message ? error.message : ""));
      }
    };

    initializeDefaultUsers();
  }, []);

  const handleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      if (!user.email.endsWith("@citchennai.net")) {
        await signOut(auth);
        throw new Error("Please use your organization email to sign in.");
      }

      const userEmail = user.email.toLowerCase();
      if (roleToggle === "admin") {
        if (userEmail === "thirupathip.aiml2023@citchennai.net") {
          onLogin({
            user: {
              email: userEmail,
              displayName: user.displayName || userEmail.split('@')[0]
            },
            role: "admin"
          });
        } else {
          await signOut(auth);
          throw new Error("Only the specified admin account is allowed.");
        }
      } else {
        // For employees, block all logins
        await signOut(auth);
        throw new Error("Employee login is not allowed.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Sign In</h2>
      <div style={styles.toggle}>
        <label>
          <input
            type="radio"
            name="role"
            value="employee"
            checked={roleToggle === "employee"}
            onChange={() => setRoleToggle("employee")}
          />
          Employee
        </label>
        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            name="role"
            value="admin"
            checked={roleToggle === "admin"}
            onChange={() => setRoleToggle("admin")}
          />
          Admin
        </label>
      </div>
      <button
        onClick={handleLogin}
        disabled={loading}
        style={styles.button}
      >
        {loading ? "Signing in..." : `Sign in with Google as ${roleToggle}`}
      </button>
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 320,
    margin: "100px auto",
    textAlign: "center",
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  },
  toggle: {
    margin: "20px 0",
    display: "flex",
    justifyContent: "center",
    gap: "20px"
  },
  button: {
    padding: "12px 24px",
    fontSize: "16px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer"
  },
  error: {
    color: "#dc3545",
    marginTop: "10px",
    fontSize: "14px"
  }
};