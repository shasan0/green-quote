import { CURRENCY } from '../lib/constants';

export const formatDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(iso));

export const formatNumber = (n: number) => new Intl.NumberFormat('en-US').format(n);

export const formatPercent = (n: number) => `${n.toFixed(1)}%`;

export const formatMoney = (amount: number, currency = CURRENCY) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
