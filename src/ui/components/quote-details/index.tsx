import Link from 'next/link';
import { RiskBand } from '../risk-band';
import { QuoteRecord } from '@/src/lib/repositories/quotes';
import { formatDate, formatMoney, formatNumber } from '@/src/utils/number-utils';
import { ROUTES } from '@/src/lib/constants';

export function QuoteDetails({
  quotes,
  caption,
  showOwner = false,
}: {
  quotes: QuoteRecord[];
  caption: string;
  showOwner?: boolean;
}) {
  return (
    <div className="table-wrap">
      <table>
        <caption className="visually-hidden">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Date</th>
            {showOwner && <th scope="col">Customer</th>}
            <th scope="col" className="num">
              System size
            </th>
            <th scope="col" className="num">
              Price
            </th>
            <th scope="col">Risk band</th>
            <th scope="col">
              <span className="visually-hidden">Details</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {quotes.map((q) => (
            <tr key={q.id}>
              <td>{formatDate(q.createdAt)}</td>
              {showOwner && (
                <td>
                  {q.owner.fullName}
                  <br />
                  <span style={{ color: 'var(--ink-soft)', fontSize: '0.88rem' }}>
                    {q.owner.email}
                  </span>
                </td>
              )}
              <td className="num">{formatNumber(q.inputs.systemSizeKw)} kW</td>
              <td className="num">{formatMoney(q.derived.systemPrice, q.derived.currency)}</td>
              <td>
                <RiskBand band={q.derived.riskBand} />
              </td>
              <td>
                <Link href={`${ROUTES.VIEW_QUOTE}/${q.id}`}>
                  View<span className="visually-hidden"> quote from {formatDate(q.createdAt)}</span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
