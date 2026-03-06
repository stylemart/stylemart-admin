// ============================================================
// DASHBOARD HOME PAGE
// Shows overview stats and recent activity
// ============================================================

import { query } from "@/lib/db";
import {
  FiUsers,
  FiShoppingBag,
  FiShoppingCart,
  FiDollarSign,
} from "react-icons/fi";

// Fetch dashboard stats from database
async function getStats() {
  try {
    const [usersResult, productsResult, ordersResult, revenueResult] =
      await Promise.all([
        query("SELECT COUNT(*) as count FROM users"),
        query("SELECT COUNT(*) as count FROM products WHERE is_active = TRUE"),
        query("SELECT COUNT(*) as count FROM orders"),
        query(
          "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE payment_status = 'paid'"
        ),
      ]);

    return {
      totalUsers: parseInt(usersResult.rows[0].count),
      totalProducts: parseInt(productsResult.rows[0].count),
      totalOrders: parseInt(ordersResult.rows[0].count),
      totalRevenue: parseFloat(revenueResult.rows[0].total),
    };
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return {
      totalUsers: 0,
      totalProducts: 0,
      totalOrders: 0,
      totalRevenue: 0,
    };
  }
}

// Fetch recent orders
async function getRecentOrders() {
  try {
    const result = await query(
      `SELECT o.id, o.order_number, o.total_amount, o.status, o.created_at, u.full_name, u.email
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC
       LIMIT 5`
    );
    return result.rows;
  } catch (error) {
    return [];
  }
}

export default async function DashboardPage() {
  const stats = await getStats();
  const recentOrders = await getRecentOrders();

  // Stat cards configuration
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: FiUsers,
      color: "bg-blue-500",
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: FiShoppingBag,
      color: "bg-green-500",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: FiShoppingCart,
      color: "bg-orange-500",
    },
    {
      label: "Revenue",
      value: `R$ ${stats.totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      icon: FiDollarSign,
      color: "bg-purple-500",
    },
  ];

  return (
    <div>
      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Overview of your store performance
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="stat-card flex items-center gap-4">
              <div
                className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center`}
              >
                <Icon size={22} className="text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-xl font-bold text-gray-800">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="table-container">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">
            Recent Orders
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Order #
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Customer
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Amount
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-400"
                  >
                    No orders yet
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-primary">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {order.full_name || order.email || "—"}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-800">
                      R$ {parseFloat(order.total_amount).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-700"
                            : order.status === "paid"
                            ? "bg-yellow-100 text-yellow-700"
                            : order.status === "cancelled"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
