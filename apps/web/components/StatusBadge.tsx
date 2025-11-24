"use client";

import { useEffect, useMemo, useState } from "react";

type Status = "green" | "amber" | "red";

export default function StatusBadge({
  url = `${process.env.NEXT_PUBLIC_BACKEND_URL ?? ""}/api/v1/converse/health`,
  intervalMs = 30_000,
  className = ""
}: { url?: string; intervalMs?: number; className?: string }) {
  const [status, setStatus] = useState<Status>("red");
  const [label, setLabel] = useState<string>("offline");

  const color = useMemo(() => ({
    green: "bg-green-500",
    amber: "bg-amber-500",
    red:   "bg-red-500"
  }[status]), [status]);

  async function ping() {
    try {
      const r = await fetch(url, { cache: "no-store" });
      if (!r.ok) throw new Error(String(r.status));
      const j = await r.json();
      const features = (j.features ?? j.data?.features ?? []) as string[];
      const ok = j.success !== false && (j.service === "conversational" || j.pipeline);
      setStatus(ok ? (features?.length ? "green" : "amber") : "amber");
      setLabel(ok ? "online" : "degraded");
    } catch {
      setStatus("red"); setLabel("offline");
    }
  }

  useEffect(() => { ping(); const id = setInterval(ping, intervalMs); return () => clearInterval(id); }, [url, intervalMs]);

  return (
    <div className={`inline-flex items-center gap-2 text-sm ${className}`} aria-live="polite">
      <span className={`h-2.5 w-2.5 rounded-full ${color} animate-pulse`} />
      <span>Maya: {label}</span>
    </div>
  );
}