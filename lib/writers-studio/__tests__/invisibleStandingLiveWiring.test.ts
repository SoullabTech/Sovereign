/** JARVIS-MAIA-INVISIBLE-STANDING-SHADOW-02 · production wiring contract. */

import fs from 'fs';
import path from 'path';

const CODE = (rel: string) => fs.readFileSync(path.join(process.cwd(), rel), 'utf8');

const SERVICE = () => CODE('lib/sovereign/maiaService.ts');
const SHADOW = () => CODE('lib/writers-studio/invisibleStandingShadow.ts');

describe('Invisible Standing live-shadow wiring', () => {
  it('is Writer-only and explicitly OFF unless the exact feature gate is 1', () => {
    const svc = SERVICE();
    expect(svc).toMatch(
      /if \(writerStudioTurn && process\.env\.MAIA_INVISIBLE_STANDING_SHADOW === '1'\) \{/,
    );
    expect(svc.match(/runInvisibleStandingShadowSafely\(/g) ?? []).toHaveLength(1);
  });

  it('audits the last stable member-facing text after all text-mutating scrubs and before return', () => {
    const svc = SERVICE();
    const finalScrub = svc.indexOf('text = scrubIdentityDisclaimers({');
    const audit = svc.indexOf('runInvisibleStandingShadowSafely({');
    const finalReturn = svc.indexOf('return {', audit);
    expect(finalScrub).toBeGreaterThanOrEqual(0);
    expect(audit).toBeGreaterThan(finalScrub);
    expect(finalReturn).toBeGreaterThan(audit);

    const betweenAuditAndReturn = svc.slice(audit, finalReturn);
    // The audit may READ finalText: text; nothing may assign a new member-facing text afterwards.
    expect(betweenAuditAndReturn).not.toMatch(/\btext\s*=/);
  });

  it('does not await, assign, or route the shadow result into member-visible output', () => {
    const svc = SERVICE();
    const call = svc.indexOf('runInvisibleStandingShadowSafely({');
    const lineStart = svc.lastIndexOf('\n', call) + 1;
    const lineEnd = svc.indexOf('\n', call);
    const line = svc.slice(lineStart, lineEnd);
    expect(line).not.toContain('await');
    expect(line).not.toContain('=');
    expect(line.trim()).toBe('runInvisibleStandingShadowSafely({');
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
