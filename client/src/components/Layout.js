import React, { useEffect, useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import LightDarkToggle from "./LightDarkToggle";

const Layout = ({ isLoggedIn, handleLogout, darkMode, setDarkMode, isAdmin }) => {
  const location = useLocation();
  // eslint-disable-next-line no-unused-vars
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    setToken(localStorage.getItem('token'));
  }, [isLoggedIn]);

  return (
    <>
      {location.pathname !== "/" && (
        <nav className="bg-white/80 dark:bg-gray-900/80 shadow-md px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-2xl font-extrabold text-indigo-700 dark:text-indigo-200 tracking-tight hover:text-blue-500 dark:hover:text-blue-300 transition"
            >
              VaultDrop
            </Link>
            {isLoggedIn && (
              <div className="hidden md:flex gap-6 text-base font-medium">
                <Link to="/upload" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Upload</Link>
                <Link to="/files" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">My Files</Link>
                <Link to="/download" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Download by Code</Link>
                <Link to="/history" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Download History</Link>
                {isAdmin && <Link to="/admin" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Admin</Link>}
              </div>
            )}
          </div>
          <div className="flex gap-4 items-center">
            <LightDarkToggle darkMode={darkMode} setDarkMode={setDarkMode} />
            {isLoggedIn ? (
              <>
                <Link to="/profile" className="hover:text-indigo-600 dark:hover:text-indigo-300 transition">Profile</Link>
                <button onClick={handleLogout} className="px-4 py-1 rounded-lg bg-red-500 dark:bg-red-700 text-white font-semibold hover:bg-red-600 dark:hover:bg-red-800 transition">Logout</button>
              </>
            ) : (
              <>
                <Link to="/register" className="px-4 py-1 rounded-lg border border-indigo-600 dark:border-indigo-300 text-indigo-700 dark:text-indigo-200 font-semibold hover:bg-indigo-50 dark:hover:bg-gray-800 transition">Register</Link>
                <Link to="/login" className="px-4 py-1 rounded-lg bg-indigo-600 dark:bg-indigo-800 text-white font-semibold hover:bg-indigo-700 dark:hover:bg-indigo-900 transition">Login</Link>
              </>
            )}
          </div>
        </nav>
      )}
      <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
        <Outlet />
      </div>
    </>
  );
};

export default Layout;
