"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PurchaseNotification {
  id: string;
  name: string;
  location: string;
  product: string;
  time: string;
}

const SAMPLE_PURCHASES: Omit<PurchaseNotification, "id" | "time">[] = [
  { name: "Arjun K.", location: "Mumbai", product: "Oversized Acid Wash Tee" },
  { name: "Priya S.", location: "Delhi", product: "District Void Hoodie" },
  { name: "Rohan M.", location: "Bangalore", product: "Rift Logo Sweatshirt" },
  { name: "Ananya R.", location: "Pune", product: "Washed Black Hoodie" },
  { name: "Vikram P.", location: "Hyderabad", product: "Limited Drop Tee" },
  { name: "Sneha D.", location: "Chennai", product: "Oversized Crew Neck" },
  { name: "Aditya B.", location: "Kolkata", product: "Acid Wash Hoodie" },
  { name: "Ishita G.", location: "Ahmedabad", product: "Premium Sweatshirt" },
];

export function LivePurchaseNotifications() {
  const [notification, setNotification] = useState<PurchaseNotification | null>(null);

  useEffect(() => {
    const showNotification = () => {
      const random = SAMPLE_PURCHASES[Math.floor(Math.random() * SAMPLE_PURCHASES.length)];
      const minutesAgo = Math.floor(Math.random() * 30) + 1;
      
      setNotification({
        ...random,
        id: Date.now().toString(),
        time: `${minutesAgo}m ago`,
      });

      setTimeout(() => setNotification(null), 5000);
    };

    const initialTimeout = setTimeout(showNotification, 5000);
    const interval = setInterval(() => {
      showNotification();
    }, Math.random() * 10000 + 15000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          key={notification.id}
          initial={{ opacity: 0, y: 50, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 50, x: "-50%" }}
          className="fixed bottom-6 left-1/2 z-[80] max-w-sm w-full mx-4"
        >
          <div className="glass-card--strong p-4 flex items-center gap-4 border border-rift-orange/30 rounded-xl shadow-xl">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                <span className="text-rift-orange">{notification.name}</span> from {notification.location}
              </p>
              <p className="text-xs text-rift-mist/60 truncate">
                just purchased {notification.product}
              </p>
            </div>
            <span className="text-xs text-rift-mist/40 whitespace-nowrap">{notification.time}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}