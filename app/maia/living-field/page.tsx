'use client'

// Living Field entry. Identity in this app lives in localStorage (beta_user /
// memberId), resolved client-side via getValidMemberId() and carried to the API
// as x-member-id by apiFetch. A server component cannot read localStorage, so this
// page must resolve identity on the client — matching every other MAIA surface.

import { useEffect, useState } from 'react'
import { apiFetch, getValidMemberId } from '@/lib/http/apiBase'
import { PersonalLivingFieldDashboard } from '@/components/maia/living-field/PersonalLivingFieldDashboard'
import type {
  LivingField,
  PersonalSpiral,
  PersonalState,
  SpiralState,
} from '@/components/maia/living-field/types'

interface LivingFieldData {
  fields: LivingField[]
  keep_denominator?: number
  spiral_state: SpiralState | null
  active_spirals: PersonalSpiral[]
  recent_states: PersonalState[]
}

export default function LivingFieldPage() {
  const [memberId, setMemberId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [data, setData] = useState<LivingFieldData | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const id = getValidMemberId()
    setMemberId(id)
    setAuthChecked(true)
    if (!id) {
      setLoading(false)
      return
    }
    apiFetch('/api/maia/living-field')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setData(d)
        else setFailed(true)
      })
      .catch(() => setFailed(true))
      .finally(() => setLoading(false))
  }, [])

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-600 text-sm font-light">Opening your Living Field…</p>
      </div>
    )
  }

  if (!memberId) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Sign in to enter your Living Field.</p>
      </div>
    )
  }

  if (failed || !data) {
    return (
      <div className="min-h-screen bg-stone-950 flex items-center justify-center">
        <p className="text-stone-400 text-sm">Something went quiet. Try returning in a moment.</p>
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
