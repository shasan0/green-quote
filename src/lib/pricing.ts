import round from 'lodash.round';
import {
  BASE_APR_BY_BAND,
  CURRENCY,
  OFFER_TERMS_YEARS,
  PRICE_PER_KW,
  RISK_BAND_A_MAX_SYSTEM_SIZE_KW,
  RISK_BAND_A_MIN_MONTHLY_CONSUMPTION_KW,
  RISK_BAND_B_MIN_MONTHLY_CONSUMPTION_KW,
  RISK_BANDS,
  ROUNDING_DECIMALS,
} from './constants';

interface QuoteInput {
  monthlyConsumptionKw: number;
  systemSizeKw: number;
  downPayment: number;
}

export interface Offer {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
}

export interface ScheduleRow {
  month: number;
  payment: number;
  interest: number;
  principal: number;
  balance: number;
}

export const calculateSystemPrice = (systemSizeKw: number) =>
  round(systemSizeKw * PRICE_PER_KW, ROUNDING_DECIMALS);

export const calculatePrincipalAmount = (systemPrice: number, downPayment: number) =>
  round(Math.max(systemPrice - downPayment, 0), ROUNDING_DECIMALS);

export const calculateRiskBand = (monthlyConsumptionKw: number, systemSizeKw: number) => {
  if (
    monthlyConsumptionKw >= RISK_BAND_A_MIN_MONTHLY_CONSUMPTION_KW &&
    systemSizeKw <= RISK_BAND_A_MAX_SYSTEM_SIZE_KW
  ) {
    return RISK_BANDS.A;
  }
  if (monthlyConsumptionKw >= RISK_BAND_B_MIN_MONTHLY_CONSUMPTION_KW) {
    return RISK_BANDS.B;
  }
  return RISK_BANDS.C;
};

export const calculateMonthlyPayment = (
  principal: number,
  aprPercent: number,
  termYears: number,
): number => {
  const termMonths = termYears * 12;
  if (principal <= 0) {
    return 0;
  }

  const interestRate = aprPercent / 100 / 12;
  if (interestRate === 0) {
    return round(principal / termMonths, 2);
  }

  const payment = (principal * interestRate) / (1 - Math.pow(1 + interestRate, -termMonths));
  return round(payment, 2);
};

export const generateOffers = (principalAmount: number, baseApr: number): Offer[] =>
  OFFER_TERMS_YEARS.map((termYears: number) => ({
    termYears,
    apr: baseApr,
    principalUsed: principalAmount,
    monthlyPayment: calculateMonthlyPayment(principalAmount, baseApr, termYears),
  }));

export const generateQuote = (quoteInput: QuoteInput) => {
  const { monthlyConsumptionKw, systemSizeKw, downPayment = 0 } = quoteInput;

  const systemPrice = calculateSystemPrice(systemSizeKw);
  const principalAmount = calculatePrincipalAmount(systemPrice, downPayment);
  const riskBand = calculateRiskBand(monthlyConsumptionKw, systemSizeKw);
  const baseApr = BASE_APR_BY_BAND[riskBand];

  return {
    currency: CURRENCY,
    systemPrice,
    principalAmount,
    riskBand,
    baseApr,
    offers: generateOffers(principalAmount, baseApr),
  };
};

export function getAmortizationSchedule(offer: Offer): ScheduleRow[] {
  const n = offer.termYears * 12;
  const r = offer.apr / 100 / 12;
  const rows: ScheduleRow[] = [];
  let balance = offer.principalUsed;
  for (let month = 1; month <= n && balance > 0; month++) {
    const interest = round(balance * r, ROUNDING_DECIMALS);
    let payment = offer.monthlyPayment;
    let principal = round(payment - interest, ROUNDING_DECIMALS);
    if (month === n || principal > balance) {
      principal = round(balance, ROUNDING_DECIMALS);
      payment = round(principal + interest, ROUNDING_DECIMALS);
    }
    balance = round(balance - principal, ROUNDING_DECIMALS);
    rows.push({ month, payment, interest, principal, balance });
  }
  return rows;
}
