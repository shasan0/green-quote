import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/src/ui/components/auth-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <div className="page page--narrow">
      <h1>Sign in</h1>
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
