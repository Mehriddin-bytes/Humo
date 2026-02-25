"use client";

import { useState, FormEvent } from "react";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");

    const form = e.currentTarget;
    const fd = new FormData(form);
    const data = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      service: fd.get("service") as string,
      message: fd.get("message") as string,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        setStatus("success");
        setErrorMsg("");
        form.reset();
      } else {
        const body = await res.json().catch(() => null);
        setErrorMsg(
          body?.error || `Server error (${res.status}). Please try again or email us directly.`
        );
        setStatus("error");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setErrorMsg("Request timed out. Please check your connection and try again.");
      } else {
        setErrorMsg("Network error. Please check your connection or email us directly.");
      }
      setStatus("error");
    }
  }

  const inputClass =
    "w-full px-0 py-3 bg-transparent border-b border-slate-200 text-slate-800 placeholder:text-slate-300 focus:border-navy focus:outline-none transition-colors text-sm";

  return (
    <section id="contact" className="section-pad bg-slate-50">
      <div className="container-lg">
        <div className="grid lg:grid-cols-12 gap-16 lg:gap-24">
          {/* Left */}
          <div className="lg:col-span-5">
            <div className="label mb-5">Contact</div>
            <div className="divider mb-8" />

            <h2 className="title-lg text-navy mb-8">
              Let&apos;s discuss
              <br />
              your project.
            </h2>

            <p className="body-md mb-12">
              Whether you need an estimate, a second opinion, or want to start
              right away — we&apos;re ready when you are.
            </p>

            <div className="space-y-6">
              <div>
                <span className="text-[11px] font-semibold tracking-widest-xl uppercase text-slate-300">
                  Email
                </span>
                <p className="text-navy font-medium mt-1">
                  info@humorestorations.ca
                </p>
              </div>
              <div>
                <span className="text-[11px] font-semibold tracking-widest-xl uppercase text-slate-300">
                  Phone
                </span>
                <a href="tel:+16476699339" className="block text-navy font-medium mt-1 hover:text-crimson transition-colors">
                  +1 (647) 669-9339
                </a>
              </div>
              <div>
                <span className="text-[11px] font-semibold tracking-widest-xl uppercase text-slate-300">
                  Address
                </span>
                <a
                  href="https://maps.apple.com/?address=Humo+Restorations"
                  onClick={(e) => {
                    const isApple = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
                    if (!isApple) {
                      e.preventDefault();
                      window.open("https://www.google.com/maps/place/Humo+Restorations/@43.7853627,-79.5570338,17z", "_blank");
                    }
                  }}
                  className="block text-navy font-medium mt-1 hover:text-crimson transition-colors"
                >
                  131 Whitmore Rd Unit 24, Woodbridge, ON
                </a>
              </div>
            </div>
          </div>

          {/* Right — Form */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200/80 shadow-sm p-8 sm:p-10 lg:p-12">
              {status === "success" ? (
                <div className="flex flex-col items-start justify-center py-8">
                  <div className="w-12 h-12 border-2 border-green-500 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-navy mb-3">
                    Request received.
                  </h3>
                  <p className="body-md mb-8">
                    We&apos;ll review your project details and get back to you within
                    1-2 business days. A confirmation has been sent to your email.
                  </p>
                  <button
                    onClick={() => setStatus("idle")}
                    className="text-sm text-crimson font-medium hover:underline"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="font-display text-xl font-semibold text-navy mb-2">
                    Request a Free Quote
                  </h3>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="sr-only">Name</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        className={inputClass}
                        placeholder="Full name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="sr-only">Email</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        className={inputClass}
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="sr-only">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        className={inputClass}
                        placeholder="Phone (optional)"
                      />
                    </div>
                    <div>
                      <label htmlFor="service" className="sr-only">Service</label>
                      <select
                        id="service"
                        name="service"
                        required
                        className={`${inputClass} bg-transparent cursor-pointer`}
                        defaultValue=""
                      >
                        <option value="" disabled>
                          Select a service
                        </option>
                        <option>Balcony Restoration</option>
                        <option>Masonry & Brick</option>
                        <option>Caulking & Sealant</option>
                        <option>Waterproofing</option>
                        <option>Concrete Repair</option>
                        <option>Protective Coatings</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="sr-only">Message</label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className={`${inputClass} resize-none`}
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  {status === "error" && (
                    <div className="bg-red-50 border border-red-200 p-4">
                      <p className="text-crimson text-sm font-medium mb-1">Request failed</p>
                      <p className="text-sm text-slate-600">
                        {errorMsg || "Something went wrong. Please try again or email us directly."}
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-navy text-white text-sm font-semibold tracking-wide px-10 py-4 hover:bg-crimson transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {status === "sending" ? "Sending..." : "Send Request"}
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                    </svg>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
