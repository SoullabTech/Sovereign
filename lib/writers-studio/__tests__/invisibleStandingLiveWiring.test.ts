/** JARVIS-MAIA-INVISIBLE-STANDING-SHADOW-02 · production wiring contract. */

import fs from 'fs';
import path from 'path';

const CODE = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');
const COGNITION = () => CODE('lib/writers-studio/writersStudioCognition.ts');
const SERVICE = () => CODE('lib/sovereign/maiaService.ts');
const SHADOW = () => CODE('lib/writers-studio/invisibleStandingShadow.ts');

describe('Invisible Standing live-shadow wiring', () => {
  it('is Writer-only and explicitly OFF unless the exact feature gate is 1', () => {
    const cognition = COGNITION();
    expect(cognition).toMatch(
      /if \(response && process\.env\.MAIA_INVISIBLE_STANDING_SHADOW === '1'\) \{/,
    );
    expect(cognition.match(/runInvisibleStandingShadowSafely\(/g) ?? []).toHaveLength(1);
  });

  it('audits the exact finalized getMaiaResponse text and returns the same response variable', () => {
    const cognition = COGNITION();
    const resolved = cognition.indexOf('.then(r => {');
    const capture = cognition.indexOf('const response = r?.text ?? undefined;', resolved);
    const audit = cognition.indexOf('runInvisibleStandingShadowSafely({', capture);
    const returned = cognition.indexOf('return { ok: true, response };', audit);
    expect(resolved).toBeGreaterThanOrEqual(0);
    expect(capture).toBeGreaterThan(resolved);
    expect(audit).toBeGreaterThan(capture);
    expect(returned).toBeGreaterThan(audit);
    expect(cognition.slice(audit, returned)).not.toMatch(/\bresponse\s*=/);
  });

  it('does not await, assign, or route the shadow result into the response', () => {
    const cognition = COGNITION();
    const call = cognition.indexOf('runInvisibleStandingShadowSafely({');
    const lineStart = cognition.lastIndexOf('\n', call) + 1;
    const lineEnd = cognition.indexOf('\n', call);
    const line = cognition.slice(lineStart, lineEnd);
    expect(line).not.toContain('await');
    expect(line).not.toContain('=');
    expect(line.trim()).toBe('runInvisibleStandingShadowSafely({');
  });

  it('keeps the frontier-labeled maiaService free of shadow wiring', () => {
    expect(SERVICE()).not.toContain('runInvisibleStandingShadowSafely');
  });

  it('adds no second model, network, database, or persistence surface', () => {
    const shadow = SHADOW();
    expect(shadow).not.toMatch(/generateText|modelService|fetch\s*\(|query\s*\(|postgres|TurnsStore|addConversationExchange/);
    expect(shadow).not.toMatch(/async\s+function|Promise</);
  });

  it('cannot author replacement/member-facing prose by result shape', () => {
    const shadow = SHADOW();
    const auditInterface = shadow.slice(
      shadow.indexOf('export interface InvisibleStandingShadowAudit'),
      shadow.indexOf('interface EvidenceRow'),
    );
    expect(auditInterface).not.toMatch(/readonly\s+(?:text|response|replacement)\??\s*:/);
  });

  it('does not perturb the canonical handoff crossing', () => {
    const svc = SERVICE();
    expect(svc.match(/writerStudio\?\.onHandoff\?\.\(\)/g) ?? []).toHaveLength(1);
    const branch = svc.slice(svc.indexOf('if (writerStudioTurn) {'), svc.indexOf('switch (processingProfile)'));
    expect(branch.indexOf('generateText({')).toBeGreaterThanOrEqual(0);
    expect(branch.indexOf('onHandoff?.()')).toBeGreaterThan(branch.indexOf('generateText({'));
    expect(branch).not.toContain('runInvisibleStandingShadowSafely');
  });
});
