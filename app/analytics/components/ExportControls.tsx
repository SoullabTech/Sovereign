'use client';
import React from 'react';

export default function ExportControls() {
  const download = (path: string) => window.open(path, '_blank');
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => download('/api/analytics/export/csv')}
        className="bg-emerald-600 text-white px-2 py-1 rounded text-sm"
      >
        CSV Export
      </button>
      <button
        onClick={() => download('/api/analytics/export/research')}
        className="bg-indigo-600 text-white px-2 py-1 rounded text-sm"
      >
        Research Export
      </button>
    </div>
  );
}
