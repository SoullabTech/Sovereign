"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

type ToneMetric = {
  element: string;
  phase: string;
  count: number;
};

export function ToneMetricsHeatmap() {
  const [metrics, setMetrics] = useState<ToneMetric[]>([]);

  useEffect(() => {
    fetch("/api/metrics/tone")
      .then((res) => res.json())
      .then(setMetrics)
      .catch((err) => console.error("Failed to load tone metrics", err));
  }, []);

  const phases = ["emergence", "integration", "unity"];
  const elements = ["fire", "water", "earth", "air", "aether"];

  const getCount = (element: string, phase: string) => {
    return metrics.find((m) => m.element === element && m.phase === phase)?.count ?? 0;
  };

  const maxCount = Math.max(...metrics.map((m) => m.count), 1);

  return (
    <Card className="col-span-full">
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-4">Tone Metrics Heatmap</h2>
        <div className="grid grid-cols-[120px_repeat(3,1fr)] gap-2">
          <div className="font-semibold text-center text-sm">Element</div>
          {phases.map((p) => (
            <div key={p} className="font-semibold text-center capitalize text-sm">
              {p}
            </div>
          ))}

          {elements.map((el) => (
            <>
              <div key={el} className="font-semibold capitalize text-right pr-2 text-sm flex items-center justify-end">
                {el}
              </div>
              {phases.map((p) => {
                const val = getCount(el, p);
                const intensity = val === 0 ? 0.1 : Math.min(0.3 + (val / maxCount) * 0.7, 1);
                return (
                  <div
                    key={`${el}-${p}`}
                    className="flex items-center justify-center rounded-lg text-white font-medium transition-all hover:scale-105"
                    style={{
                      minHeight: "40px",
                      backgroundColor: val === 0 ? "#e5e7eb" : "#6366f1",
                      opacity: intensity,
                    }}
                  >
                    {val}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}