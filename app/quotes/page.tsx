import { getCurrentUser } from '@/src/lib/auth/server';
import { ROUTES } from '@/src/lib/constants';
import { listQuotesForUser } from '@/src/services/quote';
import { PageFallback } from '@/src/ui/components/PageFallback';
import { QuoteDetails } from '@/src/ui/components/quote-details';
import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

export const metadata: Metadata = { title: 'My quotes' };

async function QuotesContent() {
  const user = await getCurrentUser();
  if (!user) redirect(`${ROUTES.LOGIN}?next=${ROUTES.CREATE_NEW_QUOTE}`);

  const quotes = await listQuotesForUser(user);

  return (
    <div className="page">
      <div className="page-head">
        <h1>All Quotes</h1>
        <Link className="btn" href={ROUTES.CREATE_NEW_QUOTE}>
          New Quote
        </Link>
      </div>
      <div>
        {quotes.length === 0 ? (
          <div className="empty">
            <h2>No Quotes</h2>
            <p style={{ margin: '0 auto 1rem' }}>
              Get your first pre-qualification to see financing offers here.
            </p>
            <Link className="btn" href={ROUTES.CREATE_NEW_QUOTE}>
              Get pre-qualified
            </Link>
          </div>
        ) : (
          <QuoteDetails quotes={quotes} caption="Your quotes" />
        )}
      </div>
    </div>
  );
}

export default function QuotesPage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <QuotesContent />
    </Suspense>
  );
}
