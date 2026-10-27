'use client';

import { getAmortizationSchedule, Offer } from '@/src/lib/pricing';
import { formatMoney } from '@/src/utils/number-utils';
import { useId, useMemo, useState } from 'react';

export function AmortizationSchedule({ offers, currency }: { offers: Offer[]; currency: string }) {
  const selectId = useId();
  const [termYears, setTermYears] = useState(offers[0]?.termYears ?? 5);
  const offer = offers.find((o) => o.termYears === termYears) ?? offers[0];

  const rows = useMemo(() => (offer ? getAmortizationSchedule(offer) : []), [offer]);
  if (!offer) return null;

  const totalInterest = rows.reduce((sum, r) => sum + r.interest, 0);
  const money = (n: number) => formatMoney(n, currency);

  return (
    <details className="panel">
      <summary>Amortization schedule</summary>
      <div className="schedule-controls">
        <div className="field">
          <label htmlFor={selectId}>Loan term</label>
          <select
            id={selectId}
            value={termYears}
            onChange={(e) => setTermYears(Number(e.target.value))}
          >
            {offers.map((o) => (
              <option key={o.termYears} value={o.termYears}>
                {o.termYears} years
              </option>
            ))}
          </select>
        </div>
        <p style={{ margin: 0 }} aria-live="polite">
          Total interest over {offer.termYears} years: <strong>{money(totalInterest)}</strong>.
          Total repaid: <strong>{money(offer.principalUsed + totalInterest)}</strong>.
        </p>
      </div>
      <div
        className="table-wrap schedule-scroll"
        tabIndex={0}
        role="region"
        aria-label="Amortization schedule table"
      >
        <table>
          <caption className="visually-hidden">
            Month-by-month payments for the {offer.termYears}-year offer
          </caption>
          <thead>
            <tr>
              <th scope="col" className="num">
                Month
              </th>
              <th scope="col" className="num">
                Payment
              </th>
              <th scope="col" className="num">
                Principal
              </th>
              <th scope="col" className="num">
                Interest
              </th>
              <th scope="col" className="num">
                Balance
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.month}>
                <td className="num">{r.month}</td>
                <td className="num">{money(r.payment)}</td>
                <td className="num">{money(r.principal)}</td>
                <td className="num">{money(r.interest)}</td>
                <td className="num">{money(r.balance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
