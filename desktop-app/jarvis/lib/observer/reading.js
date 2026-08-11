'use strict';
/**
 * JARVIS O-1 Observer — Reading primitives.
 *
 * Every datum Observer displays is a Reading, never a bare value. A bare value
 * cannot say when it was seen, who produced it, or that it is missing — and an
 * Observer that cannot say "I don't know" will eventually say something false.
 *
 * Epistemic classes (source map §6):
 *   OBSERVED    read directly from an authoritative producer
 *   DERIVED     computed from observed values; carries its inputs
 *   INFERRED    a warning Observer raises; labelled as inference, not fact
 *   UNAVAILABLE producer failed; carries the reason
 *   UNKNOWN     never observed in this cycle (distinct from failed)
 *
 * The distinction UNAVAILABLE vs UNKNOWN is load-bearing: "production is
 * unhealthy" and "Observer cannot determine production health" are materially
 * different conditions and must never collapse into one another.
 */

const CLASS = Object.freeze({
  OBSERVED: 'OBSERVED',
  DERIVED: 'DERIVED',
  INFERRED: 'INFERRED',
  UNAVAILABLE: 'UNAVAILABLE',
  UNKNOWN: 'UNKNOWN',
});

/** Freshness states a family may be in. */
const FRESHNESS = Object.freeze({
  LIVE: 'live',
  STALE: 'stale',
  UNAVAILABLE: 'unavailable',
  UNKNOWN: 'unknown',
});

const isoNow = () => new Date().toISOString();

/**
 * A successful read from an authoritative producer.
 * `source` must name the actual producer, not the family.
 */
function observed(value, source, observedAt = isoNow()) {
  return Object.freeze({
    klass: CLASS.OBSERVED,
    value,
    source,
    observed_at: observedAt,
    error: null,
  });
}

/**
 * A value computed from other Readings. Inputs are retained so the founder can
 * see what a derived number was built from — a derived value whose inputs are
 * not both OBSERVED is not trustworthy and says so.
 */
function derived(value, source, inputs = [], observedAt = isoNow()) {
  const inputsOk = inputs.every((r) => r && r.klass === CLASS.OBSERVED);
  if (!inputsOk) {
    return Object.freeze({
      klass: CLASS.UNKNOWN,
      value: null,
      source,
      observed_at: observedAt,
      error: 'derivation inputs not all OBSERVED',
      inputs: inputs.map(summarize),
    });
  }
  return Object.freeze({
    klass: CLASS.DERIVED,
    value,
    source,
    observed_at: observedAt,
    error: null,
    inputs: inputs.map(summarize),
  });
}

/** A warning Observer raises. Explicitly an inference, never presented as fact. */
function inferred(value, source, basis, observedAt = isoNow()) {
  return Object.freeze({
    klass: CLASS.INFERRED,
    value,
    source,
    observed_at: observedAt,
    error: null,
    basis: String(basis),
  });
}

/**
 * The producer was reached for and failed. This is NOT an empty result —
 * callers must never render it as zero, none, clear, or healthy.
 */
function unavailable(source, reason, observedAt = isoNow()) {
  return Object.freeze({
    klass: CLASS.UNAVAILABLE,
    value: null,
    source,
    observed_at: observedAt,
    error: String(reason && reason.message ? reason.message : reason),
  });
}

/** Not attempted, or no reading has ever been taken. Distinct from failure. */
function unknown(source, reason = 'not observed') {
  return Object.freeze({
    klass: CLASS.UNKNOWN,
    value: null,
    source,
    observed_at: null,
    error: String(reason),
  });
}

function summarize(r) {
  if (!r) return { klass: CLASS.UNKNOWN, source: null };
  return { klass: r.klass, source: r.source, observed_at: r.observed_at };
}

/** True only for a Reading that actually carries an authoritative value. */
const hasValue = (r) => Boolean(r) && (r.klass === CLASS.OBSERVED || r.klass === CLASS.DERIVED);

/**
 * Freshness for a Reading given a TTL. A successful read older than its TTL is
 * STALE, never silently LIVE — "one successful refresh makes everything current"
 * is the failure this prevents.
 */
function freshness(reading, ttlMs, now = Date.now()) {
  if (!reading) return FRESHNESS.UNKNOWN;
  if (reading.klass === CLASS.UNAVAILABLE) return FRESHNESS.UNAVAILABLE;
  if (reading.klass === CLASS.UNKNOWN || !reading.observed_at) return FRESHNESS.UNKNOWN;
  const age = now - new Date(reading.observed_at).getTime();
  return age > ttlMs ? FRESHNESS.STALE : FRESHNESS.LIVE;
}

const ageMs = (reading, now = Date.now()) =>
  reading && reading.observed_at ? now - new Date(reading.observed_at).getTime() : null;

/**
 * Merge a fresh attempt with the previous cycle's reading.
 *
 * Retains three distinguishable conditions rather than collapsing them:
 *   - a current value                 → the new OBSERVED reading
 *   - last known value + source down  → UNAVAILABLE carrying `last_known`
 *   - never observed                  → UNKNOWN
 *
 * The retained `last_known` is explicitly non-authoritative: it never changes
 * the reading's class to OBSERVED and never resets observed_at.
 */
function carryForward(fresh, previous) {
  if (hasValue(fresh)) return fresh;
  if (fresh && fresh.klass === CLASS.UNAVAILABLE && previous && hasValue(previous)) {
    return Object.freeze({
      ...fresh,
      last_known: {
        value: previous.value,
        observed_at: previous.observed_at,
        authoritative: false,
      },
    });
  }
  return fresh;
}

module.exports = {
  CLASS,
  FRESHNESS,
  observed,
  derived,
  inferred,
  unavailable,
  unknown,
  hasValue,
  freshness,
  ageMs,
  carryForward,
  isoNow,
};
