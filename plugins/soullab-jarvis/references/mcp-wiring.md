# MCP wiring (opt-in — this plugin ships none enabled)

`.mcp.json` in this plugin is intentionally **empty**. Auto-starting servers that need a
build step produces a failing server on every session start, which is worse than no server.
Wire what you actually use, after building it.

## Servers that live in this repo

| Server | Path | Build |
|---|---|---|
| `ain` | `mcp-servers/ain` | `npm --prefix mcp-servers/ain install && npm --prefix mcp-servers/ain run build` |
| `beads` | `mcp-servers/beads` | `npm --prefix mcp-servers/beads install && npm --prefix mcp-servers/beads run build` |
| `ganglion` | `mcp-servers/ganglion` | Python + BrainFlow; requires OpenBCI hardware to be useful |

## Ready to paste into `.mcp.json`

```json
{
  "mcpServers": {
    "ain": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/../../mcp-servers/ain/dist/index.js"]
    },
    "beads": {
      "command": "node",
      "args": ["${CLAUDE_PLUGIN_ROOT}/../../mcp-servers/beads/dist/index.js"]
    }
  }
}
```

The `../../` is relative to the plugin root and assumes the plugin stays at
`plugins/soullab-jarvis/` inside this repo. If you install the plugin from elsewhere, use
absolute paths instead.

**Before adding any server, price it.** Every MCP server's tool schemas are injected at
startup and sit inside the ~55,000-token startup residual that has never been enumerated
(context audit §1.1, M1). Adding servers is not free, and the cost is currently unmeasured.
