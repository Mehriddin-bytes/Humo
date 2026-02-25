export default function WhyChooseUs() {
  const items = [
    {
      num: "01",
      title: "Licensed & Insured",
      text: "Fully licensed with WSIB coverage. We exceed all Ontario building codes and safety regulations.",
    },
    {
      num: "02",
      title: "Transparent Pricing",
      text: "Detailed, itemized quotes with no hidden fees. You know exactly what you\u2019re paying for before we begin.",
    },
    {
      num: "03",
      title: "On-Time, Every Time",
      text: "We plan meticulously and deliver on schedule. Delays cost everyone \u2014 we don\u2019t tolerate them.",
    },
    {
      num: "04",
      title: "Direct Communication",
      text: "One point of contact from start to finish. No runaround, no middlemen, no surprises.",
    },
  ];

  return (
    <section className="section-pad bg-navy text-white">
      <div className="container-lg">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-20">
          {/* Left */}
          <div className="lg:col-span-5">
            <div className="label mb-5 !text-crimson-light">Why Humo</div>
            <div className="w-12 h-[2px] bg-crimson mb-8" />
            <h2 className="title-lg text-white mb-8">
              Built on trust.
              <br />
              Proven by results.
            </h2>
            <p className="body-lg text-white/40">
              We don&apos;t cut corners. We don&apos;t overpromise. We show up, do
              exceptional work, and let our track record speak for itself.
            </p>
          </div>

          {/* Right — numbered list */}
          <div className="lg:col-span-7">
            <div className="divide-y divide-white/10">
              {items.map((item) => (
                <div
                  key={item.num}
                  className="group py-8 first:pt-0 last:pb-0 flex gap-6 md:gap-10"
                >
                  <span className="text-[13px] font-mono text-white/20 pt-1 flex-shrink-0">
                    {item.num}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-semibold text-white mb-2 group-hover:text-crimson-light transition-colors duration-300">
                      {item.title}
                    </h3>
                    <p className="text-sm text-white/40 leading-relaxed max-w-lg">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
