import React, { useEffect, useState } from 'react';
import api from '../api';

export default function AdminDashboard({ token }) {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [tab, setTab] = useState('analytics');

  useEffect(() => {
    async function fetchData() {
      try {
        const [a, u, f] = await Promise.all([
          api.get('/admin/analytics', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/admin/users', { headers: { Authorization: `Bearer ${token}` } }),
          api.get('/admin/files', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        setAnalytics(a.data);
        setUsers(u.data);
        setFiles(f.data);
      } catch {}
    }
    fetchData();
  }, [token]);

  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="p-4">
        <div className="mb-4 flex gap-2">
          <button onClick={() => setTab('analytics')} className={tab==='analytics' ? 'font-bold underline' : ''}>Analytics</button>
          <button onClick={() => setTab('users')} className={tab==='users' ? 'font-bold underline' : ''}>Users</button>
          <button onClick={() => setTab('files')} className={tab==='files' ? 'font-bold underline' : ''}>Files</button>
        </div>
        {tab === 'analytics' && analytics && (
          <div>
            <div>Total Users: {analytics.totalUsers}</div>
            <div>Total Files: {analytics.totalFiles}</div>
            <div>Total Downloads: {analytics.totalDownloads}</div>
            <div className="mt-2">Recent Downloads:
              <ul className="list-disc ml-6">
                {analytics.recentDownloads.map((d, i) => (
                  <li key={i}>{d.fileId?.originalname || 'Deleted'} - {new Date(d.downloadedAt).toLocaleString()}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {tab === 'users' && (
          <table className="min-w-full border mt-2">
            <thead><tr className="bg-gray-100"><th className="p-2 border">Name</th><th className="p-2 border">Email</th><th className="p-2 border">Joined</th></tr></thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i} className="border-b"><td className="p-2 border">{u.firstName} {u.lastName}</td><td className="p-2 border">{u.email}</td><td className="p-2 border">{new Date(u.createdAt).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        )}
        {tab === 'files' && (
          <table className="min-w-full border mt-2">
            <thead><tr className="bg-gray-100"><th className="p-2 border">File</th><th className="p-2 border">Owner</th><th className="p-2 border">Size</th><th className="p-2 border">Uploaded</th></tr></thead>
            <tbody>
              {files.map((f, i) => (
                <tr key={i} className="border-b"><td className="p-2 border">{f.originalname}</td><td className="p-2 border">{f.owner}</td><td className="p-2 border">{(f.size/1024).toFixed(1)} KB</td><td className="p-2 border">{new Date(f.createdAt).toLocaleString()}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
