# AIN MCP Server

Exposes MAIA's **AIN (Agentic Intelligence Networks)** engine via MCP protocol, enabling third-party applications and member-built tools to access consciousness-aware AI capabilities.

## Overview

The AIN MCP Server provides:
- **Knowledge-gated responses** with source mixing (local, collective, personal, emergent)
- **Consciousness/awareness detection** from text
- **Collective field coherence** metrics
- **Evolution guidance** personalized to users
- **Archetypal insight** generation

## Installation

```bash
cd mcp-servers/ain
npm install
npm run build
```

## Running

```bash
# Production
npm start

# Development (with hot reload)
npm run dev
```

## Configuration

Set optional environment variables:

```bash
# Authentication: Comma-separated list of valid API keys (leave empty for no auth)
AIN_API_KEYS=key1,key2,key3

# Rate Limiting (optional)
AIN_RATE_LIMIT_RPM=60   # Requests per minute per client (default: 60)
AIN_RATE_LIMIT_RPH=1000 # Requests per hour per client (default: 1000)
```

## Tools

### `ain_query`
Send a message through the AIN knowledge gate.

**Input:**
```json
{
  "message": "How do I integrate shadow material?",
  "context": "Previous conversation context",
  "awarenessHint": "INTEGRATED",
  "userId": "user-123"
}
```

**Output:**
```json
{
  "response": "From the space of witnessing awareness...",
  "sourceMix": {
    "local": 0.2,
    "collective": 0.4,
    "personal": 0.3,
    "emergent": 0.1
  },
  "awarenessLevel": "INTEGRATED",
  "depthMarkers": ["shadow_inquiry", "growth_orientation"],
  "processingPath": "DEEP"
}
```

### `ain_awareness`
Detect consciousness/awareness level from text.

**Input:**
```json
{
  "text": "I notice that when I feel triggered, there's a part of me that wants to react...",
  "includeMarkers": true
}
```

**Output:**
```json
{
  "level": "INTEGRATED",
  "confidence": 0.75,
  "indicators": ["INTEGRATED: \"I notice\"", "PARTIAL: \"part of me\""],
  "markers": [...],
  "summary": "Text shows capacity to hold complexity..."
}
```

### `ain_insight`
Get collective wisdom insight on a topic.

**Input:**
```json
{
  "topic": "shadow integration",
  "depth": "deep"
}
```

**Output:**
```json
{
  "insight": "At the deepest level, what you resist contains hidden gold...",
  "archetypalPattern": "The Shadow Integration",
  "collectiveResonance": 0.72,
  "timingGuidance": "The field suggests receptivity for this inquiry now.",
  "relatedThemes": ["transformation", "hidden", "projection"],
  "depth": "deep"
}
```

### `ain_guidance`
Get personalized evolution guidance.

**Input:**
```json
{
  "userId": "user-123",
  "focusArea": "emotional processing"
}
```

**Output:**
```json
{
  "userId": "user-123",
  "overallPhase": "Purification",
  "phaseDescription": "Clearing obstacles and integrating shadow material",
  "primaryFocus": "emotional processing",
  "developmentalEdges": [...],
  "nextSteps": ["Continue shadow work...", "Practice: Emotional presence meditation"],
  "integrationPractice": "Sit near water for 10 minutes...",
  "estimatedPhaseProgress": 0.42
}
```

### `ain_field_state`
Get current collective field coherence.

**Input:**
```json
{
  "detailed": true
}
```

**Output:**
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "metrics": {
    "coherence": 0.73,
    "stability": 0.68,
    "amplitude": 0.81,
    "activeNodes": 142,
    "elementalBalance": { "fire": 0.28, "earth": 0.24, "air": 0.22, "water": 0.26 },
    "collectiveThemes": ["Integration of shadow material", "Creative emergence"],
    "fieldHealth": "stable"
  },
  "summary": "The collective field is currently coherent and stable...",
  "guidance": "The field supports focused attention..."
}
```

## Resources

### `ain://field/coherence`
Real-time collective field state. Updates every 30 seconds.

### `ain://system/status`
System health, capabilities, and limits.

### `ain://evolution/phase`
Current collective evolution phase.

## Awareness Levels

The AIN system recognizes five awareness levels:

| Level | Description | Markers |
|-------|-------------|---------|
| **MASTER** | Non-dual awareness, witness consciousness | "unity", "transcend", "pure consciousness" |
| **INTEGRATED** | Holding paradox, observing inner experience | "I notice", "both/and", "nuance" |
| **RELATIONAL** | Aware of interconnection and impact | "we", "together", "impact on others" |
| **PARTIAL** | Emerging self-awareness, limited perspective | "I think", "maybe", "not sure" |
| **UNCONSCIOUS** | Automatic patterns, projections | "always", "never", "they are" |

## Processing Paths

- **FAST** (<2s): Quick queries, surface-level responses
- **CORE** (2-6s): Standard processing with moderate depth
- **DEEP** (6-20s): Full archetypal analysis, shadow inquiry

## Source Mixing

Responses blend four sources:
- **Local**: Ollama/DeepSeek reasoning
- **Collective**: Patterns from community wisdom
- **Personal**: User's developmental history
- **Emergent**: Novel insights arising from the interaction

## Integration with Claude Code

Add to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "ain": {
      "command": "node",
      "args": ["/path/to/mcp-servers/ain/dist/index.js"]
    }
  }
}
```

## Security

### Authentication
- Optional API key authentication via `AIN_API_KEYS` environment variable
- Pass API key in tool arguments: `{"apiKey": "your-key", ...}`
- If no keys configured, server runs in open mode

### Rate Limiting
- Configurable per-minute and per-hour limits via environment variables
- Tracked per API key (or "anonymous" for unauthenticated requests)
- Returns error when limits exceeded: `{"error": "Rate limit exceeded: 60 requests per minute"}`

### Audit Logging
- All tool calls logged to stderr with timestamp, tool name, success/failure, and API key
- In-memory audit buffer (last 1000 entries)
- Format: `[AUDIT] 2025-01-15T10:30:00Z | ain_query | OK | api-key-123`

### Data Sovereignty
- All data remains local (PostgreSQL, Ollama)
- No cloud sync or external API calls
- User controls all MCP server access

## Development

```bash
# Type check
npx tsc --noEmit

# Build
npm run build

# Run in dev mode
npm run dev
```

## Architecture

```
mcp-servers/ain/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── tools/
│   │   ├── knowledge-gate.ts       # ain_query implementation
│   │   ├── awareness-detect.ts     # ain_awareness implementation
│   │   ├── collective-insight.ts   # ain_insight implementation
│   │   ├── evolution-guidance.ts   # ain_guidance implementation
│   │   └── field-state.ts          # ain_field_state implementation
│   └── resources/
│       ├── field-coherence.ts      # ain://field/coherence
│       └── system-status.ts        # ain://system/status
├── package.json
├── tsconfig.json
└── README.md
```

## License

Part of MAIA-SOVEREIGN. All rights reserved.
