import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h2>JWT Auth App</h2>
        </div>

        <div className="navbar-menu">
          <div className="navbar-user">
            <span className="user-avatar">👤</span>
            <span className="user-name">{user?.name}</span>
          </div>

          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
