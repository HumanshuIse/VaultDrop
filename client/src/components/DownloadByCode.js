import React, { useState } from 'react';

const API_URL = 'http://localhost:5000';

const DownloadByCode = () => {
  const [accessCode, setAccessCode] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const token = localStorage.getItem('token');

  const handleRequestOtp = async () => {
    setError('');
    setOtp('');
    try {
      const res = await fetch(`${API_URL}/request-download-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, accessCode })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(2);
      } else {
        setError(data.message || 'Failed to request OTP');
      }
    } catch (err) {
      setError('Network error.');
    }
  };

  const handleVerifyOtp = async () => {
    setError('');
    setVerifying(true);
    try {
      const res = await fetch(`${API_URL}/verify-download-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email, accessCode, otp })
      });
      const data = await res.json();
      if (res.ok) {
        setStep(3);
      } else {
        setError(data.message || 'OTP verification failed');
      }
    } catch (err) {
      setError('Network error.');
    }
    setVerifying(false);
  };

  const handleDownload = async () => {
    setError('');
    setDownloading(true);
    try {
      const res = await fetch(`${API_URL}/file/${accessCode}?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || 'Download failed');
        setDownloading(false);
        return;
      }
      const disposition = res.headers.get('Content-Disposition');
      let filename = 'downloaded_file';
      if (disposition && disposition.indexOf('filename=') !== -1) {
        filename = disposition.split('filename=')[1].replace(/"/g, '');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Download failed');
    }
    setDownloading(false);
  };

  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="min-h-screen flex items-center justify-center bg-[linear-gradient(135deg,_#e9ecef_0%,_#f8fafc_100%)] relative overflow-hidden">
        {/* Subtle lock icon watermark background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 select-none flex items-center justify-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Watermark" className="w-96 h-96 mx-auto" />
        </div>
        <div className="max-w-md mx-auto bg-white border border-slate-200 shadow-md rounded-2xl p-8 w-full relative z-10 flex flex-col items-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold mb-4 text-center text-slate-800">Download File by Access Code</h2>
          {step === 1 && (
            <>
              <input
                className="border border-slate-300 p-2 mb-4 w-full rounded"
                placeholder="Enter Access Code"
                value={accessCode}
                onChange={e => setAccessCode(e.target.value)}
              />
              <input
                className="border border-slate-300 p-2 mb-4 w-full rounded"
                placeholder="Enter Your Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
              <button
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-4 rounded transition duration-150"
                onClick={handleRequestOtp}
                disabled={!accessCode || !email}
              >
                Request OTP
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <input
                className="border border-slate-300 p-2 mb-4 w-full rounded"
                placeholder="Enter OTP"
                value={otp}
                onChange={e => setOtp(e.target.value)}
              />
              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded transition duration-150"
                onClick={handleVerifyOtp}
                disabled={!otp || verifying}
              >
                {verifying ? 'Verifying...' : 'Verify OTP'}
              </button>
            </>
          )}
          {step === 3 && (
            <button
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2 px-4 rounded transition duration-150"
              onClick={handleDownload}
              disabled={downloading}
            >
              {downloading ? 'Downloading...' : 'Download File'}
            </button>
          )}
          {error && <div className="text-red-600 mt-2 text-center">{error}</div>}
        </div>
      </div>
    </div>
  );
};

export default DownloadByCode;