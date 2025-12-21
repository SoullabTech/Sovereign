'use client';
import React, { useState } from 'react';

export default function RefreshButton() {
  const [loading, setLoading] = useState(false);
  const handleRefresh = async () => {
    setLoading(true);
    const start = performance.now();
    await fetch('/api/analytics/refresh');
    const duration = performance.now() - start;
    alert(`Refreshed in ${duration.toFixed(0)} ms`);
    setLoading(false);
  };
  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm hover:bg-indigo-700 disabled:opacity-60"
    >
      {loading ? 'Refreshing…' : 'Refresh'}
    </button>
  );
}
