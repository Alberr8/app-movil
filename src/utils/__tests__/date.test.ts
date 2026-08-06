import { toLocalISODate } from '../date';

describe('toLocalISODate', () => {
  it('formats as YYYY-MM-DD with zero-padding', () => {
    expect(toLocalISODate(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('pads single-digit month and day', () => {
    expect(toLocalISODate(new Date(2026, 8, 9))).toBe('2026-09-09');
  });

  it('does not pad double-digit month and day', () => {
    expect(toLocalISODate(new Date(2026, 11, 25))).toBe('2026-12-25');
  });
});
