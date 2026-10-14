import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function WritersStudioBetaLimited() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'grid',
      placeItems: 'center',
      background: '#191612',
      color: '#eee6d9',
      padding: 28,
    }}>
      <section style={{ width: 'min(100%, 540px)', lineHeight: 1.65 }}>
        <div style={{ color: '#c6aa79', fontSize: 12, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          Soullab · Writer’s Studio
        </div>
        <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(28px, 6vw, 40px)', fontWeight: 500 }}>
          Writer’s Studio is in a limited beta.
        </h1>
        <p>
          This writing room is currently open to invited beta participants.
          Your existing writing remains yours and has not been changed.
        </p>
        <Link href="/house" style={{ color: '#e2bb5a', textUnderlineOffset: 4 }}>
          Return to Soullab
        </Link>
      </section>
    </main>
  );
}
