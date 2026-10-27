import { randomUUID } from 'node:crypto';
import { getDb } from '../db';
import { CREATE_QUOTE, FIND_QUOTE_BY_ID, LIST_QUOTES_FOR_USER, QUOTE_SELECT } from '../queries';
import type { Offer } from '../pricing';
import { RiskBandTypes } from '../constants';

export interface QuoteRecord {
  id: string;
  userId: string;
  createdAt: string;
  owner: { fullName: string; email: string };
  inputs: {
    fullName: string;
    email: string;
    address: string;
    monthlyConsumptionKw: number;
    systemSizeKw: number;
    downPayment: number;
  };
  derived: {
    currency: string;
    systemPrice: number;
    principalAmount: number;
    riskBand: RiskBandTypes;
    baseApr: number;
  };
  offers: Offer[];
}

interface QuoteRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  address: string;
  monthly_consumption_kw: number;
  system_size_kw: number;
  down_payment: number;
  currency: string;
  system_price: number;
  principal_amount: number;
  risk_band: RiskBandTypes;
  base_apr: number;
  offers_json: Offer[];
  created_at: string;
  owner_name: string;
  owner_email: string;
}

const toRecord = (r: QuoteRow): QuoteRecord => ({
  id: r.id,
  userId: r.user_id,
  createdAt: r.created_at,
  owner: { fullName: r.full_name, email: r.email },
  inputs: {
    fullName: r.full_name,
    email: r.email,
    address: r.address,
    monthlyConsumptionKw: r.monthly_consumption_kw,
    systemSizeKw: r.system_size_kw,
    downPayment: r.down_payment,
  },
  derived: {
    currency: r.currency,
    systemPrice: r.system_price,
    principalAmount: r.principal_amount,
    riskBand: r.risk_band,
    baseApr: r.base_apr,
  },
  offers: r.offers_json,
});

export type NewQuote = Omit<QuoteRecord, 'id' | 'createdAt' | 'owner'>;

export const create = async (q: NewQuote): Promise<QuoteRecord | null> => {
  const id = randomUUID();

  await getDb().query(CREATE_QUOTE, [
    id,
    q.userId,
    q.inputs.fullName,
    q.inputs.email,
    q.inputs.address,
    q.inputs.monthlyConsumptionKw,
    q.inputs.systemSizeKw,
    q.inputs.downPayment,
    q.derived.currency,
    q.derived.systemPrice,
    q.derived.principalAmount,
    q.derived.riskBand,
    q.derived.baseApr,
    JSON.stringify(q.offers),
  ]);

  return findById(id)!;
};

export const findById = async (id: string): Promise<QuoteRecord | null> => {
  const result = await getDb().query(FIND_QUOTE_BY_ID, [id]);
  const row = result?.rows?.[0] as QuoteRow | undefined;

  return row ? toRecord(row) : null;
};

export const listByUser = async (id: string) => {
  const result = await getDb().query<QuoteRow>(LIST_QUOTES_FOR_USER, [id]);

  return result.rows.map(toRecord);
};

export const listAll = async (
  filter: { q?: string; userId?: string } = {},
): Promise<QuoteRecord[]> => {
  const where: string[] = [];
  const params: string[] = [];
  let paramIndex = 1;

  if (filter.userId) {
    where.push(`q.user_id = $${paramIndex++}`);
    params.push(filter.userId);
  }

  if (filter.q) {
    const like = `%${filter.q.replace(/[\\%_]/g, '\\$&')}%`;
    where.push(
      `(u.full_name LIKE $${paramIndex++} ESCAPE '\\' OR u.email LIKE $${paramIndex++} ESCAPE '\\')`,
    );
    params.push(like, like);
  }

  const sql = `${QUOTE_SELECT} ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                 ORDER BY q.created_at DESC, q.id DESC`;

  const result = await getDb().query<QuoteRow>(sql, params);
  return result.rows.map(toRecord);
};
