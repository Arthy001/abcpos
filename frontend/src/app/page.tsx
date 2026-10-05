"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardStats } from "@/types";
import { fetchDashboardStats } from "@/lib/api";
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || "Failed to connect to backend server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Top Header / Welcome Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome Back, Admin 👋</h1>
            <p className="text-sm text-gray-500 mt-1">Here is what's happening with your store today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-orange-500" : "text-gray-500"}`} />
              <span>Refresh</span>
            </button>
            <Link
              href="/pos"
              className="flex items-center space-x-2 px-5 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-orange-500/20 active:scale-95 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Open POS</span>
            </Link>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Backend connection error: {error}. Make sure backend server is running on port 5000.</span>
            </div>
            <button onClick={loadData} className="text-sm font-bold underline ml-4">
              Retry
            </button>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Sales */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <DollarSign className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                Today: ฿{(stats?.summary.todaySales ?? 0).toLocaleString()}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                ฿{stats?.summary.totalSales.toLocaleString() ?? "0"}
              </h3>
            </div>
          </div>

          {/* Total Orders */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <ShoppingCart className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                Today: {stats?.summary.todayOrders ?? 0}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Orders</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.summary.totalOrders ?? 0}
              </h3>
            </div>
          </div>

          {/* Total Products */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-500">
                <Package className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                Active Catalog
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Total Products</p>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                {stats?.summary.totalProducts ?? 0}
              </h3>
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="text-xs font-semibold text-amber-700 bg-amber-100 px-2 py-1 rounded-md">
                Threshold &le; 5
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Low Stock Alerts</p>
              <h3 className="text-2xl font-bold text-amber-600 mt-1">
                {stats?.summary.lowStockCount ?? 0} Items
              </h3>
            </div>
          </div>
        </div>

        {/* Sales Chart & Low Stock Side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Sales & Purchase Overview</h3>
                <p className="text-xs text-gray-400">Monthly revenue compared to purchase expenses</p>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <span className="inline-block w-3 h-3 rounded-full bg-orange-500"></span>
                <span className="text-gray-600 font-medium">Sales</span>
                <span className="inline-block w-3 h-3 rounded-full bg-blue-500 ml-2"></span>
                <span className="text-gray-600 font-medium">Purchases</span>
              </div>
            </div>

            <div className="h-72 w-full">
              {stats?.chartData && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fill: "#888", fontSize: 12 }} />
                    <Tooltip
                      formatter={(val: number) => [`฿${val.toLocaleString()}`, ""]}
                      contentStyle={{ backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e5e7eb" }}
                    />
                    <Bar dataKey="sales" fill="#FE9F43" radius={[6, 6, 0, 0]} barSize={22} name="Sales" />
                    <Bar dataKey="purchase" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={22} name="Purchases" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Low Stock Alerts Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-gray-900">Low Stock Products</h3>
                <span className="text-xs font-semibold px-2 py-0.5 bg-red-50 text-red-600 rounded-md">
                  {stats?.lowStockProducts.length || 0} Alerts
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {stats?.lowStockProducts.map((p) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400 font-semibold text-xs border border-gray-200">
                        {p.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold px-2 py-1 bg-red-100 text-red-700 rounded-full">
                        {p.stock} left
                      </span>
                    </div>
                  </div>
                ))}
                {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) && (
                  <p className="text-xs text-gray-400 py-6 text-center">All stocks are currently sufficient.</p>
                )}
              </div>
            </div>

            <Link
              href="/products"
              className="w-full mt-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-semibold rounded-xl text-center border border-gray-200 block transition-colors"
            >
              Manage Inventory
            </Link>
          </div>
        </div>

        {/* Lower Row: Recent Transactions (2 cols) & Top Selling Products (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Transactions Table */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Transactions</h3>
                <p className="text-xs text-gray-400">Latest completed sales orders</p>
              </div>
              <Link href="/orders" className="text-xs font-semibold text-orange-600 hover:text-orange-700 flex items-center space-x-1">
                <span>View All Orders</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <table className="w-full text-left text-sm text-gray-600 min-w-[550px]">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider border-b border-gray-200">
                  <tr>
                    <th className="px-3 py-3 rounded-l-lg">Order ID</th>
                    <th className="px-3 py-3">Customer</th>
                    <th className="px-3 py-3">Payment</th>
                    <th className="px-3 py-3">Total Amount</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 rounded-r-lg text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {stats?.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-3 py-3 font-semibold text-gray-900">{order.orderNumber}</td>
                      <td className="px-3 py-3 font-medium text-gray-700">
                        {order.customer?.name || "Walk-in Customer"}
                      </td>
                      <td className="px-3 py-3">
                        <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                          {order.paymentMethod}
                        </span>
                      </td>
                      <td className="px-3 py-3 font-bold text-gray-900">
                        ฿{order.total.toLocaleString()}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${order.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right text-xs text-gray-400">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}

                  {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-gray-400 text-xs">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Selling Products Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Top Selling Products</h3>
                  <p className="text-xs text-gray-400">Highest volume items</p>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md">
                  Best Sellers
                </span>
              </div>

              <div className="divide-y divide-gray-100">
                {stats?.topSellingProducts?.map((product: any, idx) => (
                  <div key={product.id || idx} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-xs">
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">฿{Number(product.price).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                        {product.totalSold !== undefined ? `${product.totalSold} sold` : `${product.stock} in stock`}
                      </span>
                    </div>
                  </div>
                ))}

                {(!stats?.topSellingProducts || stats.topSellingProducts.length === 0) && (
                  <p className="text-xs text-gray-400 py-6 text-center">No sales recorded yet.</p>
                )}
              </div>
            </div>

            <Link
              href="/pos"
              className="w-full mt-4 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-600 text-xs font-bold rounded-xl text-center border border-orange-200 block transition-colors"
            >
              Open POS Terminal
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
