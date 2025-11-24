export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 py-12">
      {/* Soullab Header */}
      <div className="mb-12">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-md shadow-sm flex items-center justify-center">
            <span className="text-white text-sm font-semibold">SL</span>
          </div>
          <span className="text-xl font-light tracking-tight text-gray-900">
            Soullab
          </span>
        </div>
      </div>

      <div className="w-full max-w-2xl space-y-8">
        {children}
      </div>
    </main>
  );
}