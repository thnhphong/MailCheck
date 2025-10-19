import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import '../App.css';
const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = localStorage.getItem("currentUser");

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/");
  };

  const linkClass = (path) =>
    `px-4 py-2 rounded-md text-sm font-medium ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100"
    }`;

  return (
    <nav className="bg-white shadow-md p-4 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h1
          onClick={() => navigate("/inbox")}
          className="text-xl font-bold text-blue-600 cursor-pointer"
        >
          MailCheck
        </h1>
      </div>

      <div className="flex gap-2">
        <Link to="/inbox" className={linkClass("/inbox")}>
          Inbox
        </Link>
        <Link to="/sent" className={linkClass("/sent")}>
          Sent
        </Link>
        <Link to="/compose" className={linkClass("/compose")}>
          Compose
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {currentUser && (
          <p className="text-gray-600 text-sm">{currentUser}</p>
        )}
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
