"""
RLM Microservice for MAIA
Recursive Language Models - MIT OASYS paradigm

Exposes RLM capabilities via FastAPI for MAIA orchestration layer.
Runs in Docker container for sovereignty/isolation.
"""

import os
import json
import logging
from typing import Optional, Any
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
logger = logging.getLogger("rlm-service")

# ═══════════════════════════════════════════════════════════════════════════════
# Models
# ═══════════════════════════════════════════════════════════════════════════════

class RecursiveQuery(BaseModel):
    """Request for recursive language model processing"""
    prompt: str = Field(..., description="The main query/task")
    corpus: Optional[list[str]] = Field(default=None, description="Corpus chunks to search/navigate")
    corpus_type: Optional[str] = Field(default="general", description="Type: general, codebase, docs, transcript")
    max_recursions: int = Field(default=5, description="Maximum recursive depth")
    max_tokens: int = Field(default=4096, description="Max tokens per call")
    tools_enabled: list[str] = Field(default=["search", "read", "navigate"], description="Available tools")

class RecursiveResult(BaseModel):
    """Response from recursive processing"""
    answer: str
    reasoning_trace: list[dict]
    tool_calls: int
    recursion_depth: int
    chunks_accessed: list[int]
    confidence: float

class CorpusChunk(BaseModel):
    """A chunk of corpus for environment"""
    id: int
    content: str
    metadata: Optional[dict] = None

class HealthResponse(BaseModel):
    status: str
    version: str
    model: str

# ═══════════════════════════════════════════════════════════════════════════════
# RLM Core Engine
# ═══════════════════════════════════════════════════════════════════════════════

class RLMEngine:
    """
    Recursive Language Model engine implementing MIT OASYS paradigm.

    Instead of stuffing entire corpus into context, model queries/navigates
    corpus as external environment through tool calls.
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

    def _execute_tool(
        self,
        tool_name: str,
        tool_input: dict,
        corpus: list[str],
        accessed_chunks: set
    ) -> tuple[str, set]:
        """Execute a tool call against the corpus environment"""

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

            return json.dumps({"results": results, "total_found": len(results)}), accessed_chunks

        elif tool_name == "read_chunk":
            chunk_id = tool_input.get("chunk_id", 0)
            if 0 <= chunk_id < len(corpus):
                accessed_chunks.add(chunk_id)
                return corpus[chunk_id], accessed_chunks
            return f"Chunk {chunk_id} not found", accessed_chunks

        elif tool_name == "navigate_related":
            chunk_id = tool_input.get("chunk_id", 0)
            direction = tool_input.get("direction", "next")

            if direction == "next" and chunk_id + 1 < len(corpus):
                return json.dumps({"related_chunk_id": chunk_id + 1}), accessed_chunks
            elif direction == "prev" and chunk_id > 0:
                return json.dumps({"related_chunk_id": chunk_id - 1}), accessed_chunks
            elif direction == "similar":
                # Would use embeddings in production
                return json.dumps({"related_chunk_id": min(chunk_id + 2, len(corpus) - 1)}), accessed_chunks

            return json.dumps({"related_chunk_id": None, "message": "No related chunk found"}), accessed_chunks

        elif tool_name == "submit_answer":
            # This is handled specially - signals completion
            return json.dumps(tool_input), accessed_chunks

        return "Unknown tool", accessed_chunks

    async def process(self, query: RecursiveQuery) -> RecursiveResult:
        """
        Process query using recursive corpus-as-environment paradigm.

        Model navigates corpus through tool calls rather than seeing all at once.
        """
        corpus = query.corpus or []
        messages = []
        reasoning_trace = []
        tool_calls_count = 0
        accessed_chunks: set[int] = set()

        # System prompt for RLM behavior
        system = f"""You are a recursive language model processing a query against a corpus environment.

Instead of seeing the entire corpus, you navigate it using tools:
- search_corpus: Find relevant chunks
- read_chunk: Read full content of a chunk
- navigate_related: Find connected chunks
- submit_answer: Submit your final answer (required to complete)

Corpus type: {query.corpus_type}
Total chunks available: {len(corpus)}

Strategy:
1. Search for relevant information
2. Read promising chunks
3. Navigate to related content if needed
4. Submit answer when confident

Be efficient - minimize tool calls while ensuring accuracy.
When ready, call submit_answer with your response."""

        # Initial user message
        messages.append({
            "role": "user",
            "content": query.prompt
        })

        # Recursive loop
        for depth in range(query.max_recursions):
            response = self.client.messages.create(
                model=self.model,
                max_tokens=query.max_tokens,
                system=system,
                tools=self.tools,
                messages=messages
            )

            # Track reasoning
            reasoning_trace.append({
                "depth": depth,
                "stop_reason": response.stop_reason,
                "content_types": [block.type for block in response.content]
            })

            # Check if model is done (no tool use)
            if response.stop_reason == "end_turn":
                # Extract text response
                text_blocks = [b for b in response.content if b.type == "text"]
                if text_blocks:
                    return RecursiveResult(
                        answer=text_blocks[0].text,
                        reasoning_trace=reasoning_trace,
                        tool_calls=tool_calls_count,
                        recursion_depth=depth + 1,
                        chunks_accessed=list(accessed_chunks),
                        confidence=0.7  # Default confidence for direct response
                    )

            # Process tool calls
            if response.stop_reason == "tool_use":
                # Add assistant response to messages
                messages.append({
                    "role": "assistant",
                    "content": response.content
                })

                tool_results = []
                for block in response.content:
                    if block.type == "tool_use":
                        tool_calls_count += 1

                        # Check for submit_answer (completion signal)
                        if block.name == "submit_answer":
                            answer_data = block.input
                            return RecursiveResult(
                                answer=answer_data.get("answer", ""),
                                reasoning_trace=reasoning_trace,
                                tool_calls=tool_calls_count,
                                recursion_depth=depth + 1,
                                chunks_accessed=list(accessed_chunks),
                                confidence=answer_data.get("confidence", 0.8)
                            )

                        # Execute other tools
                        result, accessed_chunks = self._execute_tool(
                            block.name,
                            block.input,
                            corpus,
                            accessed_chunks
                        )

                        tool_results.append({
                            "type": "tool_result",
                            "tool_use_id": block.id,
                            "content": result
                        })

                # Add tool results to messages
                messages.append({
                    "role": "user",
                    "content": tool_results
                })

        # Max recursions reached
        return RecursiveResult(
            answer="Max recursion depth reached without conclusive answer.",
            reasoning_trace=reasoning_trace,
            tool_calls=tool_calls_count,
            recursion_depth=query.max_recursions,
            chunks_accessed=list(accessed_chunks),
            confidence=0.3
        )

# ═══════════════════════════════════════════════════════════════════════════════
# FastAPI Application
# ═══════════════════════════════════════════════════════════════════════════════

rlm_engine: Optional[RLMEngine] = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RLM engine on startup"""
    global rlm_engine
    logger.info("Initializing RLM engine...")
    rlm_engine = RLMEngine()
    logger.info(f"RLM engine ready (model: {rlm_engine.model})")
    yield
    logger.info("RLM service shutting down")

app = FastAPI(
    title="MAIA RLM Service",
    description="Recursive Language Models for corpus-as-environment processing",
    version="0.1.0",
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
        version="0.1.0",
        model=rlm_engine.model if rlm_engine else "not initialized"
    )

@app.post("/process", response_model=RecursiveResult)
async def process_recursive(query: RecursiveQuery):
    """
    Process a query using recursive corpus-as-environment paradigm.

    The model navigates the corpus through tool calls rather than
    receiving the entire context at once.
    """
    if not rlm_engine:
        raise HTTPException(status_code=503, detail="RLM engine not initialized")

    try:
        result = await rlm_engine.process(query)
        logger.info(
            f"RLM processed: depth={result.recursion_depth}, "
            f"tools={result.tool_calls}, chunks={len(result.chunks_accessed)}"
        )
        return result
    except Exception as e:
        logger.error(f"RLM processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
async def search_corpus(query: str, corpus: list[str], max_results: int = 10):
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
