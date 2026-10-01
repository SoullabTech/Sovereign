import { redirect } from 'next/navigation';

/**
 * One beta-tester authority surface.
 *
 * The former Lab Tools copy kept a browser-local roster, creating a second
 * reality next to members.tester. Keep one canonical admin destination.
 */
export default function LegacyBetaTesterAdmin() {
  redirect('/admin/beta-testers');
}
