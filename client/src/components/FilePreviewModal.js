import React, { useState, useEffect } from 'react';

const API_URL = 'http://localhost:5000';

export default function FilePreviewModal({ open, onClose, file, token }) {
  const [error, setError] = useState(false);
  const [previewSrc, setPreviewSrc] = useState(null);
  useEffect(() => {
    if (!open || !file) return;
    setError(false);
    setPreviewSrc(null);
    const ext = file.originalname.split('.').pop().toLowerCase();
    const url = `${API_URL}/preview/${file._id}`;
    // Only fetch for image, text, or PDF
    if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg", "pdf", "txt", "md", "csv", "log"].includes(ext)) {
      fetch(url, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Preview fetch failed');
          if (["pdf"].includes(ext)) return res.blob();
          if (["txt", "md", "csv", "log"].includes(ext)) return res.text();
          return res.blob();
        })
        .then(data => {
          if (["pdf", "jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext)) {
            setPreviewSrc(URL.createObjectURL(data));
          } else if (["txt", "md", "csv", "log"].includes(ext)) {
            setPreviewSrc(data);
          }
        })
        .catch(() => setError(true));
    }
  }, [open, file, token]);

  if (!open || !file) return null;
  const ext = file.originalname.split('.').pop().toLowerCase();

  let content;
  if (["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext)) {
    content = previewSrc ? (
      <img src={previewSrc} alt={file.originalname} className="max-h-[70vh] max-w-full" />
    ) : error ? (
      <div className="text-red-600">Failed to load preview.</div>
    ) : (
      <div>Loading preview...</div>
    );
  } else if (ext === "pdf") {
    content = previewSrc ? (
      <iframe src={previewSrc} title="PDF Preview" className="w-full h-[70vh]" />
    ) : error ? (
      <div className="text-red-600">Failed to load preview.</div>
    ) : (
      <div>Loading preview...</div>
    );
  } else if (["txt", "md", "csv", "log"].includes(ext)) {
    content = previewSrc ? (
      <pre className="w-full h-[70vh] bg-white text-black overflow-auto p-2 border rounded">{previewSrc}</pre>
    ) : error ? (
      <div className="text-red-600">Failed to load preview.</div>
    ) : (
      <div>Loading preview...</div>
    );
  } else {
    content = <div className="p-4">No preview available for this file type.</div>;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-700 hover:text-black">&times;</button>
        <div className="p-4 border-b font-semibold">{file.originalname}</div>
        <div className="p-4 flex justify-center items-center">{content}</div>
      </div>
    </div>
  );
}
