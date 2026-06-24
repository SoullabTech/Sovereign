import Link from 'next/link';
import { getDoc } from '@/lib/beta-testers/docs';
import { FIELD_ACCENT } from '@/lib/beta-testers/constants';
import { Markdown } from './_components/Markdown';

// Server component — reads the welcome doctrine markdown at request time.
export default function BetaTestersWelcomePage() {
  const { content } = getDoc('welcome');

  return (
    <div className="space-y-10">
      <Markdown content={content} />

      <section className="flex flex-wrap gap-3 border-t border-white/5 pt-8">
        <Link
          href="/beta-testers/questions"
          className="rounded-full px-5 py-2 text-sm font-medium"
          style={{ backgroundColor: FIELD_ACCENT, color: '#0c0c0f' }}
        >
          Living Questions
        </Link>
        <Link
          href="/beta-testers/observe"
          className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:bg-white/5"
        >
          Leave an observation
        </Link>
        <Link
          href="/beta-testers/pulse"
          className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-200 hover:bg-white/5"
        >
          What’s alive →
        </Link>
        <Link
          href="/beta-testers/participate"
          className="rounded-full border border-white/15 px-5 py-2 text-sm text-zinc-400 hover:bg-white/5"
        >
          How to participate
        </Link>
      </section>
    </div>
  );
}
