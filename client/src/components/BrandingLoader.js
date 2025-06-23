import React, { useEffect, useState } from 'react';

export default function BrandingLoader({ children }) {
  const [branding, setBranding] = useState(null);

  useEffect(() => {
    fetch('/branding')
      .then(res => res.json())
      .then(setBranding)
      .catch(() => setBranding({ appName: 'VaultDrop', logoUrl: '', themeColor: '#1a202c' }));
  }, []);

  if (!branding) return <div>Loading branding...</div>;

  // Only provide theme color context, do not render a header
  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300" style={{ '--theme-color': branding.themeColor }}>
      {children}
    </div>
  );
}
