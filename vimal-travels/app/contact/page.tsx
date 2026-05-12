// app/contact/page.tsx
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import Image from "next/image";
import QuickEnquiryForm from "@/components/QuickEnquiryForm";
import type { Metadata } from "next";
import ScrollReveal from "@/components/ScrollReveal";

export const metadata: Metadata = {
  title: "Contact Us — Vimal Travels",
  description: "Get in touch with Vimal Travels. Visit our Bengaluru office or send us an enquiry online.",
};

export default function ContactPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[50vh] flex items-center pt-20 overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1600&q=85"
          alt="Contact hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 hero-overlay" />
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <ScrollReveal direction="up">
            <div className="max-w-2xl">
              <p className="section-label text-blue-300 mb-3">Get In Touch</p>
              <h1 className="font-display text-4xl md:text-5xl text-white font-bold leading-tight">Contact Us</h1>
              <p className="text-gray-200 mt-4 text-lg">We&apos;re here to help you plan your perfect trip. Reach out anytime!</p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Contact section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* Contact Info */}
            <ScrollReveal direction="left">
              <div>
                <p className="section-label mb-2">OUR OFFICE</p>
                <h2 className="font-display text-3xl font-bold text-slate-900 mb-3 leading-tight">Let&apos;s Plan Your Dream Trip</h2>
                <p className="text-gray-500 mb-8 leading-relaxed text-sm">
                  Whether you have a destination in mind or need inspiration, our travel experts are ready to help you create the perfect itinerary.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: MapPin, label: "Office Address", content: "5, Vimal Shopping Complex, MS Ramaiah Rd, opp. divya msr gateway, Gokula Extension, Mathikere, Bengaluru, Karnataka 560054", href: undefined },
                    { icon: Phone,  label: "Phone",          content: "+91 98861 14440  |  +91 98456 79729", href: "tel:+919886114440" },
                    { icon: Mail,   label: "Email",          content: "vimaltrls@gmail.com", href: "mailto:vimaltrls@gmail.com" },
                    { icon: Clock,  label: "Business Hours", content: "Mon–Sat: 10:30 AM – 8:00 PM", href: undefined },
                  ].map((item, i) => (
                    <div key={i} className="card p-4 flex gap-4 items-start">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm mb-0.5">{item.label}</h3>
                        {item.href ? (
                          <a href={item.href} className="text-gray-500 text-sm hover:text-blue-600 transition-colors">{item.content}</a>
                        ) : (
                          <p className="text-gray-500 text-sm">{item.content}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="rounded-xl overflow-hidden h-56 shadow-md border border-gray-100">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.3862!2d77.5697!3d13.0351!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae3d5948b6430d:0x6d5316369472fcf3!2sVimal+Travels!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Vimal Travels Location"
                  />
                </div>
              </div>
            </ScrollReveal>

            {/* Enquiry Form */}
            <ScrollReveal direction="right">
              <div className="card p-7">
                <h3 className="font-display text-xl font-bold text-slate-900 mb-1">Send Us a Message</h3>
                <p className="text-gray-500 text-sm mb-6">Fill the form below and we&apos;ll get back within 2 hours.</p>
                <QuickEnquiryForm />
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Call strip */}
      <section className="bg-blue-900 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-bold text-white">Prefer to call? We&apos;re available Mon–Sat, 10:30 AM – 8:00 PM</h3>
              <p className="text-blue-200 text-sm mt-1">Our travel experts are ready to answer your queries.</p>
            </div>
            <div className="flex flex-wrap gap-3 shrink-0">
              <a href="tel:+919886114440" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-6 py-3 rounded-lg transition-colors text-sm">
                +91 98861 14440
              </a>
              <a href="tel:+919845679729" className="bg-white text-blue-900 hover:bg-blue-50 font-bold px-6 py-3 rounded-lg transition-colors text-sm">
                +91 98456 79729
              </a>
              <a href="https://wa.me/919886114440" className="border-2 border-white text-white hover:bg-white hover:text-blue-900 font-semibold px-6 py-3 rounded-lg transition-colors text-sm">
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}


