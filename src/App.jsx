import React, { useState, useEffect } from "react";
import Login from "./components/LoginPage";
import AdminHome from "./components/AdminHome";
import EmployeeHome from "./components/EmployeeHome";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

export default function App() {
  const [session, setSession] = useState(() => {
    const savedSession = localStorage.getItem('userSession');
    return savedSession ? JSON.parse(savedSession) : null;
  });

  useEffect(() => {
    if (session) {
      localStorage.setItem('userSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('userSession');
    }
  }, [session]);

  const handleLogin = ({ user, role }) => {
    if (!user || !role) {
      console.error('Invalid login credentials');
      return;
    }
    setSession({ user, role });
  };

  const handleLogout = () => {
    setSession(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/admin" element={
          session?.role === "admin" ? <AdminHome user={session?.user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />
        } />
        <Route path="/employee" element={
          session?.role === "employee" ? <EmployeeHome user={session?.user} onLogout={handleLogout} /> : <Login onLogin={handleLogin} />
        } />
      </Routes>
      {/* Redirect to dashboard after login */}
      {session && session.role === "admin" && window.location.pathname === "/" && (window.location.replace("/admin"), null)}
      {session && session.role === "employee" && window.location.pathname === "/" && (window.location.replace("/employee"), null)}
    </Router>
  );
}
