#!/usr/bin/env python3
"""
RCN Vault Smoke Test - Test vault-as-corpus functionality

Tests three scenarios:
  1) Simple vault search + read
  2) Heading extraction
  3) Budget limit behavior

Usage:
  python scripts/rcn-vault-smoke-test.py
  python scripts/rcn-vault-smoke-test.py --vault-path ~/my-vault
  python scripts/rcn-vault-smoke-test.py --base-url http://localhost:8080
"""

import argparse
import json
import os
import sys
import tempfile
import time
from pathlib import Path

try:
    import requests
except ImportError:
    print("Install requests: pip install requests", file=sys.stderr)
    sys.exit(1)


def create_test_vault(base_dir: Path) -> Path:
    """Create a temporary test vault with sample markdown files."""
    vault = base_dir / "test-vault"
    vault.mkdir(parents=True, exist_ok=True)

    # Create some test files
    (vault / "README.md").write_text("""# Test Vault

This is a test vault for RCN smoke testing.

## Overview

Contains sample notes about MAIA development.

## Structure

- projects/ - Project notes
- daily/ - Daily logs
""")

    projects = vault / "projects"
    projects.mkdir(exist_ok=True)

    (projects / "MAIA.md").write_text("""# MAIA Project

MAIA is a consciousness-aware AI companion.

## Architecture

MAIA uses a sovereign architecture with:
- Local PostgreSQL database
- Claude API for intelligence
- Spiralogic consciousness framework

## Key Features

### Memory System
MAIA remembers conversations and builds relationship context.

### Voice Modes
- Talk: Natural dialogue
- Care: Supportive counsel
- Note: Journaling/capture

## Roadmap

1. Beta launch with core features
2. Voice integration improvements
3. Community commons expansion
""")

    (projects / "RCN.md").write_text("""# Recursive Corpus Navigator

RCN is MAIA's implementation of the RLM paradigm.

## Concept

Instead of context stuffing, the model navigates corpus as environment.

## Tools

- search_corpus: Find relevant chunks
- read_chunk: Read full chunk content
- navigate_related: Find related chunks
- vault_search: Search vault files (ripgrep)
- vault_read: Read vault files with heading extraction

## Budget System

Hard limits prevent runaway recursion:
- max_recursions
- max_tool_calls
- max_chunks_read
- timeout_ms
""")

    daily = vault / "daily"
    daily.mkdir(exist_ok=True)

    (daily / "2025-01-08.md").write_text("""# 2025-01-08 Daily Note

## Morning
- Implemented vault adapter for RCN
- Added ripgrep-based search

## Afternoon
- Testing vault smoke tests
- Bug fixes

## Ideas
- Could add backlinks support
- Consider caching vault index
""")

    return vault


def run_scenario(base_url: str, name: str, prompt: str, vault_path: str, budget: dict, timeout: float = 90.0) -> dict:
    """Run a single RCN vault scenario and return results."""
    payload = {
        "prompt": prompt,
        "corpus_type": "vault",
        "vault_path": vault_path,
        "tools_enabled": ["vault_search", "vault_read"],
        "budget": budget,
    }

    print(f"\n{'='*80}")
    print(f"SCENARIO: {name}")
    print(f"Vault: {vault_path}")
    print(f"Budget: {json.dumps(budget)}")
    print(f"Prompt: {prompt[:100]}...")
    print("-" * 80)

    t0 = time.time()
    try:
        resp = requests.post(
            f"{base_url}/process",
            json=payload,
            timeout=timeout,
            headers={"Content-Type": "application/json"},
        )
        elapsed = (time.time() - t0) * 1000

        if resp.status_code != 200:
            print(f"ERROR: HTTP {resp.status_code}")
            print(resp.text[:500])
            return {"error": resp.status_code, "text": resp.text}

        result = resp.json()

        # Print key fields
        print(f"Status: HTTP 200 ({elapsed:.0f}ms)")
        print(f"run_id: {result.get('run_id')}")
        print(f"completed_normally: {result.get('completed_normally')}")
        print(f"confidence: {result.get('confidence')}")
        print(f"not_verified: {result.get('not_verified')}")

        bu = result.get("budget_usage", {})
        print(f"budget_usage:")
        print(f"  recursions: {bu.get('recursions_used')}/{bu.get('recursions_limit')}")
        print(f"  tool_calls: {bu.get('tool_calls_used')}/{bu.get('tool_calls_limit')}")
        print(f"  reads: {bu.get('chunks_read_used')}/{bu.get('chunks_read_limit')}")
        print(f"  elapsed_ms: {bu.get('elapsed_ms'):.0f}/{bu.get('timeout_ms')}")

        if bu.get("budget_exhausted_reason"):
            print(f"  EXHAUSTED: {bu.get('budget_exhausted_reason')}")
        if bu.get("forced_submit_used"):
            print(f"  forced_submit: +{bu.get('forced_submit_overhead_recursions')} recursion")

        # Print provenance (vault-specific)
        prov = result.get("provenance", [])
        if prov:
            print(f"\nProvenance ({len(prov)} files read):")
            for p in prov[:5]:
                fp = p.get("file_path", f"chunk_{p.get('chunk_id')}")
                heading = f" ({p.get('heading')})" if p.get("heading") else ""
                print(f"  - {fp}{heading}: {p.get('char_count')} chars")

        print(f"\nAnswer ({len(result.get('answer', ''))} chars):")
        answer = result.get("answer", "")
        print(answer[:500] + ("..." if len(answer) > 500 else ""))

        return result

    except requests.exceptions.Timeout:
        print(f"TIMEOUT after {timeout}s")
        return {"error": "timeout"}
    except Exception as e:
        print(f"ERROR: {e}")
        return {"error": str(e)}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", default="http://localhost:8080", help="RCN service URL")
    parser.add_argument("--vault-path", default=None, help="Path to existing vault (default: create temp vault)")
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    print(f"RCN Vault Smoke Test targeting: {base_url}")

    # Check health first
    try:
        health = requests.get(f"{base_url}/health", timeout=5).json()
        print(f"Service healthy: {health.get('status')} (v{health.get('version')}, model: {health.get('model')})")
    except Exception as e:
        print(f"Health check failed: {e}")
        print("Is the RCN service running?")
        return 1

    # Create or use vault
    if args.vault_path:
        vault_path = args.vault_path
        print(f"Using existing vault: {vault_path}")
    else:
        temp_dir = Path(tempfile.mkdtemp(prefix="rcn-vault-test-"))
        vault_path = str(create_test_vault(temp_dir))
        print(f"Created test vault: {vault_path}")

    results = []

    # Scenario 1: Simple search and read
    results.append(run_scenario(
        base_url,
        "simple_search",
        "What is MAIA? Search for information about it in the vault.",
        vault_path,
        {
            "max_recursions": 5,
            "max_tool_calls": 12,
            "max_chunks_read": 8,
            "timeout_ms": 45000,
            "max_tokens_per_call": 4096,
        },
    ))

    # Scenario 2: Heading extraction
    results.append(run_scenario(
        base_url,
        "heading_extraction",
        "What are the key features of MAIA? Look for a 'Key Features' or 'Features' section.",
        vault_path,
        {
            "max_recursions": 5,
            "max_tool_calls": 10,
            "max_chunks_read": 5,
            "timeout_ms": 45000,
            "max_tokens_per_call": 4096,
        },
    ))

    # Scenario 3: Multi-file exploration
    results.append(run_scenario(
        base_url,
        "multi_file",
        "What's the relationship between MAIA and RCN? Compare what you find in different project notes.",
        vault_path,
        {
            "max_recursions": 6,
            "max_tool_calls": 15,
            "max_chunks_read": 10,
            "timeout_ms": 60000,
            "max_tokens_per_call": 4096,
        },
    ))

    # Scenario 4: Starved budget (should trigger forced submit)
    results.append(run_scenario(
        base_url,
        "starved_budget",
        "Give me a comprehensive overview of everything in this vault, including all projects and daily notes.",
        vault_path,
        {
            "max_recursions": 2,
            "max_tool_calls": 4,
            "max_chunks_read": 2,
            "timeout_ms": 15000,
            "max_tokens_per_call": 2048,
        },
    ))

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    scenario_names = ["simple_search", "heading_extraction", "multi_file", "starved_budget"]
    for i, (name, r) in enumerate(zip(scenario_names, results)):
        if "error" in r:
            print(f"{i+1}. {name}: ERROR - {r.get('error')}")
        else:
            nv = r.get("not_verified") or []
            bu = r.get("budget_usage", {})
            prov = r.get("provenance", [])
            vault_files = [p for p in prov if p.get("file_path")]
            forced = bu.get("forced_submit_used", False)
            print(f"{i+1}. {name}:")
            print(f"   completed={r.get('completed_normally')}, conf={r.get('confidence')}, forced_submit={forced}")
            print(f"   files_read={len(vault_files)}, not_verified={len(nv)}")
            if vault_files:
                print(f"   files: {[p.get('file_path') for p in vault_files[:3]]}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
