'use client';

import Link from 'next/link';
import styles from './house-continuity-link.module.css';
import { useRouter } from 'next/navigation';
import {
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';

const DEPARTURE_KEY = 'soullab.house.continuity.departure.v1';
const RETURN_KEY = 'soullab.house.continuity.return.v1';
const RETURN_WINDOW_MS = 30 * 60 * 1000;

type Departure = {
  placeId: string;
  href: string;
  at: number;
};

type ViewTransitionDocument = Document & {
  startViewTransition?: (
    update: () => void | Promise<void>,
  ) => { finished: Promise<void> };
};

function reducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function modified(event: MouseEvent<HTMLAnchorElement>) {
  return (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}

async function nextPaint() {
  await new Promise<void>((resolve) =>
    window.requestAnimationFrame(() =>
      window.requestAnimationFrame(() => resolve()),
    ),
  );
}

export function transitionNameForHousePlace(placeId: string) {
  return `house-place-${placeId}`;
}

export function HouseContinuityLink({
  href,
  placeId,
  className,
  children,
  ariaLabel,
  onDeparture,
}: {
  href: string;
  placeId: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  onDeparture?: () => void;
}) {
  const router = useRouter();

  const enter = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || modified(event)) return;
    event.preventDefault();

    const departure: Departure = { placeId, href, at: Date.now() };
    try {
      window.sessionStorage.setItem(DEPARTURE_KEY, JSON.stringify(departure));
    } catch {
      // Continuity memory is optional. Navigation remains authoritative.
    }

    onDeparture?.();

    const navigate = async () => {
      router.push(href);
      await nextPaint();
    };

    const doc = document as ViewTransitionDocument;
    if (!reducedMotion() && doc.startViewTransition) {
      doc.startViewTransition(navigate);
      return;
    }

    void navigate();
  };

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      data-house-place={placeId}
      style={{ viewTransitionName: transitionNameForHousePlace(placeId) }}
      onClick={enter}
    >
      {children}
    </Link>
  );
}

export function HouseReturnLink({
  href = '/house',
  placeId,
  className,
  children,
  ariaLabel,
  shareIdentity = true,
}: {
  href?: string;
  placeId: string;
  className?: string;
  children: ReactNode;
  ariaLabel?: string;
  shareIdentity?: boolean;
}) {
  const router = useRouter();

  const leave = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.defaultPrevented || modified(event)) return;
    event.preventDefault();

    try {
      const raw = window.sessionStorage.getItem(DEPARTURE_KEY);
      const departure = raw ? (JSON.parse(raw) as Departure) : null;
      const isMatchedReturn =
        departure?.placeId === placeId &&
        !!departure.at &&
        Date.now() - departure.at <= RETURN_WINDOW_MS;

      if (isMatchedReturn) {
        window.sessionStorage.setItem(
          RETURN_KEY,
          JSON.stringify({ placeId, href, at: Date.now() } satisfies Departure),
        );
      }
    } catch {
      // Return receipt is optional. Navigation remains authoritative.
    }

    const navigate = async () => {
      router.push(href);
      await nextPaint();
    };

    const doc = document as ViewTransitionDocument;
    if (!reducedMotion() && doc.startViewTransition) {
      doc.startViewTransition(navigate);
      return;
    }

    void navigate();
  };

  return (
    <Link
      href={href}
      className={className}
      aria-label={ariaLabel}
      data-house-return={placeId}
      style={shareIdentity ? { viewTransitionName: transitionNameForHousePlace(placeId) } : undefined}
      onClick={leave}
    >
      {children}
    </Link>
  );
}

export function useHouseReturnPlace() {
  const [placeId, setPlaceId] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    let departure: Departure | null = null;

    try {
      const raw = window.sessionStorage.getItem(RETURN_KEY);
      window.sessionStorage.removeItem(RETURN_KEY);
      window.sessionStorage.removeItem(DEPARTURE_KEY);
      departure = raw ? (JSON.parse(raw) as Departure) : null;
    } catch {
      departure = null;
    }

    if (
      !departure?.placeId ||
      !departure.at ||
      Date.now() - departure.at > RETURN_WINDOW_MS
    ) {
      return;
    }

    setPlaceId(departure.placeId);

    if (!reducedMotion()) {
      timer.current = window.setTimeout(() => setPlaceId(null), 1600);
    }

    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, []);

  return placeId;
}

export function HousePlaceContext({
  placeId,
  label,
  onArrange,
}: {
  placeId: string;
  label: string;
  onArrange: () => void;
}) {
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const toggle = () => {
    const panel = panelRef.current as
      | (HTMLDivElement & { togglePopover?: () => void })
      | null;

    if (panel?.togglePopover) {
      panel.togglePopover();
      return;
    }

    setFallbackOpen((value) => !value);
  };

  return (
    <>
      <button
        type="button"
        className={styles.trigger}
        aria-label={`Options for ${label}`}
        aria-expanded={fallbackOpen}
        onClick={toggle}
      >
        ···
      </button>
      <div
        ref={panelRef}
        popover="auto"
        className={styles.panel}
        data-fallback-open={fallbackOpen ? 'true' : 'false'}
        data-anchor-place={placeId}
      >
        <p>{label}</p>
        <span>This place stays the same place when you enter and return.</span>
        <button type="button" onClick={onArrange}>
          Arrange in my House
        </button>
      </div>
    </>
  );
}
