import Link from 'next/link';
import { getQuotesForUser } from '@/src/services/quote';
import { ROUTES } from '@/src/lib/constants';
import { formatDate } from '@/src/utils/number-utils';
import { PageFallback } from '@/src/ui/components/PageFallback';
import { Suspense } from 'react';
import { getCurrentUser } from '@/src/lib/auth/server';
import { notFound, redirect } from 'next/navigation';
import { QuoteInfo } from '@/src/ui/components/quote-info';
import { ApiError } from '@/src/utils/api-errors';

interface QuotePageParams {
  params: Promise<{ id: string }>;
}

async function QuotesContnet({ params }: QuotePageParams) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);

  if (!user) {
    redirect(`${ROUTES.LOGIN}?next=${ROUTES.VIEW_QUOTE}/${encodeURIComponent(id)}`);
  }

  let quote;
  try {
    quote = await getQuotesForUser(user, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1>No Quote Found</h1>
            <p>We could not retrieve the requested quote information.</p>
          </div>
          <Link className="btn btn--ghost" href={ROUTES.VIEW_QUOTE}>
            View All Quotes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Your pre-qualification</h1>
          <p>
            Prepared {formatDate(quote.createdAt)} for {quote.owner.fullName}
          </p>
        </div>
        <Link className="btn btn--ghost" href="/quotes">
          All quotes
        </Link>
      </div>
      <QuoteInfo quote={quote} />
    </div>
  );
}

export default function QuotesPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <QuotesContnet params={params} />
    </Suspense>
  );
}
