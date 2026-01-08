"""
Recursive Corpus Navigator (RCN) for MAIA
Inspired by MIT OASYS RLM paradigm

Implements corpus-as-environment processing where the model navigates
corpus via tool calls instead of context stuffing.

NOT the actual RLM library - this is an RLM-shaped implementation
optimized for MAIA's sovereignty constraints.
"""

import os
import json
import logging
import hashlib
import time
from typing import Optional
from datetime import datetime, timezone
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

import anthropic

# Load environment
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rcn-service")

# ═══════════════════════════════════════════════════════════════════════════════
# Budget Defaults (can be overridden per-request)
# ═══════════════════════════════════════════════════════════════════════════════

DEFAULT_MAX_RECURSIONS = 5
DEFAULT_MAX_TOOL_CALLS = 15
DEFAULT_MAX_CHUNKS_READ = 30
DEFAULT_TIMEOUT_MS = 60000  # 60 seconds
DEFAULT_MAX_TOKENS_PER_CALL = 4096

# Token cost estimates (rough, for budgeting)
TOKENS_PER_TOOL_CALL_ESTIMATE = 500
TOKENS_PER_CHUNK_READ_ESTIMATE = 800

# ═══════════════════════════════════════════════════════════════════════════════
# Models
# ═══════════════════════════════════════════════════════════════════════════════

class BudgetLimits(BaseModel):
    """Hard limits to prevent runaway recursion"""
    max_recursions: int = Field(default=DEFAULT_MAX_RECURSIONS, le=20, description="Max recursive depth")
    max_tool_calls: int = Field(default=DEFAULT_MAX_TOOL_CALLS, le=50, description="Max total tool calls")
    max_chunks_read: int = Field(default=DEFAULT_MAX_CHUNKS_READ, le=100, description="Max chunks to read")
    timeout_ms: int = Field(default=DEFAULT_TIMEOUT_MS, le=300000, description="Timeout in milliseconds")
    max_tokens_per_call: int = Field(default=DEFAULT_MAX_TOKENS_PER_CALL, le=8192, description="Max tokens per LLM call")

class RecursiveQuery(BaseModel):
    """Request for recursive corpus navigation"""
    prompt: str = Field(..., description="The main query/task")
    corpus: Optional[list[str]] = Field(default=None, description="Corpus chunks to search/navigate")
    corpus_type: Optional[str] = Field(default="general", description="Type: general, codebase, docs, transcript")
    tools_enabled: list[str] = Field(default=["search", "read", "navigate"], description="Available tools")
    budget: BudgetLimits = Field(default_factory=BudgetLimits, description="Hard budget limits")

class ChunkProvenance(BaseModel):
    """Provenance for an accessed chunk"""
    chunk_id: int
    content_hash: str  # SHA256 of chunk content
    char_count: int
    accessed_at: str  # ISO timestamp
    access_order: int  # Order in which it was accessed

class ExecutionTrace(BaseModel):
    """Detailed trace of a single recursion step"""
    depth: int
    stop_reason: str
    tool_calls_this_step: int
    chunks_read_this_step: list[int]
    elapsed_ms: float
    token_estimate: int

class BudgetUsage(BaseModel):
    """How much of the budget was consumed"""
    recursions_used: int
    recursions_limit: int
    tool_calls_used: int
    tool_calls_limit: int
    chunks_read_used: int
    chunks_read_limit: int
    elapsed_ms: float
    timeout_ms: int
    estimated_tokens: int
    budget_exhausted_reason: Optional[str] = None

class RecursiveResult(BaseModel):
    """Response from recursive processing"""
    answer: str
    confidence: float
    reasoning_trace: list[ExecutionTrace]
    provenance: list[ChunkProvenance]
    budget_usage: BudgetUsage
    completed_normally: bool  # False if budget exhausted

class HealthResponse(BaseModel):
    status: str
    version: str
    model: str
    default_budgets: dict

# ═══════════════════════════════════════════════════════════════════════════════
# Recursive Corpus Navigator Engine
# ═══════════════════════════════════════════════════════════════════════════════

class RCNEngine:
    """
    Recursive Corpus Navigator (RLM-inspired)

    Instead of stuffing entire corpus into context, model queries/navigates
    corpus as external environment through tool calls.

    Key differences from raw LLM:
    - Hard budget enforcement (tool calls, chunks, time)
    - Provenance tracking (what was read, when, hashes)
    - Observability (detailed execution trace)
    """

    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )
        self.model = os.getenv("RLM_MODEL", "claude-sonnet-4-20250514")
        self.tools = self._build_tools()

    def _build_tools(self) -> list[dict]:
        """Define tools for corpus-as-environment"""
        return [
            {
                "name": "search_corpus",
                "description": "Search the corpus for chunks matching a query. Returns chunk IDs and snippets.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "query": {
                            "type": "string",
                            "description": "Search query (keywords or semantic)"
                        },
                        "max_results": {
                            "type": "integer",
                            "description": "Maximum chunks to return",
                            "default": 5
                        }
                    },
                    "required": ["query"]
                }
            },
            {
                "name": "read_chunk",
                "description": "Read the full content of a specific corpus chunk by ID.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "chunk_id": {
                            "type": "integer",
                            "description": "The chunk ID to read"
                        }
                    },
                    "required": ["chunk_id"]
                }
            },
            {
                "name": "navigate_related",
                "description": "Find chunks related to the current chunk (adjacent, linked, or semantically similar).",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "chunk_id": {
                            "type": "integer",
                            "description": "Starting chunk ID"
                        },
                        "direction": {
                            "type": "string",
                            "enum": ["next", "prev", "similar", "linked"],
                            "description": "Navigation direction"
                        }
                    },
                    "required": ["chunk_id", "direction"]
                }
            },
            {
                "name": "submit_answer",
                "description": "Submit final answer when you have enough information. Call this when done.",
                "input_schema": {
                    "type": "object",
                    "properties": {
                        "answer": {
                            "type": "string",
                            "description": "The final answer"
                        },
                        "confidence": {
                            "type": "number",
                            "description": "Confidence 0-1"
                        },
                        "reasoning": {
                            "type": "string",
                            "description": "Brief reasoning summary"
                        }
                    },
                    "required": ["answer", "confidence"]
                }
            }
        ]

    def _hash_chunk(self, content: str) -> str:
        """Generate SHA256 hash of chunk content for provenance"""
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def _execute_tool(
        self,
        tool_name: str,
        tool_input: dict,
        corpus: list[str],
        provenance: list[ChunkProvenance],
        chunks_read_count: int
    ) -> tuple[str, list[ChunkProvenance], int, list[int]]:
        """
        Execute a tool call against the corpus environment.

        Returns: (result_str, updated_provenance, new_chunks_read_count, chunk_ids_read_this_call)
        """
        chunks_read_this_call: list[int] = []

        if tool_name == "search_corpus":
            query = tool_input.get("query", "").lower()
            max_results = tool_input.get("max_results", 5)

            # Simple keyword search (production would use embeddings)
            results = []
            for i, chunk in enumerate(corpus):
                if query in chunk.lower():
                    snippet = chunk[:200] + "..." if len(chunk) > 200 else chunk
                    results.append({"chunk_id": i, "snippet": snippet})
                    if len(results) >= max_results:
                        break

            return json.dumps({"results": results, "total_found": len(results)}), provenance, chunks_read_count, chunks_read_this_call

        elif tool_name == "read_chunk":
            chunk_id = tool_input.get("chunk_id", 0)
            if 0 <= chunk_id < len(corpus):
                content = corpus[chunk_id]
                chunks_read_count += 1
                chunks_read_this_call.append(chunk_id)

                # Add provenance
                provenance.append(ChunkProvenance(
                    chunk_id=chunk_id,
                    content_hash=self._hash_chunk(content),
                    char_count=len(content),
                    accessed_at=datetime.now(timezone.utc).isoformat(),
                    access_order=chunks_read_count
                ))

                return content, provenance, chunks_read_count, chunks_read_this_call
            return f"Chunk {chunk_id} not found", provenance, chunks_read_count, chunks_read_this_call

        elif tool_name == "navigate_related":
            chunk_id = tool_input.get("chunk_id", 0)
            direction = tool_input.get("direction", "next")

            if direction == "next" and chunk_id + 1 < len(corpus):
                return json.dumps({"related_chunk_id": chunk_id + 1}), provenance, chunks_read_count, chunks_read_this_call
            elif direction == "prev" and chunk_id > 0:
                return json.dumps({"related_chunk_id": chunk_id - 1}), provenance, chunks_read_count, chunks_read_this_call
            elif direction == "similar":
                # Would use embeddings in production
                return json.dumps({"related_chunk_id": min(chunk_id + 2, len(corpus) - 1)}), provenance, chunks_read_count, chunks_read_this_call

            return json.dumps({"related_chunk_id": None, "message": "No related chunk found"}), provenance, chunks_read_count, chunks_read_this_call

        elif tool_name == "submit_answer":
            # This is handled specially - signals completion
            return json.dumps(tool_input), provenance, chunks_read_count, chunks_read_this_call

        return "Unknown tool", provenance, chunks_read_count, chunks_read_this_call

    async def process(self, query: RecursiveQuery) -> RecursiveResult:
        """
        Process query using recursive corpus-as-environment paradigm.

        Enforces hard budgets and tracks provenance.
        """
        start_time = time.time()
        corpus = query.corpus or []
        budget = query.budget
        messages = []
        reasoning_trace: list[ExecutionTrace] = []
        provenance: list[ChunkProvenance] = []
        tool_calls_count = 0
        chunks_read_count = 0
        estimated_tokens = 0
        budget_exhausted_reason: Optional[str] = None

        # System prompt for RCN behavior
        system = f"""You are a recursive corpus navigator processing a query against a corpus environment.

Instead of seeing the entire corpus, you navigate it using tools:
- search_corpus: Find relevant chunks
- read_chunk: Read full content of a chunk
- navigate_related: Find connected chunks
- submit_answer: Submit your final answer (required to complete)

Corpus type: {query.corpus_type}
Total chunks available: {len(corpus)}

BUDGET LIMITS (will be enforced):
- Max tool calls: {budget.max_tool_calls}
- Max chunks to read: {budget.max_chunks_read}
- Time limit: {budget.timeout_ms}ms

Strategy:
1. Search for relevant information
2. Read promising chunks (be selective - you have limits)
3. Navigate to related content if needed
4. Submit answer when confident

Be efficient - minimize tool calls while ensuring accuracy.
When ready, call submit_answer with your response."""

        # Initial user message
        messages.append({
            "role": "user",
            "content": query.prompt
        })

        # Recursive loop with budget enforcement
        for depth in range(budget.max_recursions):
            step_start = time.time()

            # Check timeout
            elapsed_ms = (time.time() - start_time) * 1000
            if elapsed_ms >= budget.timeout_ms:
                budget_exhausted_reason = "timeout"
                break

            # Check tool call budget
            if tool_calls_count >= budget.max_tool_calls:
                budget_exhausted_reason = "max_tool_calls"
                break

            # Check chunks read budget
            if chunks_read_count >= budget.max_chunks_read:
                budget_exhausted_reason = "max_chunks_read"
                break

            try:
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=budget.max_tokens_per_call,
                    system=system,
                    tools=self.tools,
                    messages=messages
                )
            except Exception as e:
                logger.error(f"LLM call failed at depth {depth}: {e}")
                budget_exhausted_reason = f"llm_error: {str(e)}"
                break

            step_elapsed = (time.time() - step_start) * 1000
            tool_calls_this_step = 0
            chunks_read_this_step: list[int] = []

            # Track reasoning
            trace_entry = ExecutionTrace(
                depth=depth,
                stop_reason=response.stop_reason,
                tool_calls_this_step=0,
                chunks_read_this_step=[],
                elapsed_ms=step_elapsed,
                token_estimate=TOKENS_PER_TOOL_CALL_ESTIMATE
            )

            # Check if model is done (no tool use)
            if response.stop_reason == "end_turn":
                text_blocks = [b for b in response.content if b.type == "text"]
                reasoning_trace.append(trace_entry)

                if text_blocks:
                    total_elapsed = (time.time() - start_time) * 1000
                    return RecursiveResult(
                        answer=text_blocks[0].text,
                        confidence=0.7,
                        reasoning_trace=reasoning_trace,
                        provenance=provenance,
                        budget_usage=BudgetUsage(
                            recursions_used=depth + 1,
                            recursions_limit=budget.max_recursions,
                            tool_calls_used=tool_calls_count,
                            tool_calls_limit=budget.max_tool_calls,
                            chunks_read_used=chunks_read_count,
                            chunks_read_limit=budget.max_chunks_read,
                            elapsed_ms=total_elapsed,
                            timeout_ms=budget.timeout_ms,
                            estimated_tokens=estimated_tokens
                        ),
                        completed_normally=True
                    )

            # Process tool calls
            if response.stop_reason == "tool_use":
                messages.append({
                    "role": "assistant",
                    "content": response.content
                })

                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        tool_calls_count += 1
                        tool_calls_this_step += 1
                        estimated_tokens += TOKENS_PER_TOOL_CALL_ESTIMATE

                        # Check budgets before executing
                        if tool_calls_count > budget.max_tool_calls:
                            budget_exhausted_reason = "max_tool_calls"
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": "BUDGET EXCEEDED: max_tool_calls reached. Call submit_answer now."
                            })
                            continue

                        # Check for submit_answer (completion signal)
                        if block.name == "submit_answer":
                            answer_data = block.input
                            trace_entry.tool_calls_this_step = tool_calls_this_step
                            trace_entry.chunks_read_this_step = chunks_read_this_step
                            reasoning_trace.append(trace_entry)

                            total_elapsed = (time.time() - start_time) * 1000
                            return RecursiveResult(
                                answer=answer_data.get("answer", ""),
                                confidence=answer_data.get("confidence", 0.8),
                                reasoning_trace=reasoning_trace,
                                provenance=provenance,
                                budget_usage=BudgetUsage(
                                    recursions_used=depth + 1,
                                    recursions_limit=budget.max_recursions,
                                    tool_calls_used=tool_calls_count,
                                    tool_calls_limit=budget.max_tool_calls,
                                    chunks_read_used=chunks_read_count,
                                    chunks_read_limit=budget.max_chunks_read,
                                    elapsed_ms=total_elapsed,
                                    timeout_ms=budget.timeout_ms,
                                    estimated_tokens=estimated_tokens
                                ),
                                completed_normally=True
                            )

                        # Check chunk read budget
                        if block.name == "read_chunk" and chunks_read_count >= budget.max_chunks_read:
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": "BUDGET EXCEEDED: max_chunks_read reached. Call submit_answer with what you know."
                            })
                            continue

                        # Execute tool
                        result, provenance, chunks_read_count, chunks_this_call = self._execute_tool(
                            block.name,
                            block.input,
                            corpus,
                            provenance,
                            chunks_read_count
                        )
                        chunks_read_this_step.extend(chunks_this_call)

                        if block.name == "read_chunk":
                            estimated_tokens += TOKENS_PER_CHUNK_READ_ESTIMATE

                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result
                        })

                messages.append({
                    "role": "user",
                    "content": tool_results
                })

                trace_entry.tool_calls_this_step = tool_calls_this_step
                trace_entry.chunks_read_this_step = chunks_read_this_step
                reasoning_trace.append(trace_entry)

            # Break if budget exhausted
            if budget_exhausted_reason:
                break

        # Budget exhausted or max recursions - return partial result
        total_elapsed = (time.time() - start_time) * 1000
        return RecursiveResult(
            answer=f"Processing stopped: {budget_exhausted_reason or 'max_recursions'}. Partial exploration completed.",
            confidence=0.3,
            reasoning_trace=reasoning_trace,
            provenance=provenance,
            budget_usage=BudgetUsage(
                recursions_used=len(reasoning_trace),
                recursions_limit=budget.max_recursions,
                tool_calls_used=tool_calls_count,
                tool_calls_limit=budget.max_tool_calls,
                chunks_read_used=chunks_read_count,
                chunks_read_limit=budget.max_chunks_read,
                elapsed_ms=total_elapsed,
                timeout_ms=budget.timeout_ms,
                estimated_tokens=estimated_tokens,
                budget_exhausted_reason=budget_exhausted_reason
            ),
            completed_normally=False
        )

# ═══════════════════════════════════════════════════════════════════════════════
# FastAPI Application
# ═══════════════════════════════════════════════════════════════════════════════

rcn_engine: Optional[RCNEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RCN engine on startup"""
    global rcn_engine
    logger.info("Initializing Recursive Corpus Navigator...")
    rcn_engine = RCNEngine()
    logger.info(f"RCN engine ready (model: {rcn_engine.model})")
    yield
    logger.info("RCN service shutting down")

app = FastAPI(
    title="MAIA Recursive Corpus Navigator",
    description="RLM-inspired corpus-as-environment processing with budget enforcement",
    version="0.2.0",
    lifespan=lifespan
)

# CORS for internal network
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Internal service, locked to docker network
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health():
    """Health check endpoint"""
    return HealthResponse(
        status="healthy",
        version="0.2.0",
        model=rcn_engine.model if rcn_engine else "not initialized",
        default_budgets={
            "max_recursions": DEFAULT_MAX_RECURSIONS,
            "max_tool_calls": DEFAULT_MAX_TOOL_CALLS,
            "max_chunks_read": DEFAULT_MAX_CHUNKS_READ,
            "timeout_ms": DEFAULT_TIMEOUT_MS
        }
    )

@app.post("/process", response_model=RecursiveResult)
async def process_recursive(query: RecursiveQuery):
    """
    Process a query using recursive corpus-as-environment paradigm.

    The model navigates the corpus through tool calls rather than
    receiving the entire context at once.

    Hard budgets prevent runaway recursion.
    """
    if not rcn_engine:
        raise HTTPException(status_code=503, detail="RCN engine not initialized")

    try:
        result = await rcn_engine.process(query)
        logger.info(
            f"RCN processed: depth={result.budget_usage.recursions_used}, "
            f"tools={result.budget_usage.tool_calls_used}/{result.budget_usage.tool_calls_limit}, "
            f"chunks={result.budget_usage.chunks_read_used}/{result.budget_usage.chunks_read_limit}, "
            f"elapsed={result.budget_usage.elapsed_ms:.0f}ms, "
            f"completed={result.completed_normally}"
        )
        return result
    except Exception as e:
        logger.error(f"RCN processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_corpus_direct(query: str, corpus: list[str], max_results: int = 10):
    """
    Simple corpus search endpoint (for testing/direct use).
    """
    query_lower = query.lower()
    results = []
    for i, chunk in enumerate(corpus):
        if query_lower in chunk.lower():
            results.append({
                "chunk_id": i,
                "snippet": chunk[:300] + "..." if len(chunk) > 300 else chunk
            })
            if len(results) >= max_results:
                break
    return {"results": results, "total": len(results)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)
