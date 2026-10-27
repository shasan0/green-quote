import Link from 'next/link';
import { getCurrentUser } from '@/src/lib/auth/server';
import { SignOutButton } from '../sign-out-button';
import { ROUTES } from '@/src/lib/constants';

export function HeaderShell({
  children,
  href = '/',
}: {
  children?: React.ReactNode;
  href?: string;
}) {
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link href={href} className="brand">
          <span className="brand__sun" aria-hidden="true" />
          GreenQuote
        </Link>
        {children}
      </div>
    </header>
  );
}

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <HeaderShell href={user ? '/quotes' : '/'}>
      <nav className="nav" aria-label="Main">
        {user ? (
          <>
            <Link href={ROUTES.VIEW_QUOTE}>My quotes</Link>
            <Link href={ROUTES.CREATE_NEW_QUOTE}>New quote</Link>
            {user.role === 'admin' && <Link href={ROUTES.ADMIN_QUOTES}>All quotes</Link>}
          </>
        ) : (
          <>
            <Link href={ROUTES.LOGIN}>Sign in</Link>
            <Link href={ROUTES.REGISTER}>Create account</Link>
          </>
        )}
      </nav>
      {user && (
        <div className="userbox">
          <span>{user.fullName}</span>
          <SignOutButton />
        </div>
      )}
    </HeaderShell>
  );
}
