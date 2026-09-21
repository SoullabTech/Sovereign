/**
 * SERVING-IDENTITY / R2 — generalized live serving-truth substrate.
 *
 * Facts only. This module does not decide disclosure, does not classify generalized
 * divergence, and does not select or route providers.
 */

import type { ProviderMeta, ProviderName } from './types';

export type ExecutionDomain = 'local' | 'external' | 'mixed' | 'unknown';

export type LiveRoutingContract =
  | 'legacy_default'
  | 'primary'
  | 'sovereign'
  | 'local_only'
  | 'multi_engine'
  | 'explicit_moonshot'
  | 'deep_wrapper'
  | 'unknown';

export type ServiceState =
  | 'served_model'
  | 'served_non_model'
  | 'degraded_non_model'
  | 'unresolved';

export type LiveNonModelSubsystem =
  | 'field_safety'
  | 'rcn'
  | 'deterministic_fallback';

type KnownProviderName = Exclude<ProviderName, 'unknown'>;

export type LiveIntendedTarget =
  | {
      kind: 'provider';
      provider: KnownProviderName;
      model?: string;
      domain: ExecutionDomain;
    }
  | {
      kind: 'domain';
      domain: ExecutionDomain;
      reason: string;
    }
  | {
      kind: 'unresolved';
      reason: string;
    };

export type LiveServedTarget =
  | {
      kind: 'model';
      provider: KnownProviderName;
      model: string;
      domain: ExecutionDomain;
    }
  | {
      kind: 'non_model';
      subsystem: LiveNonModelSubsystem;
      domain: ExecutionDomain;
    }
  | null;

export interface LiveServingTruth {
  routingContract: LiveRoutingContract;
  intended: LiveIntendedTarget;
  serviceState: ServiceState;
  served: LiveServedTarget;
  reason?: string;
}

export function executionDomainForProvider(provider: ProviderName): ExecutionDomain {
  switch (provider) {
    case 'ollama':
    case 'consciousness_engine':
    case 'local_inference':
      return 'local';
    case 'anthropic':
    case 'openai':
    case 'moonshot':
      return 'external';
    case 'multi_engine':
      // The provider label alone does not prove where every engine executed.
      return 'unknown';
    case 'unknown':
    default:
      return 'unknown';
  }
}

export function intendedProvider(
  provider: KnownProviderName,
  model?: string
): LiveIntendedTarget {
  return {
    kind: 'provider',
    provider,
    ...(model ? { model } : {}),
    domain: executionDomainForProvider(provider),
  };
}

export function intendedDomain(
  domain: ExecutionDomain,
  reason: string
): LiveIntendedTarget {
  return { kind: 'domain', domain, reason };
}

export function unresolvedIntent(reason: string): LiveIntendedTarget {
  return { kind: 'unresolved', reason };
}

/**
 * Stamp an actual ProviderMeta result without changing or re-running routing.
 * Unknown provider identity remains unresolved unless the result is the existing
 * deterministic degraded sentinel.
 */
export function truthFromProviderMeta(args: {
  routingContract: LiveRoutingContract;
  intended: LiveIntendedTarget;
  provider: ProviderMeta;
  reason?: string;
}): LiveServingTruth {
  const { routingContract, intended, provider } = args;
  const reason = args.reason ?? provider.reason;

  if (
    provider.provider === 'unknown' &&
    provider.model === 'degraded' &&
    provider.mode === 'fallback'
  ) {
    return {
      routingContract,
      intended,
      serviceState: 'degraded_non_model',
      served: null,
      reason: reason ?? 'all_providers_unavailable',
    };
  }

  if (provider.provider === 'unknown') {
    return {
      routingContract,
      intended,
      serviceState: 'unresolved',
      served: null,
      ...(reason ? { reason } : {}),
    };
  }

  return {
    routingContract,
    intended,
    serviceState: 'served_model',
    served: {
      kind: 'model',
      provider: provider.provider,
      model: provider.model,
      domain: executionDomainForProvider(provider.provider),
    },
    ...(reason ? { reason } : {}),
  };
}

export function servedNonModelTruth(args: {
  routingContract: LiveRoutingContract;
  intended: LiveIntendedTarget;
  subsystem: LiveNonModelSubsystem;
  domain: ExecutionDomain;
  reason?: string;
}): LiveServingTruth {
  return {
    routingContract: args.routingContract,
    intended: args.intended,
    serviceState: 'served_non_model',
    served: {
      kind: 'non_model',
      subsystem: args.subsystem,
      domain: args.domain,
    },
    ...(args.reason ? { reason: args.reason } : {}),
  };
}

export function degradedNonModelTruth(args: {
  routingContract: LiveRoutingContract;
  intended: LiveIntendedTarget;
  reason: string;
}): LiveServingTruth {
  return {
    routingContract: args.routingContract,
    intended: args.intended,
    serviceState: 'degraded_non_model',
    served: null,
    reason: args.reason,
  };
}

export function unresolvedServingTruth(args: {
  routingContract: LiveRoutingContract;
  intended: LiveIntendedTarget;
  reason: string;
}): LiveServingTruth {
  return {
    routingContract: args.routingContract,
    intended: args.intended,
    serviceState: 'unresolved',
    served: null,
    reason: args.reason,
  };
}
