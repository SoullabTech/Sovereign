# RLM Navigator Manual

> Developer tool for navigating the MAIA codebase
> Location: `localhost:3000/labtools/rlm`

---

## Overview

RLM (Retrieval-augmented Language Model) Navigator helps you find code fast. Ask natural language questions like "where is X implemented?" and get ranked file recommendations with proof anchors.

**Two modes:**
- **Navigate** — Fast token-based search (no LLM, instant results)
- **Ask** — Agentic Q&A using local Ollama (deeper analysis, slower)

---

## Quick Start

1. Go to `localhost:3000/labtools/rlm`
2. Type a question in the text area
3. Press **⌘+Enter** or click **Navigate**
4. Open recommended files directly from results

---

## Modes

### Navigate Mode (Default)

**Best for:** "Where is X?" questions, finding files, quick lookups

**How it works:**
- Builds an in-memory index of all `.ts`, `.tsx`, `.js`, `.md`, `.sql`, `.sh`, `.json`, `.yml` files
- Extracts tokens from exports, functions, classes, interfaces
- Scores files by token overlap with your query
- Returns top 5 files with snippets

**Speed:** Instant (~50-200ms)

**No dependencies:** Works without Ollama or any external service

**Example queries:**
- "Where is synastry saved to timeline?"
- "postgres connection handling"
- "How does explorerId become a UUID?"
- "authentication middleware"
- "consciousness router"

### Ask Mode

**Best for:** Complex questions requiring multiple file reads, explanations

**How it works:**
- Uses local Ollama (DeepSeek model) to iteratively:
  1. Search for relevant files
  2. Read file contents
  3. Synthesize an answer
- Returns a full prose answer with source references

**Speed:** 5-60 seconds (depends on Ollama and iteration count)

**Requirements:** Ollama must be running locally (`ollama serve`)

**Example queries:**
- "Explain how the postgres client handles connections"
- "What's the flow from user message to MAIA response?"
- "How does the memory system decide what to store?"

---

## UI Controls

| Control | Description |
|---------|-------------|
| **Text area** | Enter your question (min 2 characters) |
| **Navigate / Ask toggle** | Switch between modes |
| **includeTrace** | (Ask only) Show reasoning steps in results |
| **Navigate / Ask button** | Run the query |
| **Cancel** | Abort in-flight request |
| **⌘+Enter** | Keyboard shortcut to run |

---

## Results

### Navigate Results

| Section | Description |
|---------|-------------|
| **Next files to open** | Ranked list of recommended files |
| **Score** | Relevance score (higher = better match) |
| **Why** | Reasons for ranking (token matches, file type) |
| **Snippet** | Code excerpt around the match |
| **Open** | View file contents inline |
| **Copy** | Copy file path to clipboard |
| **Suggested grep queries** | Pre-built grep commands to run in terminal |
| **Proof anchors** | Source references for audit trail |
| **Warnings** | System warnings (e.g., `usage_not_applicable_bloodhound`) |

### Ask Results

| Section | Description |
|---------|-------------|
| **Answer** | Synthesized prose answer |
| **Proof** | Source references with line numbers |
| **Files read** | List of files the agent examined |
| **Trace** | (if includeTrace) Step-by-step reasoning |
| **Usage** | Budget consumption (search/read/list operations) |

---

## File Viewer

When you click **Open** on any file:

| Control | Description |
|---------|-------------|
| **File path** | Shows current file and line range |
| **Open full** | Load entire file (if viewing a snippet) |
| **Use as context** | (Navigate only) Re-run search with this file as focus |
| **Close** | Dismiss the viewer |

### Focus Mode

After opening a file, click **Use as context** to:
- Set that file as the "focus"
- Re-run your query with additional context from that file
- Results will prioritize files in the same directory or related areas

A green **Focus** indicator shows which file is active. Click **Clear focus** to reset.

---

## Stats & Confidence

### Navigate Stats
```
confidence 85% · indexed 1,247 · 142ms
```
- **confidence** — How likely the top result answers your question (0-95%)
- **indexed** — Total files in the search index
- **ms** — Query time in milliseconds

### Ask Stats
```
confidence 72% · iterations 4 · ~2,340 tokens
```
- **confidence** — Answer quality estimate
- **iterations** — How many search/read cycles the agent ran
- **tokens** — Approximate token usage

---

## Warnings

| Warning | Meaning |
|---------|---------|
| `usage_not_applicable_bloodhound` | Navigate mode doesn't track usage budgets (normal) |
| `confidence_without_proof_anchor` | High confidence but no source refs (edge case) |
| `ollama_unavailable` | Ask mode can't reach Ollama |

---

## Tips

### Get better Navigate results
- Use specific terms: "synastry timeline save" vs "save stuff"
- Include type hints: "postgres client" vs "database"
- Try function/class names if you know them

### When to use Ask vs Navigate
- **Navigate first** — instant results, often enough
- **Ask** — when you need explanation or multi-file understanding

### Speed up Ask mode
- Keep Ollama warm (run a query first)
- Use smaller models if available
- Reduce `maxIterations` in the request

### Use Focus for exploration
1. Navigate → find a relevant file
2. Open → Use as context
3. Your next search prioritizes nearby files
4. Great for "show me related code"

---

## API Endpoints

For programmatic access:

### POST /api/rlm/navigate
```json
{
  "query": "postgres connection",
  "limit": 5,
  "includeSnippets": true,
  "focus": {
    "path": "lib/db/postgres.ts",
    "content": "..."
  }
}
```

### POST /api/rlm/ask
```json
{
  "query": "How does the memory system work?",
  "includeTrace": true,
  "maxIterations": 8,
  "budget": {
    "search": 8,
    "read": 12,
    "list": 6
  }
}
```

### POST /api/rlm/open
```json
{
  "path": "lib/db/postgres.ts",
  "startLine": 50,
  "endLine": 100
}
```

---

## Troubleshooting

### "Taking a while? Make sure Ollama is running"
Ask mode requires Ollama. Start it:
```bash
ollama serve
```

### No results in Navigate
- Try broader terms
- Check spelling
- The file might use different naming

### Ask returns shallow answers
- Increase `maxIterations`
- Be more specific in your question
- Check if Ollama model is loaded

### File viewer shows truncated content
Large files are capped. Click **Open full** or use line range params in the API.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   /labtools/rlm                         │
│                   (React UI)                            │
└─────────────────────┬───────────────────────────────────┘
                      │
        ┌─────────────┴─────────────┐
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│ /api/rlm/     │           │ /api/rlm/ask  │
│ navigate      │           │               │
└───────┬───────┘           └───────┬───────┘
        │                           │
        ▼                           ▼
┌───────────────┐           ┌───────────────┐
│ lib/rlm/      │           │ lib/rlm/      │
│ navigate.ts   │           │ CodebaseNav   │
│ (bloodhound)  │           │ igator.ts     │
└───────────────┘           └───────┬───────┘
                                    │
                                    ▼
                            ┌───────────────┐
                            │ Local Ollama  │
                            │ (DeepSeek)    │
                            └───────────────┘
```

---

## Files

| File | Purpose |
|------|---------|
| `app/labtools/rlm/page.tsx` | UI component |
| `lib/rlm/navigate.ts` | Bloodhound (fast search) |
| `lib/rlm/CodebaseNavigator.ts` | Agentic navigator (Ollama) |
| `lib/rlm/types.ts` | Shared types |
| `lib/rlm/access.ts` | Access control |
| `app/api/rlm/navigate/route.ts` | Navigate API |
| `app/api/rlm/ask/route.ts` | Ask API |
| `app/api/rlm/open/route.ts` | File open API |
| `components/rlm/RlmFileViewer.tsx` | File viewer component |

---

*Last updated: January 2026*
