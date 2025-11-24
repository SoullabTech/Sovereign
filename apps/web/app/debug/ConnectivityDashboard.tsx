'use client';

import React, { useEffect, useMemo, useState } from "react";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

type CheckStatus = "idle" | "ok" | "warn" | "fail";

type Result = {
  name: string;
  status: CheckStatus;
  detail?: string;
  latencyMs?: number;
};

const timer = async <T,>(fn: () => Promise<T>): Promise<{ value?: T; ms: number; error?: unknown }> => {
  const t0 = performance.now();
  try {
    const value = await fn();
    return { value, ms: Math.round(performance.now() - t0) };
  } catch (error) {
    return { error, ms: Math.round(performance.now() - t0) };
  }
};

export default function ConnectivityDashboard() {
  const [results, setResults] = useState<Result[]>([]);
  const [running, setRunning] = useState(false);

  // Next.js environment variables (adjusting from Vite style)
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL as string | undefined;
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;
  const ENV = (process.env.NEXT_PUBLIC_ENV_NAME as string | undefined) ?? "unknown";
  const FRONTEND_ORIGIN = (typeof window !== "undefined" && window.location.origin) || undefined;

  const supabase: SupabaseClient | null = useMemo(() => {
    if (!SUPABASE_URL || !SUPABASE_KEY) return null;
    return createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
  }, [SUPABASE_URL, SUPABASE_KEY]);

  const runChecks = async () => {
    if (running) return;
    setRunning(true);
    const out: Result[] = [];

    // 0) Tailwind renders? We just assume if the component styles show.
    out.push({ name: "Tailwind CSS", status: "ok", detail: "Rendered utility classes", latencyMs: 0 });

    // 0.5) Frontend /api/health (Vercel deployment check)
    if (FRONTEND_ORIGIN) {
      const fe = await timer(async () => {
        const res = await fetch(`${FRONTEND_ORIGIN}/api/health`, { cache: "no-store" });
        return { ok: res.ok, status: res.status, json: await res.json(), headers: Array.from(res.headers.entries()) };
      });
      if (fe.error) {
        out.push({ name: "Frontend /api/health (Vercel)", status: "fail", detail: String(fe.error), latencyMs: fe.ms });
      } else if (fe.value) {
        const v = fe.value;
        const vercelId = v.json?.vercel_id || v.headers.find(([k]) => k.toLowerCase() === "x-vercel-id")?.[1];
        out.push({
          name: "Frontend /api/health (Vercel)",
          status: v.ok ? "ok" : "fail",
          detail: `HTTP ${v.status}${vercelId ? ` • ${vercelId}` : ""}`,
          latencyMs: fe.ms,
        });
      }
    } else {
      out.push({ name: "Frontend /api/health (Vercel)", status: "warn", detail: "No window.origin" });
    }

    // 0.6) Vercel CDN cache check (optional static asset test)
    if (FRONTEND_ORIGIN) {
      const asset = await timer(async () => {
        const res = await fetch(`${FRONTEND_ORIGIN}/favicon.ico?ts=${Date.now()}`, { cache: "no-store" });
        return { ok: res.ok, headers: Array.from(res.headers.entries()) };
      });
      const cacheHeader = asset.value?.headers.find(([k]) => k.toLowerCase() === "x-vercel-cache")?.[1];
      out.push({
        name: "Vercel CDN cache",
        status: asset.error ? "warn" : (asset.value?.ok ? "ok" : "fail"),
        detail: cacheHeader || "n/a",
        latencyMs: asset.ms,
      });
    }

    // 1) Backend health
    if (BACKEND_URL) {
      const { value, error, ms } = await timer(async () => {
        const res = await fetch(new URL("/health", BACKEND_URL).toString(), { cache: "no-store" });
        const text = await res.text();
        return { ok: res.ok, status: res.status, text, headers: Array.from(res.headers.entries()) };
      });
      if (error) {
        out.push({ name: "Backend /health", status: "fail", detail: String(error), latencyMs: ms });
      } else if (value) {
        const servedBy = value.headers.find(([k]) => k.toLowerCase() === "server");
        const providerHint = servedBy ? `server=${servedBy[1]}` : "";
        out.push({
          name: "Backend /health",
          status: value.ok ? "ok" : "fail",
          detail: `HTTP ${value.status} ${providerHint}`.trim(),
          latencyMs: ms,
        });
      }
    } else {
      out.push({ name: "Backend /health", status: "warn", detail: "NEXT_PUBLIC_BACKEND_URL not set" });
    }

    // 2) Supabase – do three tiny probes
    if (supabase) {
      // 2a) Auth: get anon session (should be null but reachable)
      const authProbe = await timer(() => supabase.auth.getSession());
      out.push({
        name: "Supabase Auth",
        status: authProbe.error ? "fail" : "ok",
        detail: authProbe.error ? String(authProbe.error) : "reachable",
        latencyMs: authProbe.ms,
      });

      // 2b) DB RPC health_check (optional). If you created a function
      // create or skip based on error code.
      const rpcProbe = await timer(async () => {
        // change to your own RPC or a tiny public table query
        const { data, error } = await supabase.rpc("health_check");
        if (error) throw error;
        return data;
      });
      out.push({
        name: "Supabase RPC health_check",
        status: rpcProbe.error ? "warn" : "ok",
        detail: rpcProbe.error ? "Missing RPC or RLS denied (optional)" : String(rpcProbe.value),
        latencyMs: rpcProbe.ms,
      });

      // 2c) Storage ping (optional, requires a public bucket or RLS rule)
      const storageProbe = await timer(async () => {
        const res = await supabase.storage.listBuckets();
        if ("error" in res && res.error) throw res.error;
        return (res as any).data?.length ?? 0;
      });
      out.push({
        name: "Supabase Storage",
        status: storageProbe.error ? "warn" : "ok",
        detail: storageProbe.error ? "List buckets requires service role or policy" : `${storageProbe.value} buckets`,
        latencyMs: storageProbe.ms,
      });
    } else {
      out.push({ name: "Supabase", status: "warn", detail: "NEXT_PUBLIC_SUPABASE_URL/KEY not set" });
    }

    setResults(out);
    setRunning(false);
  };

  useEffect(() => {
    runChecks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pill = (s: CheckStatus) =>
    ({
      ok: "bg-green-100 text-green-800 ring-green-300",
      warn: "bg-yellow-100 text-yellow-800 ring-yellow-300",
      fail: "bg-red-100 text-red-800 ring-red-300",
      idle: "bg-gray-100 text-gray-800 ring-gray-300",
    }[s]);

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Connectivity Dashboard</h2>
        <button
          onClick={runChecks}
          disabled={running}
          className="px-3 py-1.5 rounded-xl bg-black text-white disabled:opacity-50 shadow-sm"
        >
          {running ? "Checking…" : "Re-run checks"}
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-3">env: {ENV}</div>

      <ul className="space-y-2">
        {results.map((r) => (
          <li key={r.name} className="rounded-2xl border border-gray-200 p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-gray-600 whitespace-pre-wrap">{r.detail}</div>
            </div>
            <div className="flex items-center space-x-3">
              {typeof r.latencyMs === "number" && (
                <span className="text-xs text-gray-500 tabular-nums">{r.latencyMs} ms</span>
              )}
              <span className={`px-2 py-0.5 rounded-full text-xs ring-1 ${pill(r.status)}`}>{r.status}</span>
            </div>
          </li>
        ))}
      </ul>

      {/* Tailwind visual sanity strip */}
      <div className="mt-6 grid grid-cols-4 gap-2">
        <div className="h-2 rounded-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500" />
        <div className="h-2 rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-orange-500" />
        <div className="h-2 rounded-full bg-gradient-to-r from-amber-500 via-lime-500 to-teal-500" />
        <div className="h-2 rounded-full bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-500" />
      </div>

      <div className="mt-3 text-xs text-gray-500">
        Tip: if Backend shows WARN and you&apos;re on Vercel/Render, check env vars and that /health is mounted.
      </div>
    </div>
  );
}