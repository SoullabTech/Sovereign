import {
  consumeReadOnceConsent,
  evaluateLiveConsent,
  revokeLiveConsent,
} from '../consentLifecycle';

const baseGrant={
  consentRef:'consent:r2',
  memberRef:'member:fixture',
  grantedBy:'member' as const,
  granted:true as const,
  purpose:'aether_reflection' as const,
  persistenceAllowed:false as const,
  deliveryAllowed:false as const,
  promptMutationAllowed:false as const,
  productionEscalationAllowed:false as const,
};

describe('AIN-AETHER-LIVE-ADAPTER-01R2 consent lifecycle',()=>{
  test('read-once consent is valid before use and consumed after one use',()=>{
    const grant={...baseGrant,scope:'aether_read_once' as const};
    const lifecycle={
      consentRef:grant.consentRef,
      grantedAt:'2026-09-28T16:00:00-04:00',
      expiresAt:'2026-09-28T17:00:00-04:00',
    };
    const request={
      memberRef:grant.memberRef,
      consentRef:grant.consentRef,
      now:'2026-09-28T16:30:00-04:00',
    };

    const before=evaluateLiveConsent(grant,lifecycle,request);
    expect(before.valid).toBe(true);
    expect(before.consumeOnUse).toBe(true);
    expect(before.reusable).toBe(false);

    const consumed=consumeReadOnceConsent(grant,lifecycle,'2026-09-28T16:31:00-04:00');
    const after=evaluateLiveConsent(grant,consumed,{
      ...request,
      now:'2026-09-28T16:32:00-04:00',
    });
    expect(after.valid).toBe(false);
    expect(after.state).toBe('consumed');
    expect(after.errors).toContain('consent_already_consumed');
  });

  test('session consent is reusable only inside matching session before expiry',()=>{
    const grant={...baseGrant,scope:'aether_session_read' as const};
    const lifecycle={
      consentRef:grant.consentRef,
      grantedAt:'2026-09-28T16:00:00-04:00',
      expiresAt:'2026-09-28T17:00:00-04:00',
      sessionRef:'session:fixture',
    };
    const valid=evaluateLiveConsent(grant,lifecycle,{
      memberRef:grant.memberRef,
      consentRef:grant.consentRef,
      sessionRef:'session:fixture',
      now:'2026-09-28T16:30:00-04:00',
    });
    expect(valid.valid).toBe(true);
    expect(valid.reusable).toBe(true);

    const wrongSession=evaluateLiveConsent(grant,lifecycle,{
      memberRef:grant.memberRef,
      consentRef:grant.consentRef,
      sessionRef:'session:other',
      now:'2026-09-28T16:31:00-04:00',
    });
    expect(wrongSession.valid).toBe(false);
    expect(wrongSession.errors).toContain('session_ref_mismatch');
  });

  test('expired consent fails closed',()=>{
    const grant={...baseGrant,scope:'aether_read_once' as const};
    const result=evaluateLiveConsent(grant,{
      consentRef:grant.consentRef,
      grantedAt:'2026-09-28T15:00:00-04:00',
      expiresAt:'2026-09-28T16:00:00-04:00',
    },{
      memberRef:grant.memberRef,
      consentRef:grant.consentRef,
      now:'2026-09-28T16:00:00-04:00',
    });
    expect(result.valid).toBe(false);
    expect(result.state).toBe('expired');
    expect(result.errors).toContain('consent_expired');
  });

  test('revoked consent fails closed even before normal expiry',()=>{
    const grant={...baseGrant,scope:'aether_session_read' as const};
    const lifecycle=revokeLiveConsent({
      consentRef:grant.consentRef,
      grantedAt:'2026-09-28T15:00:00-04:00',
      expiresAt:'2026-09-28T18:00:00-04:00',
      sessionRef:'session:fixture',
    },'2026-09-28T16:20:00-04:00');
    const result=evaluateLiveConsent(grant,lifecycle,{
      memberRef:grant.memberRef,
      consentRef:grant.consentRef,
      sessionRef:'session:fixture',
      now:'2026-09-28T16:30:00-04:00',
    });
    expect(result.valid).toBe(false);
    expect(result.state).toBe('revoked');
    expect(result.errors).toContain('consent_revoked');
  });

  test('member or consent mismatch fails closed',()=>{
    const grant={...baseGrant,scope:'aether_read_once' as const};
    const lifecycle={
      consentRef:grant.consentRef,
      grantedAt:'2026-09-28T16:00:00-04:00',
      expiresAt:'2026-09-28T17:00:00-04:00',
    };
    const result=evaluateLiveConsent(grant,lifecycle,{
      memberRef:'member:other',
      consentRef:'consent:other',
      now:'2026-09-28T16:30:00-04:00',
    });
    expect(result.valid).toBe(false);
    expect(result.state).toBe('invalid');
    expect(result.errors).toEqual(expect.arrayContaining([
      'request_consent_ref_mismatch',
      'request_member_mismatch',
    ]));
  });
});
