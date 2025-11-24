/**
 * Journal Entry Storage
 * In-memory storage for journal entries (replace with database in production)
 */

import { JournalingMode, JournalingResponse } from '../journaling/JournalingPrompts';

export interface StoredJournalEntry {
  id: string;
  userId: string;
  mode: JournalingMode;
  entry: string;
  reflection: JournalingResponse;
  timestamp: string;
  element?: string;
}

class JournalStorage {
  private entries: Map<string, StoredJournalEntry[]>;

  constructor() {
    this.entries = new Map();
  }

  addEntry(entry: StoredJournalEntry): void {
    const userEntries = this.entries.get(entry.userId) || [];
    userEntries.push(entry);
    this.entries.set(entry.userId, userEntries);
  }

  getEntries(userId: string, filters?: {
    mode?: JournalingMode;
    symbol?: string;
    archetype?: string;
    emotion?: string;
    startDate?: Date;
    endDate?: Date;
  }): StoredJournalEntry[] {
    let userEntries = this.entries.get(userId) || [];

    if (filters) {
      if (filters.mode) {
        userEntries = userEntries.filter(e => e.mode === filters.mode);
      }
      if (filters.symbol) {
        userEntries = userEntries.filter(e =>
          e.reflection.symbols.includes(filters.symbol!)
        );
      }
      if (filters.archetype) {
        userEntries = userEntries.filter(e =>
          e.reflection.archetypes.includes(filters.archetype!)
        );
      }
      if (filters.emotion) {
        userEntries = userEntries.filter(e =>
          e.reflection.emotionalTone === filters.emotion
        );
      }
      if (filters.startDate) {
        userEntries = userEntries.filter(e =>
          new Date(e.timestamp) >= filters.startDate!
        );
      }
      if (filters.endDate) {
        userEntries = userEntries.filter(e =>
          new Date(e.timestamp) <= filters.endDate!
        );
      }
    }

    return userEntries.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getEntry(userId: string, entryId: string): StoredJournalEntry | undefined {
    const userEntries = this.entries.get(userId) || [];
    return userEntries.find(e => e.id === entryId);
  }

  deleteEntry(userId: string, entryId: string): boolean {
    const userEntries = this.entries.get(userId) || [];
    const index = userEntries.findIndex(e => e.id === entryId);
    if (index !== -1) {
      userEntries.splice(index, 1);
      this.entries.set(userId, userEntries);
      return true;
    }
    return false;
  }

  getUserStats(userId: string): {
    totalEntries: number;
    modeDistribution: Record<JournalingMode, number>;
    last7Days: number;
    last30Days: number;
  } {
    const userEntries = this.entries.get(userId) || [];
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const modeDistribution: Record<JournalingMode, number> = {
      free: 0,
      dream: 0,
      emotional: 0,
      shadow: 0,
      direction: 0
    };

    let last7Days = 0;
    let last30Days = 0;

    userEntries.forEach(entry => {
      modeDistribution[entry.mode]++;
      const entryDate = new Date(entry.timestamp);
      if (entryDate >= sevenDaysAgo) last7Days++;
      if (entryDate >= thirtyDaysAgo) last30Days++;
    });

    return {
      totalEntries: userEntries.length,
      modeDistribution,
      last7Days,
      last30Days
    };
  }
}

export const journalStorage = new JournalStorage();