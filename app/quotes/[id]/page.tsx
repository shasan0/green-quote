import Link from 'next/link';
import { getQuoteById } from "@/src/services/quote";
import { ROUTES } from '@/src/lib/constants';
import { formatDate } from '@/src/utils/date-utils';
import { QuoteDetails } from '@/src/ui/components/quote-details';
import { PageFallback } from '@/src/ui/components/PageFallback';
import { Suspense } from 'react';

interface QuotePageParams {
  params: Promise<{ id: string }>;
}

async function QuotesContnet({ params }: QuotePageParams) {
    const { id } = await params;

    let quote;
    try {
        quote = await getQuoteById(Number(id));
    } catch (error) {
        return (
            <div>
                <p>No Quote Found</p>
                <Link href={ROUTES.VIEW_QUOTE}>View All Quotes</Link>
            </div>
        )
    }

    return (
        <div className="page">
            <div className="page-head">
                <div>
                    <h1>Your pre-qualification</h1>
                    <p>
                        Prepared {formatDate(quote.createdAt)} for {quote.fullName}
                    </p>
                </div>
                <Link className="btn btn--ghost" href="/quotes">
                    All quotes
                </Link>
            </div>
            <QuoteDetails quote={quote} />
        </div>
    )
}

export default function QuotesPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<PageFallback />}>
      <QuotesContnet params={params} />
    </Suspense>
  );
}