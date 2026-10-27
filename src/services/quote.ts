import { generateQuote } from '../lib/pricing';
import { create, findById, listAll, listByUser, QuoteRecord } from '../lib/repositories/quotes';
import { User } from '../lib/repositories/users';
import { CreateQuote } from '../lib/schemas';
import { ApiError } from '../utils/api-errors';

export const createQuote = async (user: User, input: CreateQuote): Promise<QuoteRecord | null> => {
  const result = generateQuote(input);
  const record = await create({
    userId: user.id,
    inputs: {
      fullName: input.fullName,
      email: input.email,
      address: input.address,
      monthlyConsumptionKw: input.monthlyConsumptionKw,
      systemSizeKw: input.systemSizeKw,
      downPayment: input.downPayment,
    },
    derived: {
      currency: result.currency,
      systemPrice: result.systemPrice,
      principalAmount: result.principalAmount,
      riskBand: result.riskBand,
      baseApr: result.baseApr,
    },
    offers: result.offers,
  });

  return record;
};

export const getQuotesForUser = async (user: User, id: string) => {
  const quote = await findById(id);
  if (!quote) throw ApiError.notFound('Quote not found');
  if (quote.userId !== user.id && user.role !== 'admin') throw ApiError.forbidden();
  return quote;
};

export const listQuotesForUser = (user: User) => listByUser(user.id);

export const listAllQuotes = (user: User, filter: { q?: string; userId?: string }) => {
  if (user.role !== 'admin') throw ApiError.forbidden('Admin access required');
  return listAll(filter);
};
