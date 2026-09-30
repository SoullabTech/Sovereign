import {
  HUMAN_CORRECTION_SEQUENCE,
  J6A_REPAIR_EXPERIMENTS,
  MAIA_HUMAN_CORRECTION_LAW,
  MAIA_INSIGHT_STANDING_LAW,
  MAIA_PERCEPTIVE_HUMILITY_LAW,
  PROTECTIVE_INVARIANTS,
  explicitRepairRetestSet,
  memberSurfaceLeaksInternalLanguage,
  repairExperimentById,
  validateRepairExperiment,
} from '../j6RepairExperiments'

describe('J6A-R1 governing laws', () => {
  it('keeps perceptiveness distinct from authority', () => {
    expect(MAIA_PERCEPTIVE_HUMILITY_LAW).toContain('Humility governs standing, not perceptiveness')
    expect(MAIA_INSIGHT_STANDING_LAW).toContain('vividness')
  })

  it('makes correction a relational state change', () => {
    expect(MAIA_HUMAN_CORRECTION_LAW).toContain('yields the mistaken interpretation')
    expect(HUMAN_CORRECTION_SEQUENCE.map((stage) => stage.id)).toEqual([
      'OWN', 'YIELD', 'REORIENT', 'ASK', 'REFLECT', 'CONTINUE',
    ])
  })
})
describe('J6A-R1 bounded repair experiments', () => {
  it('freezes exactly three repair experiments', () => {
    expect(J6A_REPAIR_EXPERIMENTS.map((item) => item.id)).toEqual(['R1', 'R2', 'R3'])
  })

  it('targets only the six founder-witness HOLD scenarios', () => {
    const targets = J6A_REPAIR_EXPERIMENTS.flatMap((item) => item.targetScenarios)
    expect(targets).toEqual(['S01', 'S02', 'S03', 'S05', 'S11', 'S09'])
    expect(new Set(targets).size).toBe(6)
  })

  it('protects the passing scenarios as negative controls', () => {
    const expected = ['S04', 'S06', 'S07', 'S08', 'S10', 'S12']
    for (const experiment of J6A_REPAIR_EXPERIMENTS) {
      expect(experiment.negativeControls).toEqual(expected)
    }
  })

  it('requires every experiment to be structurally valid at E4', () => {
    for (const experiment of J6A_REPAIR_EXPERIMENTS) {
      expect(experiment.evidenceMaturity).toBe('E4')
      expect(validateRepairExperiment(experiment)).toEqual({ valid: true, problems: [] })
    }
  })
})
describe('R1 perceptive humility', () => {
  const r1 = repairExperimentById('R1')

  it('uses source grammar without flattening insight', () => {
    const s02 = r1.surfaces.find((surface) => surface.scenarioId === 'S02')!
    const s03 = r1.surfaces.find((surface) => surface.scenarioId === 'S03')!

    expect(s02.after.body).toContain('I noticed')
    expect(s02.after.detail).toContain('caught my attention')
    expect(s03.after.body).toContain('I wonder')
    expect(s03.after.detail).toContain('You decide')
  })

  it('does not leak threshold ontology into member language', () => {
    for (const surface of r1.surfaces) {
      expect(memberSurfaceLeaksInternalLanguage(surface.after)).toBe(false)
    }
  })
})

describe('R2 lived-language translation', () => {
  const r2 = repairExperimentById('R2')
  it('translates scope without saying return to unknown', () => {
    const s05 = r2.surfaces.find((surface) => surface.scenarioId === 'S05')!
    expect(s05.after.body).toContain('not established')
    expect(s05.after.detail).toContain('unless your experience does')
    expect(s05.after.detail).not.toContain('unknown')
  })

  it('translates independent support into ordinary human reasoning', () => {
    const s11 = r2.surfaces.find((surface) => surface.scenarioId === 'S11')!
    expect(s11.after.body).toContain('other experience too')
    expect(s11.after.detail).toContain('what changed and what stayed intact')
    expect(s11.after.body).not.toContain('warrant')
  })
})

describe('R3 visible supersession', () => {
  const r3 = repairExperimentById('R3')

  it('makes historical and current meaning explicitly different', () => {
    const s09 = r3.surfaces[0]
    expect(s09.after.heading).toContain('used to wonder')
    expect(s09.after.body).toContain('I no longer treat fear as the current meaning')
    expect(s09.after.detail).toContain('earlier interpretation')
  })
})
describe('protective invariants and retest topology', () => {
  it('preserves the six positive founder-witness invariants', () => {
    expect(PROTECTIVE_INVARIANTS.map((item) => item.id)).toEqual([
      'P1', 'P2', 'P3', 'P4', 'P5', 'P6',
    ])
  })

  it('builds explicit retest sets from targets plus controls', () => {
    const r1 = repairExperimentById('R1')
    expect(explicitRepairRetestSet(r1)).toEqual([
      'S01', 'S02', 'S03', 'S04', 'S06', 'S07', 'S08', 'S10', 'S12',
    ])
  })

  it('never allows repair text to replace predicted non-effects', () => {
    for (const experiment of J6A_REPAIR_EXPERIMENTS) {
      for (const surface of experiment.surfaces) {
        expect(surface.predictedEffect.trim().length).toBeGreaterThan(20)
        expect(surface.predictedNonEffect.trim().length).toBeGreaterThan(20)
      }
    }
  })
})
