export const CURRENCY = 'USD';

export const ROUNDING_DECIMALS = 2;
export const PRICE_PER_KW = 1200;

export const BAND_NOTE = {
  A: 'Strong fit: high usage with a right-sized system.',
  B: 'Good fit: your usage supports a standard rate.',
  C: 'Higher rate: low usage relative to the system.',
} as const;

export const MAX_TERM = 15;

export const RISK_BANDS = {
  A: 'A',
  B: 'B',
  C: 'C',
} as const;

export type RiskBandTypes = (typeof RISK_BANDS)[keyof typeof RISK_BANDS];

export const RISK_BAND_A_MIN_MONTHLY_CONSUMPTION_KW = 400;
export const RISK_BAND_A_MAX_SYSTEM_SIZE_KW = 6;
export const RISK_BAND_B_MIN_MONTHLY_CONSUMPTION_KW = 250;

export const BASE_APR_BY_BAND = {
  A: 6.9,
  B: 8.9,
  C: 11.9,
};

export const OFFER_TERMS_YEARS = [5, 10, 15] as const;

export const URLS = {
  CREATE_QUOTE: '/api/quotes',
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  LOGOUT: '/api/auth/logout',
} as const;

export const ROUTES = {
  VIEW_QUOTE: '/quotes',
  CREATE_NEW_QUOTE: '/quotes/create',
  LOGIN: '/login',
  REGISTER: '/register',
  ADMIN_QUOTES: '/admin/quotes',
} as const;

export const UNIQUE_VOILATION_CODE = '23505';
