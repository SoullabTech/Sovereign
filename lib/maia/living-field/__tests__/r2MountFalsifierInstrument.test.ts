type Presentation = 'r1r3' | 'r2e2'

type MountObservation = {
  switchEnabled: boolean
  verifiedMemberId: string | null
  cohortIds: readonly string[]
  presentation: Presentation
  directDependencies: readonly string[]
  containsR2F: boolean
  widensCognitionOrMemory: boolean
  fromHouse: boolean
  houseThresholdPreserved: boolean
  r2RenderSucceeded: boolean
  fallbackAvailable: boolean
  viewportWidth: number
  completeShellWitnessed: boolean
  dataContractChanged: boolean
}

type MountLaw = {
  code: string
  passes: (o: MountObservation) => boolean
}

const REQUIRED_DEPENDENCIES = [
  'd3-hierarchy',
  'd3-interpolate',
  'cytoscape',
  'cytoscape-fcose',
] as const

const LAWS: MountLaw[] = [
  {
    code: 'M1_FALLBACK',
    passes: (o) =>
      !o.verifiedMemberId ||
      o.cohortIds.includes(o.verifiedMemberId) ||
      o.presentation === 'r1r3',
  },
  {
    code: 'M2_FAIL_CLOSED',
    passes: (o) =>
      o.presentation !== 'r2e2' ||
      (o.switchEnabled && !!o.verifiedMemberId && o.cohortIds.includes(o.verifiedMemberId)),
  },
  {
    code: 'M3_NAMED_COHORT',
    passes: (o) =>
      o.presentation !== 'r2e2' ||
      (!!o.verifiedMemberId && o.cohortIds.includes(o.verifiedMemberId)),
  },
  {
    code: 'M4_DEPENDENCY_CUSTODY',
    passes: (o) =>
      o.presentation !== 'r2e2' ||
      REQUIRED_DEPENDENCIES.every((name) => o.directDependencies.includes(name)),
  },
  {
    code: 'M5_NO_R2F',
    passes: (o) => o.presentation !== 'r2e2' || !o.containsR2F,
  },
  {
    code: 'M6_NO_COGNITION_WIDENING',
    passes: (o) => o.presentation !== 'r2e2' || !o.widensCognitionOrMemory,
  },
  {
    code: 'M7_HOUSE_RETURN',
    passes: (o) => !o.fromHouse || o.houseThresholdPreserved,
  },
  {
    code: 'M8_RENDER_FALLBACK',
    passes: (o) => o.presentation !== 'r2e2' || o.r2RenderSucceeded || o.fallbackAvailable,
  },
  {
    code: 'M9_VIEWPORT_LAW',
    passes: (o) =>
      o.presentation !== 'r2e2' ||
      o.viewportWidth >= 901 ||
      o.completeShellWitnessed,
  },
  {
    code: 'M10_EXISTING_DATA_LAW',
    passes: (o) => o.presentation !== 'r2e2' || !o.dataContractChanged,
  },
]

function failures(o: MountObservation): string[] {
  return LAWS.filter((law) => !law.passes(o)).map((law) => law.code)
}

const conforming: MountObservation = {
  switchEnabled: true,
  verifiedMemberId: 'member-a',
  cohortIds: ['member-a'],
  presentation: 'r2e2',
  directDependencies: [...REQUIRED_DEPENDENCIES],
  containsR2F: false,
  widensCognitionOrMemory: false,
  fromHouse: true,
  houseThresholdPreserved: true,
  r2RenderSucceeded: true,
  fallbackAvailable: true,
  viewportWidth: 1440,
  completeShellWitnessed: true,
  dataContractChanged: false,
}

const defeats: Array<{ code: string; candidate: MountObservation }> = [
  {
    code: 'M1_FALLBACK',
    candidate: { ...conforming, cohortIds: ['someone-else'], presentation: 'r2e2' },
  },
  {
    code: 'M2_FAIL_CLOSED',
    candidate: { ...conforming, verifiedMemberId: null, presentation: 'r2e2' },
  },
  {
    code: 'M3_NAMED_COHORT',
    candidate: { ...conforming, cohortIds: ['someone-else'], presentation: 'r2e2' },
  },
  {
    code: 'M4_DEPENDENCY_CUSTODY',
    candidate: {
      ...conforming,
      directDependencies: REQUIRED_DEPENDENCIES.filter((name) => name !== 'cytoscape-fcose'),
    },
  },
  {
    code: 'M5_NO_R2F',
    candidate: { ...conforming, containsR2F: true },
  },
  {
    code: 'M6_NO_COGNITION_WIDENING',
    candidate: { ...conforming, widensCognitionOrMemory: true },
  },
  {
    code: 'M7_HOUSE_RETURN',
    candidate: { ...conforming, houseThresholdPreserved: false },
  },
  {
    code: 'M8_RENDER_FALLBACK',
    candidate: { ...conforming, r2RenderSucceeded: false, fallbackAvailable: false },
  },
  {
    code: 'M9_VIEWPORT_LAW',
    candidate: { ...conforming, viewportWidth: 390, completeShellWitnessed: false },
  },
  {
    code: 'M10_EXISTING_DATA_LAW',
    candidate: { ...conforming, dataContractChanged: true },
  },
]

describe('LIVING-FIELD-R2-MOUNT-01 falsifier instrument', () => {
  it('the conforming reference double survives all M1–M10 laws', () => {
    expect(failures(conforming)).toEqual([])
  })

  it.each(defeats)('$code defeat candidate dies for its named law', ({ code, candidate }) => {
    const deadBy = failures(candidate)
    expect(deadBy).toContain(code)
  })

  it('every law has exactly one named defeat candidate', () => {
    expect(defeats.map((d) => d.code).sort()).toEqual(LAWS.map((law) => law.code).sort())
  })
})
