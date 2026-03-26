'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useField } from '@/lib/field/FieldProvider';

const MODULE_ROUTES: Record<string, string> = {
  threshold:    '',
  presence:     '/presence',
  'work-with-me': '/work',
  booking:      '/book',
  groups:       '/groups',
  maia:         '/maia',
};

export default function FieldNav() {
  const field = useField();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const enabledModules = field.modules
    .filter(m => m.enabled && MODULE_ROUTES[m.id] !== undefined)
    .sort((a, b) => a.order - b.order);

  const baseHref = `/field/${field.slug}`;

  function isActive(moduleId: string) {
    const route = MODULE_ROUTES[moduleId];
    const full = `${baseHref}${route}`;
    if (route === '') return pathname === baseHref || pathname === `${baseHref}/`;
    return pathname?.startsWith(full) ?? false;
  }

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{
        borderColor: `${field.palette.primary}20`,
        backgroundColor: `${field.palette.background}F0`,
        backdropFilter: 'blur(12px)',
      }}
      aria-label="Field navigation"
    >
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Left: name */}
        <Link
          href={baseHref}
          className="text-sm font-medium tracking-wide transition-opacity hover:opacity-70"
          style={{
            fontFamily: 'var(--field-font-display)',
            color: field.palette.text,
          }}
        >
          {field.name}
        </Link>

        {/* Desktop: module links */}
        <div className="hidden sm:flex items-center gap-6">
          {enabledModules
            .filter(m => m.id !== 'threshold')
            .map(module => {
              const active = isActive(module.id);
              return (
                <Link
                  key={module.id}
                  href={`${baseHref}${MODULE_ROUTES[module.id]}`}
                  className="text-xs tracking-widest uppercase transition-colors duration-300"
                  style={{
                    color: active ? field.palette.primary : `${field.palette.text}60`,
                    borderBottom: active ? `1px solid ${field.palette.primary}` : 'none',
                    paddingBottom: active ? '2px' : undefined,
                  }}
                >
                  {module.label}
                </Link>
              );
            })}
        </div>

        {/* Mobile: hamburger */}
        <button
          className="sm:hidden flex flex-col gap-1.5 p-1"
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <span
            className="w-5 h-px transition-transform duration-300"
            style={{
              backgroundColor: field.palette.text,
              transform: menuOpen ? 'rotate(45deg) translate(2px, 2px)' : 'none',
            }}
          />
          <span
            className="w-5 h-px transition-opacity duration-300"
            style={{
              backgroundColor: field.palette.text,
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            className="w-5 h-px transition-transform duration-300"
            style={{
              backgroundColor: field.palette.text,
              transform: menuOpen ? 'rotate(-45deg) translate(2px, -2px)' : 'none',
            }}
          />
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div
          className="sm:hidden border-t px-6 pb-4 pt-3 flex flex-col gap-4"
          style={{ borderColor: `${field.palette.primary}20` }}
        >
          {enabledModules
            .filter(m => m.id !== 'threshold')
            .map(module => {
              const active = isActive(module.id);
              return (
                <Link
                  key={module.id}
                  href={`${baseHref}${MODULE_ROUTES[module.id]}`}
                  onClick={() => setMenuOpen(false)}
                  className="text-sm tracking-widest uppercase transition-colors"
                  style={{
                    color: active ? field.palette.primary : `${field.palette.text}70`,
                  }}
                >
                  {module.label}
                </Link>
              );
            })}
        </div>
      )}
    </nav>
  );
}
