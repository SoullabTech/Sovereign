/**
 * MCP (Model Context Protocol) Module for MAIA-SOVEREIGN
 *
 * Bidirectional MCP integration:
 * - Client: Connect to external MCP servers (Apple Health, Calendar, Obsidian, etc.)
 * - Server: Expose AIN engine for third-party applications
 *
 * Usage:
 *   import { getMCPClientManager, getMCPConfig } from '@/lib/mcp';
 *
 *   const manager = getMCPClientManager();
 *   await manager.initialize();
 *
 *   // Call Apple Health tool
 *   const hrv = await manager.callTool('appleHealth', {
 *     name: 'get_hrv_data',
 *     arguments: { days: 7 }
 *   });
 */

// Types
export * from './types';

// Configuration
export { getMCPConfig, validateMCPConfig, getEnabledServers, isMCPEnabled } from './config';

// Client Manager
export {
  MCPClientManager,
  getMCPClientManager,
  resetMCPClientManager,
} from './MCPClientManager';

// Client Service (DI-compatible wrapper)
export {
  MCPClientService,
  getMCPClientService,
  resetMCPClientService,
} from './MCPClientService';

// Event Bridge (connects MCP to EventBus)
export {
  MCPEventBridge,
  MCPEventTypes,
  getMCPEventBridge,
  resetMCPEventBridge,
  type MCPEventType,
  type MCPDomainEvent,
} from './MCPEventBridge';

// Re-export config type for convenience
export type { MCPConfig } from './types';

// Adapters
export * from './adapters';

// Consciousness Integrations
export * from './integrations';
