import React, { useEffect, useState } from 'react';
import api from '../api';

export default function DarkModeToggle({ token, initial, setDarkMode }) {
  const [dark, setDarkLocal] = useState(initial);
  useEffect(() => {
    setDarkLocal(initial);
  }, [initial]);
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const handleToggle = async () => {
    setDarkLocal(d => {
      const newDark = !d;
      document.documentElement.classList.toggle('dark', newDark);
      if (setDarkMode) setDarkMode(newDark);
      return newDark;
    });
    try {
      await api.put('/profile/darkmode', { darkMode: !dark }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
  };

  return (
    <button
      className="px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
      onClick={handleToggle}
      title="Toggle dark mode"
    >
      {dark ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}
