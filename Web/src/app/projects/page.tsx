"use client";

import { useState } from "react";
import Link from "next/link";

const categories = [
  "All",
  "Balcony Restoration",
  "Masonry & Brick",
  "Waterproofing",
  "Concrete Repair",
  "Caulking & Sealant",
  "Protective Coatings",
] as const;

type Category = (typeof categories)[number];

interface Project {
  title: string;
  category: Exclude<Category, "All">;
  location: string;
  description: string;
  featured?: boolean;
}

const projects: Project[] = [
  {
    title: "Midtown Condo Complex",
    category: "Balcony Restoration",
    location: "Toronto, ON",
    description:
      "Full balcony restoration across 14 floors including concrete repair, waterproof membrane installation, and new railing systems.",
    featured: true,
  },
  {
    title: "Heritage Brick Facade",
    category: "Masonry & Brick",
    location: "Vaughan, ON",
    description:
      "Complete repointing and brick replacement on a heritage-designated commercial building facade.",
  },
  {
    title: "Underground Parking Garage",
    category: "Waterproofing",
    location: "Mississauga, ON",
    description:
      "Comprehensive waterproofing and drainage system for a 200-space underground parking structure.",
  },
  {
    title: "Commercial Tower Podium",
    category: "Concrete Repair",
    location: "Brampton, ON",
    description:
      "Structural concrete restoration of a 5-storey podium including carbon fiber reinforcement.",
  },
  {
    title: "Residential Complex Exterior",
    category: "Protective Coatings",
    location: "Richmond Hill, ON",
    description:
      "Application of elastomeric protective coatings to exterior walls and balcony soffits.",
  },
  {
    title: "Lakeshore Townhomes",
    category: "Caulking & Sealant",
    location: "Oakville, ON",
    description:
      "Full window and expansion joint caulking replacement for a 48-unit townhome complex.",
  },
  {
    title: "Highrise Balcony Overhaul",
    category: "Balcony Restoration",
    location: "North York, ON",
    description:
      "Restoration of 220 balconies including structural repairs, waterproofing, and new tile finishes.",
  },
  {
    title: "Historic Church Restoration",
    category: "Masonry & Brick",
    location: "Woodbridge, ON",
    description:
      "Delicate stone and brick restoration preserving original architectural details on a century-old church.",
  },
  {
    title: "Retail Plaza Waterproofing",
    category: "Waterproofing",
    location: "Markham, ON",
    description:
      "Below-grade waterproofing and foundation repair for a busy retail plaza with active tenants.",
  },
  {
    title: "Parking Structure Rehabilitation",
    category: "Concrete Repair",
    location: "Etobicoke, ON",
    description:
      "Multi-level parking garage concrete rehabilitation including traffic-bearing membrane installation.",
  },
  {
    title: "Condo Envelope Restoration",
    category: "Caulking & Sealant",
    location: "Scarborough, ON",
    description:
      "Complete building envelope re-sealing for a 22-storey residential condominium.",
  },
  {
    title: "Industrial Warehouse Coatings",
    category: "Protective Coatings",
    location: "Bolton, ON",
    description:
      "Anti-corrosion and protective coating application on structural steel and concrete surfaces.",
  },
];

export default function ProjectsPage() {
  const [active, setActive] = useState<Category>("All");

  const filtered =
    active === "All"
      ? projects
      : projects.filter((p) => p.category === active);

  return (
    <>
      {/* Header */}
      <header className="fixed inset-x-0 top-0 z-50 bg-white/95 backdrop-blur-lg shadow-[0_1px_0_0_rgba(0,0,0,0.06)]">
        <div className="max-w-[1280px] mx-auto flex items-center justify-between h-20 md:h-24 px-6 sm:px-8 lg:px-12">
          <Link href="/" className="flex items-baseline gap-1.5">
            <span className="font-display text-2xl font-bold tracking-wide text-[#081428]">
              HUMO
            </span>
            <span className="text-[11px] font-sans font-bold tracking-[0.2em] uppercase text-[#081428]">
              RESTORATIONS
            </span>
            <span className="text-[9px] font-sans font-medium tracking-[0.2em] uppercase text-[#081428]/50">
              INC.
            </span>
          </Link>
          <Link
            href="/#contact"
            className="text-[13px] font-semibold tracking-wide px-6 py-2.5 border border-[#081428] text-[#081428] hover:bg-[#081428] hover:text-white transition-all duration-300"
          >
            Free Consultation
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="bg-navy pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-white/40 text-sm hover:text-white/70 transition-colors mb-10"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to Home
            </Link>
            <div className="max-w-2xl">
              <div className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#C41E3A] mb-5">
                Our Work
              </div>
              <div className="w-12 h-[2px] bg-[#C41E3A] mb-8" />
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-semibold leading-[1.1] tracking-tight text-white mb-6">
                Projects
              </h1>
              <p className="text-lg md:text-xl leading-relaxed text-white/50 font-light">
                Explore a selection of restoration and construction projects
                completed across Ontario. Every project reflects our commitment to
                quality craftsmanship and lasting results.
              </p>
            </div>
          </div>
        </section>

        {/* Filters + Grid */}
        <section className="bg-slate-50 py-16 md:py-24">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
            {/* Filter Bar */}
            <div className="flex flex-wrap gap-2 mb-12 md:mb-16">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`text-[12px] font-semibold tracking-wide px-5 py-2.5 border transition-all duration-200 ${
                    active === cat
                      ? "bg-[#081428] border-[#081428] text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:border-[#081428] hover:text-[#081428]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Project Count */}
            <p className="text-sm text-slate-400 mb-8">
              {filtered.length} project{filtered.length !== 1 ? "s" : ""}
            </p>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((project) => (
                <article
                  key={project.title}
                  className="group bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                >
                  {/* Image Placeholder */}
                  <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-[#081428]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-[1]" />
                    <div className="absolute bottom-4 left-4 z-[2] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-white/60">
                        {project.category}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-display text-lg font-semibold text-[#081428] group-hover:text-[#C41E3A] transition-colors duration-300">
                        {project.title}
                      </h3>
                      <svg
                        className="w-4 h-4 mt-1.5 shrink-0 text-slate-300 group-hover:text-[#C41E3A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3">
                      <svg className="w-3.5 h-3.5 text-slate-300" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                      </svg>
                      <span className="text-[12px] text-slate-400">{project.location}</span>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {project.description}
                    </p>
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-[#C41E3A]">
                        {project.category}
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-20 text-center">
              <p className="text-slate-400 mb-6">
                Have a similar project in mind?
              </p>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-3 bg-[#081428] text-white text-sm font-semibold tracking-wide px-10 py-4 hover:bg-[#C41E3A] transition-colors duration-300"
              >
                Get a Free Quote
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Footer */}
      <footer className="bg-[#081428] text-white/25 py-8">
        <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p>&copy; 2026 Humo Restorations INC.</p>
          <Link href="/" className="text-white/40 hover:text-white/70 transition-colors">
            Back to Home
          </Link>
        </div>
      </footer>
    </>
  );
}
