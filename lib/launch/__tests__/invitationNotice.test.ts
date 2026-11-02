/**
 * The invitation notice: a member the gate turns away is told so, and the public
 * doorway page stays a public, static page that knows nothing about the viewer.
 */
import { readFileSync } from 'fs';
import path from 'path';
import { INVITATION_REQUIRED, invitationNoticeFor } from '../invitationNotice';
import { PUBLIC_DOORWAYS } from '../publicDoorwaysP0';

const src = (relative: string) => readFileSync(path.join(process.cwd(), relative), 'utf8');
const stripComments = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

describe('the notice appears only where the gate actually sends people', () => {
  it("shows for Writer's Studio when the gate's marker is present", () => {
    const text = invitationNoticeFor('writers-studio', INVITATION_REQUIRED);
    expect(text).toMatch(/invitation-only/i);
    expect(text).toMatch(/hasn't been invited/i);
  });

  it('is silent without the marker, or with any other value', () => {
    expect(invitationNoticeFor('writers-studio', null)).toBeNull();
    expect(invitationNoticeFor('writers-studio', undefined)).toBeNull();
    expect(invitationNoticeFor('writers-studio', '')).toBeNull();
    expect(invitationNoticeFor('writers-studio', 'granted')).toBeNull();
    expect(invitationNoticeFor('writers-studio', 'Invitation-Required')).toBeNull();
  });

  it('is silent for every other doorway, even with the marker', () => {
    for (const door of PUBLIC_DOORWAYS.filter((d) => d.slug !== 'writers-studio')) {
      expect(invitationNoticeFor(door.slug, INVITATION_REQUIRED)).toBeNull();
    }
    expect(invitationNoticeFor('not-a-door', INVITATION_REQUIRED)).toBeNull();
  });

  it('says nothing about the person, and does not blame them', () => {
    const text = invitationNoticeFor('writers-studio', INVITATION_REQUIRED) ?? '';
    expect(text).not.toMatch(/@|member id|your name|plan|pro\b|upgrade|pay/i);
    expect(text).toMatch(/nothing is wrong/i);
  });
});

describe('the notice and the gate cannot drift apart silently', () => {
  it("proxy.ts redirects to the same path with the same marker this notice listens for", () => {
    /* Anchored to the start of a code line, so a mention inside a comment cannot
       satisfy it — and ⛔ NOT run through stripComments: proxy.ts holds glob
       strings containing a slash-star, which a naive block-comment stripper reads
       as the start of a comment and then eats the very lines being asserted. */
    const proxy = src('proxy.ts');
    expect(proxy).toMatch(/^\s*invitation\.pathname = '\/explore\/writers-studio';/m);
    expect(proxy).toMatch(
      new RegExp(`^\\s*invitation\\.searchParams\\.set\\('access', '${INVITATION_REQUIRED}'\\);`, 'm'));
  });
});

describe('the public doorway page stays public and static', () => {
  const page = stripComments(src('app/explore/[slug]/page.tsx'));
  const notice = stripComments(src('app/explore/[slug]/InvitationNotice.tsx'));

  it('the page reads no request, session or member', () => {
    expect(page).not.toMatch(/searchParams|cookies\(|headers\(|requireMemberId|getSession|from '@\/lib\/auth/);
    expect(page).toMatch(/export const revalidate = false/);
    expect(page).toMatch(/export const dynamicParams = false/);
  });

  it('the notice reads only the URL, in the browser', () => {
    expect(notice.trimStart().startsWith("'use client'")).toBe(true);
    expect(notice).toMatch(/useSearchParams/);
    expect(notice).not.toMatch(/fetch\(|requireMemberId|getSession|cookies\(|from '@\/lib\/auth|from '@\/lib\/db/);
  });

  it('the notice sits inside Suspense, so static generation is not forced dynamic', () => {
    expect(page).toMatch(/<Suspense fallback=\{null\}><InvitationNotice/);
  });
});
