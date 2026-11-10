import { query } from "@/lib/sql";
import { getRecentOrders, type AdminOrder } from "@/lib/db/orders";

export interface AnalyticsStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  subscribers: number;
}

export interface LowStockProduct {
  _id: string;
  name: string;
  stock: number;
}

export interface MonthlySale {
  _id: { year: number; month: number };
  revenue: number;
  orders: number;
}

export interface Analytics {
  stats: AnalyticsStats;
  recentOrders: AdminOrder[];
  lowStock: LowStockProduct[];
  monthlySales: MonthlySale[];
}

export async function getAnalytics(): Promise<Analytics> {
  const statsRes = await query<{
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalCustomers: number;
    subscribers: number;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM orders) AS totalOrders,
       (SELECT COALESCE(SUM(total), 0) FROM orders) AS totalRevenue,
       (SELECT COUNT(*) FROM products) AS totalProducts,
       (SELECT COUNT(*) FROM users WHERE role = 'user') AS totalCustomers,
       (SELECT COUNT(*) FROM newsletter_subscriptions) AS subscribers`
  );

  const lowStockRes = await query<LowStockProduct>(
    `SELECT TOP 10 id AS [_id], name, stock
     FROM products WHERE stock <= 10
     ORDER BY stock ASC`
  );

  const monthlyRes = await query<{
    year: number;
    month: number;
    revenue: number;
    orders: number;
  }>(
    `SELECT YEAR(created_at) AS year, MONTH(created_at) AS month,
            SUM(total) AS revenue, COUNT(*) AS orders
     FROM orders
     WHERE created_at >= DATEADD(MONTH, -6, SYSUTCDATETIME())
     GROUP BY YEAR(created_at), MONTH(created_at)
     ORDER BY YEAR(created_at), MONTH(created_at)`
  );

  const recentOrders = await getRecentOrders(5);

  return {
    stats: statsRes.recordset[0],
    recentOrders,
    lowStock: lowStockRes.recordset,
    monthlySales: monthlyRes.recordset.map((r) => ({
      _id: { year: r.year, month: r.month },
      revenue: r.revenue,
      orders: r.orders,
    })),
  };
}
