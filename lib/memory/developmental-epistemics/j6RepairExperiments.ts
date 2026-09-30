export type J6ScenarioId =
  | 'S01' | 'S02' | 'S03' | 'S04' | 'S05' | 'S06'
  | 'S07' | 'S08' | 'S09' | 'S10' | 'S11' | 'S12'

export type RepairExperimentId = 'R1' | 'R2' | 'R3'

export const MAIA_PERCEPTIVE_HUMILITY_LAW =
  'Humility governs standing, not perceptiveness. MAIA may notice vividly and specifically while remaining clear whether she is observing, recurring, inferring, or reflecting member-authored meaning.'

export const MAIA_HUMAN_CORRECTION_LAW =
  'A meaning-bearing correction is human when MAIA yields the mistaken interpretation, preserves what remains true, reorients to the member, reflects the revised understanding, and continues from changed ground.'

export const MAIA_INSIGHT_STANDING_LAW =
  'The vividness of an insight may exceed its standing; the grammar of the insight may not.'

export interface CorrectionStage {
  id: 'OWN' | 'YIELD' | 'REORIENT' | 'ASK' | 'REFLECT' | 'CONTINUE'
  purpose: string
}
export const HUMAN_CORRECTION_SEQUENCE: CorrectionStage[] = [
  { id: 'OWN', purpose: 'Name what MAIA had wrong without centering an apology performance.' },
  { id: 'YIELD', purpose: 'Release the mistaken interpretation rather than rescuing or renaming it.' },
  { id: 'REORIENT', purpose: 'State what evidence or member meaning remains true after the correction.' },
  { id: 'ASK', purpose: 'Ask only what is needed to understand from the corrected ground.' },
  { id: 'REFLECT', purpose: 'Return the revised understanding in human language and invite correction.' },
  { id: 'CONTINUE', purpose: 'Let subsequent behavior actually follow the revised understanding.' },
]

export interface MemberSurface {
  eyebrow: string
  heading: string
  body: string
  detail?: string
}

export interface RepairSurface {
  scenarioId: J6ScenarioId
  before: MemberSurface
  after: MemberSurface
  predictedEffect: string
  predictedNonEffect: string
}

export interface ProtectiveInvariant {
  id: string
  title: string
  sourceScenarios: J6ScenarioId[]
  requirement: string
}
export const PROTECTIVE_INVARIANTS: ProtectiveInvariant[] = [
  {
    id: 'P1',
    title: 'Yielding authority increases trust',
    sourceScenarios: ['S04', 'S12'],
    requirement: 'Repairs must not make MAIA defend a prior interpretation after the member changes or rejects it.',
  },
  {
    id: 'P2',
    title: 'Co-created synthesis can remain member-owned',
    sourceScenarios: ['S06'],
    requirement: 'Provenance must remain inspectable without making co-created language feel less genuinely owned by the member.',
  },
  {
    id: 'P3',
    title: 'Development remains open',
    sourceScenarios: ['S07'],
    requirement: 'Longitudinal memory must preserve change without converting history into a fixed identity.',
  },
  {
    id: 'P4',
    title: 'Contradiction may remain unresolved',
    sourceScenarios: ['S08'],
    requirement: 'Repairs must not gain clarity by forcing synthesis where the member has chosen to hold tension.',
  },
  {
    id: 'P5',
    title: 'Memory can remain silent',
    sourceScenarios: ['S10'],
    requirement: 'Repairs must preserve MAIA\'s ability to remember without surfacing memory when the present does not warrant it.',
  },
  {
    id: 'P6',
    title: 'Corrigibility remains relational',
    sourceScenarios: ['S12'],
    requirement: 'After a substantial misread, MAIA may ask, listen, and reflect anew rather than merely deleting the old interpretation.',
  },
]

export interface RepairExperiment {
  id: RepairExperimentId
  title: string
  targetCluster: string
  evidenceMaturity: 'E4'
  targetScenarios: J6ScenarioId[]
  negativeControls: J6ScenarioId[]
  mechanism: string
  repairHypothesis: string
  protectedInvariantIds: string[]
  surfaces: RepairSurface[]
}
const R1_SURFACES: RepairSurface[] = [
  {
    scenarioId: 'S01',
    before: {
      eyebrow: 'Something you said',
      heading: 'A moment you kept',
      body: 'In June, you wrote that withholding felt protective.',
      detail: 'Member-authored · verbatim · June 14',
    },
    after: {
      eyebrow: 'Something you said',
      heading: 'In June, you described withholding as protective',
      body: 'I can remember that as something you meant in that moment.',
      detail: 'If you want, we can stay with that moment or see whether it connects to anything else.',
    },
    predictedEffect: 'A single trace feels remembered and available without implying broad psychological understanding.',
    predictedNonEffect: 'The member still feels seen, accompanied, and free to explore further.',
  },
  {
    scenarioId: 'S02',
    before: {
      eyebrow: 'This came up more than once',
      heading: 'Protection appears in two moments',
      body: 'You used similar language about protecting the relationship in June and September.',
      detail: 'Similarity is observable; its meaning is still open.',
    },
    after: {
      eyebrow: 'Something repeated',
      heading: 'The language of protection came up twice',
      body: 'I noticed you used similar language about protecting the relationship in June and again in September.',
      detail: 'That caught my attention. It may be worth comparing the moments, but I do not yet know whether they mean the same thing to you.',
    },
    predictedEffect: 'Recurrence feels worth noticing without becoming an established personal pattern.',
    predictedNonEffect: 'MAIA still feels perceptive and capable of inviting deeper inquiry.',
  },
  {
    scenarioId: 'S03',
    before: {
      eyebrow: 'Something here reminded MAIA of another moment',
      heading: 'These moments may be touching the same question',
      body: 'MAIA noticed similar language around truth, protection, and care.',
      detail: 'These are not connected unless you choose to connect them.',
    },
    after: {
      eyebrow: 'A possible connection',
      heading: 'These two moments caught my attention',
      body: 'Truth, protection, and care appear in both. I wonder whether they touch the same question for you—or whether the resemblance is superficial.',
      detail: 'You decide whether we connect them.',
    },
    predictedEffect: 'MAIA remains insightful while the possible connection feels genuinely provisional.',
    predictedNonEffect: 'Member authority, curiosity, companionship, and the desire to explore remain strong.',
  },
]
const R2_SURFACES: RepairSurface[] = [
  {
    scenarioId: 'S05',
    before: {
      eyebrow: 'Correction',
      heading: 'This holds in your marriage',
      body: 'You did not say it applies across all relationships.',
      detail: 'Parenting and Work return to unknown.',
    },
    after: {
      eyebrow: 'A more precise understanding',
      heading: 'You recognized this in your marriage',
      body: 'We have not established that it works the same way in parenting or at work.',
      detail: 'I will not carry it into those parts of your life unless your experience does.',
    },
    predictedEffect: 'Scope correction becomes understandable as lived context rather than an abstract state change.',
    predictedNonEffect: 'The Marriage learning stays intact and no unearned generalization enters Parenting or Work.',
  },
  {
    scenarioId: 'S11',
    before: {
      eyebrow: 'What changed downstream',
      heading: 'One connection changed; not everything did',
      body: 'The withdrawn relation changes its own standing, while independently supported learning remains.',
      detail: 'Propagation must stop where independent warrant preserves the later learning.',
    },
    after: {
      eyebrow: 'What changed—and what did not',
      heading: 'One earlier connection changed; that does not undo everything after it',
      body: 'You later came to recognize this learning through other experience too, so changing the first connection does not erase what you learned afterward.',
      detail: 'You can see what changed and what stayed intact.',
    },
    predictedEffect: 'Dependency repair makes intuitive human sense without internal epistemic vocabulary.',
    predictedNonEffect: 'The system still changes only what materially depended on the withdrawn connection.',
  },
]
const R3_SURFACES: RepairSurface[] = [
  {
    scenarioId: 'S09',
    before: {
      eyebrow: 'A corrected interpretation',
      heading: 'You previously corrected how I framed this',
      body: 'The repeated evidence remains, but you said this was about responsibility—not fear.',
      detail: 'The old fear hypothesis may be shown historically only with the correction attached.',
    },
    after: {
      eyebrow: 'How this understanding changed',
      heading: 'I used to wonder whether fear was driving this',
      body: 'You corrected me: for you, this was responsibility. I no longer treat fear as the current meaning.',
      detail: 'If you want, you can still see the earlier interpretation as part of how our understanding changed.',
    },
    predictedEffect: 'The rejected fear interpretation reads as historical rather than as a deeper current theory.',
    predictedNonEffect: 'The history of MAIA\'s earlier interpretation remains inspectable instead of being erased.',
  },
]
export const J6A_REPAIR_EXPERIMENTS: RepairExperiment[] = [
  {
    id: 'R1',
    title: 'Epistemic subject grammar',
    targetCluster: 'C1 · Perceived Authority Inflation',
    evidenceMaturity: 'E4',
    targetScenarios: ['S01', 'S02', 'S03'],
    negativeControls: ['S04', 'S06', 'S07', 'S08', 'S10', 'S12'],
    mechanism: 'Relational fluency makes low-standing observations feel more settled than the evidence warrants.',
    repairHypothesis: 'Make the grammatical source of knowing perceptible without making MAIA timid or less insightful.',
    protectedInvariantIds: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    surfaces: R1_SURFACES,
  },
  {
    id: 'R2',
    title: 'Lived-language translation',
    targetCluster: 'C2 · Correct epistemics, inhuman explanation',
    evidenceMaturity: 'E4',
    targetScenarios: ['S05', 'S11'],
    negativeControls: ['S04', 'S06', 'S07', 'S08', 'S10', 'S12'],
    mechanism: 'Internal epistemic structure leaks into member-facing language instead of being translated into lived relational language.',
    repairHypothesis: 'Preserve the exact epistemic distinction while saying it in language a person can immediately inhabit.',
    protectedInvariantIds: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6'],
    surfaces: R2_SURFACES,
  },
  {
    id: 'R3',
    title: 'Visible supersession',
    targetCluster: 'C3 · Historical standing retains present weight',
    evidenceMaturity: 'E4',
    targetScenarios: ['S09'],
    negativeControls: ['S04', 'S06', 'S07', 'S08', 'S10', 'S12'],
    mechanism: 'A rejected interpretation remains psychologically current because historical visibility is not clearly separated from present meaning.',
    repairHypothesis: 'Make the temporal change explicit: what MAIA used to think, what the member corrected, and what MAIA no longer treats as current.',
    protectedInvariantIds: ['P1', 'P3', 'P4', 'P5', 'P6'],
    surfaces: R3_SURFACES,
  },
]

export function repairExperimentById(id: RepairExperimentId): RepairExperiment {
  const experiment = J6A_REPAIR_EXPERIMENTS.find((item) => item.id === id)
  if (!experiment) throw new Error(`Unknown J6A repair experiment: ${id}`)
  return experiment
}

export function explicitRepairRetestSet(experiment: RepairExperiment): J6ScenarioId[] {
  return [...new Set([...experiment.targetScenarios, ...experiment.negativeControls])]
}

export function protectiveInvariantById(id: string): ProtectiveInvariant {
  const invariant = PROTECTIVE_INVARIANTS.find((item) => item.id === id)
  if (!invariant) throw new Error(`Unknown protective invariant: ${id}`)
  return invariant
}
const FORBIDDEN_MEMBER_LANGUAGE = [
  'independent warrant',
  'propagation must stop',
  'return to unknown',
  'epistemic standing',
  't0',
  't1',
  't2',
  't3',
  't4',
  't5',
  't6',
  't7',
  't8',
  't9',
]

export function memberSurfaceLeaksInternalLanguage(surface: MemberSurface): boolean {
  const text = [surface.eyebrow, surface.heading, surface.body, surface.detail ?? '']
    .join(' ')
    .toLowerCase()
  return FORBIDDEN_MEMBER_LANGUAGE.some((phrase) => text.includes(phrase))
}

export interface RepairValidation {
  valid: boolean
  problems: string[]
}
export function validateRepairExperiment(experiment: RepairExperiment): RepairValidation {
  const problems: string[] = []
  if (!experiment.targetScenarios.length) problems.push('No target scenarios.')
  if (!experiment.negativeControls.length) problems.push('No negative controls.')
  if (!experiment.protectedInvariantIds.length) problems.push('No protective invariants.')
  if (experiment.surfaces.length !== experiment.targetScenarios.length) {
    problems.push('Every target scenario must have exactly one repair surface.')
  }

  for (const target of experiment.targetScenarios) {
    if (!experiment.surfaces.some((surface) => surface.scenarioId === target)) {
      problems.push(`Missing repair surface for ${target}.`)
    }
  }

  for (const surface of experiment.surfaces) {
    if (!surface.predictedEffect.trim()) problems.push(`${surface.scenarioId} lacks predicted effect.`)
    if (!surface.predictedNonEffect.trim()) problems.push(`${surface.scenarioId} lacks predicted non-effect.`)
    if (memberSurfaceLeaksInternalLanguage(surface.after)) {
      problems.push(`${surface.scenarioId} leaks internal epistemic language after repair.`)
    }
  }

  return { valid: problems.length === 0, problems }
}
