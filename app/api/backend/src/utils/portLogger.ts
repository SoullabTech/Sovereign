// backend/src/utils/portLogger.ts
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const LOG_DIR = path.resolve(process.cwd(), "..", "logs");
const LOG_FILE = path.join(LOG_DIR, "port-history.jsonl");
const ALERTS_FILE = path.join(LOG_DIR, "port-alerts.jsonl");

export interface PortLogEntry {
  timestamp: string;
  requested: number;
  actual: number;
  reason?: string;
  process?: string;
  pid?: number;
  duration?: number; // How long the port was blocked
}

export interface PortAlert {
  timestamp: string;
  type: 'conflict' | 'frequent_conflict' | 'new_blocker';
  details: any;
}

export function logPortUsage(entry: PortLogEntry) {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    const line = JSON.stringify(entry);
    fs.appendFileSync(LOG_FILE, line + "\n", "utf8");
    
    // Check if we should alert
    checkPortAlerts(entry);
  } catch (err) {
    console.error("❌ Failed to write port log:", err);
  }
}

export function checkPortAlerts(entry: PortLogEntry) {
  if (entry.requested !== entry.actual) {
    // Port conflict detected
    const alert: PortAlert = {
      timestamp: entry.timestamp,
      type: 'conflict',
      details: {
        requested: entry.requested,
        actual: entry.actual,
        blockedBy: entry.process || 'unknown',
        pid: entry.pid
      }
    };
    
    // Log alert
    fs.appendFileSync(ALERTS_FILE, JSON.stringify(alert) + "\n", "utf8");
    
    // Check for frequent conflicts
    const recentConflicts = getRecentConflicts(24); // Last 24 hours
    if (recentConflicts.length > 5) {
      const frequentAlert: PortAlert = {
        timestamp: entry.timestamp,
        type: 'frequent_conflict',
        details: {
          count: recentConflicts.length,
          mostCommonBlocker: getMostCommonBlocker(recentConflicts),
          suggestion: 'Consider changing default port or removing blocking service'
        }
      };
      fs.appendFileSync(ALERTS_FILE, JSON.stringify(frequentAlert) + "\n", "utf8");
    }
  }
}

export function getRecentConflicts(hoursAgo: number): PortLogEntry[] {
  try {
    if (!fs.existsSync(LOG_FILE)) return [];
    
    const cutoff = Date.now() - (hoursAgo * 60 * 60 * 1000);
    const lines = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(l => l.trim());
    
    return lines
      .map(line => {
        try {
          return JSON.parse(line);
        } catch {
          return null;
        }
      })
      .filter(entry => 
        entry && 
        new Date(entry.timestamp).getTime() > cutoff &&
        entry.requested !== entry.actual
      );
  } catch {
    return [];
  }
}

function getMostCommonBlocker(conflicts: PortLogEntry[]): string {
  const blockers = conflicts
    .map(c => c.process || 'unknown')
    .filter(p => p !== 'unknown');
  
  if (blockers.length === 0) return 'unknown';
  
  const counts = blockers.reduce((acc, blocker) => {
    acc[blocker] = (acc[blocker] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])[0][0];
}

// Get port usage statistics
export function getPortStats() {
  try {
    if (!fs.existsSync(LOG_FILE)) return null;
    
    const lines = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(l => l.trim());
    const entries = lines.map(line => {
      try {
        return JSON.parse(line);
      } catch {
        return null;
      }
    }).filter(e => e !== null) as PortLogEntry[];
    
    const portCounts: Record<number, number> = {};
    const blockerCounts: Record<string, number> = {};
    let conflictCount = 0;
    
    entries.forEach(entry => {
      portCounts[entry.actual] = (portCounts[entry.actual] || 0) + 1;
      
      if (entry.requested !== entry.actual) {
        conflictCount++;
        const blocker = entry.process || 'unknown';
        blockerCounts[blocker] = (blockerCounts[blocker] || 0) + 1;
      }
    });
    
    return {
      totalRuns: entries.length,
      conflictCount,
      conflictRate: (conflictCount / entries.length * 100).toFixed(1) + '%',
      portUsage: portCounts,
      topBlockers: Object.entries(blockerCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5),
      recentEntries: entries.slice(-10).reverse()
    };
  } catch (err) {
    console.error("Failed to get port stats:", err);
    return null;
  }
}

// Detect what's using a port
export function detectPortProcess(port: number): { process?: string, pid?: number, command?: string } {
  try {
    const lsofOutput = execSync(`lsof -i :${port} -sTCP:LISTEN 2>/dev/null || true`, { encoding: 'utf8' });
    const lines = lsofOutput.split('\n').filter(line => line && !line.startsWith('COMMAND'));
    
    if (lines.length > 0) {
      const parts = lines[0].split(/\s+/);
      return {
        process: parts[0],
        pid: parseInt(parts[1]),
        command: parts.slice(8).join(' ')
      };
    }
  } catch {
    // Fallback to netstat if lsof fails
    try {
      const netstatOutput = execSync(`netstat -anp tcp 2>/dev/null | grep ":${port}.*LISTEN" || true`, { encoding: 'utf8' });
      if (netstatOutput) {
        return { process: 'unknown (use lsof for details)' };
      }
    } catch {}
  }
  
  return {};
}