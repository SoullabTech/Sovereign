/**
 * Pallas, Juno and Vesta are computed from Keplerian elements whose reference
 * mean anomaly was never verified; the code's own note says positions "will be
 * approximate (potentially 20-60° off)". A chart position that can be tens of
 * degrees wrong is not shown to members as a position.
 *
 * Set to true only after the elements are sourced (JPL Small-Body Database)
 * and checked against an independent ephemeris at several dates.
 */
export const INCLUDE_UNVERIFIED_ASTEROIDS = false;

/** Bodies withheld while INCLUDE_UNVERIFIED_ASTEROIDS is false. */
export const UNVERIFIED_ASTEROID_KEYS = ['pallas', 'juno', 'vesta'] as const;
