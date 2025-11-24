import InteractiveDiamondSystem from '@/components/diamond/InteractiveDiamondSystem';

export default function DiamondPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0e1a] to-black py-12">
      <InteractiveDiamondSystem />

      {/* Additional info section */}
      <div className="max-w-4xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-black/40 backdrop-blur-md border border-[#d4b896]/20 rounded-lg p-6">
            <h3 className="text-xl font-light text-[#d4b896] mb-4 tracking-wide">
              💎 Like a Diamond
            </h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-[#d4b896]">•</span>
                <span>Many facets - Each feature serves transformation differently</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4b896]">•</span>
                <span>One essence - All work together for wholeness</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4b896]">•</span>
                <span>Reflects light - Your truth illuminated through interaction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4b896]">•</span>
                <span>Formed under pressure - Growth through the sacred work</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#d4b896]">•</span>
                <span>Precious - Every moment, every pattern matters</span>
              </li>
            </ul>
          </div>

          <div className="bg-black/40 backdrop-blur-md border border-[#d4b896]/20 rounded-lg p-6">
            <h3 className="text-xl font-light text-[#d4b896] mb-4 tracking-wide">
              🌀 The Sacred Loop
            </h3>
            <div className="text-gray-400 text-sm space-y-4">
              <p>
                Engage → Deepen → Listen → Reflect → Guide → Spiral → Evolve
              </p>
              <p className="text-center text-[#d4b896]/60">↓ ↑</p>
              <p className="text-center">
                Your evolution feeds the system.<br />
                The system's evolution serves your growth.
              </p>
              <p className="text-center italic text-[#d4b896]/80">
                Sacred reciprocity.
              </p>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="mt-12 text-center">
          <blockquote className="text-lg text-[#d4b896]/80 italic font-light tracking-wide">
            "Like a diamond formed under pressure, your transformation is
            precious, multifaceted, and unbreakable."
          </blockquote>
        </div>
      </div>
    </div>
  );
}