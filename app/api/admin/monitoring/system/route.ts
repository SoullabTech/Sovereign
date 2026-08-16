import { NextRequest, NextResponse } from 'next/server';
import os from 'os';
import { execSync } from 'child_process';
import { checkAdminAuth, adminUnauthorized } from '@/lib/admin/adminAuth';

export const dynamic = 'force-dynamic';

interface ContainerInfo {
  name: string;
  status: string;
  healthy: boolean;
}

interface SystemMetrics {
  memory: { used_mb: number; total_mb: number; pct: number };
  cpu: { load1: number; load5: number; load15: number };
  disk: { used_gb: number; total_gb: number; pct: number; available_gb: number } | null;
  containers: ContainerInfo[];
  deploy_age_hours: number | null;
  ollama: { available: boolean; models?: string[] } | null;
  collected_at: string;
}

function getDisk(): SystemMetrics['disk'] {
  try {
    const raw = execSync('df -BG / 2>/dev/null | tail -1', { timeout: 3000 }).toString().trim();
    const parts = raw.split(/\s+/);
    const total_gb = parseInt(parts[1], 10);
    const used_gb = parseInt(parts[2], 10);
    const available_gb = parseInt(parts[3], 10);
    const pct = parseInt(parts[4], 10);
    if (isNaN(total_gb) || isNaN(used_gb)) return null;
    return { used_gb, total_gb, pct, available_gb };
  } catch {
    return null;
  }
}

function getContainers(): ContainerInfo[] {
  try {
    const raw = execSync('docker ps --format "{{.Names}}|{{.Status}}" 2>/dev/null', { timeout: 5000 })
      .toString()
      .trim();
    if (!raw) return [];
    return raw.split('\n').map((line) => {
      const [name, status] = line.split('|');
      const healthy =
        status.includes('(healthy)') || (status.includes('Up') && !status.includes('(unhealthy)'));
      return { name: name ?? '', status: status ?? '', healthy };
    });
  } catch {
    return [];
  }
}

function getDeployAgeHours(): number | null {
  try {
    const raw = execSync('docker inspect maia-sovereign --format "{{.Created}}" 2>/dev/null', {
      timeout: 3000,
    })
      .toString()
      .trim();
    const created = new Date(raw);
    if (isNaN(created.getTime())) return null;
    return Math.round((Date.now() - created.getTime()) / 3_600_000);
  } catch {
    return null;
  }
}

async function getOllama(): Promise<SystemMetrics['ollama']> {
  try {
    const res = await fetch('http://localhost:11434/api/tags', {
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return { available: false };
    const json = (await res.json()) as { models?: Array<{ name: string }> };
    const models = (json.models ?? []).map((m) => m.name);
    return { available: true, models };
  } catch {
    return { available: false };
  }
}

export async function GET(request: NextRequest) {
  // R5 (2026-08-16): verify an admin session before exposing host/container state.
  const auth = await checkAdminAuth(request);
  if (!auth.authed) return adminUnauthorized();

  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  const usedBytes = totalBytes - freeBytes;
  const total_mb = Math.round(totalBytes / 1_048_576);
  const used_mb = Math.round(usedBytes / 1_048_576);

  const [load1, load5, load15] = os.loadavg();
  const [disk, containers, deploy_age_hours, ollama] = await Promise.all([
    Promise.resolve(getDisk()),
    Promise.resolve(getContainers()),
    Promise.resolve(getDeployAgeHours()),
    getOllama(),
  ]);

  const metrics: SystemMetrics = {
    memory: { used_mb, total_mb, pct: Math.round((used_mb / total_mb) * 100) },
    cpu: { load1, load5, load15 },
    disk,
    containers,
    deploy_age_hours,
    ollama,
    collected_at: new Date().toISOString(),
  };

  return NextResponse.json(metrics);
}
