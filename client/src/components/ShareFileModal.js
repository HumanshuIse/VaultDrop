import React, { useState } from 'react';
import { useNotification } from './NotificationProvider';
import api from '../api';

export default function ShareFileModal({ open, onClose, file, token }) {
  const [expiresInMinutes, setExpiresInMinutes] = useState(60);
  const [otpRequired, setOtpRequired] = useState(false);
  const [result, setResult] = useState(null);
  const { showNotification } = useNotification();

  if (!open || !file) return null;

  const handleShare = async () => {
    try {
      const res = await api.post(
        `/share/${file._id}`,
        { expiresInMinutes, otpRequired },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Accept both res.link and res.data.link for robustness
      setResult(res.data || res);
      showNotification('Share link created!', 'success');
    } catch (err) {
      showNotification('Failed to create share link', 'error');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-md w-full relative p-6 border border-blue-100 dark:border-gray-800">
          <button onClick={onClose} className="absolute top-2 right-2 text-gray-700 dark:text-gray-200 hover:text-black dark:hover:text-white text-2xl">&times;</button>
          <div className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Share {file.originalname}</div>
          <div className="mb-2">
            <label className="block mb-1 text-gray-800 dark:text-gray-200">Expires in (minutes):</label>
            <input type="number" min={1} max={1440} value={expiresInMinutes} onChange={e => setExpiresInMinutes(e.target.value)} className="border rounded px-2 py-1 w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-blue-200 dark:border-gray-700" />
          </div>
          <div className="mb-2">
            <label className="inline-flex items-center text-gray-800 dark:text-gray-200">
              <input type="checkbox" checked={otpRequired} onChange={e => setOtpRequired(e.target.checked)} />
              <span className="ml-2">Require OTP</span>
            </label>
          </div>
          <button onClick={handleShare} className="bg-blue-600 dark:bg-blue-700 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 dark:hover:bg-blue-800 transition">Generate Link</button>
          {result && (result.link || (result.data && result.data.link)) && (
            <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-gray-900 dark:text-gray-100">
              <div className="flex items-center gap-2">
                <b>Link:</b>
                <code className="break-all flex-1">{window.location.origin + (result.link || (result.data && result.data.link) || '')}</code>
                <button
                  className="ml-2 px-2 py-1 bg-blue-500 dark:bg-blue-700 text-white rounded hover:bg-blue-600 dark:hover:bg-blue-800 transition text-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.origin + (result.link || (result.data && result.data.link) || ''));
                    showNotification('Link copied to clipboard!', 'success');
                  }}
                  title="Copy link"
                >
                  Copy
                </button>
              </div>
              {result.otp && <div><b>OTP:</b> {result.otp}</div>}
              {result.expiresAt && <div><b>Expires At:</b> {new Date(result.expiresAt).toLocaleString()}</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
