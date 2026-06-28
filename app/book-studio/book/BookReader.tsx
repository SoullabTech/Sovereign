'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface BookReaderProps {
  children: React.ReactNode;
}

/**
 * Reading environment for /book-studio/book.
 *
 * The design variable is the state transition, not the component. Every
 * element here exists only insofar as it helps someone move from reference
 * consciousness into immersive consciousness and stay there.
 *
 * Architecture: children (StudioMarkdown — a server component) render at
 * full height inside a hidden measuring container. After fonts load, total
 * height is measured and page count calculated from viewport height. CSS
 * translation slices the content into viewport-sized pages. No content
 * coupling; no re-rendering.
 *
 * Five gates:
 *   1. No competing voice — no MAIA surface, no interpretive affordances.
 *   2. No retrieval posture — no search, no index, TOC hidden by default.
 *   3. No scroll-world — page-turn only; scroll wheel suppressed.
 *   4. No visual urgency — sparse controls, no progress pressure.
 *   5. Remember without spectacle — quiet return to last page, no tracking theater.
 */

const STORAGE_KEY = 'book-reader-page';

function usePageTurn(contentRef: React.RefObject<HTMLDivElement | null>) {
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const [measured, setMeasured] = useState(false);

  const measure = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;
    const vh = window.innerHeight;
    if (vh === 0) return;
    const total = el.scrollHeight;
    const count = Math.max(1, Math.ceil(total / vh));
    setPageCount(count);
    setMeasured(true);
  }, [contentRef]);

  // Measure after fonts load so Crimson Pro doesn't shift layout
  useEffect(() => {
    document.fonts.ready.then(measure);
  }, [measure]);

  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, [contentRef, measure]);

  // Restore last position
  useEffect(() => {
    if (!measured) return;
    try {
      const saved = parseInt(sessionStorage.getItem(STORAGE_KEY) ?? '0', 10);
      if (!isNaN(saved) && saved > 0 && saved < pageCount) {
        setPage(saved);
      }
    } catch {
      // sessionStorage unavailable — proceed from page 0
    }
  }, [measured, pageCount]);

  const go = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(next, pageCount - 1));
      setPage(clamped);
      try {
        sessionStorage.setItem(STORAGE_KEY, String(clamped));
      } catch {
        /* ignore */
      }
    },
    [pageCount],
  );

  const forward = useCallback(() => go(page + 1), [go, page]);
  const back = useCallback(() => go(page - 1), [go, page]);
  const goToPage = useCallback((n: number) => go(n), [go]);

  return { page, pageCount, measured, forward, back, goToPage };
}

export default function BookReader({ children }: BookReaderProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [tocOpen, setTocOpen] = useState(false);
  const [fading, setFading] = useState(false);
  const { page, pageCount, measured, forward, back } = usePageTurn(contentRef);

  // Suppress scroll wheel — scroll is not the reading gesture here
  useEffect(() => {
    const prevent = (e: WheelEvent) => e.preventDefault();
    wrapperRef.current?.addEventListener('wheel', prevent, { passive: false });
    return () => wrapperRef.current?.removeEventListener('wheel', prevent);
  }, []);

  // Keyboard: arrow keys and space
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (tocOpen) {
        if (e.key === 'Escape') setTocOpen(false);
        return;
      }
      if (e.key === 'ArrowRight' || e.key === ' ') {
        e.preventDefault();
        turnPage(() => forward());
      } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
        e.preventDefault();
        turnPage(() => back());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [forward, back, tocOpen]);

  // Touch swipe
  useEffect(() => {
    let startX = 0;
    const onStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
    };
    const onEnd = (e: TouchEvent) => {
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 50) {
        turnPage(dx < 0 ? forward : back);
      }
    };
    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchend', onEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchend', onEnd);
    };
  }, [forward, back]);

  const turnPage = useCallback((action: () => void) => {
    setFading(true);
    setTimeout(() => {
      action();
      setFading(false);
    }, 150);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    if (tocOpen) return;
    const x = e.clientX;
    const half = window.innerWidth / 2;
    if (x > half) turnPage(() => forward());
    else turnPage(() => back());
  };

  const vh = typeof window !== 'undefined' ? window.innerHeight : 0;

  return (
    <div className="book-env">
      {/* Clipping viewport — only one page tall, overflow hidden */}
      <div
        ref={wrapperRef}
        className="book-viewport"
        onClick={handleClick}
      >
        {/* Manuscript rendered at full height, translated to show current page */}
        <div
          ref={contentRef}
          className="book-content"
          style={{
            transform: measured ? `translateY(-${page * vh}px)` : 'translateY(0)',
            opacity: fading ? 0 : 1,
            transition: fading ? 'opacity 150ms ease' : 'opacity 150ms ease, transform 0ms',
          }}
        >
          {children}
        </div>
      </div>

      {/* Exit — nearly invisible, always accessible */}
      <a
        href="/book-studio/read"
        className="book-exit"
        onClick={(e) => e.stopPropagation()}
        aria-label="Return to Read Flow"
      >
        ← Read Flow
      </a>

      {/* TOC trigger — nearly invisible dot/glyph at bottom center */}
      <button
        className="book-toc-trigger"
        onClick={(e) => {
          e.stopPropagation();
          setTocOpen((v) => !v);
        }}
        aria-label="Contents"
        aria-expanded={tocOpen}
      >
        &#8801;
      </button>

      {/* Chapter indicator — quiet, small-caps */}
      <div className="book-indicator" aria-hidden="true">
        {measured && pageCount > 1 && (
          <span>
            {page + 1} / {pageCount}
          </span>
        )}
      </div>

      {/* TOC overlay — fills screen, dark, dismissable */}
      {tocOpen && (
        <div
          className="book-toc-overlay"
          onClick={() => setTocOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Contents"
        >
          <div className="book-toc-content" onClick={(e) => e.stopPropagation()}>
            <p className="book-toc-title">Contents</p>
            <p className="book-toc-note">
              Chapter navigation coming in v2. Use arrow keys or swipe to read.
            </p>
            <button className="book-toc-close" onClick={() => setTocOpen(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
