import { NotificationSettings } from '@/components/team/NotificationSettings';

// Auth + sidebar are provided by app/team/(shell)/layout.tsx (redirects if no member session).
export const dynamic = 'force-dynamic';

export default function NotificationsPage() {
  return <NotificationSettings />;
}
