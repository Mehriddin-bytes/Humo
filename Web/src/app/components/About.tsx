export default function About() {
  return (
    <section id="about" className="section-pad bg-white overflow-hidden">
      <div className="container-lg">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Image Column */}
          <div className="lg:col-span-5 relative">
            <div className="relative">
              <div className="aspect-[3/4] bg-slate-100" />
              {/* Floating accent block */}
              <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-navy flex flex-col items-center justify-center text-center hidden md:flex">
                <span className="font-display text-4xl font-semibold text-white">
                  10+
                </span>
                <span className="text-[10px] text-white/50 tracking-widest-xl uppercase mt-2">
                  Years of
                  <br />
                  Excellence
                </span>
              </div>
            </div>
          </div>

          {/* Text Column */}
          <div className="lg:col-span-7">
            <div className="label mb-5">About Us</div>
            <div className="divider mb-8" />

            <h2 className="title-lg text-navy mb-8">
              We build to a standard,
              <br />
              not to a price.
            </h2>

            <div className="space-y-6 mb-12">
              <p className="body-md">
                Humo Restorations INC. is a full-service restoration and masonry
                firm proudly serving across Ontario. Since 2017, we
                have specialized in returning structures to their original
                strength and beauty — from heritage buildings to modern
                high-rises.
              </p>
              <p className="body-md">
                Our approach combines traditional masonry techniques with
                contemporary engineering, ensuring every project meets the
                highest standards of durability and craftsmanship. We are fully
                licensed, insured, and WSIB compliant.
              </p>
            </div>

            {/* Values */}
            <div className="grid sm:grid-cols-3 gap-8 pt-8 border-t border-slate-100">
              {[
                {
                  title: "Precision",
                  text: "Meticulous attention to detail in every joint, seal, and surface.",
                },
                {
                  title: "Safety",
                  text: "Industry-leading safety protocols. Zero compromises on every site.",
                },
                {
                  title: "Integrity",
                  text: "Honest timelines, transparent pricing, and clear communication.",
                },
              ].map((v) => (
                <div key={v.title}>
                  <h3 className="font-display text-lg font-semibold text-navy mb-2">
                    {v.title}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {v.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
