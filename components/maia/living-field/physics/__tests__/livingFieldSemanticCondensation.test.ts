import { R2C_RELATIONS } from '../livingFieldRelationResolution'
import {
  buildCondensedPattern,
  buildRelationBundles,
  condensationModeForScale,
  crossWorldRelationCount,
  unfoldBundle,
} from '../livingFieldSemanticCondensation'

describe('Living Field semantic condensation', () => {
  it('moves from whole pattern to bridge to bundle to specifics as magnification rises', () => {
    expect(condensationModeForScale(0.8)).toBe('pattern')
    expect(condensationModeForScale(1)).toBe('bridge')
    expect(condensationModeForScale(1.5)).toBe('bundle')
    expect(condensationModeForScale(1.62)).toBe('specific')
  })

  it('groups only cross-world relations and loses none', () => {
    const bundles = buildRelationBundles()
    const condensedCount = bundles.reduce((sum, bundle) => sum + bundle.relationCount, 0)

    expect(condensedCount).toBe(crossWorldRelationCount())
    expect(new Set(bundles.flatMap((bundle) => bundle.relationIds)).size).toBe(condensedCount)
  })

  it('preserves relation-kind plurality and unresolved tension inside a bridge', () => {
    const bundle = buildRelationBundles().find((item) => item.id === 'fire--earth')
    expect(bundle).toBeDefined()
    expect(bundle?.kinds.length).toBeGreaterThan(1)
    expect(bundle?.kinds).toContain('tension')
    expect(bundle?.unresolved).toBe(true)
    expect(bundle?.kindCounts.tension).toBeGreaterThan(0)
  })

  it('preserves standing plurality instead of averaging authority', () => {
    const bundles = buildRelationBundles()
    const pattern = buildCondensedPattern()

    const sum = bundles.reduce(
      (count, bundle) =>
        count +
        (bundle.standingCounts.prototype ?? 0) +
        (bundle.standingCounts.canonical ?? 0),
      0,
    )

    expect(sum).toBe(pattern.crossWorldRelationCount)
    expect(
      (pattern.standingCounts.prototype ?? 0) +
      (pattern.standingCounts.canonical ?? 0),
    ).toBe(pattern.crossWorldRelationCount)
  })

  it('unfolds every bridge back into exactly the relations that created it', () => {
    for (const bundle of buildRelationBundles()) {
      const unfolded = unfoldBundle(bundle)
      expect(unfolded.map((relation) => relation.id)).toEqual(bundle.relationIds)
      expect(unfolded.every((relation) => R2C_RELATIONS.includes(relation))).toBe(true)
    }
  })

  it('whole-field pattern reports structure without inventing synthesis', () => {
    const pattern = buildCondensedPattern()

    expect(pattern.relationCount).toBe(R2C_RELATIONS.length)
    expect(pattern.crossWorldRelationCount).toBe(crossWorldRelationCount())
    expect(pattern.bridgeCount).toBe(buildRelationBundles().length)
    expect(pattern.unresolvedBridgeCount).toBeGreaterThan(0)
    expect(pattern.kindCounts.tension).toBeGreaterThan(0)
  })
})
