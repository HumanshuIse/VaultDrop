import React, { useEffect } from "react";

export default function LightDarkToggle({ darkMode, setDarkMode }) {
  // Ensure the html class is updated globally
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode((prev) => !prev)}
      className={`relative w-16 h-8 rounded-full border-2 border-blue-300 dark:border-gray-700 shadow-xl transition-colors duration-300 focus:outline-none bg-gradient-to-r ${
        darkMode ? "from-blue-900 to-gray-900" : "from-blue-100 to-yellow-100"
      } flex items-center`}
      aria-label="Toggle dark mode"
      style={{ minWidth: 64, minHeight: 32 }}
    >
      {/* Sun/Clouds (left) */}
      <span className={`absolute left-2 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${darkMode ? "opacity-0" : "opacity-100"}`}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="5" fill="#FFD700" />
          <ellipse cx="17" cy="17" rx="3" ry="2" fill="#bae6fd" />
        </svg>
      </span>
      {/* Moon/Stars (right) */}
      <span className={`absolute right-2 top-1/2 -translate-y-1/2 transition-opacity duration-300 ${darkMode ? "opacity-100" : "opacity-0"}`}>
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" fill="#fff" />
          <circle cx="17" cy="7" r="1" fill="#fff" />
          <circle cx="19" cy="10" r="0.5" fill="#fff" />
        </svg>
      </span>
      {/* Animated toggle circle */}
      <span
        className={`absolute top-1/2 -translate-y-1/2 left-0.5 transition-transform duration-300 w-7 h-7 rounded-full shadow-lg bg-white dark:bg-gray-800 border border-blue-200 dark:border-gray-700 flex items-center justify-center ${
          darkMode ? "translate-x-8" : "translate-x-0"
        }`}
        style={{ zIndex: 2 }}
      >
        {darkMode ? (
          <svg className="w-4 h-4 text-blue-900" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="5" />
          </svg>
        )}
      </span>
    </button>
  );
}
