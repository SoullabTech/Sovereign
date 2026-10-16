/**
 * Static regression for the password-only *candidate* beta entrance.
 * The actual browser journey remains a separate final release gate.
 */
import fs from 'node:fs';
import path from 'node:path';
const src = fs.readFileSync(path.join(process.cwd(),'components/auth/UnifiedAuth.tsx'),'utf8');
describe('Closed-beta entry is a deliberate, single supported authentication path',()=>{
 it('does not offer a biometric pathway before it is consent-qualified',()=>{
  expect(src).toContain('const offerBiometric = !betaInvitationOnly &&');
 });
 it('does not blindly redirect a previously signed-in beta visitor toward Studio',()=>{
  expect(src).toContain('if (betaInvitationOnly) return; // Only the verified sign-in response');
 });
 it('ignores account-creation query parameters and starts at the qualified password entry',()=>{
  expect(src).toContain("betaInvitationOnly ? 'password' : preVerified");
 });
 it('server-directed beta stages distinguish Studio, consent and custody-only entry',()=>{
  expect(src).toContain("data.betaCustodyOnly === true");
  expect(src).toContain("window.location.assign('/beta/custody')");
  expect(src).toContain("data.betaConsentRequired === true");
  expect(src).toContain("window.location.assign('/beta/consent')");
 });
});
