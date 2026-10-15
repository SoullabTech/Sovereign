/**
 * G2-3A / ATTENTION-OWNER-01: a practitioner's own Attention list does not
 * authorize arbitrary referenced Decisions/Changes. Return a source title only
 * if its contextual owner (member/practitioner/team/client) is independently
 * authorized. These SQL expression identifiers are developer-owned literals,
 * never caller supplied identifiers or free-form SQL.
 */
export function ownedAttentionChange(
  alias: string,
  practitionerExpr: string,
  memberExpr: string,
  teamExpr: string,
): string {
  return `(
    ${alias}.practitioner_id = ${practitionerExpr}
    AND ${alias}.team_id IS NOT DISTINCT FROM ${teamExpr}
    AND ${alias}.client_id IS NULL
    AND (${alias}.member_id IS NULL OR ${alias}.member_id = ${memberExpr})
  )`;
}

export function ownedAttentionDecision(
  alias: string,
  practitionerExpr: string,
  memberExpr: string,
  teamExpr: string,
): string {
  return `(
    (${alias}.decision_scope = 'personal'
      AND ${alias}.personal_member_id = ${memberExpr}
      AND ${alias}.practitioner_id IS NULL
      AND ${alias}.client_id IS NULL
      AND ${alias}.team_id IS NULL
      AND ${teamExpr} IS NULL)
    OR
    (${alias}.decision_scope IN ('practice','team')
      AND ${alias}.practitioner_id = ${practitionerExpr}
      AND ${alias}.team_id IS NOT DISTINCT FROM ${teamExpr}
      AND ${alias}.client_id IS NULL)
  )`;
}


/** SQL used unchanged by the route and disconnected PostgreSQL witness. */
export function attentionReadSql(scopeClause: string): string {
  // scopeClause is never supplied by a caller: route's scopeFor allows exactly
  // the three static team-scope shapes.
  if (![
    'AND fa.team_id IS NULL',
    'AND (fa.team_id = $2 OR fa.team_id IS NULL)',
    'AND fa.team_id = $2',
  ].includes(scopeClause)) {
    throw new Error('Unrecognized attention scope');
  }
  return `SELECT fa.id, fa.field, fa.kind, fa.ref_id, fa.position, fa.created_at,
              CASE WHEN fa.kind = 'note' THEN fa.label
                   WHEN fa.kind = 'change' THEN c.title
                   WHEN fa.kind = 'decision' THEN d.title
                   ELSE NULL END AS resolved,
              (fa.ref_id IS NOT NULL AND c.id IS NULL AND d.id IS NULL) AS gone
         FROM field_attention fa
         LEFT JOIN studio_changes c
           ON fa.kind = 'change' AND fa.ref_id = c.id
          AND ${ownedAttentionChange('c', 'fa.practitioner_id', '$3::uuid', 'fa.team_id')}
         LEFT JOIN studio_decisions d
           ON fa.kind = 'decision' AND fa.ref_id = d.id
          AND ${ownedAttentionDecision('d', 'fa.practitioner_id', '$3::uuid', 'fa.team_id')}
        WHERE fa.practitioner_id = $1 ${scopeClause}
          AND ($2::uuid IS NULL OR EXISTS (
            SELECT 1 FROM studio_team_members membership
             WHERE membership.team_id = $2::uuid
               AND membership.member_id = $3::uuid
               AND membership.role IN ('owner','admin','member','viewer')
          ))
        ORDER BY fa.position ASC, fa.created_at DESC
        LIMIT 300`;
}

export const ATTENTION_CREATE_SQL = (() => {
  const changeOwner = ownedAttentionChange('c', '$1::uuid', '$8::uuid', '$2::uuid');
  const decisionOwner = ownedAttentionDecision('d', '$1::uuid', '$8::uuid', '$2::uuid');
  return `INSERT INTO field_attention (practitioner_id, team_id, field, kind, ref_id, label, position)
         SELECT $1::uuid, $2::uuid, $3::text, $4::text, $5::uuid,
                CASE
                  WHEN $4::text = 'note' THEN $6::text
                  WHEN $4::text = 'change' THEN (
                    SELECT c.title FROM studio_changes c
                    WHERE c.id = $5::uuid AND ${changeOwner}
                  )
                  WHEN $4::text = 'decision' THEN (
                    SELECT d.title FROM studio_decisions d
                    WHERE d.id = $5::uuid AND ${decisionOwner}
                  )
                END, $7::integer
         WHERE ($2::uuid IS NULL OR EXISTS (
             SELECT 1 FROM studio_team_members membership
              WHERE membership.team_id = $2::uuid
                AND membership.member_id = $8::uuid
                AND membership.role IN ('owner','admin','member')
         ))
         AND ($4::text = 'note'
            OR ($4::text = 'change' AND EXISTS (
              SELECT 1 FROM studio_changes c
               WHERE c.id = $5::uuid AND ${changeOwner}
            ))
            OR ($4::text = 'decision' AND EXISTS (
              SELECT 1 FROM studio_decisions d
               WHERE d.id = $5::uuid AND ${decisionOwner}
            )))
         RETURNING id, field, kind, ref_id, label, position, created_at`;
})();
