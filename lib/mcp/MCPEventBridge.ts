/**
 * MCP Event Bridge
 *
 * Connects MCP data events to the EventBus service.
 * Enables consciousness systems to react to MCP data in real-time.
 */

import { EventEmitter } from 'events';
import type { DomainEvent, IEventBusService } from '../core/ServiceTokens';
import type { MCPClientManager } from './MCPClientManager';
import type { MCPDataEvent, MCPConnectionError } from './types';

// MCP-specific event types
export const MCPEventTypes = {
  // Connection lifecycle
  SERVER_CONNECTED: 'mcp.server.connected',
  SERVER_DISCONNECTED: 'mcp.server.disconnected',
  SERVER_ERROR: 'mcp.server.error',
  STATUS_CHANGE: 'mcp.status.change',

  // Data events
  DATA_RECEIVED: 'mcp.data.received',
  TOOL_CALLED: 'mcp.tool.called',
  RESOURCE_READ: 'mcp.resource.read',

  // Health data (Apple Health)
  HEALTH_HRV: 'mcp.health.hrv',
  HEALTH_SLEEP: 'mcp.health.sleep',
  HEALTH_HEART_RATE: 'mcp.health.heartRate',
  HEALTH_ACTIVITY: 'mcp.health.activity',

  // Calendar data
  CALENDAR_EVENTS: 'mcp.calendar.events',
  CALENDAR_AVAILABILITY: 'mcp.calendar.availability',

  // Knowledge data (Obsidian)
  KNOWLEDGE_NOTE: 'mcp.knowledge.note',
  KNOWLEDGE_SEARCH: 'mcp.knowledge.search',
  KNOWLEDGE_LINK: 'mcp.knowledge.link',

  // Task data (Beads)
  TASK_LIST: 'mcp.task.list',
  TASK_UPDATE: 'mcp.task.update',
  TASK_CREATE: 'mcp.task.create',

  // Brain data (Ganglion)
  BRAIN_METRICS: 'mcp.brain.metrics',
  BRAIN_STATE: 'mcp.brain.state',
  BRAIN_FOCUS: 'mcp.brain.focus',

  // Workspace data (Notion)
  WORKSPACE_PAGE: 'mcp.workspace.page',
  WORKSPACE_TASK: 'mcp.workspace.task',

  // Initialization
  INITIALIZED: 'mcp.initialized',
  SHUTDOWN: 'mcp.shutdown',
} as const;

export type MCPEventType = (typeof MCPEventTypes)[keyof typeof MCPEventTypes];

export interface MCPDomainEvent extends DomainEvent {
  type: MCPEventType;
  source: string;
}

/**
 * Bridges MCP events to EventBus
 */
export class MCPEventBridge extends EventEmitter {
  private eventBus: IEventBusService;
  private manager: MCPClientManager;
  private subscribed = false;

  constructor(manager: MCPClientManager, eventBus: IEventBusService) {
    super();
    this.manager = manager;
    this.eventBus = eventBus;
  }

  /**
   * Start bridging MCP events to EventBus
   */
  subscribe(): void {
    if (this.subscribed) return;

    // Connection lifecycle events
    this.manager.on('serverConnected', (info: unknown) => {
      this.publishEvent(MCPEventTypes.SERVER_CONNECTED, { connection: info });
    });

    this.manager.on('serverDisconnected', (serverName: string, code: number) => {
      this.publishEvent(MCPEventTypes.SERVER_DISCONNECTED, { serverName, code });
    });

    this.manager.on('serverError', (error: MCPConnectionError) => {
      this.publishEvent(MCPEventTypes.SERVER_ERROR, { error });
    });

    this.manager.on('statusChange', (serverName: string, status: string) => {
      this.publishEvent(MCPEventTypes.STATUS_CHANGE, { serverName, status });
    });

    // Data events
    this.manager.on('data', (event: MCPDataEvent) => {
      this.handleDataEvent(event);
    });

    // Initialization events
    this.manager.on('initialized', (stats: unknown) => {
      this.publishEvent(MCPEventTypes.INITIALIZED, { stats });
    });

    this.manager.on('shutdown', () => {
      this.publishEvent(MCPEventTypes.SHUTDOWN, {});
    });

    this.subscribed = true;
    console.log('[MCPEventBridge] Subscribed to MCP events');
  }

  /**
   * Stop bridging events
   */
  unsubscribe(): void {
    if (!this.subscribed) return;

    this.manager.removeAllListeners();
    this.subscribed = false;
    console.log('[MCPEventBridge] Unsubscribed from MCP events');
  }

  /**
   * Handle incoming data events and route to specific event types
   */
  private handleDataEvent(event: MCPDataEvent): void {
    // Convert MCPDataEvent to Record for EventBus compatibility
    const eventData: Record<string, unknown> = {
      id: event.id,
      source: event.source,
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
      userId: event.userId,
      processed: event.processed,
    };

    // Publish generic data event
    this.publishEvent(MCPEventTypes.DATA_RECEIVED, eventData);

    // Route to specific event types based on source and tool
    const specificType = this.getSpecificEventType(event);
    if (specificType) {
      this.publishEvent(specificType, eventData);
    }
  }

  /**
   * Determine specific event type from data event
   */
  private getSpecificEventType(event: MCPDataEvent): MCPEventType | null {
    const { source, type: toolName } = event;

    // Apple Health events
    if (source === 'appleHealth') {
      if (toolName.includes('hrv')) return MCPEventTypes.HEALTH_HRV;
      if (toolName.includes('sleep')) return MCPEventTypes.HEALTH_SLEEP;
      if (toolName.includes('heart')) return MCPEventTypes.HEALTH_HEART_RATE;
      if (toolName.includes('activity')) return MCPEventTypes.HEALTH_ACTIVITY;
    }

    // Calendar events
    if (source === 'calendar') {
      if (toolName.includes('event')) return MCPEventTypes.CALENDAR_EVENTS;
      if (toolName.includes('availability')) return MCPEventTypes.CALENDAR_AVAILABILITY;
    }

    // Obsidian events
    if (source === 'obsidian') {
      if (toolName.includes('note') || toolName.includes('read')) return MCPEventTypes.KNOWLEDGE_NOTE;
      if (toolName.includes('search')) return MCPEventTypes.KNOWLEDGE_SEARCH;
      if (toolName.includes('link') || toolName.includes('backlink')) return MCPEventTypes.KNOWLEDGE_LINK;
    }

    // Beads events
    if (source === 'beads') {
      if (toolName.includes('list')) return MCPEventTypes.TASK_LIST;
      if (toolName.includes('update') || toolName.includes('close')) return MCPEventTypes.TASK_UPDATE;
      if (toolName.includes('create')) return MCPEventTypes.TASK_CREATE;
    }

    // Ganglion events
    if (source === 'ganglion') {
      if (toolName.includes('metrics')) return MCPEventTypes.BRAIN_METRICS;
      if (toolName.includes('state')) return MCPEventTypes.BRAIN_STATE;
      if (toolName.includes('focus')) return MCPEventTypes.BRAIN_FOCUS;
    }

    // Notion events
    if (source === 'notion') {
      if (toolName.includes('page')) return MCPEventTypes.WORKSPACE_PAGE;
      if (toolName.includes('task')) return MCPEventTypes.WORKSPACE_TASK;
    }

    return null;
  }

  /**
   * Publish event to EventBus
   */
  private async publishEvent(type: MCPEventType, data: Record<string, unknown>): Promise<void> {
    const event: MCPDomainEvent = {
      id: `mcp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      source: 'mcp',
      data,
      timestamp: new Date(),
    };

    try {
      await this.eventBus.publish(event);
    } catch (error) {
      console.error(`[MCPEventBridge] Failed to publish event ${type}:`, error);
    }
  }

  /**
   * Dispose bridge
   */
  async dispose(): Promise<void> {
    this.unsubscribe();
  }
}

// Singleton factory
let bridgeInstance: MCPEventBridge | null = null;

export function getMCPEventBridge(
  manager: MCPClientManager,
  eventBus: IEventBusService
): MCPEventBridge {
  if (!bridgeInstance) {
    bridgeInstance = new MCPEventBridge(manager, eventBus);
  }
  return bridgeInstance;
}

export function resetMCPEventBridge(): void {
  if (bridgeInstance) {
    bridgeInstance.dispose();
    bridgeInstance = null;
  }
}
