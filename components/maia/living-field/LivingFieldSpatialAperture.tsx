'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'
import { LivingFieldGrokkerShell } from './physics/LivingFieldGrokkerShell'

type BoundaryProps = {
  children: ReactNode
  onReturn: () => void
}

type BoundaryState = {
  failed: boolean
}

class SpatialApertureBoundary extends Component<BoundaryProps, BoundaryState> {
  state: BoundaryState = { failed: false }

  static getDerivedStateFromError(): BoundaryState {
    return { failed: true }
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Deliberately no member data or error payload is logged here.
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex min-h-[420px] items-center justify-center bg-stone-950 px-6">
          <div className="max-w-md text-center">
            <p className="text-sm text-stone-300">The wider field could not open.</p>
            <p className="mt-2 text-xs leading-5 text-stone-500">
              Nothing in your Living Field has been changed.
            </p>
            <button
              type="button"
              onClick={this.props.onReturn}
              className="mt-5 text-sm text-amber-500 transition-colors hover:text-amber-400"
            >
              Return to where you were
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function LivingFieldSpatialAperture({ onReturn }: { onReturn: () => void }) {
  return (
    <section
      data-living-field-spatial-aperture
      className="relative left-1/2 w-screen -translate-x-1/2 border-y border-stone-800 bg-[#080808]"
    >
      <SpatialApertureBoundary onReturn={onReturn}>
        <div className="relative">
          <button
            type="button"
            onClick={onReturn}
            className="absolute left-24 top-16 z-[70] rounded-full border border-amber-200/15 bg-stone-950/85 px-3 py-1.5 text-[11px] text-stone-300 backdrop-blur transition hover:border-amber-200/30 hover:text-stone-100"
          >
            ← Return to where you were
          </button>
          <LivingFieldGrokkerShell />
        </div>
      </SpatialApertureBoundary>
    </section>
  )
}
