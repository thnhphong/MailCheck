import React, { useEffect, useState } from "react";
import '../App.css';

const Inbox = ({ currentUser }) => {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadInbox = async () => {
    const appPassword = localStorage.getItem("appPassword");
    try {
      const res = await fetch(
        `http://localhost:8080/api/emails/imap?user=${encodeURIComponent(
          currentUser
        )}&appPassword=${encodeURIComponent(appPassword)}`
      );
      if (!res.ok) throw new Error("Failed to fetch inbox");
      const data = await res.json();
      // Show only emails received by currentUser
      const filtered = data.filter((e) => e.to === currentUser);
      setEmails(filtered);
    } catch (err) {
      console.error("Error fetching inbox:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInbox();
  }, [currentUser]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">📥 Inbox</h2>

      {loading ? (
        <p>Loading...</p>
      ) : emails.length === 0 ? (
        <p>No emails found.</p>
      ) : (
        <ul className="space-y-4">
          {emails.map((email, index) => (
            <li
              key={index}
              className="border border-gray-200 p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm text-gray-500">
                  <strong>From:</strong> {email.from}
                </p>
               
              </div>

              <div className="flex gap-2">
                <p className="font-semibold text-gray-800 mb-1">{email.subject}</p>
                <p className="text-gray-700 whitespace-pre-line">{email.body}</p>
              </div>
              <span className="text-sm text-gray-500 whitespace-nowrap ml-2 text-bold">
                {new Date().toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>

              {email.attachments && email.attachments.length > 0 && (
                <div className="mt-3">
                  <p className="font-medium">📎 Attachments:</p>
                  <ul className="list-disc list-inside">
                    {email.attachments.map((file, i) => (
                      <li key={i}>
                        <a
                          href={`http://localhost:8080/api/emails/uploads/${file}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline hover:text-blue-800"
                        >
                          {file}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Inbox;
