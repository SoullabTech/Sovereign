#!/usr/bin/env python3
"""RGR-05 deterministic pre-materialization feasibility proof.

This module implements ONLY the bounded generator/validator machinery necessary
for the canonical RGR-04 feasibility gate. It never writes benchmark examples,
implements no model, and consumes no model performance.

Canonical benchmark:
  RGR-RT1-D2C-01 — Directed Two-Step Composition
"""

from __future__ import annotations

import argparse
import hashlib
import itertools
import json
import math
from collections import Counter
from pathlib import Path
from typing import Iterable

BENCHMARK_ID = "RGR-RT1-D2C-01"
BASE_SHA = "567e062b3d8929c41d15882ae26ea9d42077a1bc"
NODE_COUNT = 6
EDGE_COUNT = 8
CODE_WIDTH = 16
CODE_WEIGHT = 8
CODEBOOK_SIZE = 256
SPLIT_ORDER = ("TRAIN", "VALIDATION", "TEST", "REPLICATION")
SPLIT_SEEDS = {
    "TRAIN": 41041,
    "VALIDATION": 41042,
    "TEST": 41043,
    "REPLICATION": 41044,
}
SPLIT_PAIR_COUNTS = {
    "TRAIN": 12_000,
    "VALIDATION": 3_000,
    "TEST": 6_000,
    "REPLICATION": 6_000,
}
STREAM_NAMES = ("CODEBOOK", "GRAPH", "SURFACE_ASSIGNMENT", "ROW_ORDER", "SWITCH")
QUERY_PAIR_COUNT = NODE_COUNT * (NODE_COUNT - 1)
BALANCED_ALLOCATION_PER_QUERY = {
    split: count // QUERY_PAIR_COUNT for split, count in SPLIT_PAIR_COUNTS.items()
}
REQUIRED_PAIRS_PER_QUERY = sum(BALANCED_ALLOCATION_PER_QUERY.values())
ROLE_STEP = 43  # coprime to 256; six role offsets are distinct.


def canonical_stream_text(split: str, stream_name: str, counter: int) -> str:
    if split not in SPLIT_SEEDS:
        raise ValueError(f"unknown split {split}")
    if stream_name not in STREAM_NAMES:
        raise ValueError(f"unknown stream {stream_name}")
    if counter < 0:
        raise ValueError("counter must be nonnegative")
    return (
        f"RGR04|{BENCHMARK_ID}|{split}|{SPLIT_SEEDS[split]}|"
        f"{stream_name}|{counter}"
    )


def stream_digest(split: str, stream_name: str, counter: int) -> bytes:
    return hashlib.sha256(
        canonical_stream_text(split, stream_name, counter).encode("utf-8")
    ).digest()


def draw_index(split: str, stream_name: str, counter: int, size: int) -> tuple[int, int]:
    """Unbiased deterministic index draw using SHA-256 64-bit rejection sampling."""
    if size <= 0:
        raise ValueError("size must be positive")
    modulus = 1 << 64
    limit = modulus - (modulus % size)
    while True:
        value = int.from_bytes(stream_digest(split, stream_name, counter)[:8], "big")
        counter += 1
        if value < limit:
            return value % size, counter


def all_directed_edges(source: int, target: int) -> tuple[tuple[int, int], ...]:
    return tuple(
        (u, v)
        for u in range(NODE_COUNT)
        for v in range(NODE_COUNT)
        if u != v and not (u == source and v == target)
    )


def degrees(edges: Iterable[tuple[int, int]]) -> tuple[tuple[int, ...], tuple[int, ...]]:
    indeg = [0] * NODE_COUNT
    outdeg = [0] * NODE_COUNT
    for u, v in edges:
        outdeg[u] += 1
        indeg[v] += 1
    return tuple(indeg), tuple(outdeg)


def reciprocal_count(edges: Iterable[tuple[int, int]]) -> int:
    edge_set = set(edges)
    return sum(1 for u, v in edge_set if u < v and (v, u) in edge_set)


def two_step_intermediates(
    edges: Iterable[tuple[int, int]], source: int, target: int
) -> tuple[int, ...]:
    edge_set = set(edges)
    return tuple(
        m
        for m in range(NODE_COUNT)
        if m not in (source, target)
        and (source, m) in edge_set
        and (m, target) in edge_set
    )


def common_graph_errors(
    edges: Iterable[tuple[int, int]], source: int, target: int
) -> list[str]:
    edge_list = list(edges)
    edge_set = set(edge_list)
    errors: list[str] = []
    if len(edge_list) != len(edge_set):
        errors.append("duplicate_edge")
    if len(edge_set) != EDGE_COUNT:
        errors.append("edge_count")
    if any(u == v for u, v in edge_set):
        errors.append("self_loop")
    if (source, target) in edge_set:
        errors.append("direct_source_target_edge")
    return errors


def positive_errors(
    edges: Iterable[tuple[int, int]], source: int, target: int
) -> list[str]:
    errors = common_graph_errors(edges, source, target)
    if len(two_step_intermediates(edges, source, target)) != 1:
        errors.append("positive_two_step_count")
    return errors


def negative_errors(
    edges: Iterable[tuple[int, int]], source: int, target: int
) -> list[str]:
    errors = common_graph_errors(edges, source, target)
    if len(two_step_intermediates(edges, source, target)) != 0:
        errors.append("negative_two_step_count")
    return errors


def evaluate_switch(
    positive: frozenset[tuple[int, int]],
    source: int,
    target: int,
    intermediate: int,
    a: int,
    b: int,
) -> tuple[bool, str, frozenset[tuple[int, int]] | None]:
    """Evaluate the exact directed degree-preserving RGR-04 relation break."""
    if a == b or any(x in (source, target, intermediate) for x in (a, b)):
        return False, "switch_role_violation", None
    if (a, b) not in positive:
        return False, "switch_edge_absent", None
    if (intermediate, target) not in positive:
        return False, "path_edge_absent", None
    if (intermediate, b) in positive or (a, target) in positive:
        return False, "replacement_duplicate", None

    negative = frozenset(
        (positive - {(intermediate, target), (a, b)})
        | {(intermediate, b), (a, target)}
    )

    if negative_errors(negative, source, target):
        return False, "negative_relation_or_graph_invalid", negative
    if degrees(negative) != degrees(positive):
        return False, "degree_sequence_change", negative
    if reciprocal_count(negative) != reciprocal_count(positive):
        return False, "reciprocal_edge_count_change", negative
    return True, "admissible", negative


def admissible_switches(
    positive: frozenset[tuple[int, int]],
    source: int,
    target: int,
    intermediate: int,
) -> tuple[tuple[int, int, frozenset[tuple[int, int]]], ...]:
    others = tuple(
        n for n in range(NODE_COUNT) if n not in (source, target, intermediate)
    )
    accepted: list[tuple[int, int, frozenset[tuple[int, int]]]] = []
    for a in others:
        for b in others:
            ok, _, negative = evaluate_switch(
                positive, source, target, intermediate, a, b
            )
            if ok and negative is not None:
                accepted.append((a, b, negative))
    return tuple(accepted)


def edge_mask(edges: Iterable[tuple[int, int]], source: int, target: int) -> int:
    index = {edge: i for i, edge in enumerate(all_directed_edges(source, target))}
    value = 0
    for edge in edges:
        value |= 1 << index[edge]
    return value


def mask_digest(mask: int) -> str:
    return hashlib.sha256(mask.to_bytes(8, "big")).hexdigest()


def enumerate_canonical_query() -> dict:
    """Exhaust canonical s=0,t=1 space without materializing a benchmark dataset."""
    source, target = 0, 1
    universe = all_directed_edges(source, target)

    valid_positive_count = 0
    positive_with_switch = 0
    unique_switch_positive_count = 0
    switch_histogram: Counter[int] = Counter()
    rejected_switch_reasons: Counter[str] = Counter()
    negative_representative: dict[int, int] = {}

    first_valid: dict | None = None
    first_multi_switch: dict | None = None
    first_bad_reciprocal: dict | None = None

    for intermediate in (2, 3, 4, 5):
        required = {(source, intermediate), (intermediate, target)}
        optional = tuple(edge for edge in universe if edge not in required)

        for extras in itertools.combinations(optional, EDGE_COUNT - 2):
            positive = frozenset(required | set(extras))
            if positive_errors(positive, source, target):
                continue

            valid_positive_count += 1
            switches = admissible_switches(
                positive, source, target, intermediate
            )

            # Independently inspect all distractor-edge switch candidates so the
            # evidence includes refusal reasons, not only accepted cases.
            others = tuple(
                n
                for n in range(NODE_COUNT)
                if n not in (source, target, intermediate)
            )
            for a in others:
                for b in others:
                    if a == b or (a, b) not in positive:
                        continue
                    ok, reason, negative = evaluate_switch(
                        positive, source, target, intermediate, a, b
                    )
                    if not ok:
                        rejected_switch_reasons[reason] += 1
                        if (
                            reason == "reciprocal_edge_count_change"
                            and first_bad_reciprocal is None
                            and negative is not None
                        ):
                            first_bad_reciprocal = {
                                "positive": positive,
                                "negative": negative,
                                "intermediate": intermediate,
                                "switch": (a, b),
                            }

            if not switches:
                continue

            positive_with_switch += 1
            switch_histogram[len(switches)] += 1

            if first_valid is None:
                a, b, negative = switches[0]
                first_valid = {
                    "positive": positive,
                    "negative": negative,
                    "intermediate": intermediate,
                    "switch": (a, b),
                }

            if len(switches) > 1 and first_multi_switch is None:
                first_multi_switch = {
                    "positive": positive,
                    "intermediate": intermediate,
                    "switches": switches,
                }

            # For the capacity proof use the especially strict subset with one
            # and only one admissible relation break. This avoids depending on
            # any stochastic switch choice. Deduplicate negatives as well, so
            # neither member of a pair can collide across split allocation.
            if len(switches) == 1:
                unique_switch_positive_count += 1
                _, _, negative = switches[0]
                neg_mask = edge_mask(negative, source, target)
                pos_mask = edge_mask(positive, source, target)
                current = negative_representative.get(neg_mask)
                if current is None or pos_mask < current:
                    negative_representative[neg_mask] = pos_mask

    if first_valid is None or first_multi_switch is None:
        raise AssertionError("enumeration did not produce required proof fixtures")

    return {
        "source": source,
        "target": target,
        "valid_positive_count": valid_positive_count,
        "positive_with_admissible_switch": positive_with_switch,
        "unique_switch_positive_count": unique_switch_positive_count,
        "pair_capacity_per_query": len(negative_representative),
        "switch_histogram": dict(sorted(switch_histogram.items())),
        "rejected_switch_reasons": dict(sorted(rejected_switch_reasons.items())),
        "first_valid": first_valid,
        "first_multi_switch": first_multi_switch,
        "first_bad_reciprocal": first_bad_reciprocal,
    }


def balanced_code_universe() -> tuple[int, ...]:
    universe = tuple(value for value in range(1 << CODE_WIDTH) if bin(value).count('1') == CODE_WEIGHT)
    if len(universe) != math.comb(CODE_WIDTH, CODE_WEIGHT):
        raise AssertionError("constant-weight universe cardinality mismatch")
    return universe


def allocate_codebooks() -> tuple[dict[str, tuple[int, ...]], dict[str, str]]:
    universe = balanced_code_universe()
    used: set[int] = set()
    codebooks: dict[str, tuple[int, ...]] = {}
    digests: dict[str, str] = {}

    # Implementation detail frozen by this digest: split-order allocation.
    # Each split scores the full canonical universe with its own frozen seed and
    # CODEBOOK stream, then takes the best still-unclaimed 256 codes.
    for split in SPLIT_ORDER:
        ranked: list[tuple[bytes, int]] = []
        for ordinal, code in enumerate(universe):
            if code in used:
                continue
            ranked.append((stream_digest(split, "CODEBOOK", ordinal), code))
        ranked.sort(key=lambda item: (item[0], item[1]))
        selected = tuple(code for _, code in ranked[:CODEBOOK_SIZE])
        if len(selected) != CODEBOOK_SIZE or len(set(selected)) != CODEBOOK_SIZE:
            raise AssertionError("codebook allocation failed")
        if any(code in used for code in selected):
            raise AssertionError("codebook overlap")
        used.update(selected)
        codebooks[split] = selected
        raw = b"".join(code.to_bytes(2, "big") for code in selected)
        digests[split] = hashlib.sha256(raw).hexdigest()

    return codebooks, digests


def permutation_from_index(index: int, items: tuple[int, ...]) -> tuple[int, ...]:
    pool = list(items)
    if index < 0 or index >= math.factorial(len(pool)):
        raise ValueError("permutation index out of range")
    out: list[int] = []
    remainder = index
    for remaining in range(len(pool), 0, -1):
        block = math.factorial(remaining - 1)
        choice, remainder = divmod(remainder, block)
        out.append(pool.pop(choice))
    return tuple(out)


def surface_schedule_proof(pair_count: int, split: str) -> dict:
    offset, counter = draw_index(split, "SURFACE_ASSIGNMENT", 0, CODEBOOK_SIZE)
    half_stride, counter = draw_index(split, "SURFACE_ASSIGNMENT", counter, CODEBOOK_SIZE // 2)
    stride = 2 * half_stride + 1  # odd => coprime to 256

    role_counts = [[0] * CODEBOOK_SIZE for _ in range(NODE_COUNT)]
    for pair_index in range(pair_count):
        base = (offset + pair_index * stride) % CODEBOOK_SIZE
        assigned = tuple((base + role * ROLE_STEP) % CODEBOOK_SIZE for role in range(NODE_COUNT))
        if len(set(assigned)) != NODE_COUNT:
            raise AssertionError("within-pair code identities are not distinct")
        for role, code_index in enumerate(assigned):
            role_counts[role][code_index] += 1

    role_imbalances = [max(row) - min(row) for row in role_counts]
    if max(role_imbalances) > 1:
        raise AssertionError("counterbalance imbalance exceeds one occurrence")

    row_perm_index, _ = draw_index(split, "ROW_ORDER", 0, math.factorial(NODE_COUNT))
    row_permutation = permutation_from_index(row_perm_index, tuple(range(NODE_COUNT)))

    return {
        "pair_count": pair_count,
        "surface_offset": offset,
        "surface_stride": stride,
        "role_step": ROLE_STEP,
        "max_per_role_code_count_imbalance": max(role_imbalances),
        "row_order_sample_index": row_perm_index,
        "row_order_sample": row_permutation,
    }


def code_to_surface(code: int) -> tuple[int, ...]:
    return tuple(1 if code & (1 << bit) else -1 for bit in range(CODE_WIDTH))


def validate_pair_object(pair: dict) -> list[str]:
    errors: list[str] = []
    source = pair["source"]
    target = pair["target"]
    positive = frozenset(tuple(edge) for edge in pair["positive_edges"])
    negative = frozenset(tuple(edge) for edge in pair["negative_edges"])

    errors.extend(f"positive:{e}" for e in positive_errors(positive, source, target))
    errors.extend(f"negative:{e}" for e in negative_errors(negative, source, target))

    if degrees(positive) != degrees(negative):
        errors.append("pair:degree_sequence_mismatch")
    if reciprocal_count(positive) != reciprocal_count(negative):
        errors.append("pair:reciprocal_edge_count_mismatch")

    if pair["surface_codes_positive"] != pair["surface_codes_negative"]:
        errors.append("pair:surface_mismatch")
    if pair["row_order_positive"] != pair["row_order_negative"]:
        errors.append("pair:row_order_mismatch")
    if pair["query_positive"] != pair["query_negative"]:
        errors.append("pair:query_mismatch")

    codes = tuple(pair["surface_codes_positive"])
    if len(codes) != NODE_COUNT or len(set(codes)) != NODE_COUNT:
        errors.append("surface:codes_not_six_distinct")
    for code in codes:
        if len(code) != CODE_WIDTH or sum(1 for bit in code if bit == 1) != CODE_WEIGHT:
            errors.append("surface:unbalanced_code")
            break
        if any(bit not in (-1, 1) for bit in code):
            errors.append("surface:invalid_bit")
            break

    return errors


def find_one_edge_swap(
    edges: frozenset[tuple[int, int]],
    source: int,
    target: int,
    predicate,
) -> frozenset[tuple[int, int]]:
    current = set(edges)
    full = {(u, v) for u in range(NODE_COUNT) for v in range(NODE_COUNT)}
    for remove in sorted(current):
        for add in sorted(full - current):
            candidate = frozenset((current - {remove}) | {add})
            if predicate(candidate):
                return candidate
    raise AssertionError("could not construct requested mutation")


def mutation_rejection_proof(
    fixture: dict,
    codebooks: dict[str, tuple[int, ...]],
    bad_reciprocal: dict | None,
) -> dict[str, list[str]]:
    source, target = 0, 1
    positive = fixture["positive"]
    negative = fixture["negative"]
    codes = tuple(code_to_surface(code) for code in codebooks["TRAIN"][:NODE_COUNT])
    base = {
        "source": source,
        "target": target,
        "positive_edges": tuple(sorted(positive)),
        "negative_edges": tuple(sorted(negative)),
        "surface_codes_positive": codes,
        "surface_codes_negative": codes,
        "row_order_positive": (0, 1, 2, 3, 4, 5),
        "row_order_negative": (0, 1, 2, 3, 4, 5),
        "query_positive": (source, target),
        "query_negative": (source, target),
    }
    if validate_pair_object(base):
        raise AssertionError("valid proof fixture rejected")

    mutations: dict[str, dict] = {}

    m = dict(base)
    altered = list(codes)
    first = list(altered[0])
    first[0] *= -1
    altered[0] = tuple(first)
    m["surface_codes_negative"] = tuple(altered)
    mutations["surface_mismatch"] = m

    m = dict(base)
    m["row_order_negative"] = (1, 0, 2, 3, 4, 5)
    mutations["row_order_mismatch"] = m

    m = dict(base)
    m["query_negative"] = (source, 2)
    mutations["query_mismatch"] = m

    m = dict(base)
    duplicated = list(codes)
    duplicated[1] = duplicated[0]
    m["surface_codes_positive"] = tuple(duplicated)
    m["surface_codes_negative"] = tuple(duplicated)
    mutations["duplicate_surface_code"] = m

    m = dict(base)
    unbalanced = list(codes)
    unbalanced[0] = tuple([1] * 9 + [-1] * 7)
    m["surface_codes_positive"] = tuple(unbalanced)
    m["surface_codes_negative"] = tuple(unbalanced)
    mutations["unbalanced_surface_code"] = m

    m = dict(base)
    m["negative_edges"] = tuple(sorted(positive))
    mutations["negative_relation_not_broken"] = m

    second_path = find_one_edge_swap(
        positive,
        source,
        target,
        lambda e: len(two_step_intermediates(e, source, target)) >= 2,
    )
    m = dict(base)
    m["positive_edges"] = tuple(sorted(second_path))
    mutations["positive_multiple_two_step"] = m

    direct = find_one_edge_swap(
        positive,
        source,
        target,
        lambda e: (source, target) in e,
    )
    m = dict(base)
    m["positive_edges"] = tuple(sorted(direct))
    mutations["direct_source_target"] = m

    degree_drift = find_one_edge_swap(
        negative,
        source,
        target,
        lambda e: len(e) == EDGE_COUNT and degrees(e) != degrees(positive),
    )
    m = dict(base)
    m["negative_edges"] = tuple(sorted(degree_drift))
    mutations["degree_drift"] = m

    self_loop = find_one_edge_swap(
        negative,
        source,
        target,
        lambda e: any(u == v for u, v in e),
    )
    m = dict(base)
    m["negative_edges"] = tuple(sorted(self_loop))
    mutations["self_loop"] = m

    if bad_reciprocal is not None:
        m = dict(base)
        m["positive_edges"] = tuple(sorted(bad_reciprocal["positive"]))
        m["negative_edges"] = tuple(sorted(bad_reciprocal["negative"]))
        mutations["reciprocal_count_change"] = m

    rejected: dict[str, list[str]] = {}
    for name, pair in mutations.items():
        errors = validate_pair_object(pair)
        if not errors:
            raise AssertionError(f"validator accepted mutation {name}")
        rejected[name] = errors
    return rejected


def implementation_digest(paths: tuple[Path, ...]) -> dict:
    component: dict[str, str] = {}
    combined = hashlib.sha256()
    for path in sorted(paths, key=lambda p: p.as_posix()):
        data = path.read_bytes()
        digest = hashlib.sha256(data).hexdigest()
        component[path.as_posix()] = digest
        combined.update(path.as_posix().encode("utf-8"))
        combined.update(b"\0")
        combined.update(bytes.fromhex(digest))
        combined.update(b"\n")
    return {"combined_sha256": combined.hexdigest(), "components": component}


def build_evidence(independent_verifier_path: Path) -> dict:
    graph = enumerate_canonical_query()
    codebooks, codebook_digests = allocate_codebooks()

    if graph["pair_capacity_per_query"] < REQUIRED_PAIRS_PER_QUERY:
        disposition = "FEASIBILITY_FAIL — RETURN RGR-04 DESIGN / DO NOT MATERIALIZE DATA"
    else:
        disposition = "FEASIBILITY_PASS"

    allocation_ranges: dict[str, tuple[int, int]] = {}
    cursor = 0
    for split in SPLIT_ORDER:
        width = BALANCED_ALLOCATION_PER_QUERY[split]
        allocation_ranges[split] = (cursor, cursor + width - 1)
        cursor += width

    surface_schedule = {
        split: surface_schedule_proof(SPLIT_PAIR_COUNTS[split], split)
        for split in SPLIT_ORDER
    }

    stream_samples = {}
    for split in SPLIT_ORDER:
        stream_samples[split] = {}
        for stream in STREAM_NAMES:
            stream_samples[split][stream] = {
                "counter_0_text": canonical_stream_text(split, stream, 0),
                "counter_0_sha256": stream_digest(split, stream, 0).hex(),
            }
        graph_index, _ = draw_index(
            split, "GRAPH", 0, graph["pair_capacity_per_query"]
        )
        stream_samples[split]["GRAPH"]["sample_capacity_index"] = graph_index

    multi = graph["first_multi_switch"]
    for split in SPLIT_ORDER:
        switch_index, _ = draw_index(
            split, "SWITCH", 0, len(multi["switches"])
        )
        stream_samples[split]["SWITCH"]["sample_choice_index"] = switch_index
        stream_samples[split]["SWITCH"]["sample_choice_count"] = len(multi["switches"])

    mutation_rejections = mutation_rejection_proof(
        graph["first_valid"], codebooks, graph["first_bad_reciprocal"]
    )

    proof_pair = graph["first_valid"]
    sample_pair_signature = {
        "positive_mask_sha256": mask_digest(
            edge_mask(proof_pair["positive"], 0, 1)
        ),
        "negative_mask_sha256": mask_digest(
            edge_mask(proof_pair["negative"], 0, 1)
        ),
        "intermediate": proof_pair["intermediate"],
        "switch": proof_pair["switch"],
    }

    script_path = Path(__file__).resolve()
    root = script_path.parents[3]
    verifier_abs = independent_verifier_path if independent_verifier_path.is_absolute() else root / independent_verifier_path
    impl = implementation_digest(
        (
            Path(script_path.relative_to(root)),
            Path(verifier_abs.relative_to(root)),
        )
    )

    return {
        "schema": "RGR05_FEASIBILITY_EVIDENCE_v1",
        "programme": "RELATIONAL-GEOMETRY-REASONING",
        "work_unit": "RGR-05",
        "benchmark_id": BENCHMARK_ID,
        "canonical_base_sha": BASE_SHA,
        "disposition": disposition,
        "frozen_parameters": {
            "nodes": NODE_COUNT,
            "directed_edges": EDGE_COUNT,
            "surface_specification": "BALANCED_16BIT_NODE_CODE",
            "code_width": CODE_WIDTH,
            "code_weight": CODE_WEIGHT,
            "codebook_size_per_split": CODEBOOK_SIZE,
            "split_master_seeds": SPLIT_SEEDS,
            "split_pair_counts": SPLIT_PAIR_COUNTS,
            "named_streams": STREAM_NAMES,
        },
        "graph_feasibility": {
            "canonical_query": {"source": 0, "target": 1},
            "ordered_query_pairs": QUERY_PAIR_COUNT,
            "valid_positive_graphs_per_query": graph["valid_positive_count"],
            "positive_graphs_with_admissible_switch_per_query": graph[
                "positive_with_admissible_switch"
            ],
            "unique_switch_positive_graphs_per_query": graph[
                "unique_switch_positive_count"
            ],
            "collision_free_pair_capacity_per_query": graph[
                "pair_capacity_per_query"
            ],
            "required_pairs_per_query_for_balanced_full_plan": REQUIRED_PAIRS_PER_QUERY,
            "collision_free_pair_capacity_all_queries": graph[
                "pair_capacity_per_query"
            ]
            * QUERY_PAIR_COUNT,
            "required_total_pairs": sum(SPLIT_PAIR_COUNTS.values()),
            "capacity_margin_per_query": graph["pair_capacity_per_query"]
            - REQUIRED_PAIRS_PER_QUERY,
            "switch_histogram": graph["switch_histogram"],
            "rejected_switch_reasons": graph["rejected_switch_reasons"],
            "label_symmetry_bijection": (
                "All six node labels are exchangeable under permutation; the "
                "canonical s=0,t=1 count maps bijectively to each of the 30 "
                "ordered source/target queries."
            ),
        },
        "split_allocator_feasibility": {
            "balanced_pairs_per_query": BALANCED_ALLOCATION_PER_QUERY,
            "ordinal_ranges_per_query": allocation_ranges,
            "positive_and_negative_collision_policy": (
                "capacity family keeps only one-switch positives and one "
                "lexicographic positive representative per unique negative; "
                "split ordinal ranges are disjoint."
            ),
            "exact_tuple_cross_split_collision_possible_under_plan": False,
        },
        "surface_feasibility": {
            "constant_weight_universe_size": len(balanced_code_universe()),
            "required_disjoint_code_count": CODEBOOK_SIZE * len(SPLIT_ORDER),
            "codebooks_pairwise_disjoint": len(
                set().union(*(set(book) for book in codebooks.values()))
            )
            == CODEBOOK_SIZE * len(SPLIT_ORDER),
            "codebook_sha256": codebook_digests,
            "surface_assignment_schedule": surface_schedule,
        },
        "stream_law": {
            "canonical_format": (
                "RGR04|RGR-RT1-D2C-01|<split>|<master-seed>|"
                "<stream-name>|<counter>"
            ),
            "draw_method": "SHA-256 first-64-bit rejection sampling",
            "samples": stream_samples,
        },
        "validator": {
            "valid_bounded_pair_accepted": True,
            "bounded_proof_pair_count": 1,
            "bounded_pair_signature": sample_pair_signature,
            "mutation_rejections": mutation_rejections,
            "mutation_count": len(mutation_rejections),
        },
        "implementation_digest": impl,
        "materialization_boundary": {
            "full_benchmark_materialized": False,
            "materialized_benchmark_pair_count": 0,
            "dataset_files_written": 0,
            "model_code_implemented": False,
            "model_training_executed": False,
            "model_performance_inspected": False,
            "test_executed": False,
            "replication_executed": False,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence", type=Path, required=True)
    parser.add_argument(
        "--independent-verifier",
        type=Path,
        default=Path("scripts/research/rgr/rgr05_independent_verifier.py"),
    )
    args = parser.parse_args()

    evidence = build_evidence(args.independent_verifier)
    args.evidence.parent.mkdir(parents=True, exist_ok=True)
    args.evidence.write_text(json.dumps(evidence, indent=2, sort_keys=True) + "\n")
    print(json.dumps({
        "disposition": evidence["disposition"],
        "pair_capacity_per_query": evidence["graph_feasibility"]["collision_free_pair_capacity_per_query"],
        "required_pairs_per_query": evidence["graph_feasibility"]["required_pairs_per_query_for_balanced_full_plan"],
        "implementation_digest": evidence["implementation_digest"]["combined_sha256"],
        "materialized_benchmark_pair_count": 0,
    }, sort_keys=True))
    return 0 if evidence["disposition"] == "FEASIBILITY_PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
