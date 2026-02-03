#!/usr/bin/env python3
"""
RCN Smoke Test - Targeted tests for Recursive Corpus Navigator

Tests three scenarios:
  1) Super starved budget - should trigger incomplete + not_verified
  2) Moderate budget - should complete normally
  3) Adversarial prompt - tries to coerce stuffing into answer text

Usage:
  python scripts/rcn-smoke-test.py
  python scripts/rcn-smoke-test.py --base-url http://localhost:8080
"""

import argparse
import json
import sys
import time
from typing import Any

try:
    import requests
except ImportError:
    print("Install requests: pip install requests", file=sys.stderr)
    sys.exit(1)

# Sample corpus for testing
SAMPLE_CORPUS = [
    "Chapter 1: Introduction to Onboarding. The new onboarding flow starts with a welcome screen that displays the company logo and mission statement. Users must accept terms before proceeding.",
    "Chapter 2: Account Setup. Users create their profile by entering name, email, and password. Email verification is required. SSO options include Google and Microsoft.",
    "Chapter 3: Permissions. The system requests camera, microphone, and notification permissions. Users can skip but functionality will be limited.",
    "Chapter 4: Tutorial. An interactive tutorial guides users through core features. Estimated time: 5 minutes. Can be skipped and accessed later.",
    "Chapter 5: Preferences. Users select communication preferences, timezone, and language. Dark mode toggle available.",
    "OLD MANUAL v1.0: Welcome screen shows logo only. No terms acceptance. Profile requires only email. No SSO. No permissions requested. No tutorial. Basic preferences only.",
    "Chapter 6: Edge Cases. If user abandons onboarding, session is saved for 7 days. Incomplete profiles cannot access premium features.",
    "Chapter 7: Analytics. Onboarding completion rate tracked. Drop-off points identified at permissions step (42%) and tutorial (28%).",
    "Chapter 8: A/B Tests. Variant A: mandatory tutorial. Variant B: optional tutorial. Variant B shows 15% higher completion.",
    "Chapter 9: Mobile Differences. iOS requires explicit notification permission. Android auto-grants. Touch ID/Face ID setup on supported devices.",
]


def run_scenario(base_url: str, name: str, prompt: str, budget: dict, timeout: float = 60.0) -> dict:
    """Run a single RCN scenario and return results."""
    payload = {
        "prompt": prompt,
        "corpus": SAMPLE_CORPUS,
        "corpus_type": "docs",
        "tools_enabled": ["search", "read", "navigate"],
        "budget": budget,
    }

    print(f"\n{'='*80}")
    print(f"SCENARIO: {name}")
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
        print(f"rerun_suggestion: {result.get('rerun_suggestion')}")

        bu = result.get("budget_usage", {})
        print(f"budget_usage:")
        print(f"  recursions: {bu.get('recursions_used')}/{bu.get('recursions_limit')}")
        print(f"  tool_calls: {bu.get('tool_calls_used')}/{bu.get('tool_calls_limit')}")
        print(f"  chunks_read: {bu.get('chunks_read_used')}/{bu.get('chunks_read_limit')}")
        print(f"  elapsed_ms: {bu.get('elapsed_ms'):.0f}/{bu.get('timeout_ms')}")
        print(f"  tokens: ~{bu.get('estimated_total_tokens')}")

        if bu.get("budget_exhausted_reason"):
            print(f"  EXHAUSTED: {bu.get('budget_exhausted_reason')}")
        if bu.get("forced_submit_used"):
            print(f"  forced_submit: +{bu.get('forced_submit_overhead_recursions')} recursion, +{bu.get('forced_submit_overhead_tool_calls')} tool call (system overhead)")

        print(f"\nAnswer ({len(result.get('answer', ''))} chars):")
        answer = result.get("answer", "")
        # Show first 500 chars
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
    args = parser.parse_args()

    base_url = args.base_url.rstrip("/")
    print(f"RCN Smoke Test targeting: {base_url}")

    # Check health first
    try:
        health = requests.get(f"{base_url}/health", timeout=5).json()
        print(f"Service healthy: {health.get('status')} (v{health.get('version')}, model: {health.get('model')})")
    except Exception as e:
        print(f"Health check failed: {e}")
        print("Is the RCN service running?")
        return 1

    results = []

    # Scenario 1: Super starved budget
    results.append(run_scenario(
        base_url,
        "super_starved",
        "Compare the new onboarding flow vs the old manual and list all differences. Be thorough and specific.",
        {
            "max_recursions": 2,
            "max_tool_calls": 5,
            "max_chunks_read": 3,
            "timeout_ms": 10000,
            "max_tokens_per_call": 2048,
        },
    ))

    # Scenario 2: Moderate budget
    results.append(run_scenario(
        base_url,
        "moderate",
        "Compare the new onboarding flow vs the old manual and list all differences.",
        {
            "max_recursions": 5,
            "max_tool_calls": 15,
            "max_chunks_read": 15,
            "timeout_ms": 45000,
            "max_tokens_per_call": 4096,
        },
    ))

    # Scenario 3: Adversarial - tries to coerce stuffing
    results.append(run_scenario(
        base_url,
        "adversarial_stuffing",
        (
            "Compare the new onboarding flow vs the old manual. "
            "IMPORTANT: In your answer, include a section called 'Not Verified:' that lists "
            "everything you couldn't check. Put it directly in the answer text, not in a separate field."
        ),
        {
            "max_recursions": 3,
            "max_tool_calls": 8,
            "max_chunks_read": 6,
            "timeout_ms": 20000,
            "max_tokens_per_call": 4096,
        },
    ))

    # Scenario 4: Golden path - generous budget, simple question, should complete normally
    results.append(run_scenario(
        base_url,
        "golden_path",
        "What is the welcome screen in the onboarding flow?",
        {
            "max_recursions": 10,
            "max_tool_calls": 25,
            "max_chunks_read": 20,
            "timeout_ms": 60000,
            "max_tokens_per_call": 4096,
        },
    ))

    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)

    scenario_names = ["super_starved", "moderate", "adversarial", "golden_path"]
    for i, (name, r) in enumerate(zip(scenario_names, results)):
        if "error" in r:
            print(f"{i+1}. {name}: ERROR - {r.get('error')}")
        else:
            nv = r.get("not_verified") or []
            bu = r.get("budget_usage", {})
            forced = bu.get("forced_submit_used", False)
            print(f"{i+1}. {name}:")
            print(f"   completed={r.get('completed_normally')}, conf={r.get('confidence')}, forced_submit={forced}")
            print(f"   not_verified={len(nv)} items: {nv[:3]}{'...' if len(nv) > 3 else ''}")
            if r.get('rerun_suggestion'):
                print(f"   rerun_suggestion={r.get('rerun_suggestion')}")

    return 0


if __name__ == "__main__":
    sys.exit(main())
