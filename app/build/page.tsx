/**
 * /build — Field Creation Layer (Placeholder)
 *
 * Where fields are designed and shaped. For practitioners creating fields,
 * developers building agents, teams designing intelligence systems.
 *
 * Not a dashboard. A field design environment.
 */

import Link from 'next/link';

export default function BuildPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16162a] to-[#121226] text-white/90">
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        <div className="space-y-4 text-center pt-12">
          <h1 className="text-2xl font-light tracking-wide">Build</h1>
          <p className="text-sm text-white/40 leading-relaxed max-w-md mx-auto">
            Where fields are designed and shaped.
          </p>
          <p className="text-xs text-white/20 pt-4">
            This layer is forming.
          </p>
        </div>

        {/* Navigation */}
        <nav className="pt-8 border-t border-white/5">
          <div className="flex items-center justify-center gap-8 text-xs text-white/25">
            <Link href="/maia" className="hover:text-white/50 transition-colors">
              MAIA
            </Link>
            <Link href="/fields" className="hover:text-white/50 transition-colors">
              Fields
            </Link>
            <span className="text-white/50">Build</span>
          </div>
        </nav>
      </main>
    </div>
  );
}
