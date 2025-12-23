/**
 * Journey Page - Redirect to Main MAIA with Biofield Panel
 *
 * This route now redirects to /maia?panel=biofield for unified experience.
 * The Journey Experience is integrated into the main MAIA page.
 */

import { redirect } from 'next/navigation';

export default function Page() {
  redirect('/maia?panel=biofield');
}
