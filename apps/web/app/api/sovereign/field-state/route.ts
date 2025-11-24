import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

async function checkPM2Status() {
  try {
    const { stdout } = await execAsync('pm2 jlist');
    const processes = JSON.parse(stdout);

    const maiaProcess = processes.find((p: any) => p.name === 'maia-sovereign');
    const tunnelProcess = processes.find((p: any) => p.name === 'cloudflare-tunnel');

    return {
      maia: {
        status: maiaProcess?.pm2_env?.status === 'online' ? 'online' : 'offline',
        uptime: maiaProcess?.pm2_env?.pm_uptime ? formatUptime(Date.now() - maiaProcess.pm2_env.pm_uptime) : 'Unknown',
        memory: maiaProcess?.monit?.memory ? formatMemory(maiaProcess.monit.memory) : 'Unknown',
        cpu: maiaProcess?.monit?.cpu || 0,
        restarts: maiaProcess?.pm2_env?.restart_time || 0,
      },
      tunnel: {
        status: tunnelProcess?.pm2_env?.status === 'online' ? 'online' : 'offline',
        uptime: tunnelProcess?.pm2_env?.pm_uptime ? formatUptime(Date.now() - tunnelProcess.pm2_env.pm_uptime) : 'Unknown',
        connections: 4, // Cloudflare tunnel typically maintains 4 connections
      },
    };
  } catch (error) {
    console.error('PM2 check failed:', error);
    return {
      maia: { status: 'error', uptime: 'Unknown', memory: 'Unknown', cpu: 0, restarts: 0 },
      tunnel: { status: 'error', uptime: 'Unknown', connections: 0 },
    };
  }
}

async function checkDNSStatus() {
  try {
    const { stdout } = await execAsync('nslookup -type=NS soullab.life 8.8.8.8');
    const isCloudflare = stdout.includes('cloudflare.com');

    return {
      status: isCloudflare ? 'propagated' : 'pending',
      nameservers: isCloudflare
        ? ['abby.ns.cloudflare.com', 'bryce.ns.cloudflare.com']
        : ['Checking...'],
    };
  } catch (error) {
    return {
      status: 'error',
      nameservers: ['Error checking DNS'],
    };
  }
}

async function checkOllamaStatus() {
  try {
    const { stdout } = await execAsync('ollama list 2>/dev/null || echo "offline"');
    const hasDeepSeek = stdout.includes('deepseek-r1');

    return {
      status: hasDeepSeek ? 'online' : 'offline',
      model: hasDeepSeek ? 'deepseek-r1:latest' : 'Not loaded',
    };
  } catch (error) {
    return {
      status: 'offline',
      model: 'Ollama not running',
    };
  }
}

async function checkSupabaseStatus() {
  try {
    // Check if Supabase env vars are set
    const hasSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return {
      status: hasSupabase ? 'online' : 'offline',
      url: hasSupabase ? 'Configured' : 'Not configured',
    };
  } catch (error) {
    return {
      status: 'error',
      url: 'Error',
    };
  }
}

async function checkSystemHealth() {
  try {
    // Get system stats
    const { stdout: cpuOutput } = await execAsync('top -l 1 -n 0 | grep "CPU usage"');
    const { stdout: memOutput } = await execAsync('vm_stat | head -n 10');

    // Parse CPU (very rough - you might want to improve this)
    const cpuMatch = cpuOutput.match(/(\d+\.\d+)% user/);
    const cpu = cpuMatch ? parseFloat(cpuMatch[1]) : 0;

    // Parse memory (simplified)
    const memory = 45; // Placeholder - real parsing would be more complex
    const disk = 65; // Placeholder

    return { cpu, memory, disk };
  } catch (error) {
    return { cpu: 0, memory: 0, disk: 0 };
  }
}

async function getRecentLogs() {
  try {
    const logPath = '/Users/soullab/MAIA-PAI/apps/web/logs/pm2-error-0.log';
    if (existsSync(logPath)) {
      const content = await readFile(logPath, 'utf-8');
      const lines = content.split('\n').filter(Boolean);
      return lines.slice(-10); // Last 10 lines
    }
    return [];
  } catch (error) {
    return [];
  }
}

function formatUptime(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
}

function formatMemory(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(0)} MB`;
}

export async function GET() {
  try {
    const [pm2Status, dnsStatus, ollamaStatus, supabaseStatus, systemHealth, recentLogs] = await Promise.all([
      checkPM2Status(),
      checkDNSStatus(),
      checkOllamaStatus(),
      checkSupabaseStatus(),
      checkSystemHealth(),
      getRecentLogs(),
    ]);

    return NextResponse.json({
      maia: pm2Status.maia,
      tunnel: pm2Status.tunnel,
      dns: dnsStatus,
      ollama: ollamaStatus,
      supabase: supabaseStatus,
      system: systemHealth,
      logs: recentLogs,
      lastCheck: new Date().toISOString(),
      sovereignty: {
        level: 'complete',
        dependencies: {
          vercel: false,
          cloudSupabase: false,
          cloudAI: false,
        },
      },
    });
  } catch (error) {
    console.error('Field state check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check field state' },
      { status: 500 }
    );
  }
}
