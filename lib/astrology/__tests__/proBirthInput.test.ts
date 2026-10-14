import { resolveProBirthInput } from '../proBirthInput';

const base = {
  date: '2001-04-03',
  time: '12:30',
  location: { lat: 40.6, lng: -73.8, timezone: 'America/New_York' },
};

describe('Astrology Pro private preview birth-input resolution', () => {
  it('accepts explicit real coordinates and IANA timezone', () => {
    const result = resolveProBirthInput(base);
    expect(result).toEqual({ ...base, houseSystem: 'porphyry' });
  });
  it('allows explicit 0,0 and UTC without mistaking that for missing input', () => {
    expect(resolveProBirthInput({
      ...base,
      location: { lat: 0, lng: 0, timezone: 'UTC' },
    })?.location).toEqual({ lat: 0, lng: 0, timezone: 'UTC' });
  });
  it('rejects missing, null, or empty coordinates instead of fabricating 0,0', () => {
    for (const location of [
      { lng: -71, timezone: 'UTC' },
      { lat: 42, timezone: 'UTC' },
      { lat: null, lng: null, timezone: 'UTC' },
      { lat: '', lng: '', timezone: 'UTC' },
      { lat: 42, lng: '', timezone: 'UTC' },
      {},
    ]) {
      expect(resolveProBirthInput({ ...base, location })).toBeNull();
    }
  });
  it('rejects invalid coordinates, invalid or unknown timezones', () => {
    for (const location of [
      { lat: 91, lng: 0, timezone: 'UTC' },
      { lat: -91, lng: 0, timezone: 'UTC' },
      { lat: 40, lng: 181, timezone: 'UTC' },
      { lat: 40, lng: -181, timezone: 'UTC' },
      { lat: Number.NaN, lng: -75, timezone: 'UTC' },
      { lat: 0, lng: 0, timezone: '' },
      { lat: 0, lng: 0, timezone: 'Not/ARealZone' },
    ]) {
      expect(resolveProBirthInput({ ...base, location })).toBeNull();
    }
  });
  it('rejects invalid calendar and clock entries rather than computing the wrong sky', () => {
    for (const sample of [
      { date: '2001-02-30', time: '10:15' },
      { date: '2001-13-03', time: '10:15' },
      { date: '2001-04-03', time: '24:01' },
      { date: '2001-04-03', time: '12:99' },
      { date: 'April 3 2001', time: '12:00' },
      { date: '2001-04-03', time: '' },
    ]) {
      expect(resolveProBirthInput({ ...base, ...sample })).toBeNull();
    }
  });
  it('rejects array and wrong-shape input', () => {
    expect(resolveProBirthInput(null)).toBeNull();
    expect(resolveProBirthInput([])).toBeNull();
    expect(resolveProBirthInput('2001-04-03')).toBeNull();
    expect(resolveProBirthInput({ ...base, location: [] })).toBeNull();
  });
  it('accepts historical year 0099 without mapping to 1999', () => {
    expect(resolveProBirthInput({ ...base, date: '0099-04-03' })?.date).toBe('0099-04-03');
  });
});
