// T030: Protected layout with sidebar navigation
'use client';

import ProtectedLayoutComponent from '@/components/layout/ProtectedLayout';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedLayoutComponent>
      {children}
    </ProtectedLayoutComponent>
  );
}