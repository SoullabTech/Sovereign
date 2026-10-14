import { calculateBirthChart } from '../ephemerisCalculator';

const fixed = {
  date:'2000-01-01', time:'12:00',
  location:{lat:0,lng:0,timezone:'UTC'},
  houseSystem:'porphyry' as const,
};

describe('ASTRO-CALC-PRIV calculator privacy and direct strict-core protections',()=>{
  it('generates a chart without dumping personal time, latitude, longitude or planetary vectors to console',async()=>{
    const log = jest.spyOn(console,'log').mockImplementation(()=>{});
    const err = jest.spyOn(console,'error').mockImplementation(()=>{});
    try {
      const value=await calculateBirthChart(fixed);
      expect(value.sun).toMatchObject({sign:'Capricorn'});
      expect(log).not.toHaveBeenCalled();
      expect(err).not.toHaveBeenCalled();
    } finally {
      log.mockRestore(); err.mockRestore();
    }
  });
  it('does not log or throw a private invalid date string',async()=>{
    const input='BIRTH_DATE_SECRET_VALUE';
    const log = jest.spyOn(console,'log').mockImplementation(()=>{});
    const err = jest.spyOn(console,'error').mockImplementation(()=>{});
    try {
      await expect(calculateBirthChart({...fixed,date:input})).rejects.toThrow('BIRTH_CHART_CALCULATION_UNAVAILABLE');
      expect(JSON.stringify(log.mock.calls)).not.toContain(input);
      expect(JSON.stringify(err.mock.calls)).not.toContain(input);
    } finally {
      log.mockRestore(); err.mockRestore();
    }
  });
  it('never silently substitutes Porphyry for strict-core Placidus or Koch',async()=>{
    for(const houseSystem of ['placidus','koch'] as const){
      await expect(calculateBirthChart({...fixed,qualityMode:'strict-core',houseSystem})).rejects.toThrow('BIRTH_CHART_CALCULATION_UNAVAILABLE');
    }
  });
  it('maintains legacy fallback mathematical behavior for old callers pending compatibility review',async()=>{
    const warn=jest.spyOn(console,'warn').mockImplementation(()=>{});
    try {
      const porphyry=await calculateBirthChart(fixed);
      const legacy=await calculateBirthChart({...fixed,houseSystem:'placidus'});
      expect(legacy.houses).toEqual(porphyry.houses);
    } finally {warn.mockRestore();}
  });
});
