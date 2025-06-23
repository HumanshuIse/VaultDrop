import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:5000';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const Profile = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${API_URL}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setNewEmail(data.email || '');
        } else {
          setError(data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('Network error.');
      }
      setLoading(false);
    };
    fetchProfile();
  }, [token, navigate]);

  const handleUpdate = async () => {
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ firstName, lastName, email: newEmail, password: password || undefined })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully.');
        setPassword('');
      } else {
        setError(data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    setDeleting(true);
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_URL}/profile`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('Account deleted. Logging out...');
        localStorage.removeItem('token');
        setTimeout(() => { window.location.href = '/'; }, 1500);
      } else {
        setError(data.message || 'Failed to delete account');
      }
    } catch (err) {
      setError('Network error.');
    }
    setDeleting(false);
  };

  if (loading) return <div className="text-center mt-8">Loading...</div>;

  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300 flex items-center justify-center">
      <div className="absolute inset-0 pointer-events-none opacity-10 select-none flex items-center justify-center">
        <img src="/vaultdrop-logo6.svg" alt="VaultDrop Watermark" className="w-96 h-96 mx-auto" />
      </div>
      <div className="bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 shadow-xl rounded-2xl p-8 flex flex-col items-center w-full max-w-lg mx-4 relative z-10">
        <img src="/vaultdrop-logo6.svg" alt="VaultDrop Logo" className="w-16 h-16 mb-2" />
        <h2 className="text-2xl font-bold mb-2 text-blue-900 dark:text-blue-200 text-center tracking-tight">{getGreeting()}, {firstName}!</h2>
        <p className="text-center text-blue-700 dark:text-blue-300 mb-6 font-medium">Manage your VaultDrop account details below.</p>
        <div className="w-full mb-4">
          <label className="block mb-1 font-semibold text-blue-800 dark:text-blue-200">First Name:</label>
          <input
            className="border border-blue-200 dark:border-gray-700 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-100"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
          />
        </div>
        <div className="w-full mb-4">
          <label className="block mb-1 font-semibold text-blue-800 dark:text-blue-200">Last Name:</label>
          <input
            className="border border-blue-200 dark:border-gray-700 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-100"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
          />
        </div>
        <div className="w-full mb-4">
          <label className="block mb-1 font-semibold text-blue-800 dark:text-blue-200">Email:</label>
          <input
            className="border border-blue-200 dark:border-gray-700 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-100"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
          />
        </div>
        <div className="w-full mb-4">
          <label className="block mb-1 font-semibold text-blue-800 dark:text-blue-200">New Password:</label>
          <input
            className="border border-blue-200 dark:border-gray-700 p-2 w-full rounded-lg focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 bg-white dark:bg-gray-800 text-blue-900 dark:text-blue-100"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Leave blank to keep current password"
          />
        </div>
        <button
          className="w-full bg-blue-700 dark:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-900"
          onClick={handleUpdate}
          disabled={!firstName || !lastName || !newEmail || loading}
        >
          Update Profile
        </button>
        <button
          className="w-full bg-blue-100 dark:bg-red-900 text-red-600 dark:text-red-200 font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150 focus:outline-none focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900"
          onClick={handleDelete}
          disabled={deleting}
        >
          {deleting ? 'Deleting...' : 'Delete Account'}
        </button>
        {message && <div className="text-green-600 dark:text-green-300 mt-3 text-center font-semibold">{message}</div>}
        {error && <div className="text-red-600 dark:text-red-300 mt-3 text-center font-semibold">{error}</div>}
      </div>
    </div>
  );
};

export default Profile;
