/** Exactly the pure SQL used by the Studio Attention route. */
import {
  attentionReadSql, ATTENTION_CREATE_SQL,
} from '../../lib/studio/field/attentionOwnerPredicates';
process.stdout.write(JSON.stringify({
  readPersonal: attentionReadSql('AND fa.team_id IS NULL'),
  readTeam: attentionReadSql('AND fa.team_id = $2'),
  readMixed: attentionReadSql('AND (fa.team_id = $2 OR fa.team_id IS NULL)'),
  create: ATTENTION_CREATE_SQL,
}));
