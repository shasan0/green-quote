import { RiskBandTypes } from '@/src/lib/constants';

export function RiskBand({ band }: { band: RiskBandTypes }) {
  return (
    <span className={`band band--${band}`}>
      <span className="visually-hidden">Risk band</span>
      {band}
    </span>
  );
}
