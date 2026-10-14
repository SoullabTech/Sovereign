import { POST } from '../route';
import { calculateBirthChart, type BirthChart } from '@/lib/astrology/ephemerisCalculator';

jest.mock('@/lib/astrology/ephemerisCalculator', () => ({
  ...jest.requireActual('@/lib/astrology/ephemerisCalculator'),
  calculateBirthChart: jest.fn(),
}));
jest.mock('@/lib/astrology/alienPatterns', () => ({
  detectAlienPatterns: jest.fn().mockReturnValue([]),
}));

const mockedCalculator = calculateBirthChart as jest.MockedFunction<typeof calculateBirthChart>;
const DOB = '1985-03-15', CLOCK = '14:30';
const base = {
  date: DOB, time: CLOCK, houseSystem: 'porphyry',
  location: { lat: 40.7128, lng: -74.006, timezone: 'America/New_York' },
};
const chart = {
  sun: { sign:'Pisces', degree:25.16, house:8, retrograde:false },
  moon: { sign:'Capricorn', degree:20.56, house:6, retrograde:false },
  houses: [134.2,160.83,187.46,214.09,247.46,280.83,314.2,340.83,7.46,34.09,67.46,100.83],
  ascendant: {sign:'Leo',degree:14.2},
  midheaven: {sign:'Taurus',degree:4.09},
  aspects:[],
} as unknown as BirthChart;
async function send(body:unknown) {
  const req = { json:async()=>body } as any;
  const response = await POST(req);
  return {response, data:await response.json()};
}

beforeEach(()=> {
  jest.clearAllMocks();
  mockedCalculator.mockResolvedValue(chart);
});

describe('ASTRO-CALC-PRIV API redaction and opt-in strict-core', () => {
  it('preserves legacy chart contract, redacts logs, uses true Porphyry default and no-store',async()=>{
    const infoSpy=jest.spyOn(console,'log').mockImplementation(()=>{});
    const errorSpy=jest.spyOn(console,'error').mockImplementation(()=>{});
    try {
      const {response,data}=await send({...base,houseSystem:undefined});
      expect(response.status).toBe(200);
      expect(data.chart).toEqual(chart);
      expect(data.data).toEqual(chart);
      expect(data.input.houseSystem).toBe('porphyry');
      expect(data.calculationQuality.actualHouseSystem).toBe('porphyry');
      expect(data.calculationQuality.independentlyCertified).toBe(false);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(mockedCalculator).toHaveBeenCalledWith(expect.objectContaining({
        houseSystem:'porphyry',
      }));
      expect(infoSpy).not.toHaveBeenCalled();
      expect(errorSpy).not.toHaveBeenCalled();
    } finally { infoSpy.mockRestore(); errorSpy.mockRestore(); }
  });

  it('honestly labels legacy faux Placidus as Porphyry, never certified',async()=>{
    const {response,data}=await send({...base,houseSystem:'placidus'});
    expect(response.status).toBe(200);
    expect(data.calculationQuality.requestedHouseSystem).toBe('placidus');
    expect(data.calculationQuality.actualHouseSystem).toBe('porphyry');
    expect(data.calculationQuality.warnings).toContain('requested_house_system_approximated');
  });

  it('refuses faux Placidus or Koch in strict-core BEFORE invoking the calculator',async()=>{
    for(const houseSystem of ['placidus','koch']){
      const {response,data}=await send({...base,calculationProfile:'strict-core',houseSystem});
      expect(response.status).toBe(422);
      expect(data.error).toBe('HOUSE_SYSTEM_UNSUPPORTED');
    }
    expect(mockedCalculator).not.toHaveBeenCalled();
  });

  it('refuses nonexistent/ambiguous DST wall times and missing zone in strict-core',async()=>{
    const cases = [
      {...base,date:'2024-03-10',time:'02:30'},
      {...base,date:'2024-11-03',time:'01:30'},
      {...base,location:{lat:0,lng:0}},
    ];
    for(const test of cases){
      const {response}=await send({...test,calculationProfile:'strict-core'});
      expect(response.status).toBe(422);
    }
    expect(mockedCalculator).not.toHaveBeenCalled();
  });

  it('admits valid strict-core time and carries explicit uncertified quality facts',async()=>{
    const {response,data}=await send({...base,calculationProfile:'strict-core'});
    expect(response.status).toBe(200);
    expect(data.calculationQuality.profile).toBe('strict-core');
    expect(data.calculationQuality.actualHouseSystem).toBe('porphyry');
    expect(data.calculationQuality.approximateBodies).toContain('chiron');
    expect(data.calculationQuality.independentlyCertified).toBe(false);
    expect(mockedCalculator).toHaveBeenCalledWith(expect.objectContaining({qualityMode:'strict-core'}));
  });

  it('does not disclose raw exceptions or raw birth values when the calculator fails',async()=>{
    const birthSentinel = 'PERSONAL-BIRTHDATA-DO-NOT-LOG';
    mockedCalculator.mockRejectedValue(new Error(birthSentinel));
    const logSpy=jest.spyOn(console,'error').mockImplementation(()=>{});
    try {
      const {response,data}=await send({...base,date:'1985-03-15'});
      expect(response.status).toBe(500);
      expect(data).toEqual({error:'Birth chart calculation failed'});
      expect(JSON.stringify(data)).not.toContain(birthSentinel);
      expect(response.headers.get('cache-control')).toBe('private, no-store');
      expect(JSON.stringify(logSpy.mock.calls)).not.toContain(birthSentinel);
    } finally {logSpy.mockRestore();}
  });

  it('rejects an unknown quality/profile mode instead of falling back to legacy',async()=>{
    const {response,data}=await send({...base,calculationProfile:'NO-GATE'});
    expect(response.status).toBe(400);
    expect(data.error).toBe('unsupported_calculation_profile');
    expect(mockedCalculator).not.toHaveBeenCalled();
  });
});
