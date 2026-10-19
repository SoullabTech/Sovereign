/**
 * First-class Member Access room for founder administrators.
 *
 * Deliberately outside the internal Lab Tools server-layout gate. Entry remains
 * privacy-safe: the client fetches no member records without a verified member
 * session, and POST issuance is independently founder-session-gated server-side.
 * Reuse exactly the same reviewed component as Command Center; do not fork
 * recovery semantics into a second implementation.
 */
import MemberAccessPage from '@/app/labtools/admin/command-center/member-access/page';

export const dynamic = 'force-dynamic';

export default function AdminMemberAccessPage() {
  return <MemberAccessPage />;
}
