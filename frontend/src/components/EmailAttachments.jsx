import React, { useState } from "react";

function EmailAttachments({ attachments }) {
  const [previewFile, setPreviewFile] = useState(null);

  if (!attachments || attachments.length === 0) return null;

  // Helper to determine preview type
  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext)) return "image";
    if (["txt", "md", "json", "csv", "log"].includes(ext)) return "text";
    return "other";
  };

  return (
    <div className="mt-3">
      <p className="font-medium">📎 Attachments:</p>
      <ul className="list-disc list-inside">
        {attachments.map((file, i) => (
          <li key={i}>
            <button
              className="text-blue-600 underline hover:text-blue-800 cursor-pointer bg-transparent border-none p-0"
              onClick={() => setPreviewFile(file)}
              type="button"
            >
              {file}
            </button>
          </li>
        ))}
      </ul>

      {previewFile && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded max-w-3xl max-h-full overflow-auto">
            <button
              className="mb-2 px-3 py-1 bg-red-600 text-white rounded"
              onClick={() => setPreviewFile(null)}
              type="button"
            >
              Close
            </button>

            {getFileType(previewFile) === "image" && (
              <img
                src={`http://localhost:8080/api/emails/uploads/${previewFile}`}
                alt={previewFile}
                className="max-w-full max-h-[80vh]"
              />
            )}

            {getFileType(previewFile) === "text" && (
              <iframe
                src={`http://localhost:8080/api/emails/uploads/${previewFile}`}
                title={previewFile}
                className="w-full h-[80vh]"
                style={{ border: "none" }}
              />
            )}

            {getFileType(previewFile) === "other" && (
              <a
                href={`http://localhost:8080/api/emails/uploads/${previewFile}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Open {previewFile} in new tab
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EmailAttachments;
