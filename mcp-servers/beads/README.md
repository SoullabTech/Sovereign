# Beads MCP Server

MCP server for the Beads task management system. Enables MAIA to interact with your task/issue tracker.

## Tools

| Tool | Description |
|------|-------------|
| `beads_list` | List issues with filters (status, label, assignee) |
| `beads_show` | Show detailed issue information |
| `beads_create` | Create new issue |
| `beads_update` | Update issue fields |
| `beads_close` | Close issue with reason |
| `beads_search` | Search by text query |
| `beads_status` | Workspace statistics |
| `beads_comment` | Add comment to issue |
| `beads_stale` | Find stale issues |

## Resources

| URI | Description |
|-----|-------------|
| `beads://status` | Workspace overview |
| `beads://open` | All open issues |

## Setup

```bash
cd mcp-servers/beads
npm install
npm run build
```

## Usage

Add to MCP config:

```json
{
  "mcpServers": {
    "beads": {
      "command": "node",
      "args": ["/path/to/mcp-servers/beads/dist/index.js"],
      "env": {
        "BD_PATH": "/Users/soullab/.local/bin/bd"
      }
    }
  }
}
```

## Environment

- `BD_PATH` - Path to bd CLI (default: `/Users/soullab/.local/bin/bd`)
