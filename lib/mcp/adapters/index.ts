/**
 * MCP Adapters for MAIA-SOVEREIGN
 *
 * Adapters wrap MCP servers with MAIA-specific functionality:
 * - Consciousness integration
 * - Memory lattice event generation
 * - Type-safe data access
 */

// Apple Health
export {
  AppleHealthAdapter,
  getAppleHealthAdapter,
  resetAppleHealthAdapter,
  type HealthMetricsSummary,
  type ConsciousnessHealthCorrelation,
  type HeartRateReading,
  type RespiratoryReading,
} from './AppleHealthAdapter';

// Obsidian
export {
  ObsidianAdapter,
  getObsidianAdapter,
  resetObsidianAdapter,
  type VaultStats,
  type NoteContext,
  type KnowledgeQuery,
  type KnowledgeResult,
} from './ObsidianAdapter';

// Calendar
export {
  CalendarAdapter,
  getCalendarAdapter,
  resetCalendarAdapter,
  type DaySchedule,
  type TimeBlock,
  type WeekOverview,
  type UpcomingContext,
} from './CalendarAdapter';

// Notion
export {
  NotionAdapter,
  getNotionAdapter,
  resetNotionAdapter,
  type WorkspaceStats,
  type PageContext,
  type ProjectQuery,
  type ProjectResult,
  type TaskItem,
} from './NotionAdapter';

// Beads
export {
  BeadsAdapter,
  getBeadsAdapter,
  resetBeadsAdapter,
  type WorkspaceStatus,
  type TaskQuery,
  type TaskResult,
  type TaskLoad,
} from './BeadsAdapter';

// Ganglion/OpenBCI
export {
  GanglionAdapter,
  getGanglionAdapter,
  resetGanglionAdapter,
  type DeviceStatus,
  type EEGSession,
  type ConsciousnessState,
} from './GanglionAdapter';
