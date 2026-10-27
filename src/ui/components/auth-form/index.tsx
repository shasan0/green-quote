'use client';

import { type SubmitEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ROUTES, URLS } from '@/src/lib/constants';
import { loginSchema, registerSchema } from '@/src/lib/schemas';
import { useApi } from '../useApi';
import Field from '../field';
import Button from '../button';

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const next = useSearchParams().get('next');
  const isRegister = mode === 'register';

  const { errors, formError, isSubmitting, execute } = useApi({
    url: isRegister ? URLS.REGISTER : URLS.LOGIN,
    schema: isRegister ? registerSchema : loginSchema,
    onSuccess: () => {
      router.push(next ?? '/');
      router.refresh();
    },
  });

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    execute(data);
  }

  return (
    <form className="form panel" onSubmit={onSubmit} noValidate aria-busy={isSubmitting}>
      {formError && (
        <div className="alert" role="alert">
          {formError}
        </div>
      )}
      {isRegister && (
        <Field type="text" name="fullName" label="Full name" error={errors.fullName} />
      )}
      <Field type="email" name="email" label="Email" error={errors.email} />
      <Field type="password" name="password" label="Password" error={errors.password} />
      <Button
        className="btn"
        type="submit"
        disabled={isSubmitting}
        label={isSubmitting ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
      />
      <p style={{ margin: 0 }}>
        {isRegister ? (
          <>
            Already have an account? <Link href={ROUTES.LOGIN}>Sign in</Link>
          </>
        ) : (
          <>
            New to GreenQuote? <Link href={ROUTES.REGISTER}>Create an account</Link>
          </>
        )}
      </p>
    </form>
  );
}
