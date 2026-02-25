const projects = [
  {
    title: "Midtown Condo Complex",
    category: "Balcony Restoration",
    span: "md:col-span-2 md:row-span-2",
    aspect: "aspect-square md:aspect-auto md:h-full",
  },
  {
    title: "Heritage Brick Facade",
    category: "Masonry",
    span: "",
    aspect: "aspect-[4/3]",
  },
  {
    title: "Underground Garage",
    category: "Waterproofing",
    span: "",
    aspect: "aspect-[4/3]",
  },
  {
    title: "Commercial Tower",
    category: "Concrete Repair",
    span: "",
    aspect: "aspect-[4/3]",
  },
  {
    title: "Residential Exterior",
    category: "Coatings",
    span: "",
    aspect: "aspect-[4/3]",
  },
];

export default function Gallery() {
  return (
    <section id="gallery" className="section-pad bg-white">
      <div className="container-lg">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16 md:mb-20">
          <div>
            <div className="label mb-5">Portfolio</div>
            <div className="divider mb-8" />
            <h2 className="title-lg text-navy">
              Selected projects
            </h2>
          </div>
          <p className="body-md max-w-md">
            A selection of completed work across the GTA. Each project reflects
            our commitment to quality and precision.
          </p>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid md:grid-cols-3 gap-3">
          {projects.map((p) => (
            <div
              key={p.title}
              className={`group relative overflow-hidden cursor-pointer bg-slate-100 ${p.span} ${p.aspect}`}
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent z-[1]" />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[2]">
                <span className="text-[10px] font-semibold tracking-widest-xl uppercase text-white/50">
                  {p.category}
                </span>
                <h3 className="font-display text-lg md:text-xl font-semibold text-white mt-1 group-hover:text-crimson-light transition-colors duration-300">
                  {p.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
