"""
JARVIS-02 spike — ExecutionAdapter over Deep Agents / LangGraph.

BOUNDARY UNDER TEST. JARVIS owns the packet, the context, the authority and the
verdict. Deep Agents owns nothing but the act of running. This file is the whole
seam, and it is deliberately thin: everything it does is translate a JARVIS
packet into a Deep Agents invocation and translate the output back. It makes no
decision JARVIS did not already make.

DETERMINISTIC MODEL. There are no model credentials in this environment, so the
worker runs on a stub chat model that emits a fixed response. That is not a
degraded version of the experiment — it is the correct one. The question this
spike must answer is whether the SEAM holds, not whether an LLM writes a good
sentence. A stub makes the seam observable and the run reproducible; an LLM
would add variance to the one thing under test. What it does NOT prove is
stated in the report, not papered over here.
"""
import json, sys
from typing import Any, Optional
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import AIMessage
from langchain_core.outputs import ChatGeneration, ChatResult
from deepagents import create_deep_agent, FilesystemPermission
from deepagents.backends.filesystem import FilesystemBackend


class StubModel(BaseChatModel):
    """Emits one fixed answer. No network, no credentials, no variance."""
    reply: str = ""

    @property
    def _llm_type(self) -> str: return "jarvis-spike-stub"

    def _generate(self, messages, stop=None, run_manager=None, **kw) -> ChatResult:
        return ChatResult(generations=[ChatGeneration(message=AIMessage(content=self.reply))])

    def bind_tools(self, tools, **kw):
        # FINDING, not a workaround. Deep Agents unconditionally binds its
        # filesystem/subagent/summarization tools, so it cannot drive a model
        # that does not implement tool calling. JARVIS's C0 lane is precisely a
        # no-model lane; this is one concrete place where the two architectures
        # do not overlap. Recorded in the evaluation.
        return self


def main() -> int:
    req = json.load(sys.stdin)
    packet = req["packet"]          # ALREADY validated + authority-checked by JARVIS
    fragments = req["fragments"]    # ALREADY materialized + SHA-bound by JARVIS
    worktree = req["worktree"]
    reply = req["stub_reply"]

    # AUTHORITY IS TRANSLATED, NOT RE-DECIDED. JARVIS said this lane is read-only
    # (READ_ONLY_LANES); the adapter's job is to express that in the vocabulary
    # the execution machinery understands, then let the machinery enforce it.
    # Deny is listed AFTER allow because a later rule must win for the denial to
    # bite — an adapter that gets this backwards would silently grant writes.
    permissions = [
        FilesystemPermission(operations=["read_file", "ls", "glob", "grep"], paths=["/**"], mode="allow"),
        FilesystemPermission(operations=["write_file", "edit_file", "delete", "execute"], paths=["/**"], mode="deny"),
    ]

    # The worker is shown ONLY what JARVIS materialized. It is not pointed at the
    # repository and told to go read: the fragments are the context, and they
    # arrive already bound to a SHA.
    rendered = "\n\n".join(
        f"--- {f['source_file']}:{f['start_line']}-{f['end_line']} (sha {f['source_sha']}) ---\n{f['content']}"
        for f in fragments
    )
    system = (
        f"OBJECTIVE: {packet['objective']}\n\n"
        f"EXPECTED OUTPUT: {packet['expected_output']}\n\n"
        f"CONTEXT (the only material you have been shown):\n{rendered}"
    )

    agent = create_deep_agent(
        model=StubModel(reply=reply),
        system_prompt=system,
        backend=FilesystemBackend(root_dir=worktree),
        permissions=permissions,
        checkpointer=False,
    )

    result = agent.invoke({"messages": [{"role": "user", "content": packet["title"]}]})
    text = result["messages"][-1].content

    # The adapter returns EVIDENCE, not a verdict. It does not say whether the
    # work was correct — JARVIS's verifyEvidence() decides that, from the same
    # fragments, without consulting anything the worker asserted about itself.
    json.dump({
        "work_unit_id": packet["work_unit_id"],
        "output": text,
        "adapter": "deepagents",
        "permissions_declared": [
            {"operations": p.operations, "paths": p.paths, "mode": p.mode} for p in permissions
        ],
        "message_count": len(result["messages"]),
    }, sys.stdout)
    return 0


if __name__ == "__main__":
    sys.exit(main())
