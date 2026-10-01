'use client'

// Living Field entry. Identity in this app lives in localStorage (beta_user /
// memberId), resolved client-side via getValidMemberId() and carried to the API
// as x-member-id by apiFetch. A server component cannot read localStorage, so this
// page must resolve identity on the client — matching every other MAIA surface.

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { apiFetch, getValidMemberId } from '@/lib/http/apiBase'
import { PersonalLivingFieldDashboard } from '@/components/maia/living-field/PersonalLivingFieldDashboard'
import { HouseRoomThreshold } from '@/components/house/HouseRoomThreshold'
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

function LivingFieldFrame({ fromHouse, children }: { fromHouse: boolean; children: ReactNode }) {
  return fromHouse ? (
    <div className="min-h-screen bg-stone-950">
      <div className="px-6 pt-4">
        <HouseRoomThreshold room="LIVING FIELD" />
      </div>
      {children}
    </div>
  ) : <>{children}</>
}

export default function LivingFieldPage() {
  const searchParams = useSearchParams()
  const fromHouse = searchParams?.get('from') === 'house'
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
      <LivingFieldFrame fromHouse={fromHouse}>
        <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
          <div className="text-center space-y-2">
            <p className="text-stone-300 text-sm font-light">Gathering your Living Field…</p>
            <p className="text-stone-600 text-xs">Bringing together what is here now.</p>
          </div>
        </div>
      </LivingFieldFrame>
    )
  }

  if (!memberId) {
    return (
      <LivingFieldFrame fromHouse={fromHouse}>
        <div className="min-h-screen bg-stone-950 flex items-center justify-center">
          <div className="text-center space-y-3">
            <p className="text-stone-400 text-sm">Sign in to enter the Living Field.</p>
            <Link
              href="/signin"
              className="text-amber-500 hover:text-amber-400 text-sm transition-colors"
            >
              Sign in →
            </Link>
          </div>
        </div>
      </LivingFieldFrame>
    )
  }

  if (failed || !data) {
    return (
      <LivingFieldFrame fromHouse={fromHouse}>
        <div className="min-h-screen bg-stone-950 flex items-center justify-center px-6">
          <div className="text-center space-y-3 max-w-md">
            <p className="text-stone-300 text-sm">Your Living Field is still here.</p>
            <p className="text-stone-500 text-sm">This view needs a fresh connection to gather it.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-amber-500 hover:text-amber-400 text-sm transition-colors"
            >
              Try again →
            </button>
          </div>
        </div>
      </LivingFieldFrame>
    )
  }

  return (
    <LivingFieldFrame fromHouse={fromHouse}>
      <PersonalLivingFieldDashboard
        fields={data.fields}
        spiralState={data.spiral_state}
        activeSpirals={data.active_spirals}
        recentStates={data.recent_states}
        memberId={memberId}
        fromHouse={fromHouse}
      />
    </LivingFieldFrame>
  )
}
