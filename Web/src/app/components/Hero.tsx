export default function Hero() {
  return (
    <section className="relative h-screen min-h-[700px] flex items-end overflow-hidden bg-navy">
      {/* Background placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-700 via-navy to-slate-900" />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/70 to-navy/30" />

      {/* Content */}
      <div className="relative z-10 w-full container-lg px-6 sm:px-8 lg:px-12 pb-32 md:pb-40">
        <div className="max-w-3xl">
          <div className="label mb-6 text-white/50">
            Restoration & Masonry
          </div>

          <h1 className="title-xl text-white mb-8">
            Precision craft
            <br />
            for structures that
            <br />
            <span className="italic text-crimson-light">endure.</span>
          </h1>

          <p className="body-lg text-white/50 max-w-xl mb-12">
            We restore and protect buildings across Ontario
            with an uncompromising commitment to quality, safety, and lasting
            results.
          </p>

          <div className="flex flex-wrap gap-4">
            <a
              href="#contact"
              className="group inline-flex items-center gap-3 bg-crimson text-white text-sm font-semibold tracking-wide px-8 py-4 hover:bg-crimson-dark transition-colors duration-300"
            >
              Request a Consultation
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
              </svg>
            </a>
            <a
              href="#services"
              className="inline-flex items-center gap-3 text-white/60 text-sm font-medium tracking-wide px-8 py-4 border border-white/15 hover:border-white/40 hover:text-white transition-all duration-300"
            >
              View Services
            </a>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="hidden lg:flex absolute bottom-0 right-0 z-10">
        {[
          { value: "10+", label: "Years" },
          { value: "50+", label: "Projects" },
          { value: "100%", label: "Satisfaction" },
        ].map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center justify-center w-36 h-28 ${
              i === 0
                ? "bg-white/10 backdrop-blur-md"
                : i === 1
                  ? "bg-white/[0.07] backdrop-blur-md"
                  : "bg-crimson"
            }`}
          >
            <span className="font-display text-2xl font-semibold text-white">
              {stat.value}
            </span>
            <span className="text-[11px] text-white/60 tracking-wider uppercase mt-1">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
