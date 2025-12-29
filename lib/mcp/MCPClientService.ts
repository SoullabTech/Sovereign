/**
 * MCP Client Service
 *
 * Implements IMCPClientService interface for ServiceContainer integration.
 * Wraps MCPClientManager to provide DI-compatible service layer.
 */

import type {
  IMCPClientService,
  MCPToolCall,
  MCPToolResult,
  MCPTool,
  MCPConnection,
} from '../core/ServiceTokens';
import { MCPClientManager, getMCPClientManager } from './MCPClientManager';
import type { MCPConfig, MCPClientConfig } from './types';

export class MCPClientService implements IMCPClientService {
  private manager: MCPClientManager;

  constructor(config?: MCPConfig) {
    this.manager = getMCPClientManager(config);
  }

  /**
   * Initialize all MCP connections
   */
  async initialize(): Promise<void> {
    await this.manager.initialize();
  }

  /**
   * Check if a specific server is connected
   */
  isConnected(serverName: string): boolean {
    return this.manager.isConnected(serverName as keyof MCPClientConfig);
  }

  /**
   * Call a tool on a specific MCP server
   */
  async callTool(serverName: string, toolCall: MCPToolCall): Promise<MCPToolResult> {
    return this.manager.callTool(serverName as keyof MCPClientConfig, toolCall);
  }

  /**
   * Read a resource from a specific MCP server
   */
  async readResource(serverName: string, uri: string): Promise<MCPToolResult> {
    return this.manager.readResource(serverName as keyof MCPClientConfig, uri);
  }

  /**
   * Get all available tools across all connected servers
   */
  getAllTools(): Map<string, MCPTool[]> {
    const managerTools = this.manager.getAllTools();
    const result = new Map<string, MCPTool[]>();

    for (const [key, tools] of managerTools) {
      result.set(key as string, tools);
    }

    return result;
  }

  /**
   * Get connection status for all servers
   */
  getStatus(): Map<string, MCPConnection> {
    const managerStatus = this.manager.getStatus();
    const result = new Map<string, MCPConnection>();

    for (const [key, status] of managerStatus) {
      // Convert internal MCPConnection to ServiceTokens MCPConnection
      result.set(key as string, {
        id: status.id,
        serverName: status.serverName,
        status: status.status,
        connectedAt: status.connectedAt,
        lastActivity: status.lastActivity,
        tools: status.tools.map((t) => ({
          name: t.name,
          description: t.description || '',
          inputSchema: t.inputSchema,
        })),
      });
    }

    return result;
  }

  /**
   * Reconnect a specific server
   */
  async reconnect(serverName: string): Promise<void> {
    await this.manager.reconnect(serverName as keyof MCPClientConfig);
  }

  /**
   * Shutdown all MCP connections
   */
  async shutdown(): Promise<void> {
    await this.manager.shutdown();
  }

  /**
   * Dispose (alias for shutdown)
   */
  async dispose(): Promise<void> {
    await this.shutdown();
  }

  /**
   * Get underlying manager for advanced operations
   */
  getManager(): MCPClientManager {
    return this.manager;
  }

  /**
   * Subscribe to MCP events
   */
  on(event: string, handler: (...args: unknown[]) => void): this {
    this.manager.on(event, handler);
    return this;
  }

  /**
   * Unsubscribe from MCP events
   */
  off(event: string, handler: (...args: unknown[]) => void): this {
    this.manager.off(event, handler);
    return this;
  }
}

// Singleton factory
let instance: MCPClientService | null = null;

export function getMCPClientService(config?: MCPConfig): MCPClientService {
  if (!instance) {
    instance = new MCPClientService(config);
  }
  return instance;
}

export function resetMCPClientService(): void {
  if (instance) {
    instance.dispose();
    instance = null;
  }
}
