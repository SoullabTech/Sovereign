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
import uuid
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
TOKENS_PER_TOOL_CALL_OVERHEAD = 150  # Tool call structure
TOKENS_PER_CHUNK_CHAR = 0.25  # ~4 chars per token
TOKENS_PER_LLM_RESPONSE_ESTIMATE = 800  # Average response size
TOKENS_SYSTEM_PROMPT_ESTIMATE = 400  # System prompt overhead

# Tool name mapping (request names -> actual tool names)
TOOL_NAME_MAP = {
    "search": "search_corpus",
    "read": "read_chunk",
    "navigate": "navigate_related",
    "submit": "submit_answer",
    # Also accept full names
    "search_corpus": "search_corpus",
    "read_chunk": "read_chunk",
    "navigate_related": "navigate_related",
    "submit_answer": "submit_answer",
}

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
    tools_enabled: list[str] = Field(
        default=["search", "read", "navigate"],
        description="Tools to enable: search, read, navigate (submit always enabled)"
    )
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
    input_tokens_this_step: int  # Estimated input tokens this step
    output_tokens_this_step: int  # Estimated output tokens this step

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
    estimated_input_tokens: int
    estimated_output_tokens: int
    estimated_total_tokens: int
    budget_exhausted_reason: Optional[str] = None

class RecursiveResult(BaseModel):
    """Response from recursive processing"""
    run_id: str  # Unique ID for this run (for correlation/debugging)
    answer: str
    confidence: float
    reasoning_trace: list[ExecutionTrace]
    provenance: list[ChunkProvenance]
    budget_usage: BudgetUsage
    completed_normally: bool  # False if budget exhausted
    not_verified: Optional[list[str]] = None  # Things not checked (if budget exhausted)
    rerun_suggestion: Optional[str] = None  # Suggested budget increase for rerun

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

    Key features:
    - Hard budget enforcement (tool calls, chunks, time)
    - Provenance tracking (what was read, when, hashes)
    - Observability (detailed execution trace)
    - Tool filtering (enable/disable specific tools)
    - Run IDs for correlation
    """

    def __init__(self):
        self.client = anthropic.Anthropic(
            api_key=os.getenv("ANTHROPIC_API_KEY")
        )
        self.model = os.getenv("RLM_MODEL", "claude-sonnet-4-20250514")
        self.all_tools = self._build_all_tools()

    def _build_all_tools(self) -> dict[str, dict]:
        """Build all available tools as a dict for filtering"""
        return {
            "search_corpus": {
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
            "read_chunk": {
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
            "navigate_related": {
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
            "submit_answer": {
                "name": "submit_answer",
                "description": "Submit final answer when you have enough information OR when budget is exhausted. Include what you couldn't verify if incomplete.",
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
                        },
                        "not_verified": {
                            "type": "array",
                            "items": {"type": "string"},
                            "description": "List of things you didn't have time/budget to check"
                        },
                        "rerun_suggestion": {
                            "type": "string",
                            "description": "What budget to increase if rerun needed (e.g., 'increase max_chunks_read to 30')"
                        }
                    },
                    "required": ["answer", "confidence"]
                }
            }
        }

    def _get_filtered_tools(self, tools_enabled: list[str]) -> list[dict]:
        """Filter tools based on request. submit_answer always included."""
        enabled_tool_names = set()

        # Map request names to actual tool names
        for name in tools_enabled:
            if name in TOOL_NAME_MAP:
                enabled_tool_names.add(TOOL_NAME_MAP[name])

        # Always include submit_answer
        enabled_tool_names.add("submit_answer")

        return [self.all_tools[name] for name in enabled_tool_names if name in self.all_tools]

    def _hash_chunk(self, content: str) -> str:
        """Generate SHA256 hash of chunk content for provenance"""
        return hashlib.sha256(content.encode()).hexdigest()[:16]

    def _estimate_tokens(self, text: str) -> int:
        """Rough token estimate (~4 chars per token for English)"""
        return int(len(text) * TOKENS_PER_CHUNK_CHAR)

    def _execute_tool(
        self,
        tool_name: str,
        tool_input: dict,
        corpus: list[str],
        provenance: list[ChunkProvenance],
        chunks_read_count: int,
        run_id: str
    ) -> tuple[str, list[ChunkProvenance], int, list[int], int]:
        """
        Execute a tool call against the corpus environment.

        Returns: (result_str, updated_provenance, new_chunks_read_count, chunk_ids_read_this_call, tokens_estimate)
        """
        chunks_read_this_call: list[int] = []
        tokens_estimate = TOKENS_PER_TOOL_CALL_OVERHEAD

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

            result = json.dumps({"results": results, "total_found": len(results)})
            tokens_estimate += self._estimate_tokens(result)
            return result, provenance, chunks_read_count, chunks_read_this_call, tokens_estimate

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

                tokens_estimate += self._estimate_tokens(content)
                logger.debug(f"[{run_id}] read_chunk({chunk_id}): {len(content)} chars, ~{tokens_estimate} tokens")
                return content, provenance, chunks_read_count, chunks_read_this_call, tokens_estimate

            return f"Chunk {chunk_id} not found", provenance, chunks_read_count, chunks_read_this_call, tokens_estimate

        elif tool_name == "navigate_related":
            chunk_id = tool_input.get("chunk_id", 0)
            direction = tool_input.get("direction", "next")

            if direction == "next" and chunk_id + 1 < len(corpus):
                result = json.dumps({"related_chunk_id": chunk_id + 1})
            elif direction == "prev" and chunk_id > 0:
                result = json.dumps({"related_chunk_id": chunk_id - 1})
            elif direction == "similar":
                # Would use embeddings in production
                result = json.dumps({"related_chunk_id": min(chunk_id + 2, len(corpus) - 1)})
            else:
                result = json.dumps({"related_chunk_id": None, "message": "No related chunk found"})

            tokens_estimate += self._estimate_tokens(result)
            return result, provenance, chunks_read_count, chunks_read_this_call, tokens_estimate

        elif tool_name == "submit_answer":
            # This is handled specially - signals completion
            result = json.dumps(tool_input)
            tokens_estimate += self._estimate_tokens(result)
            return result, provenance, chunks_read_count, chunks_read_this_call, tokens_estimate

        return "Unknown tool", provenance, chunks_read_count, chunks_read_this_call, tokens_estimate

    def _make_budget_exhausted_message(
        self,
        reason: str,
        chunks_read: int,
        tool_calls: int,
        provenance: list[ChunkProvenance],
        budget: BudgetLimits
    ) -> str:
        """Create helpful message when budget is exhausted"""
        chunk_summary = ""
        if provenance:
            chunk_ids = [p.chunk_id for p in provenance[-5:]]  # Last 5 chunks
            chunk_summary = f" You read chunks: {chunk_ids}."

        # Suggest which budget to increase based on exhaustion reason
        suggestion = ""
        if reason == "max_tool_calls":
            suggestion = f"increase max_tool_calls from {budget.max_tool_calls} to {budget.max_tool_calls + 10}"
        elif reason == "max_chunks_read":
            suggestion = f"increase max_chunks_read from {budget.max_chunks_read} to {budget.max_chunks_read + 15}"
        elif reason == "timeout":
            suggestion = f"increase timeout_ms from {budget.timeout_ms} to {budget.timeout_ms + 30000}"

        return (
            f"BUDGET LIMIT REACHED: {reason}. "
            f"You've made {tool_calls} tool calls and read {chunks_read} chunks.{chunk_summary} "
            f"Call submit_answer NOW with: "
            f"(1) your best answer based on what you've found, "
            f"(2) not_verified: list what you didn't have time to check, "
            f"(3) rerun_suggestion: '{suggestion}' if a rerun would help."
        )

    async def process(self, query: RecursiveQuery) -> RecursiveResult:
        """
        Process query using recursive corpus-as-environment paradigm.

        Enforces hard budgets and tracks provenance.
        """
        run_id = str(uuid.uuid4())[:8]  # Short ID for logs
        start_time = time.time()
        corpus = query.corpus or []
        budget = query.budget
        messages = []
        reasoning_trace: list[ExecutionTrace] = []
        provenance: list[ChunkProvenance] = []
        tool_calls_count = 0
        chunks_read_count = 0
        estimated_input_tokens = TOKENS_SYSTEM_PROMPT_ESTIMATE
        estimated_output_tokens = 0
        budget_exhausted_reason: Optional[str] = None

        # Get filtered tools based on request
        tools = self._get_filtered_tools(query.tools_enabled)
        tool_names = [t["name"] for t in tools]

        logger.info(f"[{run_id}] Starting RCN: corpus={len(corpus)} chunks, tools={tool_names}, budget={budget.max_tool_calls}/{budget.max_chunks_read}/{budget.timeout_ms}ms")

        # System prompt for RCN behavior
        system = f"""You are a recursive corpus navigator processing a query against a corpus environment.

Instead of seeing the entire corpus, you navigate it using tools:
{chr(10).join(f'- {t["name"]}: {t["description"].split(".")[0]}' for t in tools)}

Corpus type: {query.corpus_type}
Total chunks available: {len(corpus)}

BUDGET LIMITS (will be enforced - plan accordingly):
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

        estimated_input_tokens += self._estimate_tokens(query.prompt)

        # Initial user message
        messages.append({
            "role": "user",
            "content": query.prompt
        })

        # Recursive loop with budget enforcement
        for depth in range(budget.max_recursions):
            step_start = time.time()
            step_input_tokens = 0
            step_output_tokens = 0

            # Check timeout
            elapsed_ms = (time.time() - start_time) * 1000
            if elapsed_ms >= budget.timeout_ms:
                budget_exhausted_reason = "timeout"
                logger.warning(f"[{run_id}] Timeout at depth {depth}: {elapsed_ms:.0f}ms >= {budget.timeout_ms}ms")
                break

            # Check tool call budget
            if tool_calls_count >= budget.max_tool_calls:
                budget_exhausted_reason = "max_tool_calls"
                logger.warning(f"[{run_id}] Tool call limit at depth {depth}: {tool_calls_count} >= {budget.max_tool_calls}")
                break

            # Check chunks read budget
            if chunks_read_count >= budget.max_chunks_read:
                budget_exhausted_reason = "max_chunks_read"
                logger.warning(f"[{run_id}] Chunk read limit at depth {depth}: {chunks_read_count} >= {budget.max_chunks_read}")
                break

            try:
                response = self.client.messages.create(
                    model=self.model,
                    max_tokens=budget.max_tokens_per_call,
                    system=system,
                    tools=tools,
                    messages=messages
                )
                # Estimate tokens from response
                step_output_tokens = TOKENS_PER_LLM_RESPONSE_ESTIMATE
                if hasattr(response, 'usage'):
                    # Use actual usage if available
                    step_input_tokens = getattr(response.usage, 'input_tokens', 0)
                    step_output_tokens = getattr(response.usage, 'output_tokens', 0)

            except Exception as e:
                logger.error(f"[{run_id}] LLM call failed at depth {depth}: {e}")
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
                input_tokens_this_step=step_input_tokens,
                output_tokens_this_step=step_output_tokens
            )

            # Check if model is done (no tool use)
            if response.stop_reason == "end_turn":
                text_blocks = [b for b in response.content if b.type == "text"]
                reasoning_trace.append(trace_entry)
                estimated_output_tokens += step_output_tokens

                if text_blocks:
                    total_elapsed = (time.time() - start_time) * 1000
                    logger.info(f"[{run_id}] Completed at depth {depth}: end_turn, {total_elapsed:.0f}ms")
                    return RecursiveResult(
                        run_id=run_id,
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
                            estimated_input_tokens=estimated_input_tokens,
                            estimated_output_tokens=estimated_output_tokens,
                            estimated_total_tokens=estimated_input_tokens + estimated_output_tokens
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

                        # Check budgets before executing
                        if tool_calls_count > budget.max_tool_calls:
                            budget_exhausted_reason = "max_tool_calls"
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": self._make_budget_exhausted_message(
                                    "max_tool_calls", chunks_read_count, tool_calls_count, provenance, budget
                                )
                            })
                            continue

                        # Check for submit_answer (completion signal)
                        if block.name == "submit_answer":
                            answer_data = block.input
                            trace_entry.tool_calls_this_step = tool_calls_this_step
                            trace_entry.chunks_read_this_step = chunks_read_this_step
                            reasoning_trace.append(trace_entry)
                            estimated_output_tokens += step_output_tokens

                            total_elapsed = (time.time() - start_time) * 1000
                            not_verified = answer_data.get("not_verified")
                            rerun_suggestion = answer_data.get("rerun_suggestion")
                            logger.info(f"[{run_id}] Completed at depth {depth}: submit_answer, confidence={answer_data.get('confidence', 0.8)}, not_verified={len(not_verified) if not_verified else 0}")
                            return RecursiveResult(
                                run_id=run_id,
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
                                    estimated_input_tokens=estimated_input_tokens,
                                    estimated_output_tokens=estimated_output_tokens,
                                    estimated_total_tokens=estimated_input_tokens + estimated_output_tokens
                                ),
                                completed_normally=True,
                                not_verified=not_verified,
                                rerun_suggestion=rerun_suggestion
                            )

                        # Check chunk read budget
                        if block.name == "read_chunk" and chunks_read_count >= budget.max_chunks_read:
                            tool_results.append({
                                "type": "tool_result",
                                "tool_use_id": block.id,
                                "content": self._make_budget_exhausted_message(
                                    "max_chunks_read", chunks_read_count, tool_calls_count, provenance, budget
                                )
                            })
                            continue

                        # Execute tool
                        result, provenance, chunks_read_count, chunks_this_call, tool_tokens = self._execute_tool(
                            block.name,
                            block.input,
                            corpus,
                            provenance,
                            chunks_read_count,
                            run_id
                        )
                        chunks_read_this_step.extend(chunks_this_call)
                        step_input_tokens += tool_tokens

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
                trace_entry.input_tokens_this_step = step_input_tokens
                reasoning_trace.append(trace_entry)
                estimated_input_tokens += step_input_tokens
                estimated_output_tokens += step_output_tokens

            # Break if budget exhausted
            if budget_exhausted_reason:
                break

        # Budget exhausted or max recursions - return partial result
        total_elapsed = (time.time() - start_time) * 1000
        logger.warning(f"[{run_id}] Incomplete: {budget_exhausted_reason or 'max_recursions'}, {total_elapsed:.0f}ms")
        return RecursiveResult(
            run_id=run_id,
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
                estimated_input_tokens=estimated_input_tokens,
                estimated_output_tokens=estimated_output_tokens,
                estimated_total_tokens=estimated_input_tokens + estimated_output_tokens,
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
    version="0.2.1",
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
        version="0.2.1",
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
            f"[{result.run_id}] RCN complete: "
            f"depth={result.budget_usage.recursions_used}, "
            f"tools={result.budget_usage.tool_calls_used}/{result.budget_usage.tool_calls_limit}, "
            f"chunks={result.budget_usage.chunks_read_used}/{result.budget_usage.chunks_read_limit}, "
            f"tokens~{result.budget_usage.estimated_total_tokens}, "
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
