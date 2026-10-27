import { describe, expect, it } from 'vitest';
import {
  getAmortizationSchedule,
  generateOffers,
  calculatePrincipalAmount,
  calculateSystemPrice,
  calculateRiskBand,
  calculateMonthlyPayment,
  generateQuote,
} from '@/src/lib/pricing';

describe('risk band', () => {
  it.each([
    [400, 6, 'A'],
    [500, 4, 'A'],
    [400, 6.1, 'B'], // too large for A, consumption still qualifies for B
    [399, 3, 'B'],
    [250, 10, 'B'],
    [249, 3, 'C'],
    [100, 2, 'C'],
  ])('consumption=%d kWh, size=%d kW -> %s', (kwh, kw, band) => {
    expect(calculateRiskBand(kwh, kw)).toBe(band);
  });
});

describe('price and principal', () => {
  it('prices at 1200 per kW', () => {
    expect(calculateSystemPrice(5)).toBe(6000);
    expect(calculateSystemPrice(4.5)).toBe(5400);
  });
  it('subtracts the down payment and never goes negative', () => {
    expect(calculatePrincipalAmount(6000, 1000)).toBe(5000);
    expect(calculatePrincipalAmount(6000, 9000)).toBe(0);
  });
});

describe('monthlyPayment', () => {
  it('matches the standard amortization formula', () => {
    // 10,000 at 6.9% over 5 years -> 197.54 (reference calculator value)
    expect(calculateMonthlyPayment(10_000, 6.9, 5)).toBeCloseTo(197.54, 2);
  });
  it('handles a zero principal and a zero rate', () => {
    expect(calculateMonthlyPayment(0, 6.9, 5)).toBe(0);
    expect(calculateMonthlyPayment(1200, 0, 1)).toBe(100);
  });
  it('is lower for longer terms', () => {
    const [five, ten, fifteen] = generateOffers(8000, 8.9).map((o) => o.monthlyPayment);
    expect(five).toBeGreaterThan(ten);
    expect(ten).toBeGreaterThan(fifteen);
  });
});

describe('priceQuote', () => {
  it('returns three offers at the band APR on the net principal', () => {
    const r = generateQuote({ monthlyConsumptionKw: 450, systemSizeKw: 5, downPayment: 1000 });
    expect(r).toMatchObject({
      systemPrice: 6000,
      principalAmount: 5000,
      riskBand: 'A',
      baseApr: 6.9,
    });
    expect(r.offers.map((o) => o.termYears)).toEqual([5, 10, 15]);
    expect(r.offers.every((o) => o.apr === 6.9 && o.principalUsed === 5000)).toBe(true);
  });
  it('uses the higher APR for band C', () => {
    const r = generateQuote({ monthlyConsumptionKw: 100, systemSizeKw: 3, downPayment: 0 });
    expect(r.riskBand).toBe('C');
    expect(r.baseApr).toBe(11.9);
  });
});

describe('amortizationSchedule', () => {
  const [offer] = generateOffers(5000, 6.9);
  const rows = getAmortizationSchedule(offer);

  it('has one row per month and ends at a zero balance', () => {
    expect(rows).toHaveLength(60);
    expect(rows.at(-1)!.balance).toBe(0);
  });
  it('repays exactly the principal', () => {
    const repaid = rows.reduce((sum, r) => sum + r.principal, 0);
    expect(repaid).toBeCloseTo(5000, 2);
  });
  it('front-loads interest', () => {
    expect(rows[0].interest).toBeGreaterThan(rows[59].interest);
  });
});
