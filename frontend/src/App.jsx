import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Navbar from "./components/Navbar";
import Inbox from "./components/Inbox";
import SentEmails from "./components/SentEmails";
import SendMail from "./components/SendMail";
import './App.css';


const App = () => {
  const currentUser = localStorage.getItem("currentUser");

  if (!currentUser) {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    );
  }

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/inbox" element={<Inbox currentUser={currentUser} />} />
        <Route path="/sent" element={<SentEmails currentUser={currentUser} />} />
        <Route path="/compose" element={<SendMail currentUser={currentUser} />} />
        <Route path="*" element={<Navigate to="/inbox" />} />
      </Routes>
    </Router>
  );
};

export default App;
