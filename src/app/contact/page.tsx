"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Mail, MapPin, Phone, Send, HelpCircle } from "lucide-react";

function Instagram({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function Facebook({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const contactInfo = [
    { icon: Mail, label: "Email", value: "riftdistrict@gmail.com", href: "mailto:riftdistrict@gmail.com" },
    { icon: MapPin, label: "Location", value: "Mumbai, India", href: "#" },
    { icon: Phone, label: "Phone", value: "+91 98198 14971", href: "tel:+919819814971" },
  ];

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <p className="text-xs tracking-[0.3em] uppercase text-rift-mist/50 mb-4">Contact</p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Get in Touch</h1>
          <p className="text-rift-mist/60 text-sm leading-relaxed mb-8">
            Questions about orders, collaborations, or press? We'd love to hear from you.
          </p>

          <div className="space-y-6 mb-12">
            {contactInfo.map((info, i) => (
              <motion.a
                key={info.label}
                href={info.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 glass-card--strong p-4 rounded-xl hover:border-rift-orange transition-colors group"
              >
                <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center">
                  <info.icon size={20} className="text-rift-mist/60 group-hover:text-rift-orange transition-colors" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-rift-mist/50">{info.label}</p>
                  <p className="text-white">{info.value}</p>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="flex gap-4">
            <motion.a
              href="https://www.instagram.com/riftdistrict?igsh=MnBjbnh4dHk2cmt3"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-rift-mist/60 hover:text-rift-orange transition-colors"
            >
              <Instagram size={20} />
            </motion.a>
            <motion.a
              href="https://www.facebook.com/riftdistrict"
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-rift-mist/60 hover:text-rift-orange transition-colors"
            >
              <Facebook size={20} />
            </motion.a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {sent ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card--strong p-12 text-center h-full flex flex-col items-center justify-center rounded-2xl"
            >
              <Mail size={48} className="text-rift-orange mb-4" />
              <p className="text-xl font-medium mb-2">Message Sent</p>
              <p className="text-sm text-rift-mist/60">We'll get back to you within 48 hours.</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field w-full rounded-xl"
                />
              </div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="input-field w-full rounded-xl"
                />
              </div>
              <div className="relative">
                <textarea
                  placeholder="Message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="input-field resize-none w-full rounded-xl"
                />
              </div>
              <AnimatedButton type="submit" className="w-full text-center">
                Send Message
              </AnimatedButton>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}