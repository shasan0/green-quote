import Link from 'next/link';
import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/src/lib/auth/server';
import { PageFallback } from '@/src/ui/components/PageFallback';

export default function Home() {
  return (
    <Suspense fallback={<PageFallback />}>
      <HomeContent />
    </Suspense>
  );
}

async function HomeContent() {
  if (await getCurrentUser()) redirect('/quotes');

  return (
    <div className="page">
      <section className="hero">
        <h1>See what your rooftop solar could cost per month.</h1>
        <p>
          Tell us about your home and the system you have in mind. You get a price, a risk band, and
          three financing offers (5, 10 and 15 years) right away. Pre-qualifying does not affect
          your credit.
        </p>
        <div className="hero__actions">
          <Link className="btn" href="/register">
            Create an account
          </Link>
          <Link className="btn btn--ghost" href="/login">
            Sign in
          </Link>
        </div>
      </section>
    </div>
  );
}
