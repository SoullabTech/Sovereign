'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { apiFetch } from '@/lib/http/apiBase';
import styles from './account-menu.module.css';

/**
 * The House rail's account doorway: a cog that opens Settings, Security and Sign out.
 *
 * It links only to routes that exist, and Sign out ends the SERVER session (`POST /api/members/signout` revokes
 * `maia_session` and clears the secure cookies). It never reports success it did not get: if the server call fails the
 * member stays here with a message and can try again, rather than being walked to sign-in while still signed in.
 */
const LOCAL_KEYS = ['beta_user', 'memberId', 'soullab_member', 'member_profile', 'explorerId', 'explorerName', 'explorerPreferredName'];

export function AccountMenu() {
  const router = useRouter();
  const menuId = useId();
  const root = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: MouseEvent) => {
      if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  async function signOut() {
    if (signingOut) return;
    setSigningOut(true);
    setFailed(false);
    try {
      const response = await apiFetch('/api/members/signout', { method: 'POST' });
      if (!response.ok) throw new Error('signout_refused');
    } catch {
      setSigningOut(false);
      setFailed(true);
      return;
    }
    try {
      for (const key of LOCAL_KEYS) localStorage.removeItem(key);
    } catch {
      // Storage may be unavailable; the server session is already ended.
    }
    router.replace('/signin');
  }

  return (
    <div className={styles.root} ref={root}>
      <button
        type="button"
        className={styles.cog}
        aria-label="Settings and sign out"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm7.4-2.6 1.6 1.2-1.6 2.8-1.9-.7a7.6 7.6 0 0 1-1.7 1l-.3 2h-3.2l-.3-2a7.6 7.6 0 0 1-1.7-1l-1.9.7L5 13.8l1.6-1.2a7.7 7.7 0 0 1 0-1.2L5 10.2l1.6-2.8 1.9.7a7.6 7.6 0 0 1 1.7-1l.3-2h3.2l.3 2a7.6 7.6 0 0 1 1.7 1l1.9-.7 1.6 2.8-1.6 1.2a7.7 7.7 0 0 1 0 1.2Z"
          />
        </svg>
      </button>
      {open ? (
        <div id={menuId} role="menu" className={styles.menu}>
          <Link role="menuitem" href="/account/settings" onClick={() => setOpen(false)}>Settings</Link>
          <Link role="menuitem" href="/account/security" onClick={() => setOpen(false)}>Security</Link>
          <button type="button" role="menuitem" onClick={signOut} disabled={signingOut}>
            {signingOut ? 'Signing out…' : 'Sign out'}
          </button>
          {failed ? <p role="alert" className={styles.failed}>Couldn’t sign you out. Please try again.</p> : null}
        </div>
      ) : null}
    </div>
  );
}
