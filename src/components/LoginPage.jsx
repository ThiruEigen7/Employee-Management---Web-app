import React, { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../firebase";
import { signInWithPopup, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

// Toggle Component
function ToggleTabs({ options, defaultValue, onChange }) {
  const [selected, setSelected] = useState(defaultValue || options[0]?.value);

  const handleSelect = (value) => {
    setSelected(value);
    onChange?.(value);
  };

  const containerStyle = {
    position: "relative",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(4px)",
    borderRadius: "12px",
    padding: "4px",
    display: "flex",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  const buttonStyle = (isSelected) => ({
    position: "relative",
    flex: "1",
    padding: "10px 16px",
    fontSize: "14px",
    fontWeight: "500",
    borderRadius: "8px",
    transition: "all 0.3s ease",
    border: "none",
    cursor: "pointer",
    backgroundColor: isSelected ? "rgba(255, 255, 255, 0.9)" : "transparent",
    color: isSelected ? "#1f2937" : "#6b7280",
    boxShadow: isSelected ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)" : "none",
    backdropFilter: isSelected ? "blur(4px)" : "none",
  });

  return (
    <div style={containerStyle}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => handleSelect(option.value)}
          style={buttonStyle(selected === option.value)}
          onMouseEnter={(e) => {
            if (selected !== option.value) {
              e.target.style.color = "#1f2937";
              e.target.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
            }
          }}
          onMouseLeave={(e) => {
            if (selected !== option.value) {
              e.target.style.color = "#6b7280";
              e.target.style.backgroundColor = "transparent";
            }
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

export default function Login({ onLogin }) {
  const [roleToggle, setRoleToggle] = useState("employee");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [allowed, setAllowed] = useState({ admins: [], employees: [] });
  const navigate = useNavigate();

  const userTypeOptions = [
    { value: "employee", label: "Employee" },
    { value: "admin", label: "Admin" },
  ];

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
          employeeSnap = await getDoc(employeeRef);
        }

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
        await signOut(auth);
        throw new Error("Employee login is not allowed.");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(to bottom right, #dbeafe, #e0f2fe, #ecfeff)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px",
  };

  const cardWrapperStyle = {
    width: "100%",
    maxWidth: "448px",
  };

  const cardStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    backdropFilter: "blur(24px)",
    borderRadius: "24px",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "32px",
  };

  const logoContainerStyle = {
    display: "flex",
    justifyContent: "center",
    marginBottom: "24px",
  };

  const logoStyle = {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    backdropFilter: "blur(4px)",
    borderRadius: "16px",
    padding: "16px",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.3)",
  };

  const headerStyle = {
    textAlign: "center",
    marginBottom: "32px",
  };

  const titleStyle = {
    fontSize: "24px",
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: "12px",
  };

  const subtitleStyle = {
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.5",
    paddingLeft: "8px",
    paddingRight: "8px",
  };

  const toggleContainerStyle = {
    marginBottom: "32px",
  };

  const buttonStyle = {
    width: "100%",
    backgroundColor: loading ? "#6b7280" : "#111827",
    color: "white",
    fontWeight: "500",
    padding: "16px 24px",
    borderRadius: "16px",
    transition: "all 0.3s ease",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    marginBottom: "24px",
    fontSize: "16px",
    border: "none",
    cursor: loading ? "not-allowed" : "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const errorStyle = {
    color: "#dc2626",
    fontSize: "14px",
    textAlign: "center",
    marginBottom: "16px",
    padding: "12px",
    backgroundColor: "rgba(254, 226, 226, 0.8)",
    borderRadius: "8px",
    border: "1px solid rgba(248, 113, 113, 0.3)",
  };

  const footerStyle = {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  };

  const footerTextStyle = {
    fontSize: "12px",
    color: "#9ca3af",
  };

  const iconStyle = {
    width: "24px",
    height: "24px",
    color: "#374151",
  };

  const googleIconStyle = {
    width: "20px",
    height: "20px",
    marginRight: "12px",
  };

  return (
    <div style={containerStyle}>
      <div style={cardWrapperStyle}>
        <div style={cardStyle}>
          {/* Logo Icon */}
          <div style={logoContainerStyle}>
            <div style={logoStyle}>
              <svg style={iconStyle} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div style={headerStyle}>
            <h1 style={titleStyle}>EPICAL LAYOUTS</h1>
            <p style={subtitleStyle}>
              Access your HR workspace securely with your Google account. Choose your role to continue.
            </p>
          </div>

          {/* User Type Selection */}
          <div style={toggleContainerStyle}>
            <ToggleTabs 
              options={userTypeOptions} 
              defaultValue={roleToggle}
              onChange={setRoleToggle}
            />
          </div>

          {/* Error Message */}
          {error && <div style={errorStyle}>{error}</div>}

          {/* Google Sign In Button */}
          <button
            style={buttonStyle}
            onClick={handleLogin}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#1f2937";
                e.target.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = "#111827";
                e.target.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
              }
            }}
          >
            <svg style={googleIconStyle} viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Signing in..." : `Continue with Google as ${roleToggle}`}
          </button>

          {/* Footer Text */}
          <div style={footerStyle}>
            <p style={footerTextStyle}>© 2025 EPICAL LAYOUTS PVT LTD. All rights reserved.</p>
            <p style={footerTextStyle}>Secure • Professional • Efficient</p>
          </div>
        </div>
      </div>
    </div>
  );
}