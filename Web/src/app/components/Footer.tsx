"use client";

export default function Footer() {
  return (
    <footer className="bg-navy text-white/40">
      {/* Main Footer */}
      <div className="container-lg px-6 sm:px-8 lg:px-12 py-16 md:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <div className="flex items-baseline gap-1.5 mb-5">
              <span className="font-display text-2xl font-bold tracking-wide text-white">
                HUMO
              </span>
              <span className="text-[11px] font-sans font-bold tracking-widest-xl uppercase text-white">
                RESTORATIONS
              </span>
              <span className="text-[9px] font-sans font-medium tracking-widest-xl uppercase text-white/50">
                INC.
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Premium restoration and masonry services across Ontario
              Building excellence since 2015.
            </p>
          </div>

          {/* Navigation */}
          <div className="lg:col-span-2">
            <h4 className="text-[11px] font-semibold tracking-widest-xl uppercase text-white/20 mb-5">
              Navigate
            </h4>
            <ul className="space-y-3 text-sm">
              {["Services", "About", "Projects", "Contact"].map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase()}`}
                    className="hover:text-white transition-colors duration-200"
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-semibold tracking-widest-xl uppercase text-white/20 mb-5">
              Services
            </h4>
            <ul className="space-y-3 text-sm">
              {[
                "Balcony Restoration",
                "Masonry & Brick",
                "Waterproofing",
                "Concrete Repair",
                "Protective Coatings",
              ].map((s) => (
                <li key={s}>
                  <a
                    href="#services"
                    className="hover:text-white transition-colors duration-200"
                  >
                    {s}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-3">
            <h4 className="text-[11px] font-semibold tracking-widest-xl uppercase text-white/20 mb-5">
              Get in Touch
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="mailto:info@humorestorations.ca" className="hover:text-white transition-colors duration-200">
                  info@humorestorations.ca
                </a>
              </li>
              <li>
                <a href="tel:+16476699339" className="hover:text-white transition-colors duration-200">
                  +1 (647) 669-9339
                </a>
              </li>
              <li>
                <a
                  href="https://maps.apple.com/?address=131+Whitmore+Rd+Unit+24,+Woodbridge,+ON"
                  onClick={(e) => {
                    const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
                    if (!isApple) {
                      e.preventDefault();
                      window.open("https://www.google.com/maps/place/Humo+Restorations/@43.7853627,-79.5570338,17z", "_blank");
                    }
                  }}
                  className="hover:text-white transition-colors duration-200"
                >
                  131 Whitmore Rd Unit 24, Woodbridge, ON
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.06]">
        <div className="container-lg px-6 sm:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/25">
          <p>&copy; 2026 Humo Restorations INC.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white/50 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white/50 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
