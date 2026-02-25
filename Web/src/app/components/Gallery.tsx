"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";

const projects = [
  {
    label: "Balcony Restoration",
    image: "/service/Balcony/balcony2.JPG",
    span: "md:col-span-2 md:row-span-2",
    aspect: "aspect-square md:aspect-auto md:h-full",
  },
  {
    label: "Masonry",
    image: "/service/Masonry/masonry3.jpeg",
    span: "",
    aspect: "aspect-[4/3]",
  },
  {
    label: "Balcony & Rebar",
    image: "/service/Balcony/balcony-rebar3.JPG",
    span: "",
    aspect: "aspect-[4/3]",
  },
  {
    label: "Balcony Restoration",
    image: "/service/Balcony/balcony4.jpg",
    span: "",
    aspect: "aspect-[4/3]",
  },
  {
    label: "Balcony Restoration",
    image: "/service/Balcony/balcony5-copy.jpg",
    span: "",
    aspect: "aspect-[4/3]",
  },
  {
    label: "Masonry",
    image: "/service/Masonry/masonry.jpg",
    span: "",
    aspect: "aspect-[4/3]",
  },
];

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const lightboxImages = projects.map((p) => ({ src: p.image, label: p.label }));

  const handlePrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev - 1 + projects.length) % projects.length : null
    );
  }, []);

  const handleNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev !== null ? (prev + 1) % projects.length : null
    );
  }, []);

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
            A selection of completed work across Ontario. Each project reflects
            our commitment to quality and precision.
          </p>
        </div>

        {/* Masonry-style Grid */}
        <div className="grid md:grid-cols-3 gap-3">
          {projects.map((p, i) => (
            <div
              key={i}
              onClick={() => setLightboxIndex(i)}
              className={`group relative overflow-hidden cursor-pointer ${p.span} ${p.aspect}`}
            >
              <Image
                src={p.image}
                alt={p.label}
                fill
                sizes={p.span ? "(max-width: 768px) 100vw, 66vw" : "(max-width: 768px) 100vw, 33vw"}
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy/80 via-transparent to-transparent z-[1]" />

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 z-[2]">
                <span className="text-[11px] font-semibold tracking-widest-xl uppercase text-white/70">
                  {p.label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={lightboxImages}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      )}
    </section>
  );
}
