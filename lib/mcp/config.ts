/**
 * MCP Configuration for MAIA-SOVEREIGN
 *
 * Configures both client connections (consuming external MCP servers)
 * and the AIN MCP server (exposing AIN for third-party apps)
 */

import type { MCPConfig, MCPServerConfig, MCPAINServerConfig } from './types';

// Default MCP server configurations
const defaultAppleHealth: MCPServerConfig = {
  name: 'apple-health',
  transport: 'stdio',
  enabled: true,
  command: 'npx',
  args: ['-y', '@anthropic-ai/mcp-server-apple-health'],
  timeout: 30000,
  retries: 3,
};

const defaultCalendar: MCPServerConfig = {
  name: 'apple-calendar',
  transport: 'stdio',
  enabled: true,
  command: 'npx',
  args: ['-y', 'mcp-server-apple-calendar'],
  timeout: 30000,
  retries: 3,
};

const defaultObsidian: MCPServerConfig = {
  name: 'obsidian',
  transport: 'stdio',
  enabled: true,
  command: 'npx',
  args: ['-y', '@cyanheads/obsidian-mcp-server'],
  env: {
    OBSIDIAN_VAULT_PATH: process.env.OBSIDIAN_VAULT_PATH || '~/Obsidian Vaults/Soullab',
  },
  timeout: 30000,
  retries: 3,
};

const defaultNotion: MCPServerConfig = {
  name: 'notion',
  transport: 'http',
  enabled: false, // Requires API key setup
  url: 'https://mcp.notion.so/mcp',
  apiKey: process.env.NOTION_API_KEY,
  timeout: 30000,
  retries: 3,
};

const defaultBeads: MCPServerConfig = {
  name: 'beads',
  transport: 'stdio',
  enabled: true,
  command: 'node',
  args: ['./mcp-servers/beads/dist/index.js'],
  env: {
    BD_DB: process.env.BD_DB || '',
  },
  timeout: 30000,
  retries: 3,
};

const defaultGanglion: MCPServerConfig = {
  name: 'ganglion',
  transport: 'stdio',
  enabled: false, // Optional hardware, disabled by default
  command: 'python3',
  args: ['./mcp-servers/ganglion/server.py'],
  timeout: 60000, // Longer timeout for hardware init
  retries: 2,
};

const defaultAINServer: MCPAINServerConfig = {
  enabled: false, // Enable when ready for third-party exposure
  port: 3100,
  authRequired: true,
  rateLimit: {
    requestsPerMinute: 60,
    requestsPerHour: 1000,
  },
};

/**
 * Get the full MCP configuration
 * Merges defaults with environment overrides
 */
export function getMCPConfig(): MCPConfig {
  return {
    client: {
      appleHealth: {
        ...defaultAppleHealth,
        enabled: process.env.MCP_APPLE_HEALTH_ENABLED !== 'false',
      },
      calendar: {
        ...defaultCalendar,
        enabled: process.env.MCP_CALENDAR_ENABLED !== 'false',
      },
      obsidian: {
        ...defaultObsidian,
        enabled: process.env.MCP_OBSIDIAN_ENABLED !== 'false',
        env: {
          OBSIDIAN_VAULT_PATH: process.env.OBSIDIAN_VAULT_PATH || defaultObsidian.env?.OBSIDIAN_VAULT_PATH || '',
        },
      },
      notion: {
        ...defaultNotion,
        enabled: process.env.MCP_NOTION_ENABLED === 'true' && !!process.env.NOTION_API_KEY,
        apiKey: process.env.NOTION_API_KEY,
      },
      beads: {
        ...defaultBeads,
        enabled: process.env.MCP_BEADS_ENABLED !== 'false',
      },
      ganglion: {
        ...defaultGanglion,
        enabled: process.env.MCP_GANGLION_ENABLED === 'true',
      },
    },
    server: {
      ain: {
        ...defaultAINServer,
        enabled: process.env.MCP_AIN_SERVER_ENABLED === 'true',
        port: parseInt(process.env.MCP_AIN_SERVER_PORT || '3100', 10),
        apiKeys: process.env.MCP_AIN_API_KEYS?.split(',').filter(Boolean),
      },
    },
  };
}

/**
 * Validate MCP configuration
 * Returns array of validation errors (empty if valid)
 */
export function validateMCPConfig(config: MCPConfig): string[] {
  const errors: string[] = [];

  // Validate client configs
  for (const [name, serverConfig] of Object.entries(config.client)) {
    if (serverConfig.enabled) {
      if (serverConfig.transport === 'stdio' && !serverConfig.command) {
        errors.push(`${name}: stdio transport requires command`);
      }
      if ((serverConfig.transport === 'http' || serverConfig.transport === 'sse') && !serverConfig.url) {
        errors.push(`${name}: ${serverConfig.transport} transport requires url`);
      }
    }
  }

  // Validate AIN server config
  if (config.server.ain.enabled) {
    if (config.server.ain.authRequired && (!config.server.ain.apiKeys || config.server.ain.apiKeys.length === 0)) {
      errors.push('AIN server: authRequired is true but no apiKeys configured');
    }
    if (config.server.ain.port < 1024 || config.server.ain.port > 65535) {
      errors.push('AIN server: port must be between 1024 and 65535');
    }
  }

  return errors;
}

/**
 * Get enabled MCP client servers
 */
export function getEnabledServers(config: MCPConfig): MCPServerConfig[] {
  return Object.values(config.client).filter(server => server.enabled);
}

/**
 * Check if any MCP features are enabled
 */
export function isMCPEnabled(config: MCPConfig): boolean {
  const hasEnabledClients = Object.values(config.client).some(s => s.enabled);
  const hasEnabledServer = config.server.ain.enabled;
  return hasEnabledClients || hasEnabledServer;
}
