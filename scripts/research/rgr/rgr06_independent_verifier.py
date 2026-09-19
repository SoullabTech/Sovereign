#!/usr/bin/env python3
"""Independent RGR-06 implementation verifier.

The verifier carries independent expected constants and inspects both behavior
and source structure. It does not generate benchmark data or inspect model
performance.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib.util
import inspect
import json
import subprocess
import sys
from dataclasses import replace
from pathlib import Path
from typing import Dict, List

import torch
from torch import nn
from torch.optim import AdamW

ROOT = Path(__file__).resolve().parents[3]
PRIMARY_PATH = ROOT / "scripts/research/rgr/rgr06_confirmatory.py"
BASE_REF = "a2d32f83d872bfa6c31b4bf96c5f83cd9d9b5804"

AUTHORIZED_PATHS = {
    "docs/programme/RGR-06_CONFIRMATORY_IMPLEMENTATION_LOCK_2026-09-19.md",
    "docs/programme/RGR-06_WORK_UNIT_2026-09-19.json",
    "docs/programme/evidence/RGR-06/RGR06_IMPLEMENTATION_CONFORMANCE.json",
    "docs/programme/evidence/RGR-06/RGR06_INDEPENDENT_VERIFIER.json",
    "docs/programme/evidence/RGR-06/RGR06_RUNTIME_LOCK.json",
    "scripts/research/rgr/rgr06_confirmatory.py",
    "scripts/research/rgr/rgr06_independent_verifier.py",
    "scripts/research/rgr/requirements-rgr06.txt",
}

EXPECTED_PRIMARY_SEEDS = (51001, 51002, 51003, 51004, 51005)
EXPECTED_REPLICATION_SEEDS = (61001, 61002, 61003, 61004, 61005)
EXPECTED_LR = (1e-3, 3e-4)
EXPECTED_WD = (0.0, 1e-4)
EXPECTED_DEPTHS = (1, 2, 3)
EXPECTED_PERMUTATION_SEED = 91991
EXPECTED_OPTIMIZER = "AdamW"
FORBIDDEN_SPLIT_SEED_LITERALS = ("41041", "41042", "41043", "41044")


def load_primary():
    spec = importlib.util.spec_from_file_location("rgr06_primary", PRIMARY_PATH)
    if spec is None or spec.loader is None:
        raise RuntimeError("cannot load primary implementation")
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    return module


def linear_shapes(module: nn.Module) -> List[List[int]]:
    return [
        [layer.in_features, layer.out_features]
        for layer in module.modules()
        if isinstance(layer, nn.Linear)
    ]


def git_changed_paths() -> List[str]:
    tracked = subprocess.run(
        ["git", "diff", "--name-only", BASE_REF],
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    ).stdout.splitlines()
    untracked = subprocess.run(
        ["git", "ls-files", "--others", "--exclude-standard"],
        cwd=ROOT,
        check=True,
        text=True,
        capture_output=True,
    ).stdout.splitlines()
    return sorted(set(path for path in tracked + untracked if path))


def verify() -> Dict[str, object]:
    primary = load_primary()
    checks: Dict[str, bool] = {}
    details: Dict[str, object] = {}

    source = PRIMARY_PATH.read_text(encoding="utf-8")
    checks["no_frozen_split_seed_literals_in_primary"] = all(
        literal not in source for literal in FORBIDDEN_SPLIT_SEED_LITERALS
    )
    checks["no_rgr05_generator_import"] = "rgr05_" not in source
    checks["optimizer_family"] = primary.OPTIMIZER_FAMILY == EXPECTED_OPTIMIZER
    checks["learning_rate_grid"] = tuple(primary.LEARNING_RATES) == EXPECTED_LR
    checks["weight_decay_grid"] = tuple(primary.WEIGHT_DECAYS) == EXPECTED_WD
    checks["fr_depth_grid"] = tuple(primary.FR_DEPTHS) == EXPECTED_DEPTHS
    checks["primary_seeds"] = tuple(primary.PRIMARY_SEEDS) == EXPECTED_PRIMARY_SEEDS
    checks["replication_seeds"] = (
        tuple(primary.REPLICATION_SEEDS) == EXPECTED_REPLICATION_SEEDS
    )
    checks["permutation_seed"] = (
        primary.PERMUTATION_CONTROL_SEED == EXPECTED_PERMUTATION_SEED
    )
    checks["bootstrap_replicates"] = primary.BOOTSTRAP_REPLICATES == 10_000

    obs, labels = primary._hand_authored_non_benchmark_fixture()
    alternate = primary.ObservableBatch(
        U=obs.U.clone(),
        A=obs.A.clone(),
        q_s=obs.q_s.clone(),
        q_t=obs.q_t.clone(),
    )
    alternate.A[:, 2, 5] = 1
    checks["surface_excludes_adjacency_behaviorally"] = torch.equal(
        primary.encode_surface(obs), primary.encode_surface(alternate)
    )
    checks["full_view_contains_adjacency_behaviorally"] = not torch.equal(
        primary.encode_full_flat(obs), primary.encode_full_flat(alternate)
    )

    fs2 = primary.SurfaceMLP()
    checks["fs2_architecture"] = linear_shapes(fs2) == [
        [108, 256],
        [256, 128],
        [128, 64],
        [64, 1],
    ]

    fg_expected = {
        "G1": [[144, 512], [512, 256], [256, 1]],
        "G2": [[144, 512], [512, 256], [256, 128], [128, 1]],
        "G3": [[144, 512], [512, 256], [256, 128], [128, 64], [64, 1]],
    }
    checks["fg_architectures"] = all(
        linear_shapes(primary.GenericFullMLP(name)) == shapes
        for name, shapes in fg_expected.items()
    )

    fr_ok = True
    for depth in EXPECTED_DEPTHS:
        model = primary.DirectedMPNN(depth)
        fr_ok = fr_ok and len(model.message_layers) == depth
        fr_ok = fr_ok and len(model.update_layers) == depth
        fr_ok = fr_ok and model.node_encoder.in_features == 18
        fr_ok = fr_ok and model.node_encoder.out_features == 64
        readout_shapes = linear_shapes(model.readout)
        fr_ok = fr_ok and readout_shapes == [[128, 64], [64, 1]]
    checks["fr_architecture_contract"] = fr_ok

    fr_forward = inspect.getsource(primary.DirectedMPNN.forward)
    forbidden_oracle_terms = ("two_hop", "path_feature", "latent_intermediate", "oracle")
    checks["fr_no_oracle_source_path"] = all(
        term not in fr_forward.lower() for term in forbidden_oracle_terms
    )
    checks["fr_uses_directed_adjacency"] = "A.transpose(1, 2)" in fr_forward
    checks["fr_sum_aggregation"] = "torch.bmm" in fr_forward

    checks["fs2_grid_count"] = len(primary.neural_configurations("F_S2")) == 4
    checks["fg_grid_count"] = len(primary.neural_configurations("F_G")) == 12
    checks["fr_grid_count"] = len(primary.neural_configurations("F_R")) == 12

    config = primary.neural_configurations("F_S2")[3]
    model = primary.build_neural_model(config)
    primary.initialize_neural_model(model, 123)
    optimizer = primary.make_adamw(model, config)
    group = optimizer.param_groups[0]
    checks["adamw_class"] = isinstance(optimizer, AdamW)
    checks["adamw_semantics"] = (
        tuple(group["betas"]) == (0.9, 0.999)
        and group["eps"] == 1e-8
        and group["weight_decay"] == config.weight_decay
        and group["lr"] == config.learning_rate
        and optimizer.defaults.get("foreach") is False
        and optimizer.defaults.get("fused") is False
    )

    access_ok = True
    for forbidden in ("TEST", "REPLICATION"):
        try:
            primary.assert_model_selection_access("TRAIN", forbidden)
            access_ok = False
        except primary.ContractViolation:
            pass
    checks["test_replication_selection_sealed"] = access_ok

    rng = __import__("random").Random(7)
    plan = primary.hierarchical_draw_indices(rng, 5, 4)
    checks["bootstrap_samples_atomic_pair_indices"] = all(
        isinstance(pair_index, int)
        for _, pair_indices in plan
        for pair_index in pair_indices
    )
    checks["bootstrap_level1_seed_resampling"] = len(plan) == 5
    checks["bootstrap_level2_pair_resampling"] = all(
        len(pair_indices) == 4 for _, pair_indices in plan
    )

    passing = primary.FrozenEvidence(
        benchmark_valid=True,
        fr_validation_ba=0.90,
        lb95_m_fr=0.85,
        lb95_delta_transfer=0.20,
        lb95_c_break_fr=0.80,
        fs1_exact_half=True,
        fs2_exact_half=True,
        permutation_control_ba=0.50,
        no_oracle_violation=True,
    )
    checks["all_nine_support_conditions"] = (
        len(primary.support_condition_vector(passing)) == 8
        and primary.adjudicate_final(passing, passing) == "SUPPORTED"
    )

    flips = [
        replace(passing, benchmark_valid=False),
        replace(passing, fr_validation_ba=0.79),
        replace(passing, lb95_m_fr=0.79),
        replace(passing, lb95_delta_transfer=0.09),
        replace(passing, lb95_c_break_fr=0.74),
        replace(passing, fs1_exact_half=False),
        replace(passing, permutation_control_ba=0.53),
        replace(passing, no_oracle_violation=False),
    ]
    checks["support_is_conjunctive"] = all(
        primary.adjudicate_final(candidate, passing) != "SUPPORTED"
        for candidate in flips
    )
    checks["replication_condition_is_conjunctive"] = (
        primary.adjudicate_final(
            passing, replace(passing, lb95_delta_transfer=0.09)
        )
        == "REPLICATION_FAILED"
    )

    try:
        primary.adjudicate_final(passing)
        checks["replication_seal"] = False
    except primary.EvidenceBoundaryError:
        checks["replication_seal"] = True

    changed_paths = git_changed_paths()
    checks["repository_scope_bounded"] = set(changed_paths).issubset(AUTHORIZED_PATHS)
    details["changed_paths"] = changed_paths

    work_unit_path = ROOT / "docs/programme/RGR-06_WORK_UNIT_2026-09-19.json"
    if work_unit_path.exists():
        work_unit = json.loads(work_unit_path.read_text(encoding="utf-8"))
        boundary = work_unit["materialization_boundary"]
        checks["zero_materialization_boundary"] = (
            boundary["benchmark_examples_materialized"] == 0
            and boundary["benchmark_pairs_materialized"] == 0
            and boundary["dataset_files_written"] == 0
            and boundary["benchmark_model_training_executed"] is False
            and boundary["benchmark_performance_inspected"] is False
            and boundary["test_executed"] is False
            and boundary["replication_executed"] is False
        )
    else:
        checks["zero_materialization_boundary"] = False

    failures = sorted(name for name, ok in checks.items() if not ok)
    return {
        "gate": "RGR-06",
        "verifier": "independent-static-and-behavioral-v1",
        "status": "PASS" if not failures else "FAIL",
        "checks": checks,
        "failures": failures,
        "details": details,
        "primary_sha256": hashlib.sha256(PRIMARY_PATH.read_bytes()).hexdigest(),
        "verifier_sha256": hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
        "materialization_boundary": {
            "benchmark_examples_materialized": 0,
            "benchmark_pairs_materialized": 0,
            "dataset_files_written": 0,
            "benchmark_model_training_executed": False,
            "benchmark_performance_inspected": False,
            "test_executed": False,
            "replication_executed": False,
        },
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    result = verify()
    if args.json:
        print(json.dumps(result, indent=2, sort_keys=True))
    else:
        print(result["status"])
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
