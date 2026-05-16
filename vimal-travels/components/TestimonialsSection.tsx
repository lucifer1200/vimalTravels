"use client";
import { useState } from "react";
import { Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const testimonials = [
  { text: "Vimal Travels organised our Bangkok trip in a befitting manner, made us comfortable throughout and made a pleasant and memorable holiday. They organised every event professionally — money exchange, immigration, transport, hotel stay and local currency in an emergency — all done in an exemplary manner.", name: "Suresh Puttaiah", location: "Local Guide · Bengaluru", initials: "SP" },
  { text: "Our recent trip to Singapore and Bali was absolutely fantastic. Everything was so well organised, we felt completely stress-free. Vimal Travels handled all the booking and logistics, allowing us to fully enjoy our vacation from start to finish.", name: "Vandana Tak", location: "Local Guide · Bengaluru", initials: "VT" },
  { text: "I visited Singapore and Malaysia with my family. The package by Vimal Travels was well organised covering most of the main attractions. They have their own Forex exchange so we didn't have to go anywhere else.", name: "Rahul Jain", location: "Local Guide · Bengaluru", initials: "RJ" },
  { text: "We travelled to Thailand. The places were amazing — tiger park, orangutan, birds, and the elephant show was a once in a lifetime experience. Vimal Travels made us so comfortable and provided full support. We plan on visiting again and again.", name: "Asha Suresh", location: "Bengaluru", initials: "AS" },
  { text: "Me and my family have been travelling with Vimal Travels for many years and we have made wonderful memories on national and international tours. The hotels they book, the vehicles they provide are very good. Always open for our queries.", name: "Priyanka Prakash", location: "Bengaluru", initials: "PP" },
  { text: "My friends and I went on a 4-day trip to Kerala and we had the most fun. The itinerary was structured so well that we covered many sites. Everything was done with minimal hassle. We're definitely planning another trip with them!", name: "Sharvini Gunalan", location: "Bengaluru", initials: "SG" },
  { text: "I travelled to Langkawi and Singapore with my family. They did a great job arranging everything on time and the vacation was wonderful. We'll surely cherish the memories for a lifetime. Hosted by Mayurji — excellent work!", name: "Shubham Jain", location: "Bengaluru", initials: "SJ" },
  { text: "We booked our Kashmir trip with Vimal Travels — one of the most seamless vacation experiences we've had. Being an all-girls trip, safety was our concern and that was fully ensured. We had a wonderful trip without any hassle.", name: "Deepthi Honnappa", location: "Bengaluru", initials: "DH" },
  { text: "The experience was so satisfying and trustworthy. I sent my parents to Singapore and the complete package was economical and hassle-free. Highly recommend Vimal Travels for international travel plans.", name: "Varun Srivathsav", location: "Local Guide · Bengaluru", initials: "VS" },
  { text: "Very very professional and dedicated team. Thanks to Mr Vimal and Mr Mayur for making our trip memorable. They have high values and top connectivity in India and abroad. No doubt to refer to anyone!", name: "Sri Sai Krupa", location: "Bengaluru", initials: "SK" },
  { text: "Vimal Travels is more than a travel agent — they're your personal travel genie. From choosing the right destination to picking the best places and cosiest stays, they do it all.", name: "Roo Bee", location: "Local Guide · Bengaluru", initials: "RB" },
  { text: "Overall a very good experience. Everything was planned and arranged with forethought about our comfort. Supportive to the very end. If you are looking for a memorable journey, book your vacation with Vimal Travels.", name: "Raksha Suresh", location: "Bengaluru", initials: "RS" },
];

const INITIAL_COUNT = 6;


export default function TestimonialsSection() {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? testimonials : testimonials.slice(0, INITIAL_COUNT);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="section-label mb-2">TESTIMONIALS</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-900">What Our Travelers Say</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="flex text-yellow-400">
              {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
            </div>
            <span className="text-gray-500 text-sm">4.9/5 based on 200+ Google Reviews</span>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {visible.map((t, i) => (
              <motion.div
                key={t.name}
                layout
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.45, delay: i * 0.06, ease: "easeOut", layout: { duration: 0.4 } }}
                whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(37,99,235,0.10)" }}
                className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col cursor-default"
              >
                <div className="flex text-yellow-400 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-3.5 h-3.5 fill-current" />)}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-5 flex-1">&ldquo;{t.text}&rdquo;</p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                    <div className="text-gray-400 text-xs">{t.location}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <motion.div
          className="text-center mt-10 flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-2 border border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-semibold px-6 py-2.5 rounded-lg transition-all text-sm"
          >
            {showAll ? "Show Less ↑" : `Show All ${testimonials.length} Reviews ↓`}
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            href="https://www.google.com/maps/place/Vimal+Travels/@13.0395342,77.5574472,17z"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white border border-gray-200 hover:border-blue-400 text-slate-700 hover:text-blue-600 font-semibold px-6 py-2.5 rounded-lg shadow-sm transition-all text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Write a Google Review
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
