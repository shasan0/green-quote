'use client';

import { ROUTES, URLS } from '@/src/lib/constants';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function SignOutButton() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setBusy(true);
    await fetch(URLS.LOGOUT, { method: 'POST' });
    router.push(ROUTES.LOGIN);
    router.refresh();
  }

  return (
    <button type="button" className="btn btn--ghost btn--small" onClick={signOut} disabled={busy}>
      Sign out
    </button>
  );
}
