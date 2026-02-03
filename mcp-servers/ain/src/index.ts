#!/usr/bin/env node
/**
 * AIN MCP Server for MAIA-SOVEREIGN
 *
 * Exposes MAIA's AIN (Agentic Intelligence Networks) engine via MCP protocol.
 * Enables third-party applications to access consciousness-aware AI capabilities.
 *
 * Tools:
 * - ain_query: Knowledge-gated response with source mixing
 * - ain_awareness: Detect consciousness/awareness level from text
 * - ain_insight: Get collective wisdom insights on a topic
 * - ain_guidance: Get evolution guidance for a user
 * - ain_field_state: Get current field coherence metrics
 *
 * Resources:
 * - ain://field/coherence: Real-time field state
 * - ain://system/status: System health and capabilities
 * - ain://evolution/phase: Current collective evolution phase
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Import tool implementations
import { handleAINQuery } from './tools/knowledge-gate.js';
import { handleAwarenessDetect } from './tools/awareness-detect.js';
import { handleAINInsight } from './tools/collective-insight.js';
import { handleAINGuidance } from './tools/evolution-guidance.js';
import { handleFieldState } from './tools/field-state.js';

// Import resource implementations
import { getFieldCoherence } from './resources/field-coherence.js';
import { getSystemStatus } from './resources/system-status.js';

// ============================================================================
// Security: API Key Management & Rate Limiting
// ============================================================================

const VALID_API_KEYS = new Set(
  (process.env.AIN_API_KEYS || '').split(',').filter(Boolean)
);

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  requestsPerMinute: parseInt(process.env.AIN_RATE_LIMIT_RPM || '60', 10),
  requestsPerHour: parseInt(process.env.AIN_RATE_LIMIT_RPH || '1000', 10),
};

// Track requests per API key
const requestCounts = new Map<string, { minute: number; hour: number; lastReset: number; lastHourReset: number }>();

// Audit log (in-memory for stdio, would connect to DB in production)
const auditLog: Array<{
  timestamp: Date;
  apiKey?: string;
  tool: string;
  success: boolean;
  duration?: number;
  error?: string;
}> = [];

const MAX_AUDIT_LOG_SIZE = 1000;

function logAudit(entry: typeof auditLog[0]) {
  auditLog.push(entry);
  if (auditLog.length > MAX_AUDIT_LOG_SIZE) {
    auditLog.shift();
  }
  // Also log to stderr for visibility
  console.error(`[AUDIT] ${entry.timestamp.toISOString()} | ${entry.tool} | ${entry.success ? 'OK' : 'FAIL'} | ${entry.apiKey || 'anonymous'}`);
}

function validateApiKey(key: string | undefined): boolean {
  if (VALID_API_KEYS.size === 0) return true; // No auth required if no keys configured
  return key ? VALID_API_KEYS.has(key) : false;
}

function checkRateLimit(apiKey: string | undefined): { allowed: boolean; error?: string } {
  const key = apiKey || 'anonymous';
  const now = Date.now();

  let counts = requestCounts.get(key);
  if (!counts) {
    counts = { minute: 0, hour: 0, lastReset: now, lastHourReset: now };
    requestCounts.set(key, counts);
  }

  // Reset minute counter
  if (now - counts.lastReset > 60000) {
    counts.minute = 0;
    counts.lastReset = now;
  }

  // Reset hour counter
  if (now - counts.lastHourReset > 3600000) {
    counts.hour = 0;
    counts.lastHourReset = now;
  }

  // Check limits
  if (counts.minute >= RATE_LIMIT_CONFIG.requestsPerMinute) {
    return { allowed: false, error: `Rate limit exceeded: ${RATE_LIMIT_CONFIG.requestsPerMinute} requests per minute` };
  }

  if (counts.hour >= RATE_LIMIT_CONFIG.requestsPerHour) {
    return { allowed: false, error: `Rate limit exceeded: ${RATE_LIMIT_CONFIG.requestsPerHour} requests per hour` };
  }

  // Increment counters
  counts.minute++;
  counts.hour++;

  return { allowed: true };
}

// Create MCP server
const server = new Server(
  {
    name: 'ain-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
      resources: {},
    },
  }
);

// ============================================================================
// Tools
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'ain_query',
      description: 'Send a message through AIN knowledge gate. Returns consciousness-aware response with source mixing.',
      inputSchema: {
        type: 'object',
        properties: {
          message: {
            type: 'string',
            description: 'The user message or query',
          },
          context: {
            type: 'string',
            description: 'Optional conversation context',
          },
          awarenessHint: {
            type: 'string',
            enum: ['UNCONSCIOUS', 'PARTIAL', 'RELATIONAL', 'INTEGRATED', 'MASTER'],
            description: 'Hint about user awareness level',
          },
          userId: {
            type: 'string',
            description: 'User identifier for personalization',
          },
        },
        required: ['message'],
      },
    },
    {
      name: 'ain_awareness',
      description: 'Detect consciousness/awareness level from text content.',
      inputSchema: {
        type: 'object',
        properties: {
          text: {
            type: 'string',
            description: 'Text to analyze for awareness markers',
          },
          includeMarkers: {
            type: 'boolean',
            description: 'Include detailed consciousness markers in response',
          },
        },
        required: ['text'],
      },
    },
    {
      name: 'ain_insight',
      description: 'Get collective wisdom insight on a topic.',
      inputSchema: {
        type: 'object',
        properties: {
          topic: {
            type: 'string',
            description: 'Topic to get insight about',
          },
          depth: {
            type: 'string',
            enum: ['surface', 'moderate', 'deep'],
            description: 'Depth of insight exploration',
          },
        },
        required: ['topic'],
      },
    },
    {
      name: 'ain_guidance',
      description: 'Get personalized evolution guidance for a user.',
      inputSchema: {
        type: 'object',
        properties: {
          userId: {
            type: 'string',
            description: 'User identifier',
          },
          focusArea: {
            type: 'string',
            description: 'Optional focus area for guidance',
          },
        },
        required: ['userId'],
      },
    },
    {
      name: 'ain_field_state',
      description: 'Get current collective field coherence and metrics.',
      inputSchema: {
        type: 'object',
        properties: {
          detailed: {
            type: 'boolean',
            description: 'Include detailed field metrics',
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  const typedArgs = args as Record<string, unknown>;
  const apiKey = typedArgs?.apiKey as string | undefined;
  const startTime = Date.now();

  // Validate API key if required
  if (!validateApiKey(apiKey)) {
    logAudit({
      timestamp: new Date(),
      apiKey,
      tool: name,
      success: false,
      error: 'Invalid API key',
    });
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: 'Invalid API key' }) }],
      isError: true,
    };
  }

  // Check rate limit
  const rateCheck = checkRateLimit(apiKey);
  if (!rateCheck.allowed) {
    logAudit({
      timestamp: new Date(),
      apiKey,
      tool: name,
      success: false,
      error: rateCheck.error,
    });
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: rateCheck.error }) }],
      isError: true,
    };
  }

  try {
    let result: unknown;

    switch (name) {
      case 'ain_query':
        result = await handleAINQuery(typedArgs);
        break;

      case 'ain_awareness':
        result = await handleAwarenessDetect(typedArgs);
        break;

      case 'ain_insight':
        result = await handleAINInsight(typedArgs);
        break;

      case 'ain_guidance':
        result = await handleAINGuidance(typedArgs);
        break;

      case 'ain_field_state':
        result = await handleFieldState(typedArgs);
        break;

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    logAudit({
      timestamp: new Date(),
      apiKey,
      tool: name,
      success: true,
      duration: Date.now() - startTime,
    });

    return {
      content: [{ type: 'text', text: JSON.stringify(result) }],
    };
  } catch (error) {
    const err = error as Error;
    logAudit({
      timestamp: new Date(),
      apiKey,
      tool: name,
      success: false,
      duration: Date.now() - startTime,
      error: err.message,
    });
    return {
      content: [{ type: 'text', text: JSON.stringify({ error: err.message }) }],
      isError: true,
    };
  }
});

// ============================================================================
// Resources
// ============================================================================

server.setRequestHandler(ListResourcesRequestSchema, async () => ({
  resources: [
    {
      uri: 'ain://field/coherence',
      name: 'Field Coherence',
      description: 'Real-time collective field coherence metrics',
      mimeType: 'application/json',
    },
    {
      uri: 'ain://system/status',
      name: 'System Status',
      description: 'AIN system health and capabilities',
      mimeType: 'application/json',
    },
    {
      uri: 'ain://evolution/phase',
      name: 'Evolution Phase',
      description: 'Current collective evolution phase',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    let content: unknown;

    switch (uri) {
      case 'ain://field/coherence':
        content = await getFieldCoherence();
        break;

      case 'ain://system/status':
        content = await getSystemStatus();
        break;

      case 'ain://evolution/phase':
        content = {
          phase: 'emergence',
          subPhase: 'integration',
          collectiveProgress: 0.42,
          nextMilestone: 'Coherence threshold',
          description: 'Community entering integration phase of consciousness emergence',
        };
        break;

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }

    return {
      contents: [
        {
          uri,
          mimeType: 'application/json',
          text: JSON.stringify(content),
        },
      ],
    };
  } catch (error) {
    const err = error as Error;
    return {
      contents: [
        {
          uri,
          mimeType: 'text/plain',
          text: `Error: ${err.message}`,
        },
      ],
    };
  }
});

// ============================================================================
// Main
// ============================================================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('AIN MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
