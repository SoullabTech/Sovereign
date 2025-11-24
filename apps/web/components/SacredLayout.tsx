export default function SacredLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-sacred-cosmic text-neutral-pure font-sans">
      <div className="max-w-4xl mx-auto p-md space-y-lg">
        {children}
      </div>
    </main>
  );
}