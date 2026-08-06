import { getWeekKey, getWeekEnd } from '../storage';

describe('getWeekKey', () => {
  it('assigns the same ISO week key to Monday and Sunday of the same week', () => {
    const monday = new Date(2026, 7, 3); // 2026-08-03, a Monday
    const sunday = new Date(2026, 7, 9); // 2026-08-09, that week's Sunday
    expect(getWeekKey(monday)).toBe(getWeekKey(sunday));
  });

  it('assigns different week keys across a week boundary', () => {
    const sunday = new Date(2026, 7, 9);
    const nextMonday = new Date(2026, 7, 10);
    expect(getWeekKey(sunday)).not.toBe(getWeekKey(nextMonday));
  });

  it('formats as YYYY-Www', () => {
    expect(getWeekKey(new Date(2026, 7, 3))).toMatch(/^2026-W\d{2}$/);
  });
});

describe('getWeekEnd', () => {
  it('returns a Sunday at 23:59:59.999', () => {
    const midweek = new Date(2026, 7, 5); // Wednesday
    const end = getWeekEnd(midweek);
    expect(end.getDay()).toBe(0); // Sunday
    expect(end.getHours()).toBe(23);
    expect(end.getMinutes()).toBe(59);
    expect(end.getSeconds()).toBe(59);
  });

  it('keeps a Sunday input as the same day', () => {
    const sunday = new Date(2026, 7, 9);
    const end = getWeekEnd(sunday);
    expect(end.getDate()).toBe(sunday.getDate());
  });
});
