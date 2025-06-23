import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Register from './components/Register';
import Login from './components/Login';
import FileUpload from './components/FileUpload';
import ViewFiles from './components/ViewFiles';
import DownloadByCode from './components/DownloadByCode';
import Profile from './components/Profile';
import LandingPage from './components/LandingPage';
import Layout from './components/Layout';
import { NotificationProvider } from './components/NotificationProvider';
import BrandingLoader from './components/BrandingLoader';
import DownloadHistory from './components/DownloadHistory';
import AdminDashboard from './components/AdminDashboard';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [darkMode, setDarkMode] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const checkToken = () => {
      setIsLoggedIn(!!localStorage.getItem('token'));
    };
    window.addEventListener('storage', checkToken);
    return () => window.removeEventListener('storage', checkToken);
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      if (!token) return;
      try {
        const res = await fetch('http://localhost:5000/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setDarkMode(!!data.darkMode);
          setIsAdmin(!!data.isAdmin);
        }
      } catch {}
    }
    fetchProfile();
  }, [token, isLoggedIn]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setDarkMode(false);
    setIsAdmin(false);
  };

  return (
    <NotificationProvider>
      <BrandingLoader>
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route
              element={<Layout isLoggedIn={isLoggedIn} handleLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode} isAdmin={isAdmin} />}
            >
              <Route path="/upload" element={<FileUpload />} />
              <Route path="/files" element={<ViewFiles />} />
              <Route path="/download" element={<DownloadByCode />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />
              <Route path="/history" element={<DownloadHistory token={token} />} />
              <Route path="/admin" element={<AdminDashboard token={token} />} />
            </Route>
          </Routes>
        </Router>
      </BrandingLoader>
    </NotificationProvider>
  );
}

export default App;
