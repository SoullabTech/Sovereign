#!/usr/bin/env python3
"""Independent bitmask verifier for RGR-05 graph-capacity evidence.

Deliberately re-implements the graph logic instead of importing the primary
enumerator/validator. This is a mechanical cross-check, not a second generator.
"""

from __future__ import annotations

import argparse
import itertools
import json
import math
from collections import Counter
from pathlib import Path

N = 6
E = 8
S = 0
T = 1
REQUIRED_PER_QUERY = 900


def make_edges():
    return tuple((u, v) for u in range(N) for v in range(N) if u != v and (u, v) != (S, T))


EDGES = make_edges()
IDX = {edge: i for i, edge in enumerate(EDGES)}


def mask(edges):
    out = 0
    for edge in edges:
        out |= 1 << IDX[edge]
    return out


def edge_present(value, edge):
    return bool(value & (1 << IDX[edge]))


def iter_edges(value):
    for i, edge in enumerate(EDGES):
        if value & (1 << i):
            yield edge


def path_count(value):
    return sum(
        edge_present(value, (S, m)) and edge_present(value, (m, T))
        for m in (2, 3, 4, 5)
    )


def reciprocal_count(value):
    return sum(
        edge_present(value, (u, v)) and edge_present(value, (v, u))
        for u in range(N)
        for v in range(u + 1, N)
        if (u, v) in IDX and (v, u) in IDX
    )


def degree_vectors(value):
    indeg = [0] * N
    outdeg = [0] * N
    for u, v in iter_edges(value):
        outdeg[u] += 1
        indeg[v] += 1
    return tuple(indeg), tuple(outdeg)


def accepted_switches(pos, m):
    others = [x for x in range(N) if x not in (S, T, m)]
    out = []
    for a in others:
        for b in others:
            if a == b or not edge_present(pos, (a, b)):
                continue
            if edge_present(pos, (m, b)) or edge_present(pos, (a, T)):
                continue
            neg = pos
            neg &= ~(1 << IDX[(m, T)])
            neg &= ~(1 << IDX[(a, b)])
            neg |= 1 << IDX[(m, b)]
            neg |= 1 << IDX[(a, T)]
            if bin(neg).count('1') != E:
                continue
            if path_count(neg) != 0:
                continue
            if degree_vectors(neg) != degree_vectors(pos):
                continue
            if reciprocal_count(neg) != reciprocal_count(pos):
                continue
            out.append(neg)
    return tuple(out)


def enumerate_independent():
    valid_positive = 0
    with_switch = 0
    unique_switch = 0
    neg_to_pos = {}
    switch_hist = Counter()

    for m in (2, 3, 4, 5):
        required = {(S, m), (m, T)}
        optional = tuple(edge for edge in EDGES if edge not in required)
        req_mask = mask(required)
        optional_idx = [IDX[e] for e in optional]

        for combo in itertools.combinations(optional_idx, E - 2):
            pos = req_mask
            for idx in combo:
                pos |= 1 << idx
            if path_count(pos) != 1:
                continue
            valid_positive += 1
            switches = accepted_switches(pos, m)
            if not switches:
                continue
            with_switch += 1
            switch_hist[len(switches)] += 1
            if len(switches) == 1:
                unique_switch += 1
                neg = switches[0]
                prior = neg_to_pos.get(neg)
                if prior is None or pos < prior:
                    neg_to_pos[neg] = pos

    return {
        "valid_positive_graphs_per_query": valid_positive,
        "positive_graphs_with_admissible_switch_per_query": with_switch,
        "unique_switch_positive_graphs_per_query": unique_switch,
        "collision_free_pair_capacity_per_query": len(neg_to_pos),
        "switch_histogram": dict(sorted(switch_hist.items())),
    }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--primary-evidence", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    primary = json.loads(args.primary_evidence.read_text())
    observed = enumerate_independent()
    expected = primary["graph_feasibility"]

    keys = (
        "valid_positive_graphs_per_query",
        "positive_graphs_with_admissible_switch_per_query",
        "unique_switch_positive_graphs_per_query",
        "collision_free_pair_capacity_per_query",
    )
    mismatches = {
        key: {"primary": expected[key], "independent": observed[key]}
        for key in keys
        if expected[key] != observed[key]
    }

    formula_code_universe = math.comb(16, 8)
    result = {
        "schema": "RGR05_INDEPENDENT_VERIFIER_v1",
        "method": "independent bitmask enumeration",
        "counts": observed,
        "matches_primary": not mismatches,
        "mismatches": mismatches,
        "balanced_16bit_code_universe_formula": formula_code_universe,
        "required_pairs_per_query": REQUIRED_PER_QUERY,
        "capacity_pass": observed["collision_free_pair_capacity_per_query"] >= REQUIRED_PER_QUERY,
        "full_dataset_materialized": False,
        "verdict": "PASS" if not mismatches and observed["collision_free_pair_capacity_per_query"] >= REQUIRED_PER_QUERY else "FAIL",
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, indent=2, sort_keys=True) + "\n")
    print(json.dumps({"verdict": result["verdict"], "counts": observed}, sort_keys=True))
    return 0 if result["verdict"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
