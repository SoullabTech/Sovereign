/** Exactly the SQL executed by the G2-3D read-only integration module. */
import {
  PERSONAL_FIELD_4_TABLE_CAPABILITY_SQL,
  NATIVE_EVENTS_SQL, LEGACY_EVENTS_SQL,
  NATIVE_PEOPLE_SQL, LEGACY_PEOPLE_SQL,
} from '../../lib/ganesha/personalFieldIntegration';
process.stdout.write(JSON.stringify({
  schema:PERSONAL_FIELD_4_TABLE_CAPABILITY_SQL,
  nativeEvents:NATIVE_EVENTS_SQL,legacyEvents:LEGACY_EVENTS_SQL,
  nativePeople:NATIVE_PEOPLE_SQL,legacyPeople:LEGACY_PEOPLE_SQL,
}));
