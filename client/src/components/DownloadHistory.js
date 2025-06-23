import React, { useEffect, useState } from 'react';
import api from '../api';

export default function DownloadHistory({ token }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const isValidHistory = Array.isArray(history);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await api.get('/download-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setHistory(Array.isArray(res) ? res : (Array.isArray(res.data) ? res.data : []));
      } catch (err) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [token]);

  if (loading) return <div>Loading download history...</div>;
  if (!isValidHistory || history.length === 0) return <div>No downloads yet.</div>;

  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="overflow-x-auto">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">File</th>
              <th className="p-2 border">Access Code</th>
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Email</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, i) => (
              <tr key={i} className="border-b">
                <td className="p-2 border">{h.fileId?.originalname || 'Deleted'}</td>
                <td className="p-2 border">{h.fileId?.accessCode || '-'}</td>
                <td className="p-2 border">{new Date(h.downloadedAt).toLocaleString()}</td>
                <td className="p-2 border">{h.email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
