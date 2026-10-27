import type { Metadata } from 'next';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/server';
import { adminQuoteFilterSchema } from '@/src/lib/schemas';
import { ROUTES } from '@/src/lib/constants';
import { PageFallback } from '@/src/ui/components/PageFallback';
import { QuoteDetails } from '@/src/ui/components/quote-details';
import { listAllQuotes } from '@/src/services/quote';

export const metadata: Metadata = { title: 'All quotes' };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function AdminQuotesContent({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect(`${ROUTES.LOGIN}?next=${ROUTES.ADMIN_QUOTES}`);
  if (user.role !== 'admin') redirect(ROUTES.VIEW_QUOTE);

  const raw = await searchParams;
  const filter = adminQuoteFilterSchema.parse(raw);
  const quotes = await listAllQuotes(user, filter);
  const filtered = Boolean(filter.q || filter.userId);

  return (
    <div className="page">
      <div className="page-head">
        <h1>All quotes</h1>
      </div>

      <form className="panel" method="get" role="search" aria-label="Filter quotes">
        <div className="form-grid" style={{ alignItems: 'flex-end' }}>
          <div className="field">
            <label htmlFor="q">Search by name or email</label>
            <input id="q" name="q" type="search" defaultValue={filter.q ?? ''} />
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn" type="submit">
              Apply filters
            </button>
            {filtered && (
              <a className="btn btn--ghost" href="/admin/quotes">
                Clear
              </a>
            )}
          </div>
        </div>
      </form>

      <p aria-live="polite">
        {quotes.length} {quotes.length === 1 ? 'quote' : 'quotes'}
        {filtered ? ' match your filters' : ''}.
      </p>

      {quotes.length === 0 ? (
        <div className="empty">
          <h2>No quotes found</h2>
          <p style={{ margin: '0 auto' }}>
            {filtered
              ? 'Try a different name or email, or clear the filters.'
              : 'Quotes will appear here once customers create them.'}
          </p>
        </div>
      ) : (
        <QuoteDetails quotes={quotes} caption="All customer quotes" showOwner />
      )}
    </div>
  );
}

export default function AdminQuotesPage({ searchParams }: { searchParams: SearchParams }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <AdminQuotesContent searchParams={searchParams} />
    </Suspense>
  );
}
