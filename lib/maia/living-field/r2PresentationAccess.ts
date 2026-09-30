export type LivingFieldPresentation = 'r1r3' | 'r2e2'

type R2PresentationEnv = {
  LIVING_FIELD_R2_ENABLED?: string
  LIVING_FIELD_R2_MEMBER_IDS?: string
}

function enabled(value: string | undefined): boolean {
  if (!value) return false
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase())
}

function cohortIds(raw: string | undefined): ReadonlySet<string> {
  return new Set(
    (raw ?? '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean),
  )
}

export function livingFieldR2PresentationForMember(
  memberId: string | null | undefined,
  env: R2PresentationEnv = {
    LIVING_FIELD_R2_ENABLED: process.env.LIVING_FIELD_R2_ENABLED,
    LIVING_FIELD_R2_MEMBER_IDS: process.env.LIVING_FIELD_R2_MEMBER_IDS,
  },
): LivingFieldPresentation {
  if (!memberId || !enabled(env.LIVING_FIELD_R2_ENABLED)) return 'r1r3'
  return cohortIds(env.LIVING_FIELD_R2_MEMBER_IDS).has(memberId) ? 'r2e2' : 'r1r3'
}
