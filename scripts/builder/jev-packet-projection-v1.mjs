/**
 * JARVIS-JEV packet projection shared by JARVIS integration and LABEL-01 pilot.
 * Mirrors the admitted pilot hypothesis exactly.
 */
export const JEV_PROJECTION_VERSION = 'JEV-PROJECTION.v1';
export const JEV_FILE_COUNT_MAX = 10_000;
export const JEV_DERIVATION = Object.freeze({
  task_shape: 'IDENTITY',
  contains_sensitive: 'AUTHORITY_PROXY',
  requires_external_info: 'AUTHORITY_PROXY',
  file_count: 'DECLARED_SCOPE_PROXY',
  migration: 'PATH_PATTERN',
  auth: 'PATH_PATTERN',
  production: 'AUTHORITY_PROXY',
});

const TASK_SHAPES = Object.freeze([
  'CODE_GROUNDED','ARCHITECTURE_REASONING','ADVERSARIAL_FALSIFICATION',
  'LONG_HORIZON_DECOMPOSITION','EVIDENCE_SYNTHESIS','FRONTIER_UNKNOWN',
]);

export function deriveJevPacketProjection(workUnit) {
  if (!workUnit || typeof workUnit !== 'object') return null;
  const shape = workUnit?.identity?.task_shape;
  const allowed = workUnit?.scope?.allowed_paths;
  const authority = workUnit?.authority;
  if (!TASK_SHAPES.includes(shape) || !Array.isArray(allowed)
      || allowed.some((p) => typeof p !== 'string') || !authority) return null;
  return Object.freeze({
    task_shape: shape,
    contains_sensitive: workUnit?.custody?.evidence_class === 'E4_SENSITIVE_OR_PRODUCTION',
    requires_external_info: authority.network_external === true
      || (typeof authority.external_disclosure === 'string' && authority.external_disclosure !== 'none'),
    change_scope: Object.freeze({
      file_count: Math.min(allowed.length, JEV_FILE_COUNT_MAX),
      migration: allowed.some((p) => /(^|\/)migrations?(\/|$)/i.test(p)),
      auth: allowed.some((p) => /(^|\/)auth(\/|$|[._-])/i.test(p)),
      production: authority.production_read === true
        || authority.production_write === true
        || authority.deploy === true,
    }),
    derivation: JEV_DERIVATION,
  });
}
