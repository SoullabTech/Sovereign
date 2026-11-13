/**
 * Where a signed-in member lands when Writer's Studio refuses them.
 *
 * The refusal itself belongs to the proxy's admission check and is unchanged.
 * This only names the member-facing place that says so. It is the House, not
 * the public doorway page: that page ignores the refusal, and its only member
 * path ("Explore Soullab Home") leads back to the House Writing card, which
 * made an unbounded loop.
 */
export const WRITER_STUDIO_INVITATION_REQUIRED_ACCESS = 'writers-studio-invitation-required';

export const WRITER_STUDIO_REFUSAL_PATH = '/house';

export function isWriterStudioInvitationRefusal(access: unknown): boolean {
  return access === WRITER_STUDIO_INVITATION_REQUIRED_ACCESS;
}
