import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Roboto } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-roboto",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vimaltravels.in"),
  title: {
    default: "Vimal Travels Bengaluru — Tours, Visa & Passport Services Since 2007",
    template: "%s | Vimal Travels Bengaluru",
  },
  description:
    "IATA certified travel agency in Bengaluru since 2007. Book domestic & international tour packages, visa assistance, passport services. 4.9★ rated · 500+ reviews · Head Office: Mathikere · Branch: New BEL Road.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Vimal Travels Bengaluru — Tours, Visa & Passport Services",
    description:
      "IATA certified travel agency in Bengaluru since 2007. Tour packages, visa & passport services. 4.9★ · 500+ reviews.",
    type: "website",
    url: "https://www.vimaltravels.in",
    siteName: "Vimal Travels",
    locale: "en_IN",
    images: [
      {
        url: "/vimal-logo.jpeg",
        width: 1200,
        height: 630,
        alt: "Vimal Travels — Bengaluru's Trusted Travel Agency",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vimal Travels Bengaluru — Tours, Visa & Passport Services",
    description: "IATA certified travel agency in Bengaluru since 2007.",
    images: ["/vimal-logo.jpeg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/vimal-logo.jpeg", type: "image/jpeg" },
    ],
    apple: "/vimal-logo.jpeg",
  },
};

// JSON-LD structured data — TravelAgency with both Bengaluru offices
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TravelAgency",
      "@id": "https://www.vimaltravels.in/#organization",
      name: "Vimal Travels",
      alternateName: "Vimal Travels Bengaluru",
      url: "https://www.vimaltravels.in",
      logo: {
        "@type": "ImageObject",
        url: "https://www.vimaltravels.in/vimal-logo.jpeg",
      },
      image: "https://www.vimaltravels.in/vimal-logo.jpeg",
      description:
        "IATA certified travel agency in Bengaluru established in 2007. Offering domestic & international tour packages, visa assistance, passport services, hotel bookings, and group tours from Bengaluru.",
      foundingDate: "2007",
      telephone: ["+91-9886114440", "+91-9845679729"],
      email: "vimaltrls@gmail.com",
      // Primary office — Mathikere
      address: {
        "@type": "PostalAddress",
        streetAddress: "5, Vimal Shopping Complex, MS Ramaiah Road, opp. Divya MSR Gateway, Gokula Extension, Mathikere",
        addressLocality: "Bengaluru",
        addressRegion: "Karnataka",
        postalCode: "560054",
        addressCountry: "IN",
      },
      // Both locations
      location: [
        {
          "@type": "Place",
          name: "Vimal Travels — Mathikere Branch",
          address: {
            "@type": "PostalAddress",
            streetAddress: "5, Vimal Shopping Complex, MS Ramaiah Road, opp. Divya MSR Gateway, Gokula Extension, Mathikere",
            addressLocality: "Bengaluru",
            addressRegion: "Karnataka",
            postalCode: "560054",
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "13.02637",
            longitude: "77.56893",
          },
        },
        {
          "@type": "Place",
          name: "Vimal Travels — New BEL Road Branch",
          address: {
            "@type": "PostalAddress",
            streetAddress: "1st Floor, 17, New BEL Road, opp. to Printo, next to Bata showroom, AGS Layout, R.M.V. 2nd Stage",
            addressLocality: "Bengaluru",
            addressRegion: "Karnataka",
            postalCode: "560094",
            addressCountry: "IN",
          },
          geo: {
            "@type": "GeoCoordinates",
            latitude: "13.02100",
            longitude: "77.57200",
          },
        },
      ],
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
          opens: "10:30",
          closes: "20:00",
        },
      ],
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: "4.9",
        reviewCount: "500",
        bestRating: "5",
        worstRating: "1",
      },
      priceRange: "₹₹",
      currenciesAccepted: "INR",
      paymentAccepted: "Cash, UPI, Credit Card, Bank Transfer",
      areaServed: { "@type": "Country", name: "India" },
      knowsAbout: [
        "International Tour Packages from Bengaluru",
        "Domestic Tour Packages from Bengaluru",
        "Visa Assistance in Bengaluru",
        "Passport Services in Bengaluru",
        "Honeymoon Packages from Bangalore",
        "Group Tours from Bangalore",
        "Schengen Visa from Bengaluru",
        "Kashmir Tour Packages from Bangalore",
      ],
    },
    {
      "@type": "WebSite",
      "@id": "https://www.vimaltravels.in/#website",
      name: "Vimal Travels",
      url: "https://www.vimaltravels.in",
      publisher: { "@id": "https://www.vimaltravels.in/#organization" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${playfair.variable} ${dmSans.variable} ${roboto.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-body bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
