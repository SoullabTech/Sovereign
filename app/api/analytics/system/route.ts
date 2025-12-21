import { NextResponse } from 'next/server';
import os from 'os';

export async function GET() {
  const mem = process.memoryUsage();
  return NextResponse.json({
    system: {
      process: { uptime_hours: (process.uptime()/3600).toFixed(2) },
      memory: { rss: mem.rss, heapUsed: mem.heapUsed },
      database: { status: 'healthy' },
      hostname: os.hostname(),
      timestamp: new Date().toISOString(),
    },
  });
}
