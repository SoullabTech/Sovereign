'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { verifiedSessionFetch } from '@/lib/http/verifiedSessionFetch'
import { SOULLAB_SESSION_END_EVENT } from '@/lib/listening/audioFocus'
import { verifiedListeningMemberKey } from '@/lib/listening/listeningSessionBoundary'

export type ReaderSessionStatus =
  | 'checking'
  | 'authenticated'
  | 'unauthenticated'
  | 'unavailable'

export interface VerifiedReaderSession {
  memberKey: string | null
  status: ReaderSessionStatus
}

/**
 * LISTEN-47 — Reader consumes the same least-data, server-verified session
 * receipt as the persistent Sound Field. The member key is lifecycle state
 * only: Reader APIs still derive ownership independently from the credential.
 * No browser-stored member id, profile object, or bare identity claim is authority.
 */
export function useVerifiedReaderSession(): VerifiedReaderSession {
  const [session, setSession] = useState<VerifiedReaderSession>({
    memberKey: null,
    status: 'checking',
  })
  const generation = useRef(0)
  const controller = useRef<AbortController | null>(null)

  const endSession = useCallback(() => {
    generation.current += 1
    controller.current?.abort()
    controller.current = null
    setSession({ memberKey: null, status: 'unauthenticated' })
  }, [])

  const verify = useCallback(async () => {
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    const requestGeneration = ++generation.current
    setSession(current => ({ ...current, status: 'checking' }))

    try {
      const response = await verifiedSessionFetch('/api/members/session', {
        method: 'GET',
        cache: 'no-store',
        headers: { Accept: 'application/json' },
        signal: request.signal,
      })
      if (requestGeneration !== generation.current) return
      if (!response.ok) {
        setSession({ memberKey: null, status: 'unauthenticated' })
        return
      }

      const payload: unknown = await response.json()
      if (requestGeneration !== generation.current) return
      const memberKey = verifiedListeningMemberKey(payload)
      setSession(memberKey
        ? { memberKey, status: 'authenticated' }
        : { memberKey: null, status: 'unauthenticated' })
    } catch {
      if (request.signal.aborted) return
      if (requestGeneration === generation.current)
        setSession({ memberKey: null, status: 'unavailable' })
    } finally {
      if (requestGeneration === generation.current) controller.current = null
    }
  }, [])

  useEffect(() => {
    void verify()
    return () => {
      generation.current += 1
      controller.current?.abort()
      controller.current = null
    }
  }, [verify])

  useEffect(() => {
    const revalidate = () => void verify()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') revalidate()
    }
    window.addEventListener('focus', revalidate)
    window.addEventListener('online', revalidate)
    window.addEventListener(SOULLAB_SESSION_END_EVENT, endSession)
    document.addEventListener('visibilitychange', onVisibility)
    const interval = window.setInterval(revalidate, 60_000)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener('focus', revalidate)
      window.removeEventListener('online', revalidate)
      window.removeEventListener(SOULLAB_SESSION_END_EVENT, endSession)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [endSession, verify])

  return session
}
