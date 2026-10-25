import round from 'lodash.round';
import { BASE_APR_BY_BAND, CURRENCY, OFFER_TERMS_YEARS, PRICE_PER_KW, RISK_BAND_A_MAX_SYSTEM_SIZE_KW, RISK_BAND_A_MIN_MONTHLY_CONSUMPTION_KW, RISK_BAND_B_MIN_MONTHLY_CONSUMPTION_KW, RISK_BANDS, ROUNDING_DECIMALS } from './constants';

interface QuoteInput {
    monthlyConsumptionKw: number;
    systemSizeKw: number;
    downPayment: number;
}

interface Offer {
    termYears: number;
    apr: number;
    principalUsed: number;
    monthlyPayment: number;
}

const calculateSystemPrice = (systemSizeKw: number) =>
    round(systemSizeKw * PRICE_PER_KW, ROUNDING_DECIMALS);

const calculatePrincipalAmount = (systemPrice: number, downPayment: number) => 
    round(Math.max(systemPrice - downPayment), ROUNDING_DECIMALS);

const calculateRiskBand = (monthlyConsumptionKw: number, systemSizeKw: number) => {
    if (monthlyConsumptionKw >= RISK_BAND_A_MIN_MONTHLY_CONSUMPTION_KW && systemSizeKw <= RISK_BAND_A_MAX_SYSTEM_SIZE_KW) {
        return RISK_BANDS.A;
    }
    if (monthlyConsumptionKw >= RISK_BAND_B_MIN_MONTHLY_CONSUMPTION_KW) {
        return RISK_BANDS.B;
    }
    return RISK_BANDS.C;
}

const calculateMonthlyPayment = (principal: number, aprPercent: number, termYears: number): number => {
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
}

const generateOffers = (principalAmount: number, baseApr: number): Offer[] =>
    OFFER_TERMS_YEARS.map((termYears: number) => ({
        termYears,
        apr: baseApr,
        principalUsed: principalAmount,
        monthlyPayment: calculateMonthlyPayment(principalAmount, baseApr, termYears)
    }))

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
        offers: generateOffers(principalAmount, baseApr)
    }
}