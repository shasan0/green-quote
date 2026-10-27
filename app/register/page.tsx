import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/src/ui/components/auth-form';

export const metadata: Metadata = { title: 'Create account' };

export default function RegisterPage() {
  return (
    <div className="page page--narrow">
      <h1>Create your account</h1>
      <Suspense>
        <AuthForm mode="register" />
      </Suspense>
    </div>
  );
}
