"use client";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full max-w-full min-w-0">
      <div className="flex-1 min-w-0 max-w-full relative p-4">
        {children}
      </div>
    </div>
  );
}
