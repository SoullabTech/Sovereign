// Verifies the notification-preference consent loop against the local DB.
// Self-cleaning: removes any rows it writes. Run: npx tsx scripts/repro/notif-prefs-check.ts
import { query } from '@/lib/db/postgres';
import {
  resolveNotificationPreference,
  getResolvedPreferences,
  setNotificationPreference,
} from '@/lib/team/notificationPreferences';

async function main() {
  const m = await query<{ id: string; username: string }>(
    `SELECT id, username FROM members ORDER BY created_at LIMIT 1`
  );
  const memberId = m.rows[0]?.id;
  if (!memberId) {
    console.log('no members in DB — skipping');
    return;
  }
  console.log('test member:', m.rows[0].username, memberId.slice(0, 8));

  const dmDefault = await resolveNotificationPreference(memberId, 'dm_received', 'email');
  const chDefault = await resolveNotificationPreference(memberId, 'channel_activity', 'email');
  console.log(`dm_received/email default      = ${dmDefault}  (expect true)`);
  console.log(`channel_activity/email default = ${chDefault}  (expect false)`);

  await setNotificationPreference(memberId, 'dm_received', 'email', false);
  const dmAfter = await resolveNotificationPreference(memberId, 'dm_received', 'email');
  console.log(`dm_received/email after opt-out = ${dmAfter}  (expect false)`);

  const matrix = await getResolvedPreferences(memberId);
  const row = matrix.find(p => p.event_type === 'dm_received' && p.channel === 'email');
  console.log(`matrix dm_received/email        = ${JSON.stringify(row)}  (expect enabled:false, isDefault:false)`);

  // cleanup
  await query(`DELETE FROM member_notification_preferences WHERE member_id = $1`, [memberId]);
  const restored = await resolveNotificationPreference(memberId, 'dm_received', 'email');
  console.log(`restored default after cleanup  = ${restored}  (expect true)`);

  const pass =
    dmDefault === true && chDefault === false && dmAfter === false &&
    row?.enabled === false && row?.isDefault === false && restored === true;
  console.log(pass ? '\n✅ PASS — consent gate resolves, overrides, and cleans up' : '\n❌ FAIL');
}

main()
  .then(() => process.exit(0))
  .catch(e => { console.error(e); process.exit(1); });
