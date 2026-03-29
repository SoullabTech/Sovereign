import Link from 'next/link';

/**
 * Footer navigation for the three-facet ecosystem.
 * MAIA (personal) / Fields (practitioners) / Build (creation)
 */
export function FieldFooterNav() {
  return (
    <nav className="pt-8 border-t border-white/5">
      <div className="flex items-center justify-center gap-8 text-xs text-white/25">
        <span className="text-white/50">MAIA</span>
        <Link
          href="/fields"
          className="hover:text-white/50 transition-colors"
        >
          Fields
        </Link>
        <Link
          href="/build"
          className="hover:text-white/50 transition-colors"
        >
          Build
        </Link>
      </div>
    </nav>
  );
}
