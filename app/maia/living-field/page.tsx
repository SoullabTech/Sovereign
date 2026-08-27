'use client'

// Living Field entry. Identity in this app lives in localStorage (beta_user /
// memberId), resolved client-side via getValidMemberId() and carried to the API
// as x-member-id by apiFetch. A server component cannot read localStorage, so this
// page must resolve identity on the client — matching every other MAIA surface.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { apiFetch, getValidMemberId } from '@/lib/http/apiBase'
import { ReturnToMaia } from '@/components/navigation/ReturnToMaia'
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

/**
 * The room before the room.
 *
 * MLX-06 Unit 6A. This page returns early three times — loading, signed out,
 * and load-failed — and the dashboard that carries the way out renders in none
 * of them. A member whose Living Field could not be read met a dead end whose
 * own copy told them to "try returning" while offering nothing to return with.
 * The source-shape return guard could not see it: the affordance IS in the
 * page's import closure, just not in the branch the member met.
 *
 * So the way out lives in the antechamber too. Same component, same
 * destination, same accessible name as the dashboard's — a member should not
 * have to notice which branch they landed in.
 */
function Antechamber({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-950">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <ReturnToMaia className="text-stone-500 hover:text-stone-300 text-sm" />
      </div>
      <div className="flex items-center justify-center px-4 pb-24">{children}</div>
    </div>
  )
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
      <Antechamber>
        <p className="text-stone-600 text-sm font-light">Opening your Living Field…</p>
      </Antechamber>
    )
  }

  if (!memberId) {
    return (
      <Antechamber>
        <div className="text-center space-y-3">
          <p className="text-stone-400 text-sm">Sign in to enter your Living Field.</p>
          <Link
            href="/signin"
            className="text-amber-500 hover:text-amber-400 text-sm transition-colors"
          >
            Sign in →
          </Link>
        </div>
      </Antechamber>
    )
  }

  if (failed || !data) {
    return (
      <Antechamber>
        <p className="text-stone-400 text-sm">Something went quiet. Try returning in a moment.</p>
      </Antechamber>
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
