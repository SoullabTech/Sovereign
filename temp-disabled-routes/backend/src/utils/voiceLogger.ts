/**
 * Voice Startup Logger - Audit trail for voice engine initialization
 */

import * as fs from 'fs';
import * as path from 'path';
import { format } from 'date-fns';

interface VoiceStartupEvent {
  timestamp: string;
  engine: string;
  mode: 'local' | 'api' | 'fallback';
  success: boolean;
  latencyMs?: number;
  fallbackReason?: string;
  error?: string;
  metadata?: Record<string, any>;
}

class VoiceStartupLogger {
  private logDir: string;
  private logFile: string;

  constructor() {
    // Create logs directory if it doesn't exist
    this.logDir = path.join(process.cwd(), 'logs');
    this.logFile = path.join(this.logDir, 'voice-startup.log');
    
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log a voice startup event
   */
  logStartup(event: Partial<VoiceStartupEvent>) {
    const logEntry: VoiceStartupEvent = {
      timestamp: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS'),
      engine: event.engine || 'unknown',
      mode: event.mode || 'api',
      success: event.success !== false,
      ...event
    };

    // Format as JSON line
    const logLine = JSON.stringify(logEntry) + '\n';

    // Append to log file
    try {
      fs.appendFileSync(this.logFile, logLine);
      
      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[VoiceStartup] ${this.formatReadableLog(logEntry)}`);
      }
    } catch (error) {
      console.error('Failed to write voice startup log:', error);
    }
  }

  /**
   * Log successful voice initialization
   */
  logSuccess(engine: string, latencyMs: number, metadata?: Record<string, any>) {
    this.logStartup({
      engine,
      mode: engine === 'sesame' && process.env.SESAME_SELF_HOSTED === 'true' ? 'local' : 'api',
      success: true,
      latencyMs,
      metadata
    });
  }

  /**
   * Log voice initialization failure
   */
  logFailure(engine: string, error: string, fallbackReason?: string) {
    this.logStartup({
      engine,
      mode: 'fallback',
      success: false,
      error,
      fallbackReason
    });
  }

  /**
   * Log voice engine test
   */
  logTest(testResult: {
    engine: string;
    success: boolean;
    latencyMs?: number;
    audioGenerated?: boolean;
    playbackAttempted?: boolean;
  }) {
    this.logStartup({
      ...testResult,
      mode: 'api',
      metadata: {
        test: true,
        audioGenerated: testResult.audioGenerated,
        playbackAttempted: testResult.playbackAttempted
      }
    });
  }

  /**
   * Get recent startup events
   */
  getRecentEvents(limit: number = 100): VoiceStartupEvent[] {
    try {
      if (!fs.existsSync(this.logFile)) {
        return [];
      }

      const content = fs.readFileSync(this.logFile, 'utf-8');
      const lines = content.split('\n').filter(line => line.trim());
      
      return lines
        .slice(-limit)
        .map(line => {
          try {
            return JSON.parse(line);
          } catch {
            return null;
          }
        })
        .filter(Boolean) as VoiceStartupEvent[];
    } catch (error) {
      console.error('Failed to read voice startup logs:', error);
      return [];
    }
  }

  /**
   * Get startup statistics
   */
  getStatistics() {
    const events = this.getRecentEvents(1000);
    
    const stats = {
      total: events.length,
      successful: events.filter(e => e.success).length,
      failed: events.filter(e => !e.success).length,
      byEngine: {} as Record<string, number>,
      avgLatency: {} as Record<string, number>,
      lastStartup: events[events.length - 1]
    };

    // Calculate per-engine stats
    events.forEach(event => {
      if (!stats.byEngine[event.engine]) {
        stats.byEngine[event.engine] = 0;
      }
      stats.byEngine[event.engine]++;

      // Calculate average latency
      if (event.success && event.latencyMs) {
        if (!stats.avgLatency[event.engine]) {
          stats.avgLatency[event.engine] = event.latencyMs;
        } else {
          // Running average
          const count = stats.byEngine[event.engine];
          stats.avgLatency[event.engine] = 
            (stats.avgLatency[event.engine] * (count - 1) + event.latencyMs) / count;
        }
      }
    });

    return stats;
  }

  /**
   * Format log entry for readable console output
   */
  private formatReadableLog(entry: VoiceStartupEvent): string {
    const icon = entry.success ? '✅' : '❌';
    const engine = entry.engine.toUpperCase();
    const mode = entry.mode === 'local' ? '(LOCAL)' : '(API)';
    
    let message = `${icon} ${engine} ${mode}`;
    
    if (entry.latencyMs) {
      message += ` - ${entry.latencyMs}ms`;
    }
    
    if (entry.error) {
      message += ` - Error: ${entry.error}`;
    }
    
    if (entry.fallbackReason) {
      message += ` - Fallback: ${entry.fallbackReason}`;
    }

    return message;
  }

  /**
   * Export logs for analysis
   */
  exportLogs(outputPath?: string): string {
    const events = this.getRecentEvents(10000);
    const stats = this.getStatistics();
    
    const report = {
      generated: new Date().toISOString(),
      summary: stats,
      events: events
    };

    const jsonOutput = JSON.stringify(report, null, 2);
    
    if (outputPath) {
      fs.writeFileSync(outputPath, jsonOutput);
      return outputPath;
    }

    return jsonOutput;
  }
}

// Export singleton instance
export const voiceStartupLogger = new VoiceStartupLogger();