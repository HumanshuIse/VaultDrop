import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'info', duration = 3000) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), duration);
  }, []);

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
        {children}
        {notification && (
          <div className={`fixed bottom-4 right-4 z-50 px-4 py-2 rounded shadow-lg text-white transition-all ${
            notification.type === 'success' ? 'bg-green-600' : notification.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
          }`}>
            {notification.message}
          </div>
        )}
      </div>
    </NotificationContext.Provider>
  );
}
