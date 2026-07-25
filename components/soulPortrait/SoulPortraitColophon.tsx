/**
 * SoulPortraitColophon — the second gift.
 *
 * Placed by the DELIVERY surface (/soul-portrait/view/[slug]) AFTER the finished
 * portrait — never by the renderer. The gift stays literally untouched; this is a
 * separate door, spoken in Soullab's own quiet register (not the portrait's elemental
 * voice), the way a beautifully printed book closes on a plain imprint page.
 *
 * Founder ruling (Kelly, 2026-07-24): a colophon, not a funnel. It names where the
 * portrait came from and offers one door onward — nothing more. It must never say
 * "sign up", "unlock", "start your journey", "claim your account", "limited time",
 * or anything implying the portrait was incomplete without joining. No capture, no
 * interruption, no prominence. The portrait reads whole even if this is never clicked;
 * curious readers ask "who made this?" and are simply given an answer.
 *
 * Self-styled on purpose: it does not borrow the portrait's --sp-* theme vars, so the
 * shift to a plain parchment imprint is itself the "clear visual separation" that tells
 * the reader the portrait is complete. The one door opens to "/" (the public landing),
 * the only surface that opens without an account — never /maia, which walls a
 * session-less visitor at /signin.
 */
export function SoulPortraitColophon() {
  return (
    <aside
      aria-label="About Soullab"
      style={{
        background: '#F3EEE3',
        color: '#1A2F24',
        borderTop: '1px solid rgba(201, 162, 39, 0.35)',
        padding: '76px 24px 92px',
        fontFamily: 'Georgia, "Cormorant Garamond", serif',
      }}
    >
      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        <div
          aria-hidden
          style={{
            color: 'rgba(201, 162, 39, 0.85)',
            fontSize: 17,
            letterSpacing: '0.3em',
            marginBottom: 30,
          }}
        >
          ✦
        </div>
        <p
          style={{
            fontSize: '0.78rem',
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#6B6152',
            margin: '0 0 18px',
          }}
        >
          This portrait is complete
        </p>
        <p
          style={{
            fontSize: '1.15rem',
            lineHeight: 1.7,
            color: 'rgba(26, 47, 36, 0.85)',
            margin: '0 0 30px',
          }}
        >
          If it spoke to something true in you, you&rsquo;re welcome to continue exploring.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            fontSize: '0.95rem',
            letterSpacing: '0.04em',
            color: '#1A2F24',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(201, 162, 39, 0.7)',
            paddingBottom: 3,
          }}
        >
          Explore Soullab &rarr;
        </a>
      </div>
    </aside>
  );
}

export default SoulPortraitColophon;
