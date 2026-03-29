/**
 * /fields — Practitioner Field Directory
 *
 * Shows all active practitioner fields. Each field is a distinct
 * relational space shaped by a specific human. Not content — relationship.
 */

import Link from 'next/link';
import { getAllActiveSlugs, getFieldBySlug } from '@/lib/masters/registry';

export default function FieldsDirectoryPage() {
  const slugs = getAllActiveSlugs();
  const fields = slugs
    .map((slug) => getFieldBySlug(slug))
    .filter((f) => f !== null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1a2e] via-[#16162a] to-[#121226] text-white/90">
      <main className="max-w-2xl mx-auto px-6 py-12 space-y-10">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="text-2xl font-light tracking-wide">Fields</h1>
          <p className="text-sm text-white/40 leading-relaxed">
            Each field is shaped by a real person with a distinct way of working.
            Entering a field means stepping into their way of seeing.
          </p>
        </div>

        {/* Field cards */}
        <div className="space-y-4">
          {fields.map((field) => (
            <Link
              key={field.slug}
              href={`/fields/${field.slug}`}
              className="block p-6 rounded-xl border border-white/5 hover:border-white/10 transition-colors group"
              style={{ backgroundColor: `${field.palette.background}15` }}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: field.palette.primary }}
                  />
                  <h2 className="text-lg font-light text-white/80 group-hover:text-white/95 transition-colors">
                    {field.name}
                  </h2>
                </div>
                <p className="text-sm text-white/40 pl-5">
                  {field.presence.openingLine}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Return to MAIA */}
        <nav className="pt-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-8 text-xs text-white/25">
            <Link href="/maia" className="hover:text-white/50 transition-colors">
              MAIA
            </Link>
            <span className="text-white/50">Fields</span>
            <Link href="/build" className="hover:text-white/50 transition-colors">
              Build
            </Link>
          </div>
        </nav>
      </main>
    </div>
  );
}
