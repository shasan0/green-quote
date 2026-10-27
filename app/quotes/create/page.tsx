import type { Metadata } from 'next';
import QuoteForm from '@/src/ui/components/quote-form';
import { getCurrentUser } from '@/src/lib/auth/server';
import { redirect } from 'next/navigation';
import { ROUTES } from '@/src/lib/constants';
import { Suspense } from 'react';
import { PageFallback } from '@/src/ui/components/PageFallback';

export const metadata: Metadata = { title: 'New quote' };

async function CreateQuoteContent() {
  const user = await getCurrentUser();
  if (!user) redirect(`${ROUTES.LOGIN}?next=${ROUTES.CREATE_NEW_QUOTE}`);

  return (
    <div className="page page--narrow" style={{ maxWidth: 760 }}>
      <div className="page-head">
        <div>
          <h1>Get pre-qualified</h1>
          <p>Takes about a minute. We show your offers immediately.</p>
        </div>
      </div>
      <QuoteForm defaultName={user.fullName} defaultEmail={user.email} />
    </div>
  );
}

export default function NewQuotePage() {
  return (
    <Suspense fallback={<PageFallback />}>
      <CreateQuoteContent />
    </Suspense>
  );
}
