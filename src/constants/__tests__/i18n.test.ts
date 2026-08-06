import { strings, t, SPORTS } from '../i18n';

describe('strings ES/EN parity', () => {
  it('has the exact same set of keys in both languages', () => {
    const esKeys = Object.keys(strings.es).sort();
    const enKeys = Object.keys(strings.en).sort();
    expect(enKeys).toEqual(esKeys);
  });

  it('never returns undefined for any key in either language', () => {
    for (const key of Object.keys(strings.es)) {
      expect(t(key as keyof typeof strings.es, 'es')).toBeDefined();
      expect(t(key as keyof typeof strings.es, 'en')).toBeDefined();
    }
  });
});

describe('SPORTS', () => {
  it('gives every sport a non-empty label in both languages', () => {
    for (const sport of SPORTS) {
      expect(sport.labelEs.length).toBeGreaterThan(0);
      expect(sport.labelEn.length).toBeGreaterThan(0);
    }
  });

  it('has unique keys', () => {
    const keys = SPORTS.map(s => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
