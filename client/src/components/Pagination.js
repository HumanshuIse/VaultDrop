import React from 'react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="font-sans bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          Prev
        </button>
        <span>Page {page} of {totalPages}</span>
        <button
          className="px-2 py-1 rounded bg-gray-200 disabled:opacity-50"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
        </button>
      </div>
    </div>
  );
}
