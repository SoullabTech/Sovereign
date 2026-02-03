#!/usr/bin/env node
/**
 * Beads MCP Server for MAIA-SOVEREIGN
 *
 * Exposes the Beads task management system via MCP protocol.
 * Wraps the `bd` CLI for task/issue operations.
 *
 * Tools:
 * - beads_list: List issues with filters
 * - beads_show: Show issue details
 * - beads_create: Create new issue
 * - beads_update: Update issue fields
 * - beads_close: Close an issue
 * - beads_search: Search issues by text
 * - beads_status: Get workspace statistics
 *
 * Resources:
 * - beads://status: Current workspace overview
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Path to bd CLI
const BD_CLI = process.env.BD_PATH || '/Users/soullab/.local/bin/bd';

// Create MCP server
const server = new Server(
  {
    name: 'beads-mcp',
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
// Helper Functions
// ============================================================================

async function runBd(args: string[]): Promise<string> {
  try {
    const { stdout, stderr } = await execAsync(`${BD_CLI} ${args.join(' ')}`, {
      timeout: 30000,
      maxBuffer: 1024 * 1024,
    });
    if (stderr && !stdout) {
      throw new Error(stderr);
    }
    return stdout;
  } catch (error) {
    const err = error as Error & { stderr?: string };
    throw new Error(err.stderr || err.message);
  }
}

function parseJsonOutput(output: string): unknown {
  try {
    return JSON.parse(output);
  } catch {
    // Return as plain text if not JSON
    return { text: output };
  }
}

// ============================================================================
// Tools
// ============================================================================

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: 'beads_list',
      description: 'List issues/beads with optional filters. Returns tasks matching criteria.',
      inputSchema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            description: 'Filter by status: open, closed, all',
            enum: ['open', 'closed', 'all'],
          },
          label: {
            type: 'string',
            description: 'Filter by label',
          },
          assigned: {
            type: 'string',
            description: 'Filter by assignee',
          },
          limit: {
            type: 'number',
            description: 'Maximum number of results',
          },
          format: {
            type: 'string',
            description: 'Output format',
            enum: ['json', 'short', 'long'],
          },
        },
      },
    },
    {
      name: 'beads_show',
      description: 'Show detailed information about a specific issue/bead.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Issue ID (e.g., MAIA-123)',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'beads_create',
      description: 'Create a new issue/bead.',
      inputSchema: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'Issue title',
          },
          body: {
            type: 'string',
            description: 'Issue description/body',
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Labels to apply',
          },
          priority: {
            type: 'string',
            description: 'Priority level',
            enum: ['low', 'medium', 'high', 'critical'],
          },
        },
        required: ['title'],
      },
    },
    {
      name: 'beads_update',
      description: 'Update an existing issue/bead.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Issue ID',
          },
          title: {
            type: 'string',
            description: 'New title',
          },
          body: {
            type: 'string',
            description: 'New body/description',
          },
          status: {
            type: 'string',
            description: 'New status',
          },
          labels: {
            type: 'array',
            items: { type: 'string' },
            description: 'Labels to set',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'beads_close',
      description: 'Close an issue/bead with optional resolution message.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Issue ID',
          },
          reason: {
            type: 'string',
            description: 'Reason for closing',
          },
        },
        required: ['id'],
      },
    },
    {
      name: 'beads_search',
      description: 'Search issues by text query.',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
          },
          limit: {
            type: 'number',
            description: 'Maximum results',
          },
        },
        required: ['query'],
      },
    },
    {
      name: 'beads_status',
      description: 'Get workspace status and statistics.',
      inputSchema: {
        type: 'object',
        properties: {},
      },
    },
    {
      name: 'beads_comment',
      description: 'Add a comment to an issue.',
      inputSchema: {
        type: 'object',
        properties: {
          id: {
            type: 'string',
            description: 'Issue ID',
          },
          comment: {
            type: 'string',
            description: 'Comment text',
          },
        },
        required: ['id', 'comment'],
      },
    },
    {
      name: 'beads_stale',
      description: 'Find stale issues not updated recently.',
      inputSchema: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Days since last update',
          },
        },
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'beads_list': {
        const cmdArgs = ['list', '--json'];
        const typedArgs = args as Record<string, unknown>;

        if (typedArgs?.status === 'closed') cmdArgs.push('--closed');
        else if (typedArgs?.status === 'all') cmdArgs.push('--all');

        if (typedArgs?.label) cmdArgs.push('-l', String(typedArgs.label));
        if (typedArgs?.assigned) cmdArgs.push('--assigned', String(typedArgs.assigned));
        if (typedArgs?.limit) cmdArgs.push('-n', String(typedArgs.limit));

        const output = await runBd(cmdArgs);
        return {
          content: [{ type: 'text', text: output }],
        };
      }

      case 'beads_show': {
        const typedArgs = args as { id: string };
        const output = await runBd(['show', typedArgs.id, '--json']);
        return {
          content: [{ type: 'text', text: output }],
        };
      }

      case 'beads_create': {
        const typedArgs = args as {
          title: string;
          body?: string;
          labels?: string[];
          priority?: string;
        };

        const cmdArgs = ['create', '-t', `"${typedArgs.title}"`];

        if (typedArgs.body) cmdArgs.push('-b', `"${typedArgs.body}"`);
        if (typedArgs.labels) {
          for (const label of typedArgs.labels) {
            cmdArgs.push('-l', label);
          }
        }
        if (typedArgs.priority) cmdArgs.push('-p', typedArgs.priority);
        cmdArgs.push('--json');

        const output = await runBd(cmdArgs);
        return {
          content: [{ type: 'text', text: output }],
        };
      }

      case 'beads_update': {
        const typedArgs = args as {
          id: string;
          title?: string;
          body?: string;
          status?: string;
          labels?: string[];
        };

        const cmdArgs = ['update', typedArgs.id];

        if (typedArgs.title) cmdArgs.push('-t', `"${typedArgs.title}"`);
        if (typedArgs.body) cmdArgs.push('-b', `"${typedArgs.body}"`);
        if (typedArgs.status) cmdArgs.push('-s', typedArgs.status);
        cmdArgs.push('--json');

        const output = await runBd(cmdArgs);
        return {
          content: [{ type: 'text', text: output }],
        };
      }

      case 'beads_close': {
        const typedArgs = args as { id: string; reason?: string };
        const cmdArgs = ['close', typedArgs.id];

        if (typedArgs.reason) cmdArgs.push('-r', `"${typedArgs.reason}"`);
        cmdArgs.push('--json');

        const output = await runBd(cmdArgs);
        return {
          content: [{ type: 'text', text: output }],
        };
      }

      case 'beads_search': {
        const typedArgs = args as { query: string; limit?: number };
        const cmdArgs = ['search', `"${typedArgs.query}"`, '--json'];

        if (typedArgs.limit) cmdArgs.push('-n', String(typedArgs.limit));

        const output = await runBd(cmdArgs);
        return {
          content: [{ type: 'text', text: output }],
        };
      }

      case 'beads_status': {
        const output = await runBd(['status', '--json']);
        return {
          content: [{ type: 'text', text: output }],
        };
      }

      case 'beads_comment': {
        const typedArgs = args as { id: string; comment: string };
        const output = await runBd(['comment', typedArgs.id, `"${typedArgs.comment}"`]);
        return {
          content: [{ type: 'text', text: output }],
        };
      }

      case 'beads_stale': {
        const typedArgs = args as { days?: number };
        const cmdArgs = ['stale', '--json'];
        if (typedArgs?.days) cmdArgs.push('-d', String(typedArgs.days));

        const output = await runBd(cmdArgs);
        return {
          content: [{ type: 'text', text: output }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const err = error as Error;
    return {
      content: [{ type: 'text', text: `Error: ${err.message}` }],
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
      uri: 'beads://status',
      name: 'Beads Workspace Status',
      description: 'Current workspace overview and statistics',
      mimeType: 'application/json',
    },
    {
      uri: 'beads://open',
      name: 'Open Issues',
      description: 'List of all open issues',
      mimeType: 'application/json',
    },
  ],
}));

server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
  const { uri } = request.params;

  try {
    switch (uri) {
      case 'beads://status': {
        const output = await runBd(['status', '--json']);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: output,
            },
          ],
        };
      }

      case 'beads://open': {
        const output = await runBd(['list', '--json']);
        return {
          contents: [
            {
              uri,
              mimeType: 'application/json',
              text: output,
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown resource: ${uri}`);
    }
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
  console.error('Beads MCP server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
