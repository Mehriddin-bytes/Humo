const services = [
  {
    num: "01",
    title: "Balcony Restoration",
    description:
      "Complete structural restoration including concrete repair, waterproof membranes, and railing replacement. We return balconies to full safety and aesthetics.",
  },
  {
    num: "02",
    title: "Masonry & Brick",
    description:
      "Expert brick and stone repair, repointing, and heritage restoration. We maintain structural integrity while preserving architectural character.",
  },
  {
    num: "03",
    title: "Caulking & Sealant",
    description:
      "Professional envelope sealing to prevent water infiltration. We protect your building against moisture damage and energy loss.",
  },
  {
    num: "04",
    title: "Waterproofing",
    description:
      "Comprehensive below-grade and above-grade waterproofing systems for foundations, garages, and rooftops. Permanent moisture protection.",
  },
  {
    num: "05",
    title: "Concrete Repair",
    description:
      "Structural concrete restoration including crack injection, spall repair, and carbon fiber reinforcement for lasting durability.",
  },
  {
    num: "06",
    title: "Protective Coatings",
    description:
      "High-performance architectural coatings that shield surfaces from weathering while enhancing visual appeal. Built to last.",
  },
];

export default function Services() {
  return (
    <section id="services" className="section-pad bg-slate-50">
      <div className="container-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
          <div>
            <div className="label mb-5">Services</div>
            <div className="divider mb-8" />
            <h2 className="title-lg text-navy">
              What we do
            </h2>
          </div>
          <p className="body-md max-w-md">
            Six core disciplines, one uncompromising standard. Every service
            is delivered with the same precision and care.
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-slate-200">
          {services.map((s) => (
            <div
              key={s.num}
              className="group bg-white p-8 md:p-10 flex flex-col"
            >
              {/* Number */}
              <span className="text-[11px] font-mono text-slate-300 tracking-wider mb-6">
                {s.num}
              </span>

              {/* Image placeholder */}
              <div className="relative h-44 mb-6 overflow-hidden bg-slate-100" />

              <h3 className="font-display text-xl font-semibold text-navy mb-3 group-hover:text-crimson transition-colors duration-300">
                {s.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed flex-1">
                {s.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
