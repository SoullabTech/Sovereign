import { admitProCalculation, matchingUtcInstants } from '../proCalculationPolicy';

const base = {
  date:'2024-03-12', time:'14:30',
  location: {lat:40.7128,lng:-74.006,timezone:'America/New_York'},
  houseSystem:'porphyry',
};
const reject = (value:unknown, expected:string) => {
  const result=admitProCalculation(value);
  expect(result).toEqual({ok:false,error:expected});
};

describe('ASTRO-CALC-PRIV strict-core admission fails closed',()=>{
  it('accepts an unambiguous local time with a real UTC instant and Porphyry',()=>{
    const output=admitProCalculation(base);
    expect(output.ok).toBe(true);
    if(!output.ok) return;
    expect(output.actualHouseSystem).toBe('porphyry');
    expect(output.verifiedUtc).toBe('2024-03-12T18:30:00.000Z');
    expect(output.birthData.qualityMode).toBe('strict-core');
  });
  it('accepts UTC and explicit valid 0,0',()=>{
    const a=admitProCalculation({...base,location:{lat:0,lng:0,timezone:'UTC'},houseSystem:'whole-sign'});
    expect(a.ok).toBe(true);
    if(a.ok) expect(a.verifiedUtc).toBe('2024-03-12T14:30:00.000Z');
  });
  it('refuses faux Placidus and Koch instead of silently returning Porphyry',()=>{
    reject({...base,houseSystem:'placidus'},'HOUSE_SYSTEM_UNSUPPORTED');
    reject({...base,houseSystem:'koch'},'HOUSE_SYSTEM_UNSUPPORTED');
    reject({...base,houseSystem:'a-new-method'},'HOUSE_SYSTEM_UNSUPPORTED');
  });
  it('refuses missing/invalid longitude/latitude, including null zero alias',()=>{
    for(const location of [
      {lng:0,timezone:'UTC'}, {lat:0,timezone:'UTC'},
      {lat:null,lng:null,timezone:'UTC'},
      {lat:0,lng:Number.NaN,timezone:'UTC'},
      {lat:0,lng:181,timezone:'UTC'},
      {lat:90,lng:0,timezone:'UTC'},
    ]) {
      expect(admitProCalculation({...base,location}).ok).toBe(false);
    }
    reject({...base,location:{lat:66,lng:0,timezone:'UTC'}},'LATITUDE_UNVERIFIED');
  });
  it('refuses missing and invalid zones instead of longitude-time approximation',()=>{
    reject({...base,location:{lat:0,lng:0}},'TIMEZONE_REQUIRED');
    reject({...base,location:{lat:0,lng:0,timezone:'Invalid/Zone'}},'TIMEZONE_INVALID');
  });
  it('detects spring DST nonexistent wall times as impossible',()=>{
    expect(matchingUtcInstants('2024-03-10','02:30','America/New_York')).toEqual([]);
    reject({...base,date:'2024-03-10',time:'02:30'},'TIME_NONEXISTENT');
  });
  it('detects fall DST duplicate instants without guessing an interpretation',()=>{
    expect(matchingUtcInstants('2024-11-03','01:30','America/New_York')).toEqual([
      '2024-11-03T05:30:00.000Z','2024-11-03T06:30:00.000Z',
    ]);
    reject({...base,date:'2024-11-03',time:'01:30'},'TIME_AMBIGUOUS');
  });
  it('accepts a spring DST valid time',()=>{
    const a=admitProCalculation({...base,date:'2024-03-10',time:'03:30'});
    expect(a.ok).toBe(true);
    if(a.ok) expect(a.verifiedUtc).toBe('2024-03-10T07:30:00.000Z');
  });
  it('refuses invalid calendar and clock dates without leaking birth details in the error',()=>{
    reject({...base,date:'2024-02-30'},'INVALID_BIRTH_DATE');
    reject({...base,time:'25:01'},'INVALID_BIRTH_TIME');
    reject({...base,time:'12:30:30'},'INVALID_BIRTH_TIME');
    reject({...base,date:'hello'},'INVALID_BIRTH_DATE');
    reject(null,'INVALID_REQUEST');
  });
  it('accepts supported equal houses',()=>{
    const a=admitProCalculation({...base,houseSystem:'equal'});
    expect(a.ok).toBe(true);
    if(a.ok) expect(a.actualHouseSystem).toBe('equal');
  });
});
