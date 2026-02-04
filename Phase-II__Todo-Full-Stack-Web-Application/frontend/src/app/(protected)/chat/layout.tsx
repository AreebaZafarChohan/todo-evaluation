// T005: Chat layout - no need for extra wrapper since (protected) already has ProtectedLayout
export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
