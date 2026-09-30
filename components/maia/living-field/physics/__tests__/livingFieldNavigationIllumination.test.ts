import { buildIlluminationModel } from '../livingFieldIllumination'
import { navigationPlanForFieldKey } from '../livingFieldNavigation'

describe('Living Field navigation + illumination', () => {
  it('resolves Calling through its containing Perspective and Identity worlds', () => {
    const plan = navigationPlanForFieldKey('calling')

    expect(plan).toEqual({
      targetKey: 'calling',
      rootPhysicsNodeId: 'perspective',
      recursivePathKeys: ['air-perspective', 'identity'],
      leafKey: 'calling',
    })
  })

  it('opens Grief through Relationship rather than detaching it from context', () => {
    const plan = navigationPlanForFieldKey('grief')

    expect(plan).toEqual({
      targetKey: 'grief',
      rootPhysicsNodeId: 'relationship',
      recursivePathKeys: ['water-relationship', 'grief'],
      leafKey: null,
    })
  })

  it('does not invent spatial navigation where no rendered path exists', () => {
    expect(navigationPlanForFieldKey('longing')).toBeNull()
  })
  it('illuminates Calling from governed hierarchy and relation data', () => {
    const model = buildIlluminationModel('calling')
    expect(model).not.toBeNull()
    expect(model?.label).toBe('Calling')
    expect(model?.element?.id).toBe('air')
    // R2D3 (0d6fa5de) renamed lineage -> contextPath and declared it prototype
    // standing: the path orients, it does not claim ancestry.
    expect(model?.contextPath.map((node) => node.key)).toEqual([
      'root',
      'air',
      'air-perspective',
      'identity',
      'calling',
    ])
    expect(model?.relations.length).toBeGreaterThan(0)
    expect(model?.spatiallyNavigable).toBe(true)
    expect(model?.sourceStanding).toBe('prototype-unbound')
    expect(model?.contextPathStanding).toBe('prototype')
    expect(model?.lineageStanding).toBe('unbound')
  })

  it('keeps Grief children and its actual relations distinct', () => {
    const model = buildIlluminationModel('grief')
    expect(model?.children.map((node) => node.key)).toEqual([
      'continuing-relation',
      'remembrance',
      'ritual',
    ])
    expect(model?.relations.map((relation) => relation.otherKey)).toEqual(
      expect.arrayContaining(['water-relationship', 'continuing-relation']),
    )
  })
})
