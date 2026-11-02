/**
 * The one sentence a member is owed when the invitation gate turns them away.
 *
 * `proxy.ts` redirects a signed-in member who is not admitted to Writer's Studio
 * to `/explore/writers-studio?access=invitation-required`. That page is a public,
 * static introduction that shows a "Sign in" button — so without this sentence a
 * member who IS signed in reads the page as though the system did not know them.
 *
 * ⛔ PURE AND PUBLIC. It takes two strings the URL already carries and returns copy.
 * It reads no session, no cookie, no member, and names nothing about the person:
 * the doorway page is declared public-only and must stay statically renderable.
 *
 * ⛔ IT DESCRIBES THE GATE; IT DOES NOT SOFTEN IT. Admission is decided by
 * `proxy.ts` and nothing here can open it.
 */
export const INVITATION_REQUIRED = 'invitation-required' as const;

const NOTICES: Readonly<Record<string, string>> = {
  'writers-studio':
    "Writer's Studio is invitation-only during this beta. If you came here from your House, "
    + "your account hasn't been invited yet — nothing is wrong with it, and nothing of yours was opened or sent.",
};

export function invitationNoticeFor(slug: string, access: string | null | undefined): string | null {
  if (access !== INVITATION_REQUIRED) return null;
  return NOTICES[slug] ?? null;
}
