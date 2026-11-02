'use client';

import { useSearchParams } from 'next/navigation';
import { invitationNoticeFor } from '@/lib/launch/invitationNotice';
import styles from '../explore.module.css';

/**
 * Client-side on purpose: the doorway page is statically generated and declared
 * public-only. Reading the URL here keeps it that way — the server never learns
 * who is looking.
 */
export function InvitationNotice({ slug }: { slug: string }) {
  const notice = invitationNoticeFor(slug, useSearchParams()?.get('access'));
  if (!notice) return null;
  return <p className={styles.notice} role="status">{notice}</p>;
}
