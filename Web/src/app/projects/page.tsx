"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../components/Header";
import Lightbox from "../components/Lightbox";

const categories = [
  "All",
  "Balcony Restoration",
  "Masonry & Brick",
  "Expansion Joint",
] as const;

type Category = (typeof categories)[number];

type Size = "wide" | "normal";

interface Project {
  label: string;
  category: Exclude<Category, "All">;
  image: string;
  size: Size;
}

const projects: Project[] = [
  {
    label: "Balcony Restoration",
    category: "Balcony Restoration",
    image: "/service/Balcony/balcony1.JPG",
    size: "wide",
  },
  {
    label: "Masonry",
    category: "Masonry & Brick",
    image: "/service/Masonry/masonry.jpg",
    size: "normal",
  },
  {
    label: "Balcony Restoration",
    category: "Balcony Restoration",
    image: "/service/Balcony/balcony5.jpg",
    size: "normal",
  },
  {
    label: "Masonry",
    category: "Masonry & Brick",
    image: "/service/Masonry/masonry1.jpeg",
    size: "normal",
  },
  {
    label: "Expansion Joint",
    category: "Expansion Joint",
    image: "/service/edg/edging.jpg",
    size: "normal",
  },
  {
    label: "Balcony & Rebar",
    category: "Balcony Restoration",
    image: "/service/Balcony/balcony-rebar.JPG",
    size: "normal",
  },
  {
    label: "Balcony Restoration",
    category: "Balcony Restoration",
    image: "/service/Balcony/balcony3.jpeg",
    size: "wide",
  },
  {
    label: "Balcony & Rebar",
    category: "Balcony Restoration",
    image: "/service/Balcony/balcony-rebar2.JPG",
    size: "normal",
  },
  {
    label: "Masonry",
    category: "Masonry & Brick",
    image: "/service/Masonry/masonry2.jpeg",
    size: "normal",
  },
  {
    label: "Balcony Restoration",
    category: "Balcony Restoration",
    image: "/service/Balcony/balcony4.jpg",
    size: "normal",
  },
];

export default function ProjectsPage() {
  const [active, setActive] = useState<Category>("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered =
    active === "All"
      ? projects
      : projects.filter((p) => p.category === active);

  const lightboxImages = filtered.map((p) => ({ src: p.image, label: p.label }));

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + filtered.length) % filtered.length : null
    );
  }, [filtered.length]);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % filtered.length : null
    );
  }, [filtered.length]);

  return (
    <>
      <Header />

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
              <div className="label mb-5">Our Work</div>
              <div className="divider mb-8" />
              <h1 className="title-xl text-white mb-6">
                Projects
              </h1>
              <p className="body-lg text-white/50">
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
                      ? "bg-navy border-navy text-white"
                      : "bg-white border-slate-200 text-slate-500 hover:border-navy hover:text-navy"
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

            {/* Mosaic Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[280px] gap-3">
              {filtered.map((project, i) => (
                <article
                  key={i}
                  onClick={() => setLightboxIndex(i)}
                  className={`group relative overflow-hidden cursor-pointer ${project.size === "wide" ? "sm:col-span-2" : ""}`}
                >
                  <Image
                    src={project.image}
                    alt={project.label}
                    fill
                    sizes={project.size === "wide" ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-navy/20 to-transparent z-[1] opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6 z-[2]">
                    <span className="text-[10px] font-semibold tracking-widest-xl uppercase text-white/50">
                      {project.category}
                    </span>
                    <h3 className="font-display text-base md:text-lg font-semibold text-white mt-1 group-hover:text-crimson-light transition-colors duration-300">
                      {project.label}
                    </h3>
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
                className="inline-flex items-center gap-3 bg-navy text-white text-sm font-semibold tracking-wide px-10 py-4 hover:bg-crimson transition-colors duration-300"
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

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}

      {/* Minimal Footer */}
      <footer className="bg-navy text-white/60 py-8">
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
