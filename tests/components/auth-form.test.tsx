// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { push, refresh, execute, useApiMock, searchParamsGet } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  execute: vi.fn(),
  searchParamsGet: vi.fn(),
  useApiMock: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, refresh }),
  useSearchParams: () => ({ get: searchParamsGet }),
}));
vi.mock('@/src/ui/components/useApi', () => ({ useApi: useApiMock }));
vi.mock('@/src/ui/components/../useApi', () => ({ useApi: useApiMock }));
vi.mock('@/src/ui/components/field', () => ({
  default: (props: any) => (
    <label>
      {props.label}
      <input name={props.name} type={props.type} />
    </label>
  ),
}));
vi.mock('@/src/ui/components/button', () => ({
  default: ({ label, ...props }: any) => <button {...props}>{label}</button>,
}));

import { AuthForm } from '@/src/ui/components/auth-form';

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    searchParamsGet.mockReturnValue(null);
    useApiMock.mockReturnValue({ errors: {}, formError: '', isSubmitting: false, execute });
  });

  it('renders login fields and the registration link', () => {
    render(<AuthForm mode="login" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Create an account' })).toHaveAttribute(
      'href',
      '/register',
    );
  });

  it('includes the full-name field and account-creation action in register mode', () => {
    render(<AuthForm mode="register" />);
    expect(screen.getByLabelText('Full name')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create account' })).toBeInTheDocument();
  });

  it('shows API errors and disables the submit action while submitting', () => {
    useApiMock.mockReturnValue({
      errors: {},
      formError: 'Unable to sign in',
      isSubmitting: true,
      execute,
    });
    render(<AuthForm mode="login" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Unable to sign in');
    expect(screen.getByRole('button', { name: 'Please wait…' })).toBeDisabled();
  });
});
