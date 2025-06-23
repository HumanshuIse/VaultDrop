import React, { useState } from 'react';
import { uploadFile } from '../api';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please log in.');
      return;
    }
    if (!file) {
      setError('Please select a file.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await uploadFile(file, token);
      setResult(res);
    } catch (err) {
      setError(err.message || 'Upload failed.');
    }
    setLoading(false);
  };

  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white dark:from-gray-800 dark:via-gray-900 dark:to-black relative overflow-hidden">
        {/* Subtle shield/arrow watermark background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 select-none flex items-center justify-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Watermark" className="w-96 h-96 mx-auto" />
        </div>
        <div className="max-w-md mx-auto bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 shadow-xl rounded-2xl p-8 w-full relative z-10 flex flex-col items-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">Upload File</h2>
          <input
            type="file"
            className="block w-full text-sm text-blue-900 border border-blue-200 rounded-lg mb-4 p-2"
            onChange={(e) => setFile(e.target.files[0])}
          />
          {error && <div className="bg-red-100 border border-red-300 text-red-700 rounded p-2 w-full mb-2">{error}</div>}
          <button
            onClick={handleUpload}
            className="w-full bg-blue-700 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-900 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload'}
          </button>
          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 w-full">
              <p className="text-green-700 font-semibold">File uploaded successfully!</p>
              <p><span className="font-semibold">Access Code:</span> <span className="text-blue-700">{result.accessCode}</span></p>
              <p><span className="font-semibold">File Path:</span> <span className="text-blue-900">{result.filePath}</span></p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUpload;
