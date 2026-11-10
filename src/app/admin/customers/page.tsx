"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Mail, ShoppingBag, DollarSign, UserPlus, MoreVertical } from "lucide-react";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/admin/customers")
      .then((r) => r.json())
      .then((d) => { setCustomers(d.customers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filteredCustomers = customers.filter((c) =>
    [c.name, c.email].some((field: string) => String(field || "").toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customers</h1>
          <p className="text-sm text-rift-mist/50 mt-1">{customers.length} total customers</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-5 py-2.5 glass-card text-xs tracking-wider uppercase rounded-xl"
        >
          <UserPlus className="w-4 h-4" />
          Invite
        </motion.button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rift-mist/40" />
        <input
          type="text"
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      <div className="glass-card--strong rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="h-14 bg-rift-surface/60 rounded-xl animate-pulse" />)}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-xs text-rift-mist/40">No customers found</p>
          </div>
        ) : (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="border-b border-rift-mist/10">
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Customer</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Email</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Orders</th>
                  <th className="text-left py-3.5 px-6 text-[0.6rem] tracking-wider uppercase text-rift-mist/50 font-medium">Total Spent</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer, i) => (
                  <motion.tr
                    key={customer._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-rift-mist/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rift-orange/20 to-rift-rust/20 flex items-center justify-center border border-rift-mist/10">
                          <span className="text-[0.65rem] font-medium text-rift-mist">
                            {(customer.name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-medium">{customer.name || "Unknown"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-xs text-rift-mist/60">{customer.email || ""}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-xs font-medium">{customer.orderCount || 0}</span>
                    </td>
                    <td className="py-3.5 px-6">
                      <span className="text-xs font-medium">{customer.totalSpent ? `₹${Number(customer.totalSpent).toLocaleString()}` : "₹0"}</span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && filteredCustomers.length > 0 && (
          <div className="md:hidden divide-y divide-rift-mist/5">
            {filteredCustomers.map((customer) => (
              <div key={customer._id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rift-orange/20 to-rift-rust/20 flex items-center justify-center border border-rift-mist/10 flex-shrink-0">
                  <span className="text-xs font-medium text-rift-mist">
                    {(customer.name || "U").charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{customer.name || "Unknown"}</p>
                  <p className="text-xs text-rift-mist/50 truncate">{customer.email || ""}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-medium">{customer.totalSpent ? `₹${Number(customer.totalSpent).toLocaleString()}` : "₹0"}</p>
                  <p className="text-[0.65rem] text-rift-mist/40">{customer.orderCount || 0} orders</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}