import { validatePredictorCustody } from '@/lib/voice/predictors/modelCustody';

const base = {
  identity: { provider: 'maai' as const, modelId: 'candidate', weightLicense: 'MIT' },
  localWeightPath: '/opt/soullab/models/turn/candidate.pt',
  sha256: 'a'.repeat(64),
  commercialUseAllowed: true,
};

describe('TURN-02 predictor weight custody', () => {
  it('accepts only exact verified local custody', () => {
    expect(validatePredictorCustody(base)).toEqual(base);
  });
  it('refuses unverified or noncommercial weights', () => {
    expect(() => validatePredictorCustody({ ...base, identity: { ...base.identity, weightLicense: 'UNVERIFIED' } })).toThrow(/license/);
    expect(() => validatePredictorCustody({ ...base, commercialUseAllowed: false })).toThrow(/commercial/);
  });
  it('refuses implicit/network model resolution', () => {
    expect(() => validatePredictorCustody({ ...base, localWeightPath: 'maai-kyoto/vap_en' })).toThrow(/absolute/);
    expect(() => validatePredictorCustody({ ...base, localWeightPath: 'https://huggingface.co/model.pt' })).toThrow(/absolute|network/);
  });
  it('requires a pinned digest', () => {
    expect(() => validatePredictorCustody({ ...base, sha256: 'latest' })).toThrow(/sha256/);
  });
});
