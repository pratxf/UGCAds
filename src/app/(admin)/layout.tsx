// Auth gate is handled by middleware (see src/middleware.ts).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="dark">{children}</div>;
}
