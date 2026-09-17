import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { CheckCircle, MessageCircle, Clock, Users, MapPin, Star } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { getDestination, getAllSlugs, allDestinations } from "@/lib/destinations";

type Props = { params: Promise<{ destination: string }> };

export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ destination: slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destination } = await params;
  const d = getDestination(destination);
  if (!d) return { title: "Package Not Found" };

  const title = `${d.title} | Vimal Travels`;
  const description = `${d.tagline}. Customised group, family & honeymoon packages from Bangalore. IATA certified, 19+ years experience. Call +91 98861 14440.`;

  return {
    title,
    description,
    alternates: { canonical: `/packages/${d.slug}` },
    openGraph: {
      title,
      description,
      url: `https://www.vimaltravels.in/packages/${d.slug}`,
      images: [{ url: d.heroImage, alt: d.heroAlt }],
    },
    twitter: { card: "summary_large_image", title, description, images: [d.heroImage] },
  };
}

export default async function DestinationPage({ params }: Props) {
  const { destination } = await params;
  const d = getDestination(destination);
  if (!d) notFound();

  const whatsappMsg = encodeURIComponent(
    `Hi, I'm interested in the ${d.title}. Please share details and pricing.`
  );

  const related = d.related
    .map((slug) => allDestinations.find((x) => x.slug === slug))
    .filter(Boolean)
    .slice(0, 3);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "TouristTrip",
            name: d.title,
            description: d.tagline,
            image: d.heroImage,
            offers: d.packages.map((p) => ({
              "@type": "Offer",
              name: p.name,
              description: p.inclusions.join(", "),
              price: p.price.replace(/[₹,]/g, ""),
              priceCurrency: "INR",
            })),
            provider: {
              "@type": "TravelAgency",
              name: "Vimal Travels",
              telephone: "+91-98861-14440",
              address: {
                "@type": "PostalAddress",
                streetAddress: "5, Vimal Shopping Complex, MS Ramaiah Rd, Gokula Extension, Mathikere",
                addressLocality: "Bengaluru",
                postalCode: "560054",
                addressRegion: "Karnataka",
                addressCountry: "IN",
              },
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="relative min-h-[65vh] flex items-end overflow-hidden">
        <Image
          src={d.heroImage}
          alt={d.heroAlt}
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <ScrollReveal direction="up">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                {d.type === "domestic" ? "Domestic" : "International"}
              </span>
              {d.visaNote && (
                <span className="bg-green-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {d.visaNote}
                </span>
              )}
            </div>
            <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight max-w-3xl">
              {d.title}
            </h1>
            <p className="text-gray-200 mt-3 text-lg max-w-2xl">{d.tagline}</p>
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {d.popularDuration}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {d.tripsCount} trips done</span>
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-yellow-400 text-yellow-400" /> 4.9 rated</span>
            </div>
            <div className="flex flex-wrap gap-3 mt-6">
              <a
                href={`https://wa.me/919886114440?text=${whatsappMsg}`}
                className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp for Quote
              </a>
              <a
                href="tel:+919886114440"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-6 py-3 rounded-lg text-sm transition-colors"
              >
                Call +91 98861 14440
              </a>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Package Cards */}
      <section className="py-16 bg-white" id="packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">TOUR PACKAGES</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-2">
              Choose Your {d.type === "domestic" ? "" : "International "}Package
            </h2>
            <p className="text-gray-500 text-sm mb-10">
              Starting from <strong>{d.startPrice}</strong> per person · All prices are indicative · Customisation available
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {d.packages.map((pkg, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 100}>
                <div className={`card p-6 h-full flex flex-col relative ${pkg.tag ? "border-blue-500 border-2" : ""}`}>
                  {pkg.tag && (
                    <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {pkg.tag}
                    </span>
                  )}
                  <div className="mb-4">
                    <h3 className="font-display text-lg font-bold text-slate-900">{pkg.name}</h3>
                    <p className="text-gray-400 text-xs mt-0.5">{pkg.duration}</p>
                  </div>
                  <div className="mb-4">
                    <span className="font-display text-3xl font-bold text-blue-600">{pkg.price}</span>
                    <span className="text-gray-400 text-xs ml-2">{pkg.priceNote}</span>
                  </div>
                  <ul className="space-y-2 mb-6 flex-1">
                    {pkg.inclusions.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-gray-600">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={`https://wa.me/919886114440?text=${encodeURIComponent(`Hi, I'm interested in the ${pkg.name} for ${d.title}. Please share availability and confirm pricing.`)}`}
                    className="block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                  >
                    Enquire Now →
                  </a>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <p className="text-center text-gray-500 text-xs mt-6">
            Prices are per person on twin sharing basis unless noted. GST extra. Customisation available for group bookings.
          </p>
        </div>
      </section>

      {/* Highlights */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">TOP PLACES</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">
              Must-Visit Places in {d.title.split(" Tour")[0].split(" Package")[0]}
            </h2>
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {d.highlights.map((h, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 60}>
                <div className="card p-5 h-full flex gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm mb-1">{h.place}</h3>
                    <p className="text-gray-500 text-xs leading-relaxed">{h.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <p className="section-label mb-2">FREQUENTLY ASKED</p>
            <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">
              Common Questions about {d.title.split(" Tour")[0]} Tours from Bangalore
            </h2>
          </ScrollReveal>
          <div className="max-w-3xl space-y-4">
            {d.faqs.map((faq, i) => (
              <ScrollReveal key={i} direction="up" delay={i * 80}>
                <div className="card p-5">
                  <h3 className="font-semibold text-slate-900 text-sm mb-2">{faq.q}</h3>
                  <p className="text-gray-500 text-xs leading-relaxed">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Related Packages */}
      {related.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ScrollReveal direction="up">
              <p className="section-label mb-2">YOU MAY ALSO LIKE</p>
              <h2 className="font-display text-3xl font-bold text-slate-900 mb-8">Related Tour Packages from Bangalore</h2>
            </ScrollReveal>
            <div className="grid sm:grid-cols-3 gap-5">
              {related.map((rel, i) =>
                rel ? (
                  <ScrollReveal key={i} direction="up" delay={i * 100}>
                    <Link href={`/packages/${rel.slug}`} className="card overflow-hidden block hover:shadow-md transition-shadow group">
                      <div className="relative h-40 overflow-hidden">
                        <Image
                          src={rel.heroImage}
                          alt={rel.heroAlt}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, 33vw"
                        />
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-1 group-hover:text-blue-600 transition-colors">
                          {rel.title}
                        </h3>
                        <p className="text-gray-400 text-xs">From {rel.startPrice} · {rel.popularDuration}</p>
                      </div>
                    </Link>
                  </ScrollReveal>
                ) : null
              )}
            </div>
          </div>
        </section>
      )}

      {/* Trust strip */}
      <section className="bg-blue-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[["19+", "Years in Bengaluru"], ["5000+", "Happy Travellers"], ["IATA", "Certified Agency"], ["4.9★", "Google Rating"]].map(
              ([val, label]) => (
                <div key={label}>
                  <div className="font-display text-3xl font-bold text-white mb-1">{val}</div>
                  <div className="text-blue-200 text-xs">{label}</div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="zoom">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8 bg-blue-50 rounded-2xl p-8">
              <div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                  Ready to Plan Your {d.title.split(" Tour")[0]} Trip?
                </h2>
                <p className="text-gray-600 text-sm">
                  Head Office: Mathikere · Branch: New BEL Road, North Bangalore. Mon–Sat 10:30 AM – 8:00 PM.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                <a
                  href={`https://wa.me/919886114440?text=${whatsappMsg}`}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2 justify-center"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp Now
                </a>
                <Link
                  href="/contact"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-lg text-sm transition-colors text-center"
                >
                  Send Enquiry →
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
