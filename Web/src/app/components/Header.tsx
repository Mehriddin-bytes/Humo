"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { label: "Services", href: "#services" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "/projects" },
    { label: "Contact", href: "#contact" },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white/95 backdrop-blur-lg shadow-[0_1px_0_0_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      }`}
    >
      <div className="container-lg flex items-center justify-between h-20 md:h-24 px-6 sm:px-8 lg:px-12">
        {/* Logo */}
        <a href="#" className="relative z-10 flex items-center gap-2">
          <Image
            src="/assets/logo.png"
            alt="Humo"
            width={180}
            height={56}
            priority
            className={`h-14 md:h-16 w-auto transition-all duration-500 ${
              scrolled ? "" : "brightness-0 invert"
            }`}
          />
          <span
            className={`font-display text-lg md:text-xl font-bold tracking-wide translate-y-0.5 transition-colors duration-500 ${
              scrolled ? "text-crimson-light" : "text-white"
            }`}
          >
            RESTORATIONS
          </span>
        </a>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-10">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`text-[13px] font-medium tracking-wide transition-colors duration-300 ${
                scrolled
                  ? "text-[#2D4A73] hover:text-[#081428]"
                  : "text-white/70 hover:text-white"
              }`}
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            className={`text-[13px] font-semibold tracking-wide px-6 py-2.5 border transition-all duration-300 ${
              scrolled
                ? "border-[#081428] text-[#081428] hover:bg-[#081428] hover:text-white"
                : "border-white/40 text-white hover:bg-white/20 hover:text-white"
            }`}
          >
            Free Consultation
          </a>
        </nav>

        {/* Mobile Toggle */}
        <button
          className={`lg:hidden relative z-10 p-2 transition-colors ${
            mobileOpen || !scrolled ? "text-white" : "text-navy"
          }`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
        >
          <div className="w-6 flex flex-col gap-1.5">
            <span
              className={`block h-[1.5px] bg-current transition-all duration-300 ${
                mobileOpen ? "rotate-45 translate-y-[5px]" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] bg-current transition-all duration-300 ${
                mobileOpen ? "opacity-0" : ""
              }`}
            />
            <span
              className={`block h-[1.5px] bg-current transition-all duration-300 ${
                mobileOpen ? "-rotate-45 -translate-y-[5px]" : ""
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed inset-0 bg-navy transition-all duration-500 flex flex-col items-center justify-center ${
          mobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        <nav className="flex flex-col items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="font-display text-3xl text-white/80 hover:text-white transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="#contact"
            onClick={() => setMobileOpen(false)}
            className="mt-4 text-sm font-semibold tracking-wide px-8 py-3 border border-white/30 text-white hover:bg-white hover:text-navy transition-all"
          >
            Free Consultation
          </a>
        </nav>
      </div>
    </header>
  );
}
