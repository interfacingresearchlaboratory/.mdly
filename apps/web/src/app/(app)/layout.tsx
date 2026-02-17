"use client";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen w-full max-w-full min-w-0 overflow-hidden">
      <div className="flex-1 min-w-0 max-w-full overflow-hidden relative p-4">
        {children}
      </div>
    </div>
  );
}
