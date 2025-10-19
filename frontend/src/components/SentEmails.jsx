import React, { useEffect, useState } from "react";
import '../App.css';
import EmailAttachments from "./EmailAttachments";
const SentEmails = ({ currentUser }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadSent = async () => {
    try {
      const appPassword = localStorage.getItem("appPassword");
      const res = await fetch(
        `http://localhost:8080/api/emails/sent-imap?user=${encodeURIComponent(currentUser)}&appPassword=${encodeURIComponent(appPassword)}`
      );

      if (!res.ok) throw new Error("Failed to fetch sent emails");
      const data = await res.json();
      // Optional: only show emails sent by current user
      const filtered = data.filter(e => e.from === currentUser);
      setEmails(filtered);
    } catch (err) {
      console.error("Error fetching sent emails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSent();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📤 Sent Mail</h2>

      {loading ? (
        <p>Loading...</p>
      ) : emails.length === 0 ? (
        <p>No sent emails found.</p>
      ) : (
        <ul className="space-y-4">
          {emails.map((email, index) => (
            <li
              key={index}
              className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <p className="text-sm text-gray-500 mb-1">
                <strong>From:</strong> {email.from}
              </p>
              <p className="text-sm text-gray-500 mb-1">
                <strong>To:</strong> {email.to}
              </p>
              <p className="font-semibold mb-1">{email.subject}</p>
              <p className="text-gray-700 whitespace-pre-line">{email.body}</p>

              <EmailAttachments attachments={email.attachments} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SentEmails;
