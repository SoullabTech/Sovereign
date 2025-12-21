'use client';
import React, { useEffect, useState } from 'react';

interface HealthData {
  system: { process: { uptime_hours: string }; database: { status: string }; memory: { rss: number } };
}
export default function SystemHealthWidget() {
  const [data, setData] = useState<HealthData | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/analytics/system');
      const json = await res.json();
      setData(json);
    };
    fetchData();
    const id = setInterval(fetchData, 30000);
    return () => clearInterval(id);
  }, []);
  if (!data) return <p>Loading system health…</p>;
  const { uptime_hours } = data.system.process;
  const { status } = data.system.database;
  const { rss } = data.system.memory;
  return (
    <div className="grid grid-cols-3 gap-4 text-sm">
      <div>Uptime: {uptime_hours} h</div>
      <div>DB: {status}</div>
      <div>Memory: {(rss / 1024 / 1024).toFixed(0)} MB</div>
    </div>
  );
}
