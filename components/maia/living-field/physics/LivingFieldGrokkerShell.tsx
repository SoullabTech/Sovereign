'use client'

import Link from 'next/link'
import { useCallback, useMemo, useState } from 'react'
import {
  BookOpen,
  Home,
  MessageCircle,
  Search,
  Sparkles,
  Users,
} from 'lucide-react'
import {
  BiologicalSpatialFieldPrototype,
  type BiologicalFieldSemanticState,
} from './BiologicalSpatialFieldPrototype'
import { LivingFieldIlluminationPanel } from './LivingFieldIlluminationPanel'
import { buildIlluminationModel } from './livingFieldIllumination'
import { flattenFieldTree } from '../livingFieldHierarchy'
import styles from './livingFieldGrokkerShell.module.css'

const NAV = [
  { href: '/maia/living-field', label: 'Living Field', icon: Sparkles, active: true },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/relationships', label: 'Relationships', icon: Users },
  { href: '/maia', label: 'MAIA', icon: MessageCircle },
  { href: '/home', label: 'Home', icon: Home },
]

export function LivingFieldGrokkerShell() {
  const [fieldKey, setFieldKey] = useState('calling')
  const [selectedKey, setSelectedKey] = useState('calling')
  const [navigationRequest, setNavigationRequest] = useState<{ key: string; token: number } | null>(null)
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)

  const fieldModel = useMemo(() => buildIlluminationModel(fieldKey), [fieldKey])
  const allNodes = useMemo(() => flattenFieldTree(), [])
  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return allNodes
      .filter((node) =>
        node.label.toLowerCase().includes(q) ||
        node.inquiry.toLowerCase().includes(q) ||
        node.essence?.toLowerCase().includes(q),
      )
      .slice(0, 8)
  }, [allNodes, query])

  const onFieldState = useCallback((state: BiologicalFieldSemanticState) => {
    if (!state.selectedKey) return
    setFieldKey(state.selectedKey)
    setSelectedKey(state.selectedKey)
  }, [])

  const revealKey = useCallback((key: string) => {
    const candidate = buildIlluminationModel(key)
    setSelectedKey(key)

    if (!candidate?.spatiallyNavigable) return

    setFieldKey(key)
    setNavigationRequest((current) => ({
      key,
      token: (current?.token ?? 0) + 1,
    }))
  }, [])

  return (
    <div className={`grid h-screen min-h-[720px] grid-cols-[74px_minmax(0,1fr)_360px] grid-rows-[58px_minmax(0,1fr)] overflow-hidden ${styles.shell}`}>
      <aside className={`row-span-2 flex flex-col items-center border-r px-2 py-3 ${styles.rail}`}>
        <Link
          href="/home"
          className={`mb-4 flex w-full flex-col items-center gap-2 py-1 ${styles.brand}`}
          aria-label="Soullab home"
        >
          <img className={styles.brandMark} src="/holoflower-studio-transparent.png" alt="" />
          <span className="text-[9px]">SOULLAB</span>
          <span className="max-w-[58px] text-center text-[6px] leading-[1.45] tracking-[0.18em] text-[#7c6c58]">
            BEING · BECOMING · TOGETHER
          </span>
        </Link>

        <nav className="flex w-full flex-1 flex-col items-center gap-2">
          {NAV.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className={
                  'group flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2.5 transition ' +
                  styles.navItem + ' ' +
                  (item.active ? styles.navActive : '')
                }
              >
                <Icon className="h-4 w-4" strokeWidth={1.45} />
                <span className="max-w-[60px] truncate">{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="pb-2 text-center">
          <div className="mx-auto h-6 w-6 rounded-full border border-[rgba(217,187,142,.18)] bg-[rgba(203,169,116,.06)]" />
          <p className="mt-1 text-[9px] text-[#746654]">You</p>
        </div>
      </aside>

      <header className={`relative z-30 col-start-2 row-start-1 flex items-center justify-between gap-4 border-b px-5 ${styles.topbar}`}>
        <div className="min-w-0">
          <div className={`flex min-w-0 items-center gap-1.5 ${styles.breadcrumb}`}>
            <span className="mr-1 text-[#665846]">Context</span>
            <span className="opacity-35">·</span>
            <span>Living Field</span>
            {fieldModel?.contextPath.slice(1).map((item) => (
              <span key={item.key} className="flex min-w-0 items-center gap-1.5">
                <span className="opacity-35">›</span>
                <span className="truncate">{item.label}</span>
              </span>
            ))}
          </div>
          <p className={`mt-0.5 truncate ${styles.inquiry}`}>
            {fieldModel?.inquiry ?? 'What is calling from the field?'}
          </p>
        </div>

        <div className="relative w-[300px] shrink-0">
          <div className={`flex items-center gap-2 rounded-full px-3 py-2 ${styles.search}`}>
            <Search className="h-3.5 w-3.5 text-[#786b59]" strokeWidth={1.5} />
            <input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value)
                setSearchOpen(true)
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder="Search the field…"
              className="min-w-0 flex-1 bg-transparent text-xs text-[#d8c9b3] outline-none placeholder:text-[#6f6252]"
            />
          </div>

          {searchOpen && results.length > 0 ? (
            <div
              data-field-search-results
              className={`absolute right-0 top-11 z-50 w-full overflow-hidden rounded-2xl p-1 shadow-2xl backdrop-blur-xl ${styles.searchMenu}`}
            >
              {results.map((node) => (
                <button
                  key={node.key}
                  data-search-key={node.key}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    revealKey(node.key)
                    setQuery('')
                    setSearchOpen(false)
                  }}
                  className="w-full rounded-xl px-3 py-2 text-left transition hover:bg-[rgba(203,169,116,.07)]"
                >
                  <p className="text-xs text-[#d9cbb7]">{node.label}</p>
                  <p className="mt-0.5 line-clamp-1 text-[10px] text-[#786b59]">{node.inquiry}</p>
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      <main className={`relative z-0 col-start-2 row-start-2 min-w-0 overflow-hidden ${styles.main}`}>
        <BiologicalSpatialFieldPrototype
          embedded
          navigationRequest={navigationRequest}
          onSemanticStateChange={onFieldState}
        />
      </main>

      <div className="relative z-40 col-start-3 row-span-2 row-start-1 min-h-0">
        <LivingFieldIlluminationPanel
          selectedKey={selectedKey}
          orientationKey={fieldKey}
          onInspectKey={setSelectedKey}
          onRevealKey={revealKey}
        />
      </div>
    </div>
  )
}
