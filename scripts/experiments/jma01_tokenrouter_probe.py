#!/usr/bin/env python3
"""
JMA-01 — TokenRouter / Kimi K3 ModelAdapter probe.

Governed by docs/governance/JMA-01_TOKENROUTER_KIMI_K3_MODEL_LANE_SPIKE.md
Produces the five §4 proofs and STOPS. It changes no routing and writes no config.

    export TOKENROUTER_API_KEY=...        # env only — never an argument
    python3 scripts/experiments/jma01_tokenrouter_probe.py

By default this probes ONLY the free model ID. The paid ID bills real money and
requires --include-paid, deliberately.

Deliberately stdlib-only: the OpenAI SDK normalises responses, and this probe
exists to read exactly what the gateway returned — including which model it
says it served, which is how silent paid fallback is detected.
"""

import argparse, json, os, ssl, statistics, sys, time, urllib.error, urllib.request

ENDPOINT = "https://api.tokenrouter.com/v1/chat/completions"
FREE_MODEL = "moonshotai/kimi-k3-free"
PAID_MODEL = "moonshotai/kimi-k3"

# Non-sensitive by construction. §4: no MAIA content, no member content,
# no operational memory, no claims, no evidence, no task packets.
PROMPT = "Reply with exactly the word: ok"


def call(model, key, timeout):
    """One round-trip. Returns (elapsed_s, http_status, parsed_body_or_none, error_text)."""
    body = json.dumps({
        "model": model,
        "messages": [{"role": "user", "content": PROMPT}],
        "max_tokens": 16,
    }).encode()
    req = urllib.request.Request(ENDPOINT, data=body, method="POST", headers={
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
    })
    start = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=ssl.create_default_context()) as r:
            return time.perf_counter() - start, r.status, json.loads(r.read()), None
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8", "replace")[:400]
        return time.perf_counter() - start, e.code, None, raw
    except Exception as e:                      # network, TLS, timeout
        return time.perf_counter() - start, None, None, f"{type(e).__name__}: {e}"


def probe(model, key, samples, timeout):
    print(f"\n── {model} " + "─" * max(0, 60 - len(model)))
    latencies, usages, served, failures = [], [], set(), []

    for i in range(samples):
        elapsed, status, parsed, err = call(model, key, timeout)
        if parsed is None:
            # 404 here is the answer to §4 row 1, not a bug in the probe.
            note = {
                404: "model not offered to this account",
                401: "key rejected",
                402: "payment/quota required",
                429: "rate limited or quota exhausted",
            }.get(status, "request failed")
            print(f"  {i+1}/{samples}  {status}  {note}")
            if err:
                print(f"          {err}")
            failures.append(status)
            continue

        latencies.append(elapsed)
        usages.append(parsed.get("usage") or {})
        served.add(parsed.get("model", "<absent>"))
        text = (parsed.get("choices") or [{}])[0].get("message", {}).get("content", "")
        print(f"  {i+1}/{samples}  {elapsed:6.2f}s  served={parsed.get('model','<absent>')!r}  reply={text.strip()[:40]!r}")

    if not latencies:
        print(f"  RESULT: no successful call. statuses={failures or ['none']}")
        return {"model": model, "ok": False, "statuses": failures}

    lo, hi = min(latencies), max(latencies)
    print(f"\n  latency   n={len(latencies)}  min {lo:.2f}s  median {statistics.median(latencies):.2f}s  max {hi:.2f}s  spread {hi-lo:.2f}s")
    print(f"  usage     {json.dumps(usages[-1])}")

    # The cost-exposure check JMA-01 §4 asks for: a gateway that quietly serves a
    # paid model against a '-free' request turns an exhausted quota into a bill.
    if served and served != {model}:
        print(f"  ⛔ SILENT FALLBACK: requested {model!r}, gateway served {sorted(served)}")
    else:
        print(f"  ✓ served model matches the model requested")

    return {"model": model, "ok": True, "served": sorted(served),
            "latency_s": {"min": round(lo, 3), "median": round(statistics.median(latencies), 3), "max": round(hi, 3)},
            "usage_last": usages[-1], "samples": len(latencies), "failures": failures}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--samples", type=int, default=3, help="calls per model (default 3)")
    ap.add_argument("--timeout", type=float, default=60.0)
    ap.add_argument("--include-paid", action="store_true",
                    help=f"ALSO probe {PAID_MODEL}. This is billable. Off by default.")
    ap.add_argument("--json", metavar="PATH", help="write the raw result record here")
    args = ap.parse_args()

    key = os.environ.get("TOKENROUTER_API_KEY")
    if not key:
        sys.exit("TOKENROUTER_API_KEY is not set. Export it; do not pass it as an argument.")

    print("JMA-01 · TokenRouter probe")
    print(f"endpoint {ENDPOINT}")
    print(f"key      ...{key[-4:]} (len {len(key)})")   # never the key itself
    print(f"prompt   {PROMPT!r}")

    models = [FREE_MODEL] + ([PAID_MODEL] if args.include_paid else [])
    if not args.include_paid:
        print(f"\nnote: {PAID_MODEL} not probed — it is billable. Add --include-paid to test it.")

    results = [probe(m, key, args.samples, args.timeout) for m in models]

    print("\n" + "=" * 68)
    print("§4 PROOFS — transcribe into the JMA-01 record")
    print("=" * 68)
    free = next((r for r in results if r["model"] == FREE_MODEL), None)
    print(f"1 model ID      {FREE_MODEL!r} callable by this account: "
          f"{'YES' if free and free['ok'] else 'NO — see statuses above'}")
    print(f"2 free quota    NOT MEASURABLE FROM THE API — read the dashboard, and record its stated expiry")
    print(f"3 API call      {'one round-trip captured above' if free and free['ok'] else 'NOT ESTABLISHED'}")
    print(f"4 latency       {'reported above; spread, not best case' if free and free['ok'] else 'NOT ESTABLISHED'}")
    print(f"5 accounting    compare the usage block above against the dashboard decrement — do they agree?")
    print("\nSTOP here. Adoption is a ModelAdapter ruling and belongs to JARVIS-05.")

    if args.json:
        with open(args.json, "w") as f:
            json.dump({"endpoint": ENDPOINT, "prompt": PROMPT, "results": results}, f, indent=2)
        print(f"\nwrote {args.json}")


if __name__ == "__main__":
    main()
