"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { AlertTriangle, Package, Phone, Mail, Clock } from "lucide-react";

export default function SupportPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card--strong rounded-3xl overflow-hidden"
        >
          <div className="grid md:grid-cols-2">
            <div className="p-10 border-r border-rift-mist/10">
              <p className="text-xs tracking-[0.2em] uppercase text-rift-mist/50 mb-3">Support</p>
              <h1 className="text-3xl font-bold mb-8">How can we help?</h1>
              
              <div className="space-y-4">
                <Link href={`/support/damaged/${orderId}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 glass-card rounded-2xl hover:border-rift-orange transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rift-orange/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="text-rift-orange" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-rift-orange transition-colors">Damaged / Defective Product</h3>
                        <p className="text-sm text-rift-mist/60">
                          Received a damaged or defective item? Submit a claim with photos for review.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>

                <Link href={`/support/replacement/${orderId}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="p-6 glass-card rounded-2xl hover:border-rift-orange transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-rift-orange/10 flex items-center justify-center flex-shrink-0">
                        <Package className="text-rift-orange" size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-2 group-hover:text-rift-orange transition-colors">Replace Product</h3>
                        <p className="text-sm text-rift-mist/60">
                          Need a different size? Request a replacement within 7 days of delivery.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </div>
            </div>

            <div className="p-10 bg-gradient-to-br from-rift-surface/50 to-rift-base/50">
              <p className="text-xs tracking-[0.2em] uppercase text-rift-mist/50 mb-6">Contact Us</p>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
                    <Mail className="text-rift-mist/60" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-rift-mist/50 uppercase tracking-wider mb-1">Email</p>
                    <p className="text-white">hello@riftdistrict.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
                    <Phone className="text-rift-mist/60" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-rift-mist/50 uppercase tracking-wider mb-1">Phone</p>
                    <p className="text-white">+1 (555) 123-4567</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full glass-card flex items-center justify-center">
                    <Clock className="text-rift-mist/60" size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-rift-mist/50 uppercase tracking-wider mb-1">Support Hours</p>
                    <p className="text-white">Mon – Sat</p>
                    <p className="text-sm text-rift-mist/60">10 AM – 7 PM IST</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}