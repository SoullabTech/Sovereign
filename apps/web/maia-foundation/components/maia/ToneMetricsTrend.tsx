"use client";

import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent } from "@/components/ui/card";

type ToneMetric = {
  element: string;
  phase: string;
  count: number;
  history: { ts: number; count: number }[];
};

const ELEMENT_COLORS: Record<string, string> = {
  fire: "#ef4444",
  water: "#60a5fa",
  earth: "#22c55e",
  air: "#a78bfa",
  aether: "#fbbf24",
};

export function ToneMetricsTrend() {
  const [metrics, setMetrics] = useState<ToneMetric[]>([]);
  const [filterElement, setFilterElement] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/metrics/tone")
        .then((res) => res.json())
        .then(setMetrics)
        .catch((err) => console.error("Failed to load tone metrics", err));
    }, 5000);

    fetch("/api/metrics/tone")
      .then((res) => res.json())
      .then(setMetrics)
      .catch((err) => console.error("Failed to load tone metrics", err));

    return () => clearInterval(interval);
  }, []);

  const filteredMetrics = filterElement
    ? metrics.filter((m) => m.element === filterElement)
    : metrics;

  const data: any[] = [];
  const allTimestamps = new Set<number>();

  filteredMetrics.forEach((m) => {
    m.history.forEach((h) => allTimestamps.add(h.ts));
  });

  const sortedTimestamps = Array.from(allTimestamps).sort((a, b) => a - b);

  sortedTimestamps.forEach((ts) => {
    const point: any = { time: new Date(ts).toLocaleTimeString() };
    filteredMetrics.forEach((m) => {
      const key = `${m.element}-${m.phase}`;
      const historyPoint = m.history.find((h) => h.ts === ts);
      if (historyPoint) {
        point[key] = historyPoint.count;
      }
    });
    data.push(point);
  });

  const elements = ["fire", "water", "earth", "air", "aether"];

  return (
    <Card className="col-span-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tone Metrics Trend</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setFilterElement(null)}
              className={`px-3 py-1 rounded text-sm ${
                !filterElement ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              All
            </button>
            {elements.map((el) => (
              <button
                key={el}
                onClick={() => setFilterElement(el)}
                className={`px-3 py-1 rounded text-sm capitalize ${
                  filterElement === el ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700"
                }`}
              >
                {el}
              </button>
            ))}
          </div>
        </div>

        {data.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No tone metrics recorded yet. Start a conversation with MAIA to see data.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              {filteredMetrics.map((m) => {
                const key = `${m.element}-${m.phase}`;
                return (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={ELEMENT_COLORS[m.element] || "#6366f1"}
                    dot={false}
                    strokeWidth={2}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}