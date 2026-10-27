import { QuoteRecord } from '@/src/lib/repositories/quotes';
import { formatMoney, formatNumber, formatPercent } from '@/src/utils/number-utils';
import { RiskBand } from '../risk-band';
import { AmortizationSchedule } from '../amortization-schedule';
import { BAND_NOTE, MAX_TERM } from '@/src/lib/constants';

export function QuoteInfo({ quote }: { quote: QuoteRecord }) {
  const { inputs, derived, offers } = quote;
  const money = (n: number) => formatMoney(n, derived.currency);

  return (
    <>
      <section className="panel" aria-labelledby="summary-heading">
        <h2 id="summary-heading">Your system</h2>
        <dl className="summary-grid">
          <div className="stat">
            <dt>System price</dt>
            <dd>{money(derived.systemPrice)}</dd>
          </div>
          <div className="stat">
            <dt>Amount financed</dt>
            <dd>{money(derived.principalAmount)}</dd>
          </div>
          <div className="stat">
            <dt>Risk band</dt>
            <dd>
              <RiskBand band={derived.riskBand} />
            </dd>
          </div>
        </dl>
        <p style={{ margin: '1rem 0 0', color: 'var(--ink-soft)' }}>
          {BAND_NOTE[derived.riskBand]} Base APR {formatPercent(Number(derived.baseApr))}.
        </p>
      </section>

      <section aria-labelledby="offers-heading" style={{ marginBottom: '1.5rem' }}>
        <h2 id="offers-heading">Financing offers</h2>
        <ul className="offers">
          {offers.map((o) => (
            <li key={o.termYears} className="offer">
              <div className="offer__term">{o.termYears} years</div>
              <div className="offer__bar" aria-hidden="true">
                <span style={{ width: `${(o.termYears / MAX_TERM) * 100}%` }} />
              </div>
              <p className="offer__payment">{money(o.monthlyPayment)}</p>
              <p className="offer__per">per month</p>
              <dl>
                <dt>APR</dt>
                <dd>{formatPercent(o.apr)}</dd>
                <dt>Principal</dt>
                <dd>{money(o.principalUsed)}</dd>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <AmortizationSchedule offers={offers} currency={derived.currency} />

      <section className="panel" aria-labelledby="inputs-heading">
        <h2 id="inputs-heading">What you told us</h2>
        <dl className="facts">
          <dt>Name</dt>
          <dd>{inputs.fullName}</dd>
          <dt>Email</dt>
          <dd>{inputs.email}</dd>
          <dt>Address</dt>
          <dd>{inputs.address}</dd>
          <dt>Monthly consumption</dt>
          <dd>{formatNumber(inputs.monthlyConsumptionKw)} kWh</dd>
          <dt>System size</dt>
          <dd>{formatNumber(inputs.systemSizeKw)} kW</dd>
          <dt>Down payment</dt>
          <dd>{money(inputs.downPayment)}</dd>
        </dl>
      </section>
    </>
  );
}
