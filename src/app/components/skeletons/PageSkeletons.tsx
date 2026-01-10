export function HomeSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--aura-cream)]">
      <section className="h-screen bg-[var(--aura-deep-brown)]/20">
        <div className="h-full max-w-7xl mx-auto px-6 lg:px-12 flex items-center">
          <div className="space-y-6 w-full max-w-2xl animate-pulse">
            <div className="h-4 w-32 bg-white/30" />
            <div className="space-y-4">
              <div className="h-12 bg-white/40" />
              <div className="h-12 bg-white/30 w-5/6" />
            </div>
            <div className="h-20 bg-white/40" />
            <div className="flex gap-4">
              <div className="h-12 w-32 bg-white/40" />
              <div className="h-12 w-32 bg-white/20" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-12">
          <div className="space-y-6 animate-pulse">
            <div className="h-4 w-24 bg-[var(--aura-nude)]/60" />
            <div className="h-10 bg-[var(--aura-nude)]/60 w-4/5" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={`copy-${index}`} className="h-4 bg-[var(--aura-nude)]/50" />
              ))}
            </div>
            <div className="flex gap-4">
              <div className="h-12 w-32 bg-[var(--aura-nude)]/60" />
              <div className="h-12 w-32 bg-[var(--aura-nude)]/40" />
            </div>
          </div>
          <div className="h-[500px] bg-[var(--aura-nude)]/40 animate-pulse" />
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`badge-${index}`} className="space-y-4 animate-pulse">
              <div className="h-16 w-16 bg-[var(--aura-nude)]/40" />
              <div className="h-6 bg-[var(--aura-nude)]/60" />
              <div className="h-4 bg-[var(--aura-nude)]/40" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`service-${index}`} className="space-y-4 bg-white p-6 animate-pulse">
              <div className="h-48 bg-[var(--aura-nude)]/40" />
              <div className="h-6 bg-[var(--aura-nude)]/60 w-2/3" />
              <div className="h-4 bg-[var(--aura-nude)]/40" />
              <div className="h-4 bg-[var(--aura-nude)]/30" />
              <div className="h-4 bg-[var(--aura-nude)]/30 w-1/2" />
              <div className="h-10 bg-[var(--aura-nude)]/50 w-32" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 space-y-6 animate-pulse">
          <div className="h-8 bg-[var(--aura-nude)]/60" />
          <div className="h-4 bg-[var(--aura-nude)]/40" />
          <div className="h-12 bg-[var(--aura-nude)]/60 w-40 mx-auto" />
        </div>
      </section>
    </div>
  );
}

export function ServicesSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--aura-cream)]">
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center space-y-4 animate-pulse">
          <div className="h-4 w-32 bg-[var(--aura-nude)]/60 mx-auto" />
          <div className="h-12 bg-[var(--aura-nude)]/60 mx-auto w-2/3" />
          <div className="h-4 bg-[var(--aura-nude)]/40 mx-auto w-1/2" />
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 space-y-8">
          <div className="grid md:grid-cols-3 gap-4 animate-pulse">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`tab-${index}`} className="h-12 bg-[var(--aura-nude)]/40" />
            ))}
          </div>

          <div className="space-y-8">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={`service-row-${index}`} className="grid lg:grid-cols-2 gap-8 animate-pulse">
                <div className="h-64 bg-[var(--aura-nude)]/30" />
                <div className="space-y-4">
                  <div className="h-7 bg-[var(--aura-nude)]/60 w-2/3" />
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((__, copyIndex) => (
                      <div key={`copy-${index}-${copyIndex}`} className="h-4 bg-[var(--aura-nude)]/40" />
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-[var(--aura-nude)]/40" />
                    <div className="h-10 bg-[var(--aura-nude)]/30" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[var(--aura-deep-brown)]/10">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-8 animate-pulse">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`instruction-${index}`} className="h-24 bg-white/70" />
          ))}
        </div>
      </section>
    </div>
  );
}

export function AboutSkeleton() {
  return (
    <div className="min-h-screen bg-[var(--aura-cream)]">
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-6 animate-pulse">
          <div className="h-4 w-32 bg-[var(--aura-nude)]/60" />
          <div className="h-16 w-3/4 bg-[var(--aura-nude)]/60" />
          <div className="h-4 w-2/3 bg-[var(--aura-nude)]/40" />
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-16 animate-pulse">
          <div className="h-[500px] bg-[var(--aura-nude)]/30" />
          <div className="space-y-6">
            <div className="h-12 bg-[var(--aura-nude)]/60 w-3/4" />
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={`about-copy-${index}`} className="h-4 bg-[var(--aura-nude)]/40" />
            ))}
            <div className="h-20 bg-[var(--aura-nude)]/30 w-2/3" />
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-[var(--aura-cream)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-2 gap-8 animate-pulse">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`about-qual-${index}`} className="bg-white p-8 space-y-4">
              <div className="h-16 w-16 bg-[var(--aura-nude)]/40" />
              <div className="h-6 bg-[var(--aura-nude)]/60 w-2/3" />
              <div className="h-4 bg-[var(--aura-nude)]/40" />
              <div className="h-4 bg-[var(--aura-nude)]/30 w-5/6" />
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 lg:py-32 bg-[var(--aura-deep-brown)]/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 grid md:grid-cols-3 gap-8 animate-pulse">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={`about-cert-${index}`} className="h-72 bg-white/70" />
          ))}
        </div>
      </section>
    </div>
  );
}
