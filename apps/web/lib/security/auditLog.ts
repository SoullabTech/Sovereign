import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface AuditLogEntry {
  timestamp: Date;
  userId: string;
  therapistId?: string;
  action: 'access' | 'modify' | 'export' | 'delete' | 'login' | 'logout' | 'auth_attempt' | 'auth_failure';
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  result: 'success' | 'failure';
  reason?: string;
  metadata?: Record<string, any>;
}

interface SerializedAuditEntry extends AuditLogEntry {
  id: string;
  hash: string;
  previousHash?: string;
}

class AuditLogger {
  private logDir: string;
  private currentLogFile: string;
  private lastHash: string | null = null;
  private writeQueue: Promise<void> = Promise.resolve();

  constructor() {
    this.logDir = process.env.AUDIT_LOG_DIR || './audit-logs';
    this.currentLogFile = this.getLogFilePath();
    this.ensureLogDirectory();
  }

  async logAudit(entry: AuditLogEntry): Promise<void> {
    this.writeQueue = this.writeQueue.then(async () => {
      try {
        await this.writeAuditEntry(entry);
      } catch (error) {
        console.error('[AUDIT CRITICAL] Failed to write audit log:', error);
        await this.alertSecurityTeam('Audit logging failure', entry, error);
      }
    });

    return this.writeQueue;
  }

  private async writeAuditEntry(entry: AuditLogEntry): Promise<void> {
    const id = crypto.randomUUID();

    const serializedEntry: SerializedAuditEntry = {
      ...entry,
      id,
      hash: '',
      previousHash: this.lastHash || undefined
    };

    const entryJson = JSON.stringify({
      ...serializedEntry,
      timestamp: entry.timestamp.toISOString()
    });

    serializedEntry.hash = this.hashEntry(entryJson);

    const logLine = JSON.stringify({
      ...serializedEntry,
      timestamp: entry.timestamp.toISOString()
    }) + '\n';

    await this.ensureLogDirectory();
    await fs.appendFile(this.currentLogFile, logLine, 'utf-8');

    this.lastHash = serializedEntry.hash;

    if (process.env.NODE_ENV === 'production') {
      await this.replicateToExternalService(serializedEntry);
    }
  }

  private hashEntry(data: string): string {
    return crypto.createHash('sha256').update(data + (this.lastHash || '')).digest('hex');
  }

  private async ensureLogDirectory(): Promise<void> {
    try {
      await fs.access(this.logDir);
    } catch {
      await fs.mkdir(this.logDir, { recursive: true });
    }
  }

  private getLogFilePath(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `audit-${date}.jsonl`);
  }

  private async replicateToExternalService(entry: SerializedAuditEntry): Promise<void> {
    const endpoint = process.env.AUDIT_LOG_ENDPOINT;

    if (!endpoint) {
      console.warn('[AUDIT WARNING] AUDIT_LOG_ENDPOINT not configured');
      return;
    }

    try {
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('[AUDIT WARNING] Failed to replicate to external service:', error);
    }
  }

  private async alertSecurityTeam(
    subject: string,
    entry: AuditLogEntry,
    error: any
  ): Promise<void> {
    const alertEmail = process.env.SECURITY_ALERT_EMAIL;

    if (!alertEmail) {
      console.error('[AUDIT CRITICAL] SECURITY_ALERT_EMAIL not configured');
      return;
    }

    console.error(`[AUDIT CRITICAL] ${subject}`, {
      entry,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    });
  }

  async queryLogs(filters: {
    userId?: string;
    therapistId?: string;
    startDate: Date;
    endDate: Date;
    action?: string;
    result?: 'success' | 'failure';
  }): Promise<SerializedAuditEntry[]> {
    const logs: SerializedAuditEntry[] = [];

    const files = await this.getLogFilesInRange(filters.startDate, filters.endDate);

    for (const file of files) {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.trim().split('\n');

      for (const line of lines) {
        if (!line) continue;

        const entry: SerializedAuditEntry = JSON.parse(line);
        entry.timestamp = new Date(entry.timestamp);

        if (this.matchesFilters(entry, filters)) {
          logs.push(entry);
        }
      }
    }

    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  private async getLogFilesInRange(startDate: Date, endDate: Date): Promise<string[]> {
    const files: string[] = [];

    try {
      const allFiles = await fs.readdir(this.logDir);

      for (const file of allFiles) {
        if (!file.startsWith('audit-') || !file.endsWith('.jsonl')) continue;

        const dateStr = file.replace('audit-', '').replace('.jsonl', '');
        const fileDate = new Date(dateStr);

        if (fileDate >= startDate && fileDate <= endDate) {
          files.push(path.join(this.logDir, file));
        }
      }
    } catch (error) {
      console.error('[AUDIT ERROR] Failed to read log directory:', error);
    }

    return files;
  }

  private matchesFilters(
    entry: SerializedAuditEntry,
    filters: {
      userId?: string;
      therapistId?: string;
      startDate: Date;
      endDate: Date;
      action?: string;
      result?: 'success' | 'failure';
    }
  ): boolean {
    if (filters.userId && entry.userId !== filters.userId) return false;
    if (filters.therapistId && entry.therapistId !== filters.therapistId) return false;
    if (filters.action && entry.action !== filters.action) return false;
    if (filters.result && entry.result !== filters.result) return false;

    const entryTime = entry.timestamp.getTime();
    if (entryTime < filters.startDate.getTime() || entryTime > filters.endDate.getTime()) {
      return false;
    }

    return true;
  }

  async verifyIntegrity(logFile?: string): Promise<{
    valid: boolean;
    invalidEntries: string[];
    totalEntries: number;
  }> {
    const file = logFile || this.currentLogFile;
    const invalidEntries: string[] = [];
    let totalEntries = 0;
    let previousHash: string | null = null;

    try {
      const content = await fs.readFile(file, 'utf-8');
      const lines = content.trim().split('\n');

      for (const line of lines) {
        if (!line) continue;

        totalEntries++;
        const entry: SerializedAuditEntry = JSON.parse(line);

        if (entry.previousHash !== previousHash) {
          invalidEntries.push(entry.id);
        }

        const { hash, ...dataToHash } = entry;
        const expectedHash = this.hashEntry(JSON.stringify(dataToHash));

        if (hash !== expectedHash) {
          invalidEntries.push(entry.id);
        }

        previousHash = entry.hash;
      }
    } catch (error) {
      console.error('[AUDIT ERROR] Failed to verify integrity:', error);
      return { valid: false, invalidEntries: ['file_error'], totalEntries: 0 };
    }

    return {
      valid: invalidEntries.length === 0,
      invalidEntries,
      totalEntries
    };
  }

  async exportAuditReport(
    filters: {
      userId?: string;
      therapistId?: string;
      startDate: Date;
      endDate: Date;
    },
    format: 'json' | 'csv' = 'json'
  ): Promise<string> {
    const logs = await this.queryLogs(filters);

    if (format === 'csv') {
      return this.logsToCSV(logs);
    }

    return JSON.stringify(logs, null, 2);
  }

  private logsToCSV(logs: SerializedAuditEntry[]): string {
    const headers = [
      'Timestamp',
      'User ID',
      'Therapist ID',
      'Action',
      'Resource',
      'Resource ID',
      'IP Address',
      'User Agent',
      'Result',
      'Reason'
    ].join(',');

    const rows = logs.map(log =>
      [
        log.timestamp.toISOString(),
        log.userId,
        log.therapistId || '',
        log.action,
        log.resource,
        log.resourceId,
        log.ipAddress,
        `"${log.userAgent.replace(/"/g, '""')}"`,
        log.result,
        log.reason || ''
      ].join(',')
    );

    return [headers, ...rows].join('\n');
  }
}

export const auditLogger = new AuditLogger();

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  return auditLogger.logAudit(entry);
}

export async function queryAuditLogs(filters: {
  userId?: string;
  therapistId?: string;
  startDate: Date;
  endDate: Date;
  action?: string;
  result?: 'success' | 'failure';
}) {
  return auditLogger.queryLogs(filters);
}

export async function verifyAuditIntegrity(logFile?: string) {
  return auditLogger.verifyIntegrity(logFile);
}

export async function exportAuditReport(
  filters: {
    userId?: string;
    therapistId?: string;
    startDate: Date;
    endDate: Date;
  },
  format: 'json' | 'csv' = 'json'
): Promise<string> {
  return auditLogger.exportAuditReport(filters, format);
}