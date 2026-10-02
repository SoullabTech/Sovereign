'use client'

// Living Field entry. Runtime identity is server-verified before the page
// resolves a member. Browser storage is only a client belief; /api/auth/whoami
// delegates to the same session-backed authority used by MAIA and Writer's Studio.
// This keeps web and iOS/Capacitor on one identity law without destructive healing.

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { apiFetch } from '@/lib/http/apiBase'
import { verifyServerIdentity } from '@/lib/auth/verifyServerIdentity'
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

function LivingFieldUnavailable({ fromHouse }: { fromHouse: boolean }) {
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

export default function LivingFieldPage() {
  const searchParams = useSearchParams()
  const fromHouse = searchParams?.get('from') === 'house'
  const [memberId, setMemberId] = useState<string | null>(null)
  const [authChecked, setAuthChecked] = useState(false)
  const [data, setData] = useState<LivingFieldData | null>(null)
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [identityUnavailable, setIdentityUnavailable] = useState(false)

  useEffect(() => {
    let cancelled = false

    const load = async () => {
      const identity = await verifyServerIdentity()
      if (cancelled) return

      setAuthChecked(true)

      if (identity.parity === 'unknown') {
        setIdentityUnavailable(true)
        setLoading(false)
        return
      }

      const verifiedMemberId = identity.serverMemberId
      if (!verifiedMemberId) {
        setLoading(false)
        return
      }

      // apiFetch still carries x-member-id as a compatibility claim on Safari/native.
      // It is not authority, but a stale claim is correctly rejected when it conflicts
      // with the verified session. Once the server has proved who this member is, align
      // the direct compatibility key before any Living Field request leaves the page.
      if (identity.clientMemberId !== verifiedMemberId) {
        try {
          localStorage.setItem('memberId', verifiedMemberId)
        } catch {
          // Storage can be unavailable in private/restricted contexts. The verified
          // session remains authoritative; apiFetch will continue without this hint.
        }
      }

      setMemberId(verifiedMemberId)

      try {
        const response = await apiFetch('/api/maia/living-field')
        if (cancelled) return

        if (!response.ok) {
          setFailed(true)
          return
        }

        const livingField = await response.json()
        if (!cancelled) setData(livingField)
      } catch {
        if (!cancelled) setFailed(true)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
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

  if (identityUnavailable || failed) {
    return <LivingFieldUnavailable fromHouse={fromHouse} />
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

  if (!data) {
    return <LivingFieldUnavailable fromHouse={fromHouse} />
  }

  return (
    <LivingFieldFrame fromHouse={fromHouse}>
      <PersonalLivingFieldDashboard
        fields={data.fields}
        spiralState={data.spiral_state}
        activeSpirals={data.active_spirals}
        recentStates={data.recent_states}
        fromHouse={fromHouse}
      />
    </LivingFieldFrame>
  )
}
