"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardStats } from "@/types";
import { fetchDashboardStats } from "@/lib/api";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  RotateCcw,
  Clock,
  Layers,
  Users,
  Calendar,
  Receipt,
  Gift,
  Boxes,
  ShoppingCart,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import { BahtIcon, CircleBahtIcon } from "@/components/common/BahtIcon";
import { useCurrencyStore } from "@/store/useCurrencyStore";

export default function Dashboard1Page() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<string>("1Y");
  const [recentTab, setRecentTab] = useState<"Sale" | "Purchase" | "Quotation" | "Expenses" | "Invoices">("Sale");

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

  const summary = stats?.summary;
  const { formatMoney, currencySymbol } = useCurrencyStore();

  // Dynamic format currency based on system settings
  const formatCur = (val: number | undefined) => {
    return formatMoney(val, 0);
  };

  // Customers Donut Data (Real)
  const firstTime = (summary as any)?.firstTimeCustomers || 0;
  const returning = (summary as any)?.returningCustomers || 0;
  const customerOverviewData = useMemo(() => {
    const total = firstTime + returning;
    if (total === 0) {
      return [{ name: "No Customers", value: 1, color: "#E2E8F0" }];
    }
    return [
      { name: "First Time", value: firstTime, color: "#0D9488" }, // Teal
      { name: "Return", value: returning, color: "#F97316" }, // Orange
    ];
  }, [firstTime, returning]);

  // Top Categories Donut Data (Real)
  const categoriesDonutData = useMemo(() => {
    if (stats?.topCategories && stats.topCategories.length > 0) {
      return stats.topCategories.map((c) => ({
        name: c.name,
        value: c.sales,
        color: c.color,
      }));
    }
    return [{ name: "No Categories", value: 1, color: "#E2E8F0" }];
  }, [stats]);

  // Order Heatmap Matrix Data (Days x Hours)
  const heatmapDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const heatmapHours = ["18 Am", "16 Pm", "14 Pm", "12 Am", "10 Am", "8 Am", "6 Am", "4 Am", "2 Am"];

  // Heatmap intensity from Real Counts
  const heatmapCounts = stats?.heatmapCounts || {};
  const maxHeatmapCount = useMemo(() => {
    const values = Object.values(heatmapCounts);
    return values.length > 0 ? Math.max(...values, 1) : 1;
  }, [heatmapCounts]);

  const getHeatmapColor = (hour: string, day: string) => {
    const count = heatmapCounts[`${hour}-${day}`] || 0;
    if (count === 0) return "bg-[#FFF7ED] border border-orange-100/50"; // No orders (very light)
    if (count / maxHeatmapCount > 0.5) return "bg-[#F97316] text-white"; // High density
    return "bg-[#FED7AA]"; // Medium density
  };

  // Real transactions list for active tab
  const currentTransactions = useMemo(() => {
    if (!stats?.recentTransactions) return [];
    return stats.recentTransactions[recentTab] || [];
  }, [stats, recentTab]);

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-16 text-[#1E293B]">
        {/* ========================================================= */}
        {/* ROW 1: HEADER & BANNER                                    */}
        {/* ========================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div>
            <h1 className="text-xl font-bold text-[#111827] tracking-tight">
              Welcome, Admin
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              You have <span className="font-bold text-orange-600">{summary?.todayOrders || 0} Orders</span> Today
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Date Range Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs font-medium text-gray-600 shadow-2xs">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </span>
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              title="Refresh Real Data"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-gray-600 flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* Low Stock Warning Alert Banner (Real) */}
        {stats?.lowStockProducts && stats.lowStockProducts.length > 0 && (
          <div className="flex items-center justify-between bg-orange-50/70 border border-orange-200/80 px-3.5 py-2 rounded-xl text-xs text-gray-700">
            <div className="flex items-center space-x-2">
              <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FE9F43] flex items-center justify-center font-bold text-[10px]">!</span>
              <span>
                Your Product <span className="font-bold text-gray-900">{stats.lowStockProducts[0]?.name}</span> is running Low (In-stock: {stats.lowStockProducts[0]?.stock} units).
              </span>
            </div>
            <Link href="/inventory/low-stock" className="text-xs text-orange-600 hover:text-orange-800 font-bold underline">
              View Low Stock
            </Link>
          </div>
        )}

        {/* ========================================================= */}
        {/* ROW 2: PRIMARY 4-COLOR METRIC CARDS (REAL DATA)           */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* 1. Total Sales (Orange) */}
          <div className="bg-[#FE9F43] rounded-2xl p-4 text-white shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <div className="text-[11px] font-medium text-white/90">Total Sales</div>
              <div className="text-xl font-black mt-1 tracking-tight">
                {formatCur(summary?.totalSales)}
              </div>
              <div className="inline-flex items-center space-x-1 mt-2 text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">
                <span>{summary?.totalOrders || 0} Total Orders</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <FileText className="w-5 h-5" />
            </div>
          </div>

          {/* 2. Total Sales Return (Dark Navy) */}
          <div className="bg-[#0F172A] rounded-2xl p-4 text-white shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <div className="text-[11px] font-medium text-white/80">Total Sales Return</div>
              <div className="text-xl font-black mt-1 tracking-tight">
                {formatCur(summary?.totalSalesReturn)}
              </div>
              <div className="inline-flex items-center space-x-1 mt-2 text-[10px] font-bold bg-rose-500/30 text-rose-200 px-1.5 py-0.5 rounded">
                <span>Real Sales Returns</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
          </div>

          {/* 3. Total Purchase (Teal / Emerald) */}
          <div className="bg-[#0D9488] rounded-2xl p-4 text-white shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <div className="text-[11px] font-medium text-white/90">Total Purchase</div>
              <div className="text-xl font-black mt-1 tracking-tight">
                {formatCur(summary?.totalPurchases)}
              </div>
              <div className="inline-flex items-center space-x-1 mt-2 text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">
                <span>{summary?.totalSuppliers || 0} Suppliers</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Gift className="w-5 h-5" />
            </div>
          </div>

          {/* 4. Total Purchase Return (Blue) */}
          <div className="bg-[#2563EB] rounded-2xl p-4 text-white shadow-sm flex items-center justify-between relative overflow-hidden">
            <div>
              <div className="text-[11px] font-medium text-white/90">Total Purchase Return</div>
              <div className="text-xl font-black mt-1 tracking-tight">
                {formatCur(summary?.totalPurchaseReturn)}
              </div>
              <div className="inline-flex items-center space-x-1 mt-2 text-[10px] font-bold bg-white/20 px-1.5 py-0.5 rounded">
                <span>Real Purchase Returns</span>
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 3: SECONDARY 4 STAT CARDS (REAL DATA)                 */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Profit */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-[#111827]">
                  {formatCur(summary?.profit)}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Estimated Net Profit</div>
              </div>
              <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Layers className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-[10px]">
              <span className="text-emerald-600 font-bold">Sales - Cost - Expenses</span>
              <Link href="/reports/profit-loss" className="text-gray-400 hover:text-gray-700 underline">View Report</Link>
            </div>
          </div>

          {/* Invoice Due */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-[#111827]">
                  {formatCur(summary?.invoiceDue)}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Purchases Due (ยอดค้างจ่าย)</div>
              </div>
              <span className="p-2 rounded-xl bg-cyan-50 text-cyan-600">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-[10px]">
              <span className="text-rose-600 font-bold">Outstanding PO Due</span>
              <Link href="/purchases" className="text-gray-400 hover:text-gray-700 underline">View Purchases</Link>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-[#111827]">
                  {formatCur(summary?.totalExpenses)}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Total Expenses (ค่าใช้จ่าย)</div>
              </div>
              <span className="p-2 rounded-xl bg-orange-50 text-orange-500">
                <Receipt className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-[10px]">
              <span className="text-gray-500 font-medium">Approved Expenses</span>
              <Link href="/finance/expenses" className="text-gray-400 hover:text-gray-700 underline">View Expenses</Link>
            </div>
          </div>

          {/* Total Payment Returns */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-[#111827]">
                  {formatCur(summary?.totalPaymentReturns)}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Total Returns Value</div>
              </div>
              <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <RotateCcw className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100 text-[10px]">
              <span className="text-gray-500 font-medium">Sales + PO Returns</span>
              <Link href="/sales/returns" className="text-gray-400 hover:text-gray-700 underline">View Returns</Link>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 4: SALES & PURCHASE CHART + OVERALL INFORMATION       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* Sales & Purchase Dual Bar Chart (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-orange-50 text-[#FE9F43]">
                  <TrendingUp className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-[#111827]">Sales & Purchase (Real 12 Months)</h3>
              </div>

              {/* Time Range Pills */}
              <div className="flex items-center bg-gray-100/70 p-0.5 rounded-lg text-[10px] font-semibold text-gray-500">
                {["1M", "3M", "6M", "1Y"].map((r) => (
                  <button
                    key={r}
                    onClick={() => setTimeRange(r)}
                    className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                      timeRange === r ? "bg-[#FE9F43] text-white shadow-2xs" : "hover:text-gray-900"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Badges */}
            <div className="flex items-center space-x-6 mb-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FED7AA]" />
                <div>
                  <div className="text-[10px] text-gray-400">Total Purchase</div>
                  <div className="font-bold text-[#111827]">{formatCur(summary?.totalPurchases)}</div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#FE9F43]" />
                <div>
                  <div className="text-[10px] text-gray-400">Total Sales</div>
                  <div className="font-bold text-[#111827]">{formatCur(summary?.totalSales)}</div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "11px" }}
                  />
                  <Bar dataKey="purchase" name={`Purchase (${currencySymbol})`} fill="#FED7AA" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar dataKey="sales" name={`Sales (${currencySymbol})`} fill="#FE9F43" radius={[4, 4, 0, 0]} barSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Overall Information & Customers Overview (1 col) */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Clock className="w-4 h-4 text-gray-400" />
                <h3 className="text-sm font-bold text-[#111827]">Overall Information (Real Count)</h3>
              </div>

              {/* 3 Metric Mini Boxes */}
              <div className="grid grid-cols-3 gap-2 text-center mb-6">
                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <Users className="w-4 h-4 mx-auto text-blue-500 mb-1" />
                  <div className="text-[10px] text-gray-400">Suppliers</div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">{summary?.totalSuppliers || 0}</div>
                </div>
                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <Users className="w-4 h-4 mx-auto text-orange-500 mb-1" />
                  <div className="text-[10px] text-gray-400">Customer</div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">{summary?.totalCustomers || 0}</div>
                </div>
                <div className="bg-gray-50/70 p-3 rounded-xl border border-gray-100">
                  <ShoppingCart className="w-4 h-4 mx-auto text-teal-500 mb-1" />
                  <div className="text-[10px] text-gray-400">Orders</div>
                  <div className="text-sm font-bold text-gray-900 mt-0.5">{summary?.totalOrders || 0}</div>
                </div>
              </div>

              {/* Customers Overview Donut */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-bold text-gray-800">Customers Ratio</div>
                  <span className="text-[10px] text-gray-400">Total: {firstTime + returning}</span>
                </div>

                <div className="flex items-center justify-around mt-2">
                  <div className="w-28 h-28 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerOverviewData}
                          innerRadius={30}
                          outerRadius={45}
                          paddingAngle={customerOverviewData.length > 1 ? 5 : 0}
                          dataKey="value"
                        >
                          {customerOverviewData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-sm font-bold text-[#111827]">{firstTime}</div>
                      <div className="text-[10px] text-gray-400">First Time Customer</div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[#111827]">{returning}</div>
                      <div className="text-[10px] text-gray-400">Returning Customer</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 5: TOP CUSTOMERS, TOP CATEGORIES, ORDER HEATMAP       */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* 1. Top Customers (Real) */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-[#111827]">Top Customers</h3>
              </div>
              <Link href="/customers" className="text-xs text-gray-400 hover:text-gray-700 underline">View All</Link>
            </div>

            <div className="divide-y divide-gray-100">
              {(!stats?.topCustomers || stats.topCustomers.length === 0) ? (
                <div className="py-8 text-center text-gray-400 text-xs">No customer orders recorded yet</div>
              ) : (
                stats.topCustomers.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs overflow-hidden">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 truncate max-w-[140px]">{c.name}</div>
                        <div className="text-[10px] text-gray-400 flex items-center space-x-1">
                          <span>⊙ {c.country}</span>
                          <span>•</span>
                          <span>{c.ordersCount} Orders</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs font-bold text-gray-900">{formatCur(c.totalSpent)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Top Categories (Real) */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-bold text-[#111827]">Top Categories (Real)</h3>
                </div>
                <Link href="/categories" className="text-[10px] text-gray-400 hover:text-gray-700 underline">Manage</Link>
              </div>

              {/* Donut Chart + Legend */}
              <div className="flex items-center justify-around py-2">
                <div className="w-32 h-32 relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoriesDonutData}
                        innerRadius={36}
                        outerRadius={52}
                        paddingAngle={categoriesDonutData.length > 1 ? 6 : 0}
                        dataKey="value"
                      >
                        {categoriesDonutData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-2.5 text-xs max-h-36 overflow-y-auto">
                  {categoriesDonutData.map((cat) => (
                    <div key={cat.name} className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-xs shrink-0" style={{ backgroundColor: cat.color }} />
                      <div>
                        <div className="text-[10px] text-gray-400 truncate max-w-[110px]">{cat.name}</div>
                        <div className="font-bold text-gray-900">{cat.value} <span className="font-normal text-[10px] text-gray-400">Items/Units</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Statistics Footer */}
            <div className="border-t border-gray-100 pt-3 mt-2 text-xs space-y-1.5">
              <div className="text-[11px] font-bold text-gray-500">Category Statistics</div>
              <div className="flex justify-between items-center text-gray-600 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-900" />
                  <span>Total Number Of Categories</span>
                </span>
                <span className="font-bold text-gray-900">{summary?.totalCategories || 0}</span>
              </div>
              <div className="flex justify-between items-center text-gray-600 text-[11px]">
                <span className="flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>Total Number Of Products</span>
                </span>
                <span className="font-bold text-gray-900">{summary?.totalProducts || 0}</span>
              </div>
            </div>
          </div>

          {/* 3. Order Statistics Heatmap (Real) */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Boxes className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-[#111827]">Order Statistics (Real Heatmap)</h3>
              </div>
              <span className="text-[10px] text-gray-400">Activity Level</span>
            </div>

            {/* Heatmap Grid */}
            <div className="space-y-1">
              {heatmapHours.map((hour) => (
                <div key={hour} className="flex items-center space-x-1.5">
                  <span className="w-10 text-[9px] text-gray-400 text-right shrink-0">{hour}</span>
                  <div className="grid grid-cols-7 gap-1 flex-1">
                    {heatmapDays.map((day) => {
                      const bgClass = getHeatmapColor(hour, day);
                      const count = heatmapCounts[`${hour}-${day}`] || 0;
                      return (
                        <div
                          key={`${hour}-${day}`}
                          title={`${day} @ ${hour}: ${count} orders`}
                          className={`h-4 rounded-xs transition-colors flex items-center justify-center text-[8px] font-bold ${bgClass}`}
                        >
                          {count > 0 ? count : ""}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Day Labels at bottom */}
              <div className="flex items-center space-x-1.5 pt-1">
                <span className="w-10 shrink-0" />
                <div className="grid grid-cols-7 gap-1 flex-1 text-center text-[9px] text-gray-400 font-medium">
                  {heatmapDays.map((d) => (
                    <span key={d}>{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 6: TOP SELLING, LOW STOCK, RECENT SALES (REAL)        */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          {/* 1. Top Selling Products */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="w-4 h-4 text-rose-500" />
                <h3 className="text-sm font-bold text-[#111827]">Top Selling Products</h3>
              </div>
              <Link href="/reports/sales/best-seller" className="text-xs text-gray-400 hover:text-gray-700 underline">View Report</Link>
            </div>

            <div className="divide-y divide-gray-100">
              {(!stats?.topSellingProducts || stats.topSellingProducts.length === 0) ? (
                <div className="py-8 text-center text-gray-400 text-xs">No sales recorded yet</div>
              ) : (
                stats.topSellingProducts.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 truncate max-w-[140px]">{p.name}</div>
                        <div className="text-[10px] text-gray-400">
                          {formatCur(p.sellingPrice || p.price || 0)} • {p.totalSold || 0} Sold
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Top
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 2. Low Stock Products */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold text-[#111827]">Low Stock Products (Real)</h3>
              </div>
              <Link href="/inventory/low-stock" className="text-xs text-gray-400 hover:text-gray-700 underline">View All</Link>
            </div>

            <div className="divide-y divide-gray-100">
              {(!stats?.lowStockProducts || stats.lowStockProducts.length === 0) ? (
                <div className="py-8 text-center text-gray-400 text-xs">No low stock alerts! All items sufficient.</div>
              ) : (
                stats.lowStockProducts.slice(0, 5).map((p: any) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                        {p.image ? (
                          <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-gray-900 truncate max-w-[140px]">{p.name}</div>
                        <div className="text-[10px] text-gray-400 font-mono">ID: #{p.sku || p.id.slice(0, 6)}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-gray-400">Instock</div>
                      <div className="text-xs font-bold text-orange-600">{p.stock < 10 ? `0${p.stock}` : p.stock}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 3. Recent Sales */}
          <div className="bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-4 h-4 text-pink-500" />
                <h3 className="text-sm font-bold text-[#111827]">Recent Sales (Real)</h3>
              </div>
              <Link href="/sales" className="text-xs text-gray-400 hover:text-gray-700 underline">View All</Link>
            </div>

            <div className="divide-y divide-gray-100">
              {(!stats?.recentOrders || stats.recentOrders.length === 0) ? (
                <div className="py-8 text-center text-gray-400 text-xs">No recent sales recorded yet</div>
              ) : (
                stats.recentOrders.slice(0, 5).map((ord: any) => {
                  const prodName = ord.items?.[0]?.productName || `Order #${ord.orderNumber || ord.id.slice(0, 6)}`;
                  const st = (ord.paymentStatus || ord.status || "COMPLETED").toUpperCase();
                  return (
                    <div key={ord.id} className="py-2.5 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                          <Package className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-gray-900 truncate max-w-[130px]">{prodName}</div>
                          <div className="text-[10px] text-gray-400">
                            {formatCur(ord.total || 0)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-[9px] text-gray-400">
                          {new Date(ord.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                        </div>
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            st === "PAID" || st === "COMPLETED"
                              ? "bg-emerald-500 text-white"
                              : st === "CANCELLED"
                              ? "bg-rose-500 text-white"
                              : "bg-amber-500 text-white"
                          }`}
                        >
                          ● {st}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* ROW 7: SALES STATICS (DIVERGING BARS) + RECENT TRANSACTIONS */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Sales Statistics (Diverging Bar Chart: Revenue vs Expense) - 6 cols */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-rose-50 text-rose-500">
                  <AlertCircle className="w-4 h-4" />
                </span>
                <h3 className="text-sm font-bold text-[#111827]">Sales Statistics (Revenue vs Expense)</h3>
              </div>
              <span className="text-[10px] text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded">
                Real 2026
              </span>
            </div>

            {/* Revenue / Expense Badges */}
            <div className="flex items-center space-x-4 mb-4">
              <div className="border border-emerald-200 bg-emerald-50/40 p-2 rounded-xl flex items-center space-x-2">
                <div>
                  <div className="text-xs font-black text-gray-900">{formatCur(summary?.totalSales)}</div>
                  <div className="text-[9px] text-gray-400">Real Revenue</div>
                </div>
              </div>

              <div className="border border-rose-200 bg-rose-50/40 p-2 rounded-xl flex items-center space-x-2">
                <div>
                  <div className="text-xs font-black text-gray-900">{formatCur(summary?.totalExpenses)}</div>
                  <div className="text-[9px] text-gray-400">Real Expense</div>
                </div>
              </div>
            </div>

            {/* Chart: Diverging Bar Chart */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.chartData || []}
                  stackOffset="sign"
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "11px" }}
                  />
                  <Bar dataKey="revenue" name={`Revenue (${currencySymbol})`} fill="#0D9488" stackId="stack" barSize={14} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name={`Expense (${currencySymbol})`} fill="#EA580C" stackId="stack" barSize={14} radius={[0, 0, 4, 4]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Transactions Tabbed Table - 6 cols */}
          <div className="lg:col-span-6 bg-white rounded-2xl p-5 border border-[#E5E7EB] shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className="p-1 rounded bg-orange-50 text-orange-500">
                    <Receipt className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-[#111827]">Recent Transactions (Real Database)</h3>
                </div>
                <span className="text-xs text-gray-400">Latest 5 Records</span>
              </div>

              {/* Transaction Tabs */}
              <div className="flex border-b border-gray-200 space-x-6 text-xs mb-3 font-semibold">
                {(["Sale", "Purchase", "Quotation", "Expenses", "Invoices"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setRecentTab(tab)}
                    className={`pb-2 transition-all cursor-pointer ${
                      recentTab === tab
                        ? "text-[#FE9F43] border-b-2 border-[#FE9F43]"
                        : "text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Transactions Table */}
              <div className="overflow-x-auto min-h-[180px]">
                {currentTransactions.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 text-xs">
                    No {recentTab} records found in database yet.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="text-[10px] text-gray-400 font-semibold border-b border-gray-100">
                      <tr>
                        <th className="pb-2">Date</th>
                        <th className="pb-2">Name / Party</th>
                        <th className="pb-2">Status</th>
                        <th className="pb-2 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {currentTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-gray-50/50">
                          <td className="py-2.5 text-gray-500 text-[11px]">{tx.date}</td>
                          <td className="py-2.5 font-medium text-gray-900">
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center font-bold text-[10px] text-gray-600">
                                {tx.customer.charAt(0)}
                              </div>
                              <div>
                                <div>{tx.customer}</div>
                                <div className="text-[9px] text-gray-400 font-mono">{tx.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2.5">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                tx.status.toLowerCase().includes("completed") || tx.status.toLowerCase().includes("paid") || tx.status.toLowerCase().includes("approved")
                                  ? "bg-emerald-500 text-white"
                                  : tx.status.toLowerCase().includes("cancel")
                                  ? "bg-rose-500 text-white"
                                  : "bg-purple-600 text-white"
                              }`}
                            >
                              ● {tx.status}
                            </span>
                          </td>
                          <td className="py-2.5 text-right font-bold text-gray-900">{tx.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
