/**
 * MCP (Model Context Protocol) Type Definitions for MAIA-SOVEREIGN
 *
 * Bidirectional MCP layer:
 * - Client: Consume external MCP servers (Apple Health, Calendar, Obsidian, etc.)
 * - Server: Expose AIN engine as MCP server for third-party apps
 */

// ============================================================================
// MCP Protocol Types
// ============================================================================

export type MCPTransport = 'stdio' | 'http' | 'sse';

export interface MCPServerConfig {
  name: string;
  transport: MCPTransport;
  enabled: boolean;
  command?: string;           // For stdio transport
  args?: string[];            // For stdio transport
  url?: string;               // For http/sse transport
  apiKey?: string;            // Optional authentication
  env?: Record<string, string>;
  timeout?: number;           // Connection timeout in ms
  retries?: number;           // Retry attempts on failure
}

export interface MCPClientConfig {
  appleHealth: MCPServerConfig;
  calendar: MCPServerConfig;
  obsidian: MCPServerConfig;
  notion: MCPServerConfig;
  beads: MCPServerConfig;
  ganglion: MCPServerConfig;
}

export interface MCPAINServerConfig {
  enabled: boolean;
  port: number;
  authRequired: boolean;
  apiKeys?: string[];         // Allowed API keys for third-party access
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
}

export interface MCPConfig {
  client: MCPClientConfig;
  server: {
    ain: MCPAINServerConfig;
  };
}

// ============================================================================
// MCP Tool Types
// ============================================================================

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, MCPSchemaProperty>;
    required?: string[];
  };
}

export interface MCPSchemaProperty {
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  enum?: string[];
  items?: MCPSchemaProperty;
  properties?: Record<string, MCPSchemaProperty>;
}

export interface MCPToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPToolResult {
  content: MCPContent[];
  isError?: boolean;
}

export interface MCPContent {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;        // Base64 for images
  mimeType?: string;
  uri?: string;         // For resource references
}

// ============================================================================
// MCP Resource Types
// ============================================================================

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPResourceTemplate {
  uriTemplate: string;
  name: string;
  description?: string;
  mimeType?: string;
}

// ============================================================================
// MCP Connection Types
// ============================================================================

export interface MCPConnection {
  id: string;
  serverName: string;
  transport: MCPTransport;
  status: MCPConnectionStatus;
  connectedAt?: Date;
  lastActivity?: Date;
  tools: MCPTool[];
  resources: MCPResource[];
}

export type MCPConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error'
  | 'reconnecting';

export interface MCPConnectionError {
  serverName: string;
  error: string;
  code?: string;
  timestamp: Date;
  retryCount: number;
}

// ============================================================================
// Data Types for Specific Integrations
// ============================================================================

// Apple Health Data
export interface AppleHealthData {
  type: 'hrv' | 'heartRate' | 'sleep' | 'respiratory' | 'activity';
  value: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  source?: string;
  metadata?: Record<string, unknown>;
}

export interface HRVReading {
  rmssd: number;          // Root Mean Square of Successive Differences (ms)
  timestamp: Date;
  context?: 'resting' | 'active' | 'sleep';
}

export interface SleepSession {
  startTime: Date;
  endTime: Date;
  duration: number;       // Minutes
  stages: {
    rem: number;          // Minutes
    core: number;
    deep: number;
    awake: number;
  };
  quality?: number;       // 0-100
}

// Calendar Data
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  isAllDay: boolean;
  calendar: string;
  attendees?: string[];
  recurring?: boolean;
}

// Obsidian Data
export interface ObsidianNote {
  path: string;
  title: string;
  content: string;
  frontmatter?: Record<string, unknown>;
  tags?: string[];
  links?: string[];
  backlinks?: string[];
  createdAt?: Date;
  modifiedAt?: Date;
}

export interface ObsidianSearchResult {
  path: string;
  title: string;
  excerpt: string;
  score: number;
  matches?: Array<{
    line: number;
    text: string;
  }>;
}

// Notion Data
export interface NotionPage {
  id: string;
  title: string;
  content?: string;
  excerpt?: string;
  properties?: Record<string, unknown>;
  url: string;
  parentType?: 'database' | 'page' | 'workspace';
  parentId?: string;
  createdTime?: Date;
  lastEditedTime?: Date;
}

export interface NotionDatabase {
  id: string;
  title: string;
  url?: string;
  properties: Record<string, NotionPropertySchema>;
  createdTime?: Date;
  lastEditedTime?: Date;
}

export interface NotionPropertySchema {
  type: string;
  name: string;
}

// Beads (Task System) Data
export interface BeadsIssue {
  id: string;
  title: string;
  body?: string;
  status: 'open' | 'in_progress' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  labels?: string[];
  assignee?: string;
  dependencies?: string[];
  blockedBy?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  closedAt?: Date;
  comments?: BeadsComment[];
}

export interface BeadsComment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

// Ganglion/OpenBCI EEG Data
export interface GanglionReading {
  timestamp: Date;
  channels: number[];     // 4 EEG channels
  accelerometer?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface GanglionMetrics {
  focusScore: number;     // 0-100
  meditationScore: number; // 0-100
  alphaPower: number;
  betaPower: number;
  thetaPower: number;
  deltaPower: number;
  gammaPower?: number;
  coherence?: number;      // Inter-hemispheric coherence 0-1
  timestamp: Date;
}

// ============================================================================
// Event Types for Consciousness Integration
// ============================================================================

export interface MCPDataEvent {
  id: string;
  source: keyof MCPClientConfig;
  type: string;
  data: unknown;
  timestamp: Date;
  userId?: string;
  processed: boolean;
}

export interface MCPHealthEvent extends MCPDataEvent {
  source: 'appleHealth' | 'ganglion';
  data: AppleHealthData | GanglionReading | GanglionMetrics;
}

export interface MCPContextEvent extends MCPDataEvent {
  source: 'calendar' | 'obsidian' | 'notion' | 'beads';
  data: CalendarEvent | ObsidianNote | NotionPage | BeadsIssue;
}

// ============================================================================
// AIN MCP Server Types (for third-party exposure)
// ============================================================================

export interface AINQueryInput {
  message: string;
  context?: string;
  awarenessHint?: 'UNCONSCIOUS' | 'PARTIAL' | 'RELATIONAL' | 'INTEGRATED' | 'MASTER';
}

export interface AINQueryOutput {
  response: string;
  sourceMix: Record<string, number>;  // Source weights
  awarenessLevel: string;
  depthMarkers: string[];
}

export interface AINFieldStateOutput {
  coherence: number;
  complexity: number;
  resonance: number;
  evolution: number;
  healing: number;
  timestamp: Date;
}

export interface AINInsightInput {
  topic: string;
  userId?: string;
}

export interface AINInsightOutput {
  insight: string;
  timingGuidance?: string;
  resonanceScore: number;
  collectiveAlignment: number;
}

export interface AINGuidanceInput {
  userId: string;
}

export interface AINGuidanceOutput {
  currentFocus: string;
  nextSteps: string[];
  elementalBalance: Record<string, number>;
  shadowWorkGuidance?: string;
  evolutionPhase: string;
}

export interface AINAwarenessInput {
  text: string;
}

export interface AINAwarenessOutput {
  level: 'UNCONSCIOUS' | 'PARTIAL' | 'RELATIONAL' | 'INTEGRATED' | 'MASTER';
  confidence: number;
  depthMarkers: string[];
  emotionalCharge: number;
  symbolicLanguage: boolean;
  ritualIntent: boolean;
  systemicThinking: boolean;
}

export interface AINStreamInput {
  userId: string;
  metrics: {
    consciousnessLevel: number;
    evolutionVelocity: number;
    integrationDepth: number;
    elementalResonance: Record<string, number>;
    archetypeActivation: string[];
    shadowWorkEngagement: number;
  };
}

export interface AINStreamOutput {
  acknowledged: boolean;
  streamId: string;
  fieldContribution?: number;
}
