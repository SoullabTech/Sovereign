/**
 * Soulprint File Writer
 * Writes markdown files to disk in the AIN directory structure
 */

import fs from 'fs/promises';
import path from 'path';

export class SoulprintFileWriter {
  private baseDir: string;

  constructor(baseDir: string = './AIN') {
    this.baseDir = baseDir;
  }

  /**
   * Ensure directory structure exists
   */
  private async ensureDirectory(dirPath: string): Promise<void> {
    try {
      await fs.mkdir(dirPath, { recursive: true });
    } catch (error) {
      // Directory might already exist, that's okay
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
        throw error;
      }
    }
  }

  /**
   * Write soulprint markdown file
   */
  async writeSoulprint(userId: string, markdown: string): Promise<string> {
    const userDir = path.join(this.baseDir, 'Users', userId);
    await this.ensureDirectory(userDir);

    const filePath = path.join(userDir, 'Soulprint.md');
    await fs.writeFile(filePath, markdown, 'utf-8');

    console.log(`✅ Soulprint written: ${filePath}`);
    return filePath;
  }

  /**
   * Write individual symbol file
   */
  async writeSymbol(
    userId: string,
    symbolName: string,
    markdown: string
  ): Promise<string> {
    const symbolsDir = path.join(this.baseDir, 'Users', userId, 'Symbols');
    await this.ensureDirectory(symbolsDir);

    // Sanitize symbol name for file system
    const safeName = symbolName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(symbolsDir, `${safeName}.md`);
    await fs.writeFile(filePath, markdown, 'utf-8');

    console.log(`✅ Symbol written: ${filePath}`);
    return filePath;
  }

  /**
   * Write milestone file
   */
  async writeMilestone(
    userId: string,
    milestoneType: string,
    date: Date,
    markdown: string
  ): Promise<string> {
    const milestonesDir = path.join(this.baseDir, 'Users', userId, 'Milestones');
    await this.ensureDirectory(milestonesDir);

    const dateStr = date.toISOString().split('T')[0];
    const filePath = path.join(milestonesDir, `${milestoneType}-${dateStr}.md`);
    await fs.writeFile(filePath, markdown, 'utf-8');

    console.log(`✅ Milestone written: ${filePath}`);
    return filePath;
  }

  /**
   * Write timeline file
   */
  async writeTimeline(userId: string, markdown: string): Promise<string> {
    const userDir = path.join(this.baseDir, 'Users', userId);
    await this.ensureDirectory(userDir);

    const filePath = path.join(userDir, 'Timeline.md');
    await fs.writeFile(filePath, markdown, 'utf-8');

    console.log(`✅ Timeline written: ${filePath}`);
    return filePath;
  }

  /**
   * Write drift alert file
   */
  async writeDriftAlert(
    userId: string,
    date: Date,
    markdown: string
  ): Promise<string> {
    const alertsDir = path.join(this.baseDir, 'Users', userId, 'Alerts');
    await this.ensureDirectory(alertsDir);

    const dateStr = date.toISOString().split('T')[0];
    const filePath = path.join(alertsDir, `${dateStr}.md`);
    await fs.writeFile(filePath, markdown, 'utf-8');

    console.log(`✅ Drift alert written: ${filePath}`);
    return filePath;
  }

  /**
   * Write field dashboard
   */
  async writeFieldDashboard(markdown: string): Promise<string> {
    const dashboardsDir = path.join(this.baseDir, 'Dashboards');
    await this.ensureDirectory(dashboardsDir);

    const filePath = path.join(dashboardsDir, 'Field_Dashboard.md');
    await fs.writeFile(filePath, markdown, 'utf-8');

    console.log(`✅ Field dashboard written: ${filePath}`);
    return filePath;
  }

  /**
   * Write dev tracker
   */
  async writeDevTracker(markdown: string): Promise<string> {
    const devDir = path.join(this.baseDir, 'Dev');
    await this.ensureDirectory(devDir);

    const filePath = path.join(devDir, 'MAIA_System_Tracker.md');
    await fs.writeFile(filePath, markdown, 'utf-8');

    console.log(`✅ Dev tracker written: ${filePath}`);
    return filePath;
  }

  /**
   * Append to timeline (for incremental updates)
   */
  async appendToTimeline(userId: string, entry: string): Promise<string> {
    const userDir = path.join(this.baseDir, 'Users', userId);
    await this.ensureDirectory(userDir);

    const filePath = path.join(userDir, 'Timeline.md');

    try {
      // Try to append to existing file
      await fs.appendFile(filePath, `\n\n${entry}`, 'utf-8');
    } catch (error) {
      // File doesn't exist, create it
      const header = `# Soul Journey Timeline: ${userId}\n\n---\n\n`;
      await fs.writeFile(filePath, header + entry, 'utf-8');
    }

    console.log(`✅ Timeline entry appended: ${filePath}`);
    return filePath;
  }

  /**
   * Read existing soulprint (for updates)
   */
  async readSoulprint(userId: string): Promise<string | null> {
    const filePath = path.join(this.baseDir, 'Users', userId, 'Soulprint.md');

    try {
      return await fs.readFile(filePath, 'utf-8');
    } catch (error) {
      return null;
    }
  }

  /**
   * List all user directories
   */
  async listUsers(): Promise<string[]> {
    const usersDir = path.join(this.baseDir, 'Users');

    try {
      const entries = await fs.readdir(usersDir, { withFileTypes: true });
      return entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
    } catch (error) {
      return [];
    }
  }

  /**
   * Get stats for a user directory
   */
  async getUserStats(userId: string): Promise<{
    hasSoulprint: boolean;
    symbolCount: number;
    milestoneCount: number;
    alertCount: number;
    hasTimeline: boolean;
  }> {
    const userDir = path.join(this.baseDir, 'Users', userId);

    const stats = {
      hasSoulprint: false,
      symbolCount: 0,
      milestoneCount: 0,
      alertCount: 0,
      hasTimeline: false
    };

    try {
      // Check soulprint
      await fs.access(path.join(userDir, 'Soulprint.md'));
      stats.hasSoulprint = true;
    } catch {}

    try {
      // Check timeline
      await fs.access(path.join(userDir, 'Timeline.md'));
      stats.hasTimeline = true;
    } catch {}

    try {
      // Count symbols
      const symbolsDir = path.join(userDir, 'Symbols');
      const symbols = await fs.readdir(symbolsDir);
      stats.symbolCount = symbols.filter(f => f.endsWith('.md')).length;
    } catch {}

    try {
      // Count milestones
      const milestonesDir = path.join(userDir, 'Milestones');
      const milestones = await fs.readdir(milestonesDir);
      stats.milestoneCount = milestones.filter(f => f.endsWith('.md')).length;
    } catch {}

    try {
      // Count alerts
      const alertsDir = path.join(userDir, 'Alerts');
      const alerts = await fs.readdir(alertsDir);
      stats.alertCount = alerts.filter(f => f.endsWith('.md')).length;
    } catch {}

    return stats;
  }

  /**
   * Write users index file
   */
  async writeUsersIndex(markdown: string): Promise<string> {
    const usersDir = path.join(this.baseDir, 'Users');
    await this.ensureDirectory(usersDir);

    const filePath = path.join(usersDir, 'index.md');
    await fs.writeFile(filePath, markdown, 'utf-8');

    console.log(`✅ Users index written: ${filePath}`);
    return filePath;
  }

  /**
   * Write sync log entry
   */
  async writeSyncLog(markdown: string): Promise<string> {
    const logsDir = path.join(this.baseDir, 'Logs');
    await this.ensureDirectory(logsDir);

    const filePath = path.join(logsDir, 'sync-log.md');

    try {
      await fs.appendFile(filePath, `\n\n${markdown}`, 'utf-8');
    } catch (error) {
      const header = `# Sync Log\n\n*Auto-generated sync activity log*\n\n---\n\n`;
      await fs.writeFile(filePath, header + markdown, 'utf-8');
    }

    return filePath;
  }
}

const getVaultPath = (): string => {
  const vaultPath = process.env.OBSIDIAN_VAULT_PATH;
  if (vaultPath) {
    return `${vaultPath}/AIN`;
  }
  return './AIN';
};

export const soulprintFileWriter = new SoulprintFileWriter(getVaultPath());