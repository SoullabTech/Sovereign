#!/usr/bin/env python3
"""RGR-06 confirmatory implementation lock.

This module freezes model, training, metric, bootstrap, control, and
adjudication machinery for RGR-RT1-D2C-01. It deliberately contains no
benchmark generator, no RGR-04 split seeds, and no data materialization.
"""
from __future__ import annotations

import argparse
import copy
import hashlib
import json
import math
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, Optional, Sequence, Tuple

import torch
from torch import Tensor, nn
from torch.optim import AdamW, LBFGS

BENCHMARK_ID = "RGR-RT1-D2C-01"
NODE_COUNT = 6
SURFACE_DIM = 16
SURFACE_INPUT_DIM = NODE_COUNT * SURFACE_DIM + NODE_COUNT + NODE_COUNT
FULL_INPUT_DIM = SURFACE_INPUT_DIM + NODE_COUNT * NODE_COUNT

FS1_L2_GRID = (1e-4, 1e-3, 1e-2, 1e-1)
LEARNING_RATES = (1e-3, 3e-4)
WEIGHT_DECAYS = (0.0, 1e-4)
FG_ARCHITECTURES = {
    "G1": (512, 256),
    "G2": (512, 256, 128),
    "G3": (512, 256, 128, 64),
}
FR_DEPTHS = (1, 2, 3)

OPTIMIZER_FAMILY = "AdamW"
ADAMW_BETAS = (0.9, 0.999)
ADAMW_EPS = 1e-8
GRADIENT_CLIPPING = None
LOSS_NAME = "BCEWithLogitsLoss"
LOSS_REDUCTION = "mean"

DEVICE_POLICY = "CPU_ONLY"
NEURAL_DTYPE = torch.float32
FS1_DTYPE = torch.float64
BATCH_SIZE = 128
MAX_EPOCHS = 50
EARLY_STOPPING_PATIENCE = 5
VALIDATION_IMPROVEMENT_EPS = 1e-12
REPORTING_TOLERANCE = 1e-12

PRIMARY_SEEDS = (51001, 51002, 51003, 51004, 51005)
REPLICATION_SEEDS = (61001, 61002, 61003, 61004, 61005)
PERMUTATION_CONTROL_SEED = 91991
BOOTSTRAP_REPLICATES = 10_000
BOOTSTRAP_SEED = 706196780616792293

TAU_MIN = 0.80
DELTA_MIN = 0.10
KAPPA_MIN = 0.75
PERMUTATION_CONTROL_MAX = 0.52
COMPETENCE_FLOOR = 0.80

MODEL_SELECTION_ALLOWED_SPLITS = ("TRAIN", "VALIDATION")
MODEL_SELECTION_FORBIDDEN_SPLITS = ("TEST", "REPLICATION")

OUTCOMES = (
    "SUPPORTED",
    "NOT_SUPPORTED",
    "UNDERDETERMINED",
    "BENCHMARK_INVALID",
    "REPLICATION_FAILED",
)


class ContractViolation(RuntimeError):
    pass


class EvidenceBoundaryError(RuntimeError):
    pass


@dataclass(frozen=True)
class ObservableBatch:
    U: Tensor
    A: Tensor
    q_s: Tensor
    q_t: Tensor

    @property
    def batch_size(self) -> int:
        return int(self.U.shape[0])

    def subset(self, indices: Tensor) -> "ObservableBatch":
        return ObservableBatch(
            U=self.U.index_select(0, indices),
            A=self.A.index_select(0, indices),
            q_s=self.q_s.index_select(0, indices),
            q_t=self.q_t.index_select(0, indices),
        )


@dataclass(frozen=True)
class NeuralConfig:
    family: str
    config_id: str
    learning_rate: float
    weight_decay: float
    architecture: Optional[str] = None
    message_passing_depth: Optional[int] = None


@dataclass
class TrainingResult:
    model: nn.Module
    best_validation_ba: float
    best_epoch: int
    epochs_run: int
    config_id: str
    initialization_seed: int


@dataclass(frozen=True)
class FrozenEvidence:
    benchmark_valid: bool
    fr_validation_ba: float
    lb95_m_fr: float
    lb95_delta_transfer: float
    lb95_c_break_fr: float
    fs1_exact_half: bool
    fs2_exact_half: bool
    permutation_control_ba: float
    no_oracle_violation: bool
    interpretation_blocked: bool = False


def configure_research_runtime() -> None:
    torch.set_default_dtype(NEURAL_DTYPE)
    torch.use_deterministic_algorithms(True)
    torch.set_num_threads(1)
    try:
        torch.set_num_interop_threads(1)
    except RuntimeError:
        pass


def _validate_query(q: Tensor, name: str, batch: int) -> None:
    if q.shape != (batch, NODE_COUNT):
        raise ContractViolation(f"{name} must have shape (batch,{NODE_COUNT})")
    if not torch.all((q == 0) | (q == 1)):
        raise ContractViolation(f"{name} must be binary one-hot")
    if not torch.all(q.sum(dim=1) == 1):
        raise ContractViolation(f"{name} must be one-hot")


def validate_observable(obs: ObservableBatch) -> None:
    if obs.U.ndim != 3 or obs.U.shape[1:] != (NODE_COUNT, SURFACE_DIM):
        raise ContractViolation("U must have shape (batch,6,16)")
    batch = obs.batch_size
    if obs.A.shape != (batch, NODE_COUNT, NODE_COUNT):
        raise ContractViolation("A must have shape (batch,6,6)")
    if not torch.all((obs.U == -1) | (obs.U == 1)):
        raise ContractViolation("U values must be {-1,+1}")
    if not torch.all((obs.A == 0) | (obs.A == 1)):
        raise ContractViolation("A values must be {0,1}")
    _validate_query(obs.q_s, "q_s", batch)
    _validate_query(obs.q_t, "q_t", batch)


def encode_surface(obs: ObservableBatch) -> Tensor:
    """Canonical row-major surface view: U, then q_s, then q_t."""
    validate_observable(obs)
    return torch.cat(
        (obs.U.reshape(obs.batch_size, -1), obs.q_s, obs.q_t), dim=1
    ).to(dtype=NEURAL_DTYPE, device="cpu")


def encode_full_flat(obs: ObservableBatch) -> Tensor:
    """Canonical row-major full view: U, A, q_s, q_t."""
    validate_observable(obs)
    return torch.cat(
        (
            obs.U.reshape(obs.batch_size, -1),
            obs.A.reshape(obs.batch_size, -1),
            obs.q_s,
            obs.q_t,
        ),
        dim=1,
    ).to(dtype=NEURAL_DTYPE, device="cpu")


class SurfaceLogistic(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.linear = nn.Linear(SURFACE_INPUT_DIM, 1, bias=True, dtype=FS1_DTYPE)
        with torch.no_grad():
            self.linear.weight.zero_()
            self.linear.bias.zero_()

    def forward(self, obs: ObservableBatch) -> Tensor:
        return self.linear(encode_surface(obs).to(dtype=FS1_DTYPE)).squeeze(-1)


class SurfaceMLP(nn.Module):
    def __init__(self) -> None:
        super().__init__()
        self.network = _mlp(SURFACE_INPUT_DIM, (256, 128, 64))

    def forward(self, obs: ObservableBatch) -> Tensor:
        return self.network(encode_surface(obs)).squeeze(-1)


class GenericFullMLP(nn.Module):
    def __init__(self, architecture: str) -> None:
        super().__init__()
        if architecture not in FG_ARCHITECTURES:
            raise ContractViolation(f"unknown F_G architecture {architecture}")
        self.architecture = architecture
        self.network = _mlp(FULL_INPUT_DIM, FG_ARCHITECTURES[architecture])

    def forward(self, obs: ObservableBatch) -> Tensor:
        return self.network(encode_full_flat(obs)).squeeze(-1)


class DirectedMPNN(nn.Module):
    """Directed incoming-message network with per-round parameters shared across nodes."""

    def __init__(self, depth: int) -> None:
        super().__init__()
        if depth not in FR_DEPTHS:
            raise ContractViolation(f"F_R depth must be one of {FR_DEPTHS}")
        self.depth = depth
        self.node_encoder = nn.Linear(SURFACE_DIM + 2, 64)
        self.message_layers = nn.ModuleList(
            [nn.Linear(64, 64, bias=False) for _ in range(depth)]
        )
        self.update_layers = nn.ModuleList(
            [nn.Linear(128, 64, bias=True) for _ in range(depth)]
        )
        self.readout = nn.Sequential(
            nn.Linear(128, 64),
            nn.ReLU(),
            nn.Linear(64, 1),
        )

    def forward(self, obs: ObservableBatch) -> Tensor:
        validate_observable(obs)
        U = obs.U.to(dtype=NEURAL_DTYPE, device="cpu")
        A = obs.A.to(dtype=NEURAL_DTYPE, device="cpu")
        q_s = obs.q_s.to(dtype=NEURAL_DTYPE, device="cpu")
        q_t = obs.q_t.to(dtype=NEURAL_DTYPE, device="cpu")
        node_input = torch.cat((U, q_s.unsqueeze(-1), q_t.unsqueeze(-1)), dim=-1)
        h = torch.relu(self.node_encoder(node_input))
        for message_layer, update_layer in zip(self.message_layers, self.update_layers):
            source_messages = message_layer(h)
            incoming = torch.bmm(A.transpose(1, 2), source_messages)
            h = torch.relu(update_layer(torch.cat((h, incoming), dim=-1)))
        source_h = (h * q_s.unsqueeze(-1)).sum(dim=1)
        target_h = (h * q_t.unsqueeze(-1)).sum(dim=1)
        return self.readout(torch.cat((source_h, target_h), dim=-1)).squeeze(-1)


def _mlp(input_dim: int, hidden: Sequence[int]) -> nn.Sequential:
    layers: List[nn.Module] = []
    width = input_dim
    for next_width in hidden:
        layers.extend((nn.Linear(width, next_width), nn.ReLU()))
        width = next_width
    layers.append(nn.Linear(width, 1))
    return nn.Sequential(*layers)


def derive_seed(namespace: str, *parts: object) -> int:
    canonical = "|".join(
        ("RGR06", BENCHMARK_ID, namespace, *(str(part) for part in parts))
    )
    digest = hashlib.sha256(canonical.encode("utf-8")).digest()
    return int.from_bytes(digest[:8], "big") & ((1 << 63) - 1)


def initialize_neural_model(model: nn.Module, seed: int) -> None:
    with torch.random.fork_rng(devices=[]):
        torch.manual_seed(seed)
        for module in model.modules():
            if isinstance(module, nn.Linear):
                nn.init.xavier_uniform_(module.weight)
                if module.bias is not None:
                    nn.init.zeros_(module.bias)


def neural_configurations(family: str) -> Tuple[NeuralConfig, ...]:
    configs: List[NeuralConfig] = []
    if family == "F_S2":
        for lr_index, lr in enumerate(LEARNING_RATES):
            for wd_index, wd in enumerate(WEIGHT_DECAYS):
                configs.append(
                    NeuralConfig(
                        family=family,
                        config_id=f"F_S2-LR{lr_index}-WD{wd_index}",
                        learning_rate=lr,
                        weight_decay=wd,
                    )
                )
    elif family == "F_G":
        for architecture in ("G1", "G2", "G3"):
            for lr_index, lr in enumerate(LEARNING_RATES):
                for wd_index, wd in enumerate(WEIGHT_DECAYS):
                    configs.append(
                        NeuralConfig(
                            family=family,
                            config_id=f"F_G-{architecture}-LR{lr_index}-WD{wd_index}",
                            learning_rate=lr,
                            weight_decay=wd,
                            architecture=architecture,
                        )
                    )
    elif family == "F_R":
        for depth in FR_DEPTHS:
            for lr_index, lr in enumerate(LEARNING_RATES):
                for wd_index, wd in enumerate(WEIGHT_DECAYS):
                    configs.append(
                        NeuralConfig(
                            family=family,
                            config_id=f"F_R-D{depth}-LR{lr_index}-WD{wd_index}",
                            learning_rate=lr,
                            weight_decay=wd,
                            message_passing_depth=depth,
                        )
                    )
    else:
        raise ContractViolation(f"unknown neural family {family}")
    return tuple(configs)


def build_neural_model(config: NeuralConfig) -> nn.Module:
    if config.family == "F_S2":
        return SurfaceMLP()
    if config.family == "F_G" and config.architecture is not None:
        return GenericFullMLP(config.architecture)
    if config.family == "F_R" and config.message_passing_depth is not None:
        return DirectedMPNN(config.message_passing_depth)
    raise ContractViolation(f"invalid configuration {config}")


def make_adamw(model: nn.Module, config: NeuralConfig) -> AdamW:
    return AdamW(
        model.parameters(),
        lr=config.learning_rate,
        weight_decay=config.weight_decay,
        betas=ADAMW_BETAS,
        eps=ADAMW_EPS,
        amsgrad=False,
        maximize=False,
        foreach=False,
        capturable=False,
        differentiable=False,
        fused=False,
    )


def binary_loss(logits: Tensor, labels: Tensor) -> Tensor:
    return nn.functional.binary_cross_entropy_with_logits(
        logits, labels.to(dtype=logits.dtype), reduction=LOSS_REDUCTION
    )


def assert_model_selection_access(train_split: str, validation_split: str) -> None:
    if (train_split, validation_split) != ("TRAIN", "VALIDATION"):
        raise ContractViolation("model selection may use TRAIN + VALIDATION only")


def _batch_order(count: int, family: str, config_id: str, epoch: int) -> Tensor:
    generator = torch.Generator(device="cpu")
    generator.manual_seed(derive_seed("MODEL_SELECTION_SHUFFLE", family, config_id, epoch))
    return torch.randperm(count, generator=generator)


def _forward_family(model: nn.Module, family: str, obs: ObservableBatch) -> Tensor:
    if family in ("F_S2", "F_G", "F_R"):
        return model(obs)
    raise ContractViolation(f"unsupported neural family {family}")


def predict_labels(model: nn.Module, family: str, obs: ObservableBatch) -> Tensor:
    model.eval()
    with torch.no_grad():
        logits = _forward_family(model, family, obs)
        return (torch.sigmoid(logits) >= 0.5).to(dtype=torch.int64)


def balanced_accuracy(labels: Sequence[int], predictions: Sequence[int]) -> float:
    if len(labels) != len(predictions) or not labels:
        raise ContractViolation("labels/predictions must be equal non-empty lengths")
    positives = [i for i, y in enumerate(labels) if int(y) == 1]
    negatives = [i for i, y in enumerate(labels) if int(y) == 0]
    if not positives or not negatives:
        raise ContractViolation("balanced accuracy requires both classes")
    tpr = sum(int(predictions[i]) == 1 for i in positives) / len(positives)
    tnr = sum(int(predictions[i]) == 0 for i in negatives) / len(negatives)
    return 0.5 * (tpr + tnr)


def validation_ba(model: nn.Module, family: str, obs: ObservableBatch, labels: Tensor) -> float:
    predictions = predict_labels(model, family, obs).tolist()
    return balanced_accuracy(labels.to(dtype=torch.int64).tolist(), predictions)


def fit_neural_candidate(
    config: NeuralConfig,
    train_obs: ObservableBatch,
    train_labels: Tensor,
    validation_obs: ObservableBatch,
    validation_labels: Tensor,
    train_split: str = "TRAIN",
    validation_split: str = "VALIDATION",
) -> TrainingResult:
    """Future TRAIN/VALIDATION implementation. RGR-06 does not call this on benchmark data."""
    assert_model_selection_access(train_split, validation_split)
    configure_research_runtime()
    model = build_neural_model(config).to(device="cpu", dtype=NEURAL_DTYPE)
    init_seed = derive_seed("MODEL_SELECTION_INIT", config.family, config.config_id)
    initialize_neural_model(model, init_seed)
    optimizer = make_adamw(model, config)
    best_score = -math.inf
    best_epoch = 0
    best_state: Optional[Dict[str, Tensor]] = None
    stale_epochs = 0
    epochs_run = 0

    for epoch in range(1, MAX_EPOCHS + 1):
        model.train()
        order = _batch_order(train_obs.batch_size, config.family, config.config_id, epoch)
        for start in range(0, train_obs.batch_size, BATCH_SIZE):
            indices = order[start : start + BATCH_SIZE]
            batch_obs = train_obs.subset(indices)
            batch_labels = train_labels.index_select(0, indices).to(dtype=NEURAL_DTYPE)
            optimizer.zero_grad(set_to_none=True)
            logits = _forward_family(model, config.family, batch_obs)
            loss = binary_loss(logits, batch_labels)
            loss.backward()
            optimizer.step()

        score = validation_ba(model, config.family, validation_obs, validation_labels)
        epochs_run = epoch
        if score > best_score + VALIDATION_IMPROVEMENT_EPS:
            best_score = score
            best_epoch = epoch
            best_state = {k: v.detach().clone() for k, v in model.state_dict().items()}
            stale_epochs = 0
        else:
            stale_epochs += 1
            if stale_epochs >= EARLY_STOPPING_PATIENCE:
                break

    if best_state is None:
        raise ContractViolation("training produced no validation checkpoint")
    model.load_state_dict(best_state)
    return TrainingResult(
        model=model,
        best_validation_ba=best_score,
        best_epoch=best_epoch,
        epochs_run=epochs_run,
        config_id=config.config_id,
        initialization_seed=init_seed,
    )


def fit_surface_logistic(
    train_obs: ObservableBatch,
    train_labels: Tensor,
    l2_coefficient: float,
) -> SurfaceLogistic:
    """Deterministic full-batch convex baseline; L2 means lambda/2 * ||w||^2."""
    if l2_coefficient not in FS1_L2_GRID:
        raise ContractViolation("F_S1 L2 coefficient is outside the frozen grid")
    model = SurfaceLogistic().to(device="cpu", dtype=FS1_DTYPE)
    features = encode_surface(train_obs).to(dtype=FS1_DTYPE)
    labels = train_labels.to(dtype=FS1_DTYPE)
    optimizer = LBFGS(
        model.parameters(),
        lr=1.0,
        max_iter=200,
        max_eval=250,
        tolerance_grad=1e-9,
        tolerance_change=1e-12,
        history_size=100,
        line_search_fn="strong_wolfe",
    )

    def closure() -> Tensor:
        optimizer.zero_grad(set_to_none=True)
        logits = model.linear(features).squeeze(-1)
        data_loss = nn.functional.binary_cross_entropy_with_logits(
            logits, labels, reduction="mean"
        )
        penalty = 0.5 * l2_coefficient * model.linear.weight.square().sum()
        loss = data_loss + penalty
        loss.backward()
        return loss

    optimizer.step(closure)
    return model


def select_configuration(validation_scores: Mapping[str, float], family: str) -> str:
    configs = neural_configurations(family)
    expected = [config.config_id for config in configs]
    if set(validation_scores) != set(expected):
        raise ContractViolation("validation scores must cover the exact frozen grid")
    return min(
        expected,
        key=lambda config_id: (-float(validation_scores[config_id]), expected.index(config_id)),
    )


def select_fs1_l2(validation_scores: Mapping[float, float]) -> float:
    if set(validation_scores) != set(FS1_L2_GRID):
        raise ContractViolation("F_S1 validation scores must cover the exact frozen L2 grid")
    return min(
        FS1_L2_GRID,
        key=lambda value: (-float(validation_scores[value]), FS1_L2_GRID.index(value)),
    )


def build_confirmatory_model(config: NeuralConfig, seed: int) -> nn.Module:
    if seed not in PRIMARY_SEEDS + REPLICATION_SEEDS:
        raise ContractViolation("confirmatory seed is not preregistered")
    model = build_neural_model(config).to(device="cpu", dtype=NEURAL_DTYPE)
    initialize_neural_model(model, seed)
    return model


def family_score(seed_balanced_accuracies: Sequence[float]) -> float:
    if len(seed_balanced_accuracies) != 5:
        raise ContractViolation("confirmatory family score requires exactly five seeds")
    return sum(float(x) for x in seed_balanced_accuracies) / 5.0


def surface_score(fs1_score: float, fs2_score: float) -> float:
    return max(float(fs1_score), float(fs2_score))


def delta_transfer(fr_score: float, fs_score: float) -> float:
    return float(fr_score) - float(fs_score)


def counterfactual_break_score(
    predictions_by_seed: Sequence[Sequence[Tuple[int, int]]],
) -> float:
    if len(predictions_by_seed) != 5:
        raise ContractViolation("C_break requires exactly five confirmatory seeds")
    pair_counts = {len(seed_pairs) for seed_pairs in predictions_by_seed}
    if len(pair_counts) != 1 or 0 in pair_counts:
        raise ContractViolation("all seeds must have the same non-zero pair count")
    per_seed = []
    for seed_pairs in predictions_by_seed:
        correct = sum(int(pos) == 1 and int(neg) == 0 for pos, neg in seed_pairs)
        per_seed.append(correct / len(seed_pairs))
    return sum(per_seed) / len(per_seed)


def paired_surface_theorem_holds(held_out_ba: float) -> bool:
    return abs(float(held_out_ba) - 0.5) <= REPORTING_TOLERANCE


def permute_train_labels(labels: Sequence[int]) -> List[int]:
    order = list(range(len(labels)))
    random.Random(PERMUTATION_CONTROL_SEED).shuffle(order)
    return [int(labels[i]) for i in order]


def _validate_rectangular(values_by_seed: Sequence[Sequence[float]]) -> Tuple[int, int]:
    if not values_by_seed:
        raise ContractViolation("bootstrap requires seed values")
    pair_counts = {len(values) for values in values_by_seed}
    if len(pair_counts) != 1:
        raise ContractViolation("bootstrap pair counts must align across seeds")
    pair_count = pair_counts.pop()
    if pair_count == 0:
        raise ContractViolation("bootstrap requires at least one pair")
    return len(values_by_seed), pair_count


def hierarchical_draw_indices(
    rng: random.Random, seed_count: int, pair_count: int
) -> List[Tuple[int, Tuple[int, ...]]]:
    """Each sampled pair index is atomic; positive/negative members are never sampled separately."""
    plan: List[Tuple[int, Tuple[int, ...]]] = []
    for _ in range(seed_count):
        seed_index = rng.randrange(seed_count)
        pair_indices = tuple(rng.randrange(pair_count) for _ in range(pair_count))
        plan.append((seed_index, pair_indices))
    return plan


def _mean_from_plan(
    values_by_seed: Sequence[Sequence[float]],
    plan: Sequence[Tuple[int, Sequence[int]]],
) -> float:
    sampled: List[float] = []
    for seed_index, pair_indices in plan:
        sampled.extend(float(values_by_seed[seed_index][i]) for i in pair_indices)
    return sum(sampled) / len(sampled)


def _percentile(values: Sequence[float], probability: float) -> float:
    ordered = sorted(float(value) for value in values)
    if not ordered:
        raise ContractViolation("percentile requires values")
    position = (len(ordered) - 1) * probability
    lo = int(math.floor(position))
    hi = int(math.ceil(position))
    if lo == hi:
        return ordered[lo]
    weight = position - lo
    return ordered[lo] * (1.0 - weight) + ordered[hi] * weight


def hierarchical_bootstrap_interval(
    values_by_seed: Sequence[Sequence[float]],
    replicates: int = BOOTSTRAP_REPLICATES,
    seed: int = BOOTSTRAP_SEED,
) -> Tuple[float, float]:
    seed_count, pair_count = _validate_rectangular(values_by_seed)
    rng = random.Random(seed)
    draws: List[float] = []
    for _ in range(replicates):
        plan = hierarchical_draw_indices(rng, seed_count, pair_count)
        draws.append(_mean_from_plan(values_by_seed, plan))
    return _percentile(draws, 0.025), _percentile(draws, 0.975)


def hierarchical_bootstrap_delta_interval(
    fr_values: Sequence[Sequence[float]],
    fs1_values: Sequence[Sequence[float]],
    fs2_values: Sequence[Sequence[float]],
    replicates: int = BOOTSTRAP_REPLICATES,
    seed: int = BOOTSTRAP_SEED,
) -> Tuple[float, float]:
    shape = _validate_rectangular(fr_values)
    if _validate_rectangular(fs1_values) != shape or _validate_rectangular(fs2_values) != shape:
        raise ContractViolation("delta bootstrap arrays must align")
    seed_count, pair_count = shape
    rng = random.Random(seed)
    draws: List[float] = []
    for _ in range(replicates):
        plan = hierarchical_draw_indices(rng, seed_count, pair_count)
        fr = _mean_from_plan(fr_values, plan)
        fs1 = _mean_from_plan(fs1_values, plan)
        fs2 = _mean_from_plan(fs2_values, plan)
        draws.append(fr - max(fs1, fs2))
    return _percentile(draws, 0.025), _percentile(draws, 0.975)


def support_condition_vector(evidence: FrozenEvidence) -> Tuple[bool, ...]:
    return (
        bool(evidence.benchmark_valid),
        evidence.fr_validation_ba >= COMPETENCE_FLOOR,
        evidence.lb95_m_fr > TAU_MIN,
        evidence.lb95_delta_transfer > DELTA_MIN,
        evidence.lb95_c_break_fr > KAPPA_MIN,
        bool(evidence.fs1_exact_half and evidence.fs2_exact_half),
        evidence.permutation_control_ba <= PERMUTATION_CONTROL_MAX,
        bool(evidence.no_oracle_violation),
    )


def _validity_conditions(evidence: FrozenEvidence) -> bool:
    conditions = support_condition_vector(evidence)
    return conditions[0] and conditions[5] and conditions[6] and conditions[7]


def adjudicate_final(
    primary: FrozenEvidence,
    replication: Optional[FrozenEvidence] = None,
) -> str:
    if not _validity_conditions(primary):
        return "BENCHMARK_INVALID"
    if primary.interpretation_blocked or primary.fr_validation_ba < COMPETENCE_FLOOR:
        return "UNDERDETERMINED"
    primary_conditions = support_condition_vector(primary)
    if not all(primary_conditions):
        return "NOT_SUPPORTED"
    if replication is None:
        raise EvidenceBoundaryError(
            "primary conditions 1-8 pass; final outcome is sealed until replication is authorized"
        )
    if not _validity_conditions(replication):
        return "BENCHMARK_INVALID"
    if all(support_condition_vector(replication)) and not replication.interpretation_blocked:
        return "SUPPORTED"
    return "REPLICATION_FAILED"


def _hand_authored_non_benchmark_fixture() -> Tuple[ObservableBatch, Tensor]:
    base = torch.tensor([1] * 8 + [-1] * 8, dtype=NEURAL_DTYPE)
    node_codes = torch.stack([torch.roll(base, shifts=i) for i in range(NODE_COUNT)])
    U = node_codes.unsqueeze(0).repeat(4, 1, 1)
    A = torch.zeros((4, NODE_COUNT, NODE_COUNT), dtype=NEURAL_DTYPE)
    A[:, 0, 2] = 1
    A[:, 4, 1] = 1
    q_s = torch.zeros((4, NODE_COUNT), dtype=NEURAL_DTYPE)
    q_t = torch.zeros((4, NODE_COUNT), dtype=NEURAL_DTYPE)
    q_s[:, 0] = 1
    q_t[:, 1] = 1
    labels = torch.tensor([1, 0, 1, 0], dtype=NEURAL_DTYPE)
    return ObservableBatch(U=U, A=A, q_s=q_s, q_t=q_t), labels


def self_test() -> Dict[str, object]:
    configure_research_runtime()
    checks: Dict[str, bool] = {}

    obs, labels = _hand_authored_non_benchmark_fixture()
    alternate = ObservableBatch(
        U=obs.U.clone(),
        A=obs.A.clone(),
        q_s=obs.q_s.clone(),
        q_t=obs.q_t.clone(),
    )
    alternate.A[:, 3, 5] = 1
    checks["surface_encoder_excludes_adjacency"] = torch.equal(
        encode_surface(obs), encode_surface(alternate)
    )
    checks["full_encoder_includes_adjacency"] = not torch.equal(
        encode_full_flat(obs), encode_full_flat(alternate)
    )
    checks["surface_dim"] = encode_surface(obs).shape[1] == SURFACE_INPUT_DIM == 108
    checks["full_dim"] = encode_full_flat(obs).shape[1] == FULL_INPUT_DIM == 144

    checks["fs2_grid_count"] = len(neural_configurations("F_S2")) == 4
    checks["fg_grid_count"] = len(neural_configurations("F_G")) == 12
    checks["fr_grid_count"] = len(neural_configurations("F_R")) == 12

    for depth in FR_DEPTHS:
        config = next(
            c for c in neural_configurations("F_R") if c.message_passing_depth == depth
        )
        model = build_neural_model(config)
        initialize_neural_model(model, 123456)
        checks[f"fr_depth_{depth}_forward"] = model(obs).shape == (obs.batch_size,)

    fs2_config = neural_configurations("F_S2")[0]
    model_a = build_neural_model(fs2_config)
    model_b = build_neural_model(fs2_config)
    initialize_neural_model(model_a, 777)
    initialize_neural_model(model_b, 777)
    checks["deterministic_initialization"] = all(
        torch.equal(a, b) for a, b in zip(model_a.parameters(), model_b.parameters())
    )

    optimizer = make_adamw(model_a, fs2_config)
    optimizer.zero_grad(set_to_none=True)
    smoke_loss = binary_loss(model_a(obs), labels)
    smoke_loss.backward()
    optimizer.step()
    checks["bounded_optimizer_smoke_step"] = math.isfinite(float(smoke_loss.detach()))

    checks["balanced_accuracy_formula"] = balanced_accuracy(
        [1, 1, 0, 0], [1, 0, 0, 1]
    ) == 0.5
    checks["family_score_five_seeds"] = family_score([0.8] * 5) == 0.8
    checks["surface_max_rule"] = surface_score(0.5, 0.5) == 0.5
    checks["delta_formula"] = abs(delta_transfer(0.82, 0.5) - 0.32) < 1e-12
    checks["c_break_formula"] = counterfactual_break_score(
        [[(1, 0), (1, 0)] for _ in range(5)]
    ) == 1.0
    checks["surface_theorem_tolerance"] = paired_surface_theorem_holds(0.5)

    permuted_a = permute_train_labels([0, 1, 0, 1, 0, 1])
    permuted_b = permute_train_labels([0, 1, 0, 1, 0, 1])
    checks["permutation_control_deterministic"] = permuted_a == permuted_b

    toy_values = [[0.75, 1.0, 0.5] for _ in range(5)]
    lo, hi = hierarchical_bootstrap_interval(toy_values, replicates=200, seed=123)
    checks["bootstrap_interval_ordered"] = 0.0 <= lo <= hi <= 1.0
    plan = hierarchical_draw_indices(random.Random(5), 5, 3)
    checks["bootstrap_pair_atomicity"] = all(
        isinstance(pair_index, int)
        for _, pair_indices in plan
        for pair_index in pair_indices
    )

    try:
        assert_model_selection_access("TRAIN", "TEST")
        checks["test_selection_rejected"] = False
    except ContractViolation:
        checks["test_selection_rejected"] = True
    try:
        assert_model_selection_access("TRAIN", "REPLICATION")
        checks["replication_selection_rejected"] = False
    except ContractViolation:
        checks["replication_selection_rejected"] = True

    passing = FrozenEvidence(
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
    checks["final_supported_requires_replication"] = adjudicate_final(passing, passing) == "SUPPORTED"
    try:
        adjudicate_final(passing)
        checks["replication_seal_enforced"] = False
    except EvidenceBoundaryError:
        checks["replication_seal_enforced"] = True

    failing_threshold = FrozenEvidence(**{**passing.__dict__, "lb95_m_fr": 0.79})
    checks["failed_primary_threshold_not_supported"] = (
        adjudicate_final(failing_threshold) == "NOT_SUPPORTED"
    )
    incompetent = FrozenEvidence(**{**passing.__dict__, "fr_validation_ba": 0.79})
    checks["competence_failure_underdetermined"] = (
        adjudicate_final(incompetent) == "UNDERDETERMINED"
    )
    invalid = FrozenEvidence(**{**passing.__dict__, "fs1_exact_half": False})
    checks["validity_failure_invalid"] = adjudicate_final(invalid) == "BENCHMARK_INVALID"
    repl_fail = FrozenEvidence(**{**passing.__dict__, "lb95_c_break_fr": 0.70})
    checks["replication_failure_outcome"] = (
        adjudicate_final(passing, repl_fail) == "REPLICATION_FAILED"
    )

    failures = sorted(name for name, ok in checks.items() if not ok)
    return {
        "gate": "RGR-06",
        "benchmark_id": BENCHMARK_ID,
        "status": "PASS" if not failures else "FAIL",
        "checks": checks,
        "failures": failures,
        "implementation_lock": {
            "optimizer_family": OPTIMIZER_FAMILY,
            "device_policy": DEVICE_POLICY,
            "neural_dtype": str(NEURAL_DTYPE),
            "fs1_dtype": str(FS1_DTYPE),
            "batch_size": BATCH_SIZE,
            "max_epochs": MAX_EPOCHS,
            "early_stopping_patience": EARLY_STOPPING_PATIENCE,
            "primary_seeds": list(PRIMARY_SEEDS),
            "replication_seeds": list(REPLICATION_SEEDS),
            "permutation_seed": PERMUTATION_CONTROL_SEED,
            "bootstrap_replicates": BOOTSTRAP_REPLICATES,
            "bootstrap_seed": BOOTSTRAP_SEED,
        },
        "materialization_boundary": {
            "benchmark_examples_materialized": 0,
            "benchmark_pairs_materialized": 0,
            "dataset_files_written": 0,
            "benchmark_model_training_executed": False,
            "benchmark_performance_inspected": False,
            "test_executed": False,
            "replication_executed": False,
        },
        "fixture_kind": "HAND_AUTHORED_NON_BENCHMARK",
        "fixture_edge_count": 2,
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    parser.add_argument("--json", action="store_true")
    args = parser.parse_args()
    if not args.self_test:
        parser.error("RGR-06 exposes implementation machinery only; use --self-test")
    result = self_test()
    if args.json:
        print(json.dumps(result, indent=2, sort_keys=True))
    else:
        print(result["status"])
    return 0 if result["status"] == "PASS" else 1


if __name__ == "__main__":
    raise SystemExit(main())
