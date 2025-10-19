import React, { useState } from "react";
import '../App.css';

const SendMail = ({ currentUser }) => {
  const [email, setEmail] = useState({
    from: currentUser || "thnhphong4869@gmail.com",
    to: "",
    subject: "",
    body: "",
  });

  const [attachments, setAttachments] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmail((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setAttachments(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("from", email.from);
      formData.append("to", email.to);
      formData.append("subject", email.subject);
      formData.append("body", email.body);

      attachments.forEach((file) => formData.append("attachments", file));

      const res = await fetch("http://localhost:8080/api/emails/send", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to send email");
      const data = await res.json();

      setStatus(data.status || "✅ Email sent successfully!");
      setEmail({ ...email, to: "", subject: "", body: "" });
      setAttachments([]);
    } catch (err) {
      console.error("❌ Error sending email:", err);
      setStatus("❌ Failed to send email. Check backend console for details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg mt-10">
      <h2 className="text-3xl font-semibold text-gray-800 mb-6 flex items-center">
        <span className="text-white  mr-2 text-4xl">✉️</span> Compose Email
      </h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* FROM */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            From
          </label>
          <input
            type="email"
            name="from"
            value={email.from}
            readOnly
            className="w-full bg-gray-100 border border-gray-300 rounded-lg p-2 focus:ring-0 cursor-not-allowed"
          />
        </div>

        {/* TO */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            To
          </label>
          <input
            type="email"
            name="to"
            value={email.to}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Recipient email"
          />
        </div>

        {/* SUBJECT */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={email.subject}
            onChange={handleChange}
            required
            className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-400"
            placeholder="Subject of your email"
          />
        </div>

        {/* BODY */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Message
          </label>
          <textarea
            name="body"
            value={email.body}
            onChange={handleChange}
            required
            rows="8"
            className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-400"
            placeholder="Write your message here..."
          />
        </div>

        {/* ATTACHMENTS */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Attachments
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg p-2 bg-gray-50"
          />
          {attachments.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              📎 {attachments.length} file(s) attached
            </p>
          )}
        </div>

        {/* BUTTON */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white font-medium py-2 px-6 rounded-lg shadow hover:bg-blue-700 transition-all ${
              loading ? "opacity-60 cursor-wait" : ""
            }`}
          >
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
      </form>

      {/* STATUS */}
      {status && (
        <p
          className={`mt-5 font-medium text-center ${
            status.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {status}
        </p>
      )}
    </div>
  );
};

export default SendMail;
