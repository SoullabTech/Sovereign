/**
 * MCP Client Manager for MAIA-SOVEREIGN
 *
 * Central manager for all MCP client connections.
 * Handles lifecycle, connection pooling, and data flow to consciousness systems.
 *
 * Architecture:
 * - Manages connections to external MCP servers (Apple Health, Calendar, etc.)
 * - Publishes data events to EventBus for consciousness integration
 * - Follows adapter pattern (similar to mem0-adapter.ts)
 * - Graceful degradation if servers are unavailable
 */

import { spawn, ChildProcess } from 'child_process';
import { EventEmitter } from 'events';
import type {
  MCPConfig,
  MCPServerConfig,
  MCPConnection,
  MCPConnectionStatus,
  MCPConnectionError,
  MCPTool,
  MCPToolCall,
  MCPToolResult,
  MCPResource,
  MCPDataEvent,
  MCPClientConfig,
} from './types';
import { getMCPConfig, validateMCPConfig, getEnabledServers } from './config';

// JSON-RPC types for MCP protocol
interface JSONRPCRequest {
  jsonrpc: '2.0';
  id: number | string;
  method: string;
  params?: Record<string, unknown>;
}

interface JSONRPCResponse {
  jsonrpc: '2.0';
  id: number | string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Manages a single MCP server connection
 */
class MCPServerConnection extends EventEmitter {
  private config: MCPServerConfig;
  private process: ChildProcess | null = null;
  private connection: MCPConnection;
  private requestId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
    timeout: ReturnType<typeof setTimeout>;
  }>();
  private buffer = '';

  constructor(config: MCPServerConfig) {
    super();
    this.config = config;
    this.connection = {
      id: `mcp-${config.name}-${Date.now()}`,
      serverName: config.name,
      transport: config.transport,
      status: 'disconnected',
      tools: [],
      resources: [],
    };
  }

  get status(): MCPConnectionStatus {
    return this.connection.status;
  }

  get tools(): MCPTool[] {
    return this.connection.tools;
  }

  get resources(): MCPResource[] {
    return this.connection.resources;
  }

  async connect(): Promise<void> {
    if (this.connection.status === 'connected') {
      return;
    }

    this.connection.status = 'connecting';
    this.emit('statusChange', this.connection.status);

    try {
      if (this.config.transport === 'stdio') {
        await this.connectStdio();
      } else if (this.config.transport === 'http' || this.config.transport === 'sse') {
        await this.connectHttp();
      }

      // Initialize connection
      await this.initialize();

      // Fetch available tools and resources
      await this.fetchCapabilities();

      this.connection.status = 'connected';
      this.connection.connectedAt = new Date();
      this.emit('statusChange', this.connection.status);
      this.emit('connected', this.connection);
    } catch (error) {
      this.connection.status = 'error';
      this.emit('statusChange', this.connection.status);
      this.emit('error', {
        serverName: this.config.name,
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date(),
        retryCount: 0,
      } as MCPConnectionError);
      throw error;
    }
  }

  private async connectStdio(): Promise<void> {
    if (!this.config.command) {
      throw new Error('stdio transport requires command');
    }

    return new Promise((resolve, reject) => {
      const env = { ...process.env, ...this.config.env };

      this.process = spawn(this.config.command!, this.config.args || [], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env,
      });

      const timeout = setTimeout(() => {
        reject(new Error(`Connection timeout for ${this.config.name}`));
      }, this.config.timeout || 30000);

      this.process.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      this.process.stdout?.on('data', (data: Buffer) => {
        this.handleData(data.toString());
      });

      this.process.stderr?.on('data', (data: Buffer) => {
        console.error(`[MCP ${this.config.name}] stderr:`, data.toString());
      });

      this.process.on('close', (code) => {
        if (this.connection.status === 'connected') {
          this.connection.status = 'disconnected';
          this.emit('statusChange', this.connection.status);
          this.emit('disconnected', code);
        }
      });

      // Assume connected once process is spawned
      clearTimeout(timeout);
      resolve();
    });
  }

  private async connectHttp(): Promise<void> {
    if (!this.config.url) {
      throw new Error('http transport requires url');
    }
    // HTTP connections are stateless, just verify endpoint is reachable
    const response = await fetch(this.config.url, {
      method: 'GET',
      headers: this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {},
      signal: AbortSignal.timeout(this.config.timeout || 30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP connection failed: ${response.status} ${response.statusText}`);
    }
  }

  private handleData(data: string): void {
    this.buffer += data;

    // Process complete JSON-RPC messages (newline-delimited)
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const message = JSON.parse(line) as JSONRPCResponse;
        this.handleMessage(message);
      } catch (error) {
        console.error(`[MCP ${this.config.name}] Failed to parse message:`, line);
      }
    }
  }

  private handleMessage(message: JSONRPCResponse): void {
    const pending = this.pendingRequests.get(message.id as number);
    if (pending) {
      clearTimeout(pending.timeout);
      this.pendingRequests.delete(message.id as number);

      if (message.error) {
        pending.reject(new Error(message.error.message));
      } else {
        pending.resolve(message.result);
      }
    }

    this.connection.lastActivity = new Date();
  }

  private async sendRequest(method: string, params?: Record<string, unknown>): Promise<unknown> {
    const id = ++this.requestId;
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id,
      method,
      params,
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error(`Request timeout: ${method}`));
      }, this.config.timeout || 30000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      if (this.config.transport === 'stdio' && this.process?.stdin) {
        this.process.stdin.write(JSON.stringify(request) + '\n');
      } else if (this.config.transport === 'http' && this.config.url) {
        this.sendHttpRequest(request)
          .then(resolve)
          .catch(reject)
          .finally(() => {
            clearTimeout(timeout);
            this.pendingRequests.delete(id);
          });
      }
    });
  }

  private async sendHttpRequest(request: JSONRPCRequest): Promise<unknown> {
    const response = await fetch(this.config.url!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
      },
      body: JSON.stringify(request),
      signal: AbortSignal.timeout(this.config.timeout || 30000),
    });

    if (!response.ok) {
      throw new Error(`HTTP request failed: ${response.status}`);
    }

    const result = await response.json() as JSONRPCResponse;
    if (result.error) {
      throw new Error(result.error.message);
    }

    return result.result;
  }

  private async initialize(): Promise<void> {
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {
        roots: { listChanged: true },
        sampling: {},
      },
      clientInfo: {
        name: 'maia-sovereign',
        version: '1.0.0',
      },
    });

    await this.sendRequest('notifications/initialized', {});
  }

  private async fetchCapabilities(): Promise<void> {
    // Fetch tools
    try {
      const toolsResult = await this.sendRequest('tools/list', {}) as { tools: MCPTool[] };
      this.connection.tools = toolsResult?.tools || [];
    } catch (error) {
      console.warn(`[MCP ${this.config.name}] Failed to fetch tools:`, error);
      this.connection.tools = [];
    }

    // Fetch resources
    try {
      const resourcesResult = await this.sendRequest('resources/list', {}) as { resources: MCPResource[] };
      this.connection.resources = resourcesResult?.resources || [];
    } catch (error) {
      console.warn(`[MCP ${this.config.name}] Failed to fetch resources:`, error);
      this.connection.resources = [];
    }
  }

  async callTool(toolCall: MCPToolCall): Promise<MCPToolResult> {
    if (this.connection.status !== 'connected') {
      throw new Error(`Server ${this.config.name} is not connected`);
    }

    const result = await this.sendRequest('tools/call', {
      name: toolCall.name,
      arguments: toolCall.arguments,
    }) as MCPToolResult;

    this.connection.lastActivity = new Date();
    return result;
  }

  async readResource(uri: string): Promise<MCPToolResult> {
    if (this.connection.status !== 'connected') {
      throw new Error(`Server ${this.config.name} is not connected`);
    }

    const result = await this.sendRequest('resources/read', { uri }) as MCPToolResult;
    this.connection.lastActivity = new Date();
    return result;
  }

  async disconnect(): Promise<void> {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }

    // Clear pending requests
    Array.from(this.pendingRequests.entries()).forEach(([_id, pending]) => {
      clearTimeout(pending.timeout);
      pending.reject(new Error('Connection closed'));
    });
    this.pendingRequests.clear();

    this.connection.status = 'disconnected';
    this.emit('statusChange', this.connection.status);
  }

  getConnectionInfo(): MCPConnection {
    return { ...this.connection };
  }
}

/**
 * Central MCP Client Manager
 * Manages all MCP server connections and provides unified interface
 */
export class MCPClientManager extends EventEmitter {
  private config: MCPConfig;
  private connections = new Map<keyof MCPClientConfig, MCPServerConnection>();
  private initialized = false;

  constructor(config?: MCPConfig) {
    super();
    this.config = config || getMCPConfig();

    // Validate configuration
    const errors = validateMCPConfig(this.config);
    if (errors.length > 0) {
      console.warn('[MCP] Configuration warnings:', errors);
    }
  }

  /**
   * Initialize and connect to all enabled MCP servers
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    const enabledServers = getEnabledServers(this.config);
    console.log(`[MCP] Initializing ${enabledServers.length} MCP connections...`);

    const results = await Promise.allSettled(
      enabledServers.map(async (serverConfig) => {
        const connection = new MCPServerConnection(serverConfig);

        // Forward events
        connection.on('connected', (info) => this.emit('serverConnected', info));
        connection.on('disconnected', (code) => this.emit('serverDisconnected', serverConfig.name, code));
        connection.on('error', (error) => this.emit('serverError', error));
        connection.on('statusChange', (status) => this.emit('statusChange', serverConfig.name, status));

        await connection.connect();
        return { name: serverConfig.name, connection };
      })
    );

    // Store successful connections
    for (const result of results) {
      if (result.status === 'fulfilled') {
        const name = result.value.name as keyof MCPClientConfig;
        this.connections.set(name, result.value.connection);
        console.log(`[MCP] Connected to ${name}`);
      } else {
        console.error(`[MCP] Failed to connect:`, result.reason);
      }
    }

    this.initialized = true;
    this.emit('initialized', {
      connected: this.connections.size,
      total: enabledServers.length,
    });
  }

  /**
   * Get a specific server connection
   */
  getConnection(serverName: keyof MCPClientConfig): MCPServerConnection | undefined {
    return this.connections.get(serverName);
  }

  /**
   * Check if a server is connected
   */
  isConnected(serverName: keyof MCPClientConfig): boolean {
    const connection = this.connections.get(serverName);
    return connection?.status === 'connected';
  }

  /**
   * Call a tool on a specific server
   */
  async callTool(
    serverName: keyof MCPClientConfig,
    toolCall: MCPToolCall
  ): Promise<MCPToolResult> {
    const connection = this.connections.get(serverName);
    if (!connection) {
      throw new Error(`Server ${serverName} not found`);
    }

    const result = await connection.callTool(toolCall);

    // Emit data event for consciousness integration
    this.emit('data', {
      id: `${serverName}-${Date.now()}`,
      source: serverName,
      type: toolCall.name,
      data: result,
      timestamp: new Date(),
      processed: false,
    } as MCPDataEvent);

    return result;
  }

  /**
   * Read a resource from a specific server
   */
  async readResource(
    serverName: keyof MCPClientConfig,
    uri: string
  ): Promise<MCPToolResult> {
    const connection = this.connections.get(serverName);
    if (!connection) {
      throw new Error(`Server ${serverName} not found`);
    }

    return connection.readResource(uri);
  }

  /**
   * Get all available tools across all connected servers
   */
  getAllTools(): Map<keyof MCPClientConfig, MCPTool[]> {
    const tools = new Map<keyof MCPClientConfig, MCPTool[]>();
    Array.from(this.connections.entries()).forEach(([name, connection]) => {
      tools.set(name, connection.tools);
    });
    return tools;
  }

  /**
   * Get all available resources across all connected servers
   */
  getAllResources(): Map<keyof MCPClientConfig, MCPResource[]> {
    const resources = new Map<keyof MCPClientConfig, MCPResource[]>();
    Array.from(this.connections.entries()).forEach(([name, connection]) => {
      resources.set(name, connection.resources);
    });
    return resources;
  }

  /**
   * Get connection status for all servers
   */
  getStatus(): Map<keyof MCPClientConfig, MCPConnection> {
    const status = new Map<keyof MCPClientConfig, MCPConnection>();
    Array.from(this.connections.entries()).forEach(([name, connection]) => {
      status.set(name, connection.getConnectionInfo());
    });
    return status;
  }

  /**
   * Reconnect a specific server
   */
  async reconnect(serverName: keyof MCPClientConfig): Promise<void> {
    const serverConfig = this.config.client[serverName];
    if (!serverConfig?.enabled) {
      throw new Error(`Server ${serverName} is not enabled`);
    }

    // Disconnect existing
    const existing = this.connections.get(serverName);
    if (existing) {
      await existing.disconnect();
      this.connections.delete(serverName);
    }

    // Create new connection
    const connection = new MCPServerConnection(serverConfig);
    connection.on('connected', (info) => this.emit('serverConnected', info));
    connection.on('disconnected', (code) => this.emit('serverDisconnected', serverName, code));
    connection.on('error', (error) => this.emit('serverError', error));

    await connection.connect();
    this.connections.set(serverName, connection);
  }

  /**
   * Shutdown all connections
   */
  async shutdown(): Promise<void> {
    console.log('[MCP] Shutting down all connections...');

    await Promise.all(
      Array.from(this.connections.values()).map(conn => conn.disconnect())
    );

    this.connections.clear();
    this.initialized = false;
    this.emit('shutdown');
  }

  /**
   * Dispose (alias for shutdown, matches service pattern)
   */
  async dispose(): Promise<void> {
    await this.shutdown();
  }
}

// Export singleton factory
let instance: MCPClientManager | null = null;

export function getMCPClientManager(config?: MCPConfig): MCPClientManager {
  if (!instance) {
    instance = new MCPClientManager(config);
  }
  return instance;
}

export function resetMCPClientManager(): void {
  if (instance) {
    instance.shutdown();
    instance = null;
  }
}
