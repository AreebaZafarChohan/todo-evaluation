'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSession } from 'better-auth/client';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (!session) {
        // Redirect to sign in if not authenticated
        router.push('/signin');
      }
    };

    checkSession();
  }, [router]);

  // For now, just render children. The authentication check happens in the effect.
  // In a real app, you might want to show a loading spinner while checking session.
  return <>{children}</>;
}