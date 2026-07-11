'use client';

/**
 * Room Holoflower — the room's weather, not a widget.
 *
 * Renders the CANONICAL Soullab holoflower artwork:
 *     public/maia-spiral-logo-alt-transparent.png
 * (same mark as maia-spiral-logo-alt.png with the white ground removed, so the
 * room's own surface shows through), the radial spiral-of-dots mark (Air/gold top · Fire/red right · Water/blue bottom ·
 * Earth/green left — the four elemental quadrants, spiral center). The interview's
 * ambient motion state gently breathes the image; when an element is proposed or
 * confirmed, a soft radial glow in that element's colour warms behind it. The
 * artwork itself is never redrawn.
 *
 * ⚠️ DO NOT replace this with a hand-drawn <svg> mandala, and DO NOT revert to the
 * 12-petal `holoflower-v2` mark — both read off-brand and have been reverted before
 * (Kelly, 2026-07-07: the spiral-of-dots is the correct holoflower). The holoflower
 * is a fixed brand asset: render the PNG, warm it, breathe it. Never regenerate it.
 *
 * No persistence, no reads — it only renders local, ephemeral UI state passed in
 * as props.
 */

export type RoomMotionState = 'idle' | 'listening' | 'processing' | 'responding';
export type SpiralElement = 'Fire' | 'Water' | 'Earth' | 'Air' | 'Aether';

interface RoomHoloflowerProps {
  motionState: RoomMotionState;
  /** Element currently proposed but not yet confirmed — warms softly, fades next turn. */
  proposedElement?: SpiralElement | null;
  /** Elements the member has confirmed this session — stay gently warm. */
  confirmedElements: SpiralElement[];
  size?: number;
  /**
   * Larry's Now What? room only: wash the mark toward his nautical blues.
   * A masked colour overlay (mix-blend) tints the SAME artwork — it is never
   * redrawn. Off by default, so Soullab's own room keeps the warm original.
   */
  coolTint?: boolean;
  /**
   * What Now? room: render the monochrome WHITE spiral (holoflower.png) instead
   * of the multicolor mark, and skip the cool-tint wash — pure white on the navy
   * ground. Still the fixed brand asset, never redrawn.
   */
  mono?: boolean;
}

// Glow colours only — the artwork carries its own petal colour. These tint the
// soft radial warmth behind the mark when an element is proposed/confirmed.
const ELEMENT_COLOR: Record<SpiralElement, string> = {
  Fire: '#c0562d',
  Water: '#3b6ea5',
  Earth: '#6f8f3f',
  Air: '#c9a94a',
  Aether: '#a98fd0',
};

export function RoomHoloflower({
  motionState,
  proposedElement,
  confirmedElements,
  size = 120,
  coolTint = false,
  mono = false,
}: RoomHoloflowerProps) {
  // White What Now? room uses the monochrome spiral; Soullab's rooms keep the
  // multicolor mark. Either way it is the fixed brand asset — never redrawn.
  const art = mono ? '/holoflower.png' : '/maia-spiral-logo-alt-transparent.png';
  // Most recently confirmed element holds the glow; a proposal warms it faintly.
  const confirmed = confirmedElements[confirmedElements.length - 1] ?? null;
  const glowElement = confirmed ?? proposedElement ?? null;
  const glowOpacity = confirmed ? 0.45 : proposedElement ? 0.25 : 0;

  const breatheClass =
    motionState === 'listening'
      ? 'room-holoflower-listening'
      : motionState === 'processing'
        ? 'room-holoflower-processing'
        : motionState === 'responding'
          ? 'room-holoflower-responding'
          : 'room-holoflower-idle';

  return (
    <div
      className={`relative inline-flex items-center justify-center ${breatheClass}`}
      style={{ width: size, height: size, isolation: coolTint ? 'isolate' : 'auto' }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 rounded-full"
        style={{
          background: glowElement
            ? `radial-gradient(circle, ${ELEMENT_COLOR[glowElement]} 0%, transparent 70%)`
            : 'transparent',
          opacity: glowOpacity,
          filter: 'blur(18px)',
          transition: 'opacity 900ms ease',
        }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={art}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        className="relative select-none object-contain"
        draggable={false}
      />
      {coolTint && !mono && (
        <div
          aria-hidden="true"
          className="absolute inset-0 select-none"
          style={{
            width: size,
            height: size,
            WebkitMaskImage: 'url(/maia-spiral-logo-alt-transparent.png)',
            maskImage: 'url(/maia-spiral-logo-alt-transparent.png)',
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
            background: 'linear-gradient(160deg, #2fd0f0 0%, #1a9fd0 50%, #0d5b86 100%)',
            mixBlendMode: 'color',
            opacity: 0.34,
            pointerEvents: 'none',
          }}
        />
      )}
      <style jsx>{`
        .room-holoflower-idle {
          opacity: 1;
        }
        .room-holoflower-listening {
          animation: room-holoflower-breathe 3.2s ease-in-out infinite;
        }
        .room-holoflower-processing {
          animation: room-holoflower-breathe 1.6s ease-in-out infinite;
        }
        .room-holoflower-responding {
          animation: room-holoflower-settle 900ms ease-out;
        }
        @keyframes room-holoflower-breathe {
          0%, 100% { transform: scale(1); opacity: 0.96; }
          50% { transform: scale(1.03); opacity: 1; }
        }
        @keyframes room-holoflower-settle {
          0% { transform: scale(1.03); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
