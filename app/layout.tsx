import type { Metadata } from 'next';
import { Suspense, type ReactNode } from 'react';
import './globals.css';
import { HeaderShell, SiteHeader } from '@/src/ui/components/site-header';

export const metadata: Metadata = {
  title: { default: 'GreenQuote', template: '%s | GreenQuote' },
  description: 'Pre-qualify for residential solar financing in minutes.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to main content
        </a>
        <Suspense fallback={<HeaderShell />}>
          <SiteHeader />
        </Suspense>
        <main id="main" tabIndex={-1}>
          {children}
        </main>
      </body>
    </html>
  );
}
