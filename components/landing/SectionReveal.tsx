'use client';

import { ReactNode, useEffect, useRef } from 'react';

interface SectionRevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

/**
 * One-time reveal on first entry into the viewport.
 *
 * Implemented with a raw IntersectionObserver and direct style writes rather
 * than framer-motion's whileInView or React state:
 * - The landing page can scroll either the window or the <main> element (a
 *   global landscape rule makes <main> the scroll container on desktop), and
 *   the observer must behave identically in both cases — including after
 *   anchor navigation and during fast scrolling.
 * - Applying the reveal via React state proved to lag visibly under scroll
 *   load (the state flipped but the re-render that applies the style landed
 *   hundreds of ms later). Writing styles in the observer callback keeps the
 *   reveal off the React render queue entirely.
 *
 * Behavior contract:
 * - Server markup is fully visible; content is only hidden after hydration,
 *   and only if it is off-screen at that moment. No blank first paint.
 * - An element already in view when measured (anchor landing, fast scroll)
 *   shows immediately with no animation.
 * - Once revealed, content stays fully visible.
 * - prefers-reduced-motion shows everything immediately.
 */
export function SectionReveal({ children, delay = 0, className }: SectionRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight && rect.bottom > 0) return;

    const stagger = Math.min(delay, 0.2);
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.4s ease-out ${stagger}s, transform 0.4s ease-out ${stagger}s`;

    const reveal = () => {
      el.style.opacity = '1';
      el.style.transform = 'none';
    };

    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          reveal();
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      reveal();
    };
  }, [delay]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
