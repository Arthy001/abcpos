"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SalesReportItem, SalesReportSummary, Store, Category } from "@/types";
import { fetchSalesReport, fetchStores, fetchCategories } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  RotateCcw,
  Search,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  FileSpreadsheet,
  TrendingUp,
  Percent,
} from "lucide-react";

export default function SalesReportPage() {
  const [items, setItems] = useState<SalesReportItem[]>([]);
  const [summary, setSummary] = useState<SalesReportSummary>({
    totalAmount: "฿0",
    totalPaid: "฿0",
    totalUnpaid: "฿0",
    overdue: "฿0",
  });
  const [stores, setStores] = useState<Store[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadFilterOptions = async () => {
    try {
      const [storesData, categoriesData] = await Promise.all([
        fetchStores(),
        fetchCategories(),
      ]);
      setStores(storesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Failed to load filter options", err);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchSalesReport({
        store: selectedStore === "all" ? undefined : selectedStore,
        category: selectedCategory === "all" ? undefined : selectedCategory,
        search: search || undefined,
      });
      if (res.items) {
        setItems(res.items);
      } else {
        setItems([]);
      }
      if (res.summary) {
        setSummary(res.summary);
      }
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFilterOptions();
  }, []);

  useEffect(() => {
    loadData();
  }, [selectedStore, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const displayList = items || [];
  const totalEntries = displayList.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedList = displayList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    const headers = ["SKU,Product Name,Brand,Category,Sold Qty,Sold Revenue,Cost of Goods,Gross Profit,Margin %,Instock Qty"];
    const rows = displayList.map(
      (item) => `"${item.sku}","${item.productName}","${item.brand}","${item.category}",${item.soldQty},${item.soldAmount},${item.costAmount || 0},${item.profitAmount || 0},"${item.profitMargin || 0}%",${item.instockQty}`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Sales & Gross Profit Report</h1>
            <p className="text-xs text-gray-500 mt-0.5">Real-time revenue, product sales volume, and gross profit margins</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadData}
              disabled={loading}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 flex items-center space-x-1.5 transition-colors border border-gray-200 shadow-xs text-xs font-semibold cursor-pointer"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : "text-gray-500"}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={handleExportCSV}
              title="Export CSV"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-emerald-700 flex items-center space-x-1.5 transition-colors border border-gray-200 shadow-xs text-xs font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              title="Print Report"
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-gray-50 text-gray-700 flex items-center space-x-1.5 transition-colors border border-gray-200 shadow-xs text-xs font-semibold cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-gray-600" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Sales Revenue</p>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">{summary.totalAmount}</h3>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="bg-white p-4 rounded-2xl border border-orange-200 shadow-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Gross Profit</p>
              <h3 className="text-lg font-bold text-orange-600 mt-0.5">
                {(summary as any).totalProfit || "฿0"}
              </h3>
            </div>
          </div>

          {/* Total Paid */}
          <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Paid</p>
              <h3 className="text-lg font-bold text-blue-600 mt-0.5">{summary.totalPaid}</h3>
            </div>
          </div>

          {/* Total Unpaid / Due */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">Unpaid / Due</p>
              <h3 className="text-lg font-bold text-rose-600 mt-0.5">{summary.totalUnpaid}</h3>
            </div>
          </div>
        </div>

        {/* Filter Bar with SearchableSelect */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search SKU or Product..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:bg-white"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* Store Select */}
            <div>
              <SearchableSelect
                placeholder="All Stores"
                options={[
                  { label: "All Stores", value: "all" },
                  ...stores.map((s) => ({ label: s.name, value: s.name })),
                ]}
                value={selectedStore}
                onChange={(val) => {
                  setSelectedStore(val);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Category Select */}
            <div>
              <SearchableSelect
                placeholder="All Categories"
                options={[
                  { label: "All Categories", value: "all" },
                  ...categories.map((c) => ({ label: c.name, value: c.name })),
                ]}
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val);
                  setCurrentPage(1);
                }}
              />
            </div>

            {/* Submit / Search Button */}
            <div>
              <button
                type="submit"
                className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-900">
              Product Sales Breakdown ({totalEntries} items)
            </h2>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[900px]">
              <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4 min-w-[200px]">Product Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-center">Sold Qty</th>
                  <th className="py-3 px-4">Sold Revenue</th>
                  <th className="py-3 px-4">Cost (COGS)</th>
                  <th className="py-3 px-4">Gross Profit</th>
                  <th className="py-3 px-4 text-center">Margin</th>
                  <th className="py-3 px-4 text-right">In-Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedList.map((item) => {
                  const isProfitable = (item.profitAmount || 0) >= 0;
                  return (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      {/* SKU */}
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-800 text-[11px]">
                        {item.sku}
                      </td>

                      {/* Product Name with Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.productImage || "/assets/images/product-01.jpg"}
                            alt={item.productName}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                          <span className="font-semibold text-gray-900 line-clamp-1">{item.productName}</span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-gray-600">
                        <span className="px-2 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium">
                          {item.category}
                        </span>
                      </td>

                      {/* Sold Qty */}
                      <td className="py-3.5 px-4 text-center font-bold text-gray-900">
                        {item.soldQty}
                      </td>

                      {/* Sold Revenue */}
                      <td className="py-3.5 px-4 font-bold text-gray-900">
                        ฿{Number(item.soldAmount).toLocaleString()}
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-gray-500">
                        ฿{Number(item.costAmount || 0).toLocaleString()}
                      </td>

                      {/* Gross Profit */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            isProfitable ? "text-emerald-600" : "text-rose-600"
                          }`}
                        >
                          ฿{Number(item.profitAmount || 0).toLocaleString()}
                        </span>
                      </td>

                      {/* Margin % */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            (item.profitMargin || 0) >= 30
                              ? "bg-emerald-50 text-emerald-700"
                              : (item.profitMargin || 0) > 0
                              ? "bg-blue-50 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.profitMargin || 0}%
                        </span>
                      </td>

                      {/* Instock Qty */}
                      <td className="py-3.5 px-4 text-right">
                        <span
                          className={`font-semibold ${
                            item.instockQty <= 5 ? "text-rose-600 font-bold" : "text-gray-700"
                          }`}
                        >
                          {item.instockQty} left
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {paginatedList.length === 0 && !loading && (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-gray-400">
                      No sales data found matching the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-gray-500 gap-3 border-t border-gray-100">
            <div className="flex items-center space-x-2">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span>entries per page (Total {totalEntries})</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Prev
              </button>

              <span className="font-semibold text-gray-700">
                Page {currentPage} of {totalPages}
              </span>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-2 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
