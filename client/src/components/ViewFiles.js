import React, { useEffect, useState } from 'react';
import { useNotification } from './NotificationProvider';
import FilePreviewModal from './FilePreviewModal';
import Pagination from './Pagination';
import ShareFileModal from './ShareFileModal';

const ViewFiles = () => {
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [previewFile, setPreviewFile] = useState(null);
  const [shareFile, setShareFile] = useState(null);
  const token = localStorage.getItem('token');
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchFiles = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/my-files?page=${page}&limit=10`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        const data = await res.json();
        if (res.ok) {
          // Defensive: handle both array and object responses
          if (Array.isArray(data)) {
            setFiles(data);
            setTotalPages(1);
          } else {
            setFiles(Array.isArray(data.files) ? data.files : []);
            setTotalPages(data.totalPages || 1);
          }
        } else {
          showNotification(data.message || "Could not load files", 'error');
          setFiles([]);
        }
      } catch (err) {
        showNotification('Fetch error', 'error');
        setFiles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, [token, page, showNotification]);

  // Download handler with Authorization header
  const handleDownload = async (file) => {
    try {
      const res = await fetch(`http://localhost:5000/file/${file.accessCode}?email=your_email@example.com`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showNotification(data.message || 'Download failed', 'error');
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.originalname;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showNotification('Download started', 'success');
    } catch (err) {
      showNotification('Download failed', 'error');
    }
  };

  // Delete handler
  const handleDelete = async (file) => {
    if (!window.confirm(`Delete file '${file.originalname}'? This cannot be undone.`)) return;
    try {
      const res = await fetch(`http://localhost:5000/file/${file._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setFiles(files.filter(f => f._id !== file._id));
        showNotification('File deleted', 'success');
      } else {
        showNotification(data.message || 'Delete failed', 'error');
      }
    } catch (err) {
      showNotification('Delete failed', 'error');
    }
  };

  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-blue-50 to-white relative overflow-hidden">
        {/* Subtle shield/arrow watermark background */}
        <div className="absolute inset-0 pointer-events-none opacity-10 select-none flex items-center justify-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Watermark" className="w-96 h-96 mx-auto" />
        </div>
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 shadow-xl rounded-2xl p-8 w-full relative z-10 flex flex-col items-center">
          <img src="/vaultdrop-logo6.svg" alt="VaultDrop Logo" className="w-16 h-16 mb-2" />
          <h2 className="text-2xl font-bold mb-4 text-center text-blue-900">My Uploaded Files</h2>
          {loading ? (
            <div>Loading...</div>
          ) : !files || files.length === 0 ? (
            <p className="text-blue-700 text-center">No files uploaded yet.</p>
          ) : (
            <>
              <ul className="space-y-3 w-full">
                {files.map(file => (
                  <li key={file._id} className="border p-4 rounded-lg flex flex-col md:flex-row md:items-center md:justify-between bg-blue-50 dark:bg-gray-800">
                    <div>
                      <p><span className="font-semibold">Name:</span> {file.originalname}</p>
                      <p><span className="font-semibold">Access Code:</span> <span className="text-blue-700">{file.accessCode}</span></p>
                      <p><span className="font-semibold">Expires:</span> {new Date(file.expiresAt).toLocaleString()}</p>
                    </div>
                    <div className="flex flex-col gap-2 md:flex-row md:items-center">
                      <button
                        onClick={() => setPreviewFile(file)}
                        className="mt-3 md:mt-0 bg-gray-500 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDownload(file)}
                        className="mt-3 md:mt-0 bg-blue-700 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => setShareFile(file)}
                        className="mt-3 md:mt-0 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150"
                      >
                        Share
                      </button>
                      <button
                        onClick={() => handleDelete(file)}
                        className="mt-3 md:mt-0 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg transition duration-150"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
        <FilePreviewModal open={!!previewFile} onClose={() => setPreviewFile(null)} file={previewFile} token={token} />
        <ShareFileModal open={!!shareFile} onClose={() => setShareFile(null)} file={shareFile} token={token} />
      </div>
    </div>
  );
};

export default ViewFiles;
