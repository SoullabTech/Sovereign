import { cookies, headers } from 'next/headers'
import { PersonalLivingFieldDashboard } from '@/components/maia/living-field/PersonalLivingFieldDashboard'

export const dynamic = 'force-dynamic'

async function getLivingFieldData(memberId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/maia/living-field`, {
    headers: { 'x-member-id': memberId },
    cache: 'no-store',
  })
  if (!res.ok) return null
  return res.json()
}

export default async function LivingFieldPage() {
  const headersList = await headers()
  const memberId =
    headersList.get('x-member-id') ||
    (await cookies()).get('member_id')?.value ||
    null

  if (!memberId) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400">Sign in to enter your Living Field.</p>
      </div>
    )
  }

  const data = await getLivingFieldData(memberId)

  if (!data) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400">Something went quiet. Try returning in a moment.</p>
      </div>
    )
  }

  return (
    <PersonalLivingFieldDashboard
      fields={data.fields}
      spiralState={data.spiral_state}
      activeSpirals={data.active_spirals}
      recentStates={data.recent_states}
      memberId={memberId}
    />
  )
}
