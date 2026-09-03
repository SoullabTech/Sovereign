import type { Metadata } from 'next';
import Link from 'next/link';

/**
 * Now What? — the branded arrival.
 *
 * The public face of the environment: what it is, and one way in. It is the
 * only Now What? surface a person can meet without an account, so it carries
 * the whole first impression and nothing else.
 *
 * WHY THIS ROUTE. `config/accessMatrix.ts` declares `/now-what/welcome`
 * public; every other `/now-what/*` path redirects an unauthenticated visitor
 * to `/now-what/arrive`. So this is where a landing can live without touching
 * middleware or the access matrix.
 *
 * WHAT IT DOES NOT DO. It does not authenticate. Sign-in and account creation
 * live at `/now-what/arrive` — the environment's own door (Kelly ruling
 * 2026-07-16), already wired to `/api/now-what/signin` and
 * `/api/now-what/register`. This page hands off to it and holds no credential
 * fields of its own, so there is one auth surface rather than two that drift.
 *
 * REGISTER. Warm charcoal and bronze, per the 2026-08-05 ruling that Now What?
 * is coherent brown. `app/now-what/layout.tsx` re-inks the legacy slate ramp
 * around this page; the values here are the brand's own rather than utility
 * classes, so the arrival does not depend on that re-inking to look right.
 */

export const metadata: Metadata = {
  title: 'Now What?',
  description: 'A place to talk through what is happening and what comes next.',
};

const GOLD = '#c9a35e';
const INK = '#e9e2d4';
const DIM = '#b6ac9a';
const FAINT = '#857c6c';

export default function NowWhatWelcomePage() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-16 text-center"
      style={{
        background:
          'radial-gradient(ellipse 90% 42% at 50% 0%, rgba(196,164,110,0.08), transparent 62%),' +
          ' linear-gradient(#211d18, #1b1815)',
        color: INK,
      }}
    >
      <h1
        className="font-light"
        style={{ fontFamily: 'Georgia, "Times New Roman", serif', fontSize: 'clamp(42px, 9vw, 58px)', lineHeight: 1.05 }}
      >
        Now What?
      </h1>

      <p
        className="mt-4 uppercase"
        style={{ color: GOLD, fontSize: 10, letterSpacing: '0.32em' }}
      >
        with Larry Closs
      </p>

      <p
        className="mt-14 font-light"
        style={{
          fontFamily: 'Georgia, "Times New Roman", serif',
          fontSize: 'clamp(21px, 4.5vw, 27px)',
          lineHeight: 1.5,
          color: DIM,
          maxWidth: '16em',
        }}
      >
        A place to talk through what&rsquo;s happening and what comes next.
      </p>

      <Link
        href="/now-what/arrive"
        className="mt-14 inline-block rounded-full transition-colors"
        style={{
          border: `1px solid rgba(201,163,94,0.5)`,
          color: GOLD,
          fontSize: 14,
          letterSpacing: '0.1em',
          padding: '15px 34px',
        }}
      >
        Sign in
      </Link>

      <p className="mt-6" style={{ color: FAINT, fontSize: 13 }}>
        New here?{' '}
        <Link href="/now-what/arrive" style={{ color: DIM, textDecoration: 'underline', textUnderlineOffset: 3 }}>
          Create your key
        </Link>
      </p>

      <p
        className="absolute uppercase"
        style={{ bottom: 34, color: FAINT, fontSize: 9.5, letterSpacing: '0.24em', opacity: 0.7 }}
      >
        Powered by MAIA
      </p>
    </main>
  );
}
