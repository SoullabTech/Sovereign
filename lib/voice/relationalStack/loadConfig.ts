// MAIA Relational Stack - Config Loader
// Canonical spec: docs/maia/MAIA_RELATIONAL_STACK_SPEC.md

import fs from 'node:fs'
import path from 'node:path'
import type { ProsodyConfigFile, MaiaMode, ProsodicConfig, BlendParameter } from './types'

let cachedConfig: ProsodyConfigFile | null = null

/**
 * Load the MAIA prosody configuration.
 * Caches the result for subsequent calls.
 */
export function loadMaiaProsodyConfig(): ProsodyConfigFile {
  if (cachedConfig) return cachedConfig

  const configPath = path.join(
    process.cwd(),
    'lib/voice/relationalStack/maia.prosody.config.json'
  )

  const raw = fs.readFileSync(configPath, 'utf-8')
  cachedConfig = JSON.parse(raw) as ProsodyConfigFile

  return cachedConfig
}

/**
 * Get prosodic config for a specific mode.
 */
export function getProsodicConfig(mode: MaiaMode): ProsodicConfig {
  const config = loadMaiaProsodyConfig()
  return config.modes[mode]
}

/**
 * Get the default mode (always REGULATOR per canon).
 */
export function getDefaultMode(): MaiaMode {
  const config = loadMaiaProsodyConfig()
  return config.defaultMode
}

/**
 * Check if a mode transition is allowed.
 */
export function isTransitionAllowed(from: MaiaMode | 'DEFAULT', to: MaiaMode): boolean {
  const config = loadMaiaProsodyConfig()

  // Check forbidden first
  const isForbidden = config.transitions.forbidden.some(
    t => t.from === from && t.to === to
  )
  if (isForbidden) return false

  // Check if explicitly allowed
  const isAllowed = config.transitions.allowed.some(
    t => t.from === from && t.to === to
  )

  return isAllowed
}

/**
 * Check if silence is enabled as a response type.
 */
export function isSilenceEnabled(): boolean {
  const config = loadMaiaProsodyConfig()
  return config.silence.enabled
}

/**
 * Get the default voice embedding identifier.
 */
export function getDefaultVoiceEmbedding(): string {
  const config = loadMaiaProsodyConfig()
  return config.voiceEmbedding.default
}

/**
 * Clear the config cache (useful for testing or hot-reload).
 */
export function clearConfigCache(): void {
  cachedConfig = null
}

// ============================================================================
// ADAPTIVE SCALING
// ============================================================================

// Parameter bounds to prevent MAIA becoming a statue or a chatterbox
const PARAM_BOUNDS = {
  tempoMultiplier: { min: 0.30, max: 1.25 },
  pauseBeforeSpeechMs: { min: 0, max: 5000 },
  silenceToleranceMs: { min: 1000, max: 12000 },
  backchannelProbability: { min: 0, max: 0.35 },
}

// Type-safe blend keys (no footguns)
const BLEND_KEYS = [
  'tempoMultiplier',
  'pauseBeforeSpeechMs',
  'silenceToleranceMs',
  'backchannelProbability',
] as const

type BlendKey = typeof BLEND_KEYS[number]

/**
 * Session-scoped activation smoother state.
 * Each session/connection should have its own instance.
 */
export interface ActivationSmootherState {
  lastActivation: number
  lastTime: number
}

/**
 * Create initial smoother state for a new session.
 */
export function createSmootherState(): ActivationSmootherState {
  return {
    lastActivation: 0,
    lastTime: Date.now(),
  }
}

/**
 * Smooth activation to prevent jitter (pure function, session-scoped).
 * Uses EMA + hysteresis + slew-rate limiting.
 * MAIA responds to trends, not spikes.
 *
 * @param state - Previous smoother state (from session)
 * @param rawActivation - Raw activation value [0..1]
 * @param now - Current timestamp (defaults to Date.now())
 * @returns New smoother state with updated activation
 */
export function smoothActivation(
  state: ActivationSmootherState,
  rawActivation: number,
  now: number = Date.now()
): ActivationSmootherState {
  const config = loadMaiaProsodyConfig()
  const { smoothingWindowMs, maxChangePerSecond, hysteresisThreshold } =
    config.adaptiveScaling.rateLimits

  const dt = Math.max(0.001, (now - state.lastTime) / 1000)
  const target = Math.max(0, Math.min(1, rawActivation))

  // Hysteresis: ignore tiny changes (prevents micro-adjustments)
  if (Math.abs(target - state.lastActivation) < hysteresisThreshold) {
    return { ...state, lastTime: now }
  }

  // Slew-rate limit: max change per second
  const maxStep = maxChangePerSecond * dt
  const stepped = state.lastActivation +
    Math.max(-maxStep, Math.min(maxStep, target - state.lastActivation))

  // EMA smoothing approximated from window
  const alpha = Math.min(1, (dt * 1000) / smoothingWindowMs)
  const smoothed = state.lastActivation + alpha * (stepped - state.lastActivation)

  return {
    lastActivation: smoothed,
    lastTime: now,
  }
}

/**
 * Compute blended prosodic parameters based on current activation scalar.
 * Returns the mode's base config adjusted by activation level.
 *
 * @param mode - Current MAIA mode
 * @param smootherState - Session-scoped smoother state
 * @param rawActivation - Raw activation scalar [0..1] where 0=calm, 1=activated
 * @returns Object with prosodic config and updated smoother state
 */
export function getAdaptiveProsodicConfig(
  mode: MaiaMode,
  smootherState: ActivationSmootherState,
  rawActivation: number
): { config: ProsodicConfig; smootherState: ActivationSmootherState } {
  const config = loadMaiaProsodyConfig()
  const baseConfig = config.modes[mode]
  const scaling = config.adaptiveScaling

  // If adaptive scaling is disabled, return base config unchanged
  if (!scaling.enabled) {
    return { config: baseConfig, smootherState }
  }

  // Smooth activation to prevent jitter (session-scoped)
  const newSmootherState = smoothActivation(smootherState, rawActivation)
  const a = newSmootherState.lastActivation

  // Get blend params, applying mode-specific overrides if present
  const blend = scaling.blend
  const overrides = blend.overrides?.[mode]

  // Type-safe blend param getter
  const getBlendParam = (key: BlendKey): BlendParameter => {
    const base = blend[key]
    const override = overrides?.[key]
    return override ? { ...base, ...override } : base
  }

  const tempoBlend = getBlendParam('tempoMultiplier')
  const pauseBlend = getBlendParam('pauseBeforeSpeechMs')
  const silenceBlend = getBlendParam('silenceToleranceMs')
  const backchannelBlend = getBlendParam('backchannelProbability')

  // Compute blended values
  const tempoMultiplier = clamp(
    applyBlend(baseConfig.tempoMultiplier, tempoBlend.direction, tempoBlend.maxDelta, a),
    PARAM_BOUNDS.tempoMultiplier.min,
    PARAM_BOUNDS.tempoMultiplier.max
  )

  const rawMinPause = Math.round(
    clamp(
      applyBlend(baseConfig.minPauseBeforeSpeechMs, pauseBlend.direction, pauseBlend.maxDelta * 0.5, a),
      PARAM_BOUNDS.pauseBeforeSpeechMs.min,
      PARAM_BOUNDS.pauseBeforeSpeechMs.max
    )
  )

  const rawMaxPause = Math.round(
    clamp(
      applyBlend(baseConfig.maxPauseBeforeSpeechMs, pauseBlend.direction, pauseBlend.maxDelta, a),
      PARAM_BOUNDS.pauseBeforeSpeechMs.min,
      PARAM_BOUNDS.pauseBeforeSpeechMs.max
    )
  )

  // Sanity guard: ensure min ≤ max
  const minPauseBeforeSpeechMs = Math.min(rawMinPause, rawMaxPause)
  const maxPauseBeforeSpeechMs = Math.max(rawMinPause, rawMaxPause)

  const silenceToleranceMs = Math.round(
    clamp(
      applyBlend(baseConfig.silenceToleranceMs, silenceBlend.direction, silenceBlend.maxDelta, a),
      PARAM_BOUNDS.silenceToleranceMs.min,
      PARAM_BOUNDS.silenceToleranceMs.max
    )
  )

  const backchannelProbability = clamp(
    applyBlend(baseConfig.backchannelProbability, backchannelBlend.direction, backchannelBlend.maxDelta, a),
    PARAM_BOUNDS.backchannelProbability.min,
    PARAM_BOUNDS.backchannelProbability.max
  )

  return {
    config: {
      ...baseConfig,
      tempoMultiplier,
      minPauseBeforeSpeechMs,
      maxPauseBeforeSpeechMs,
      silenceToleranceMs,
      backchannelProbability,
    },
    smootherState: newSmootherState,
  }
}

/**
 * Simplified version for cases where you manage state externally.
 * Uses provided smoothed activation directly (no smoothing applied).
 */
export function getAdaptiveProsodicConfigDirect(
  mode: MaiaMode,
  smoothedActivation: number
): ProsodicConfig {
  const dummyState = { lastActivation: smoothedActivation, lastTime: Date.now() }
  const { config } = getAdaptiveProsodicConfig(mode, dummyState, smoothedActivation)
  return config
}

/**
 * Apply a blend delta based on activation and direction.
 * - 'direct': parameter increases as activation increases
 * - 'inverse': parameter decreases as activation increases
 * Direction is explicit; maxDelta should be positive.
 */
function applyBlend(
  base: number,
  direction: 'direct' | 'inverse',
  maxDelta: number,
  activation: number
): number {
  const clamped = Math.max(0, Math.min(1, activation))
  const signedDelta = direction === 'inverse' ? -Math.abs(maxDelta) : Math.abs(maxDelta)
  return base + signedDelta * clamped
}

/**
 * Clamp a value to bounds.
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/**
 * Check if adaptive scaling is enabled.
 */
export function isAdaptiveScalingEnabled(): boolean {
  const config = loadMaiaProsodyConfig()
  return config.adaptiveScaling.enabled
}

/**
 * Get the rate limits for smoothing activation changes.
 */
export function getAdaptiveRateLimits() {
  const config = loadMaiaProsodyConfig()
  return config.adaptiveScaling.rateLimits
}
