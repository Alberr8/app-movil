import { distributeScore, weightedRandom } from '../scoring';

describe('distributeScore', () => {
  it('splits the total across the 5 breakdown fields so they sum back to it', () => {
    for (let total = 5; total <= 10; total++) {
      const b = distributeScore(total);
      const sum = b.coordination + b.fit + b.appropriateness + b.trend + b.completeness;
      expect(sum).toBe(total);
    }
  });

  it('keeps every field within the 0-2 range', () => {
    for (let i = 0; i < 50; i++) {
      const total = 5 + Math.floor(Math.random() * 6); // 5..10
      const b = distributeScore(total);
      for (const v of [b.coordination, b.fit, b.appropriateness, b.trend, b.completeness]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(2);
      }
    }
  });
});

describe('weightedRandom', () => {
  it('always returns a value between 5 and 10', () => {
    for (let i = 0; i < 200; i++) {
      const score = weightedRandom();
      expect(score).toBeGreaterThanOrEqual(5);
      expect(score).toBeLessThanOrEqual(10);
    }
  });
});
