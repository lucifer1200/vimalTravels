import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Vimal Travels — Bengaluru's Trusted Travel Agency",
  description:
    "Your trusted travel partner for Tours, Visa & Passport Services. Plan your dream vacation with expert guidance, best prices, and end-to-end travel support.",
  keywords: "travel agency bengaluru, visa services, passport assistance, tour packages, domestic international tours",
  openGraph: {
    title: "Vimal Travels",
    description: "Tours, Visa & Passport Services from Bengaluru",
    type: "website",
  },
  icons: {
    icon: "/vimal-logo.jpeg",
    apple: "/vimal-logo.jpeg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable}`}>
      <body className="font-body bg-white text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
