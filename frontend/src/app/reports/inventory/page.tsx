"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { InventoryReportItem, Category } from "@/types";
import { fetchInventoryReport, fetchCategories } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  RotateCcw,
  Search,
  Printer,
  FileSpreadsheet,
  Package,
  AlertTriangle,
  Boxes,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function InventoryReportPage() {
  const router = useRouter();
  const [items, setItems] = useState<InventoryReportItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [stockStatus, setStockStatus] = useState<string>("All");

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportData, catData] = await Promise.all([
        fetchInventoryReport({
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          search: search.trim() || undefined,
          stockStatus: stockStatus !== "All" ? stockStatus : undefined,
        }),
        fetchCategories(),
      ]);
      setItems(reportData || []);
      setCategories(catData || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, stockStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  // KPI Calculations
  const summary = useMemo(() => {
    const totalItems = items.length;
    let totalStockQty = 0;
    let totalStockValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    items.forEach((it) => {
      totalStockQty += it.instockQty;
      totalStockValue += it.stockValue;
      if (it.instockQty <= 0) {
        outOfStockCount++;
      } else if (it.instockQty <= it.minStock) {
        lowStockCount++;
      }
    });

    return {
      totalItems,
      totalStockQty,
      totalStockValue,
      lowStockCount,
      outOfStockCount,
    };
  }, [items]);

  // Client-side search filtering
  const filteredList = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (it) =>
        it.productName.toLowerCase().includes(q) ||
        it.sku.toLowerCase().includes(q) ||
        it.category.toLowerCase().includes(q)
    );
  }, [items, search]);

  const totalEntries = filteredList.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    if (filteredList.length === 0) return;
    const headers = [
      "SKU",
      "Product Name",
      "Category",
      "Unit",
      "Instock Qty",
      "Min Stock Alert",
      "Stock Value (THB)",
      "Status",
    ];

    const rows = filteredList.map((item) => [
      `"${item.sku}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.category}"`,
      `"${item.unit}"`,
      item.instockQty,
      item.minStock,
      item.stockValue,
      item.instockQty <= 0 ? "Out of Stock" : item.instockQty <= item.minStock ? "Low Stock" : "Normal",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `inventory_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.name,
      label: cat.name,
    }));
  }, [categories]);

  const stockStatusOptions = [
    { value: "low_stock", label: "⚠️ สต็อกถึงจุดเตือน (Low Stock)" },
    { value: "out_of_stock", label: "❌ สินค้าหมด (Out of Stock)" },
    { value: "in_stock", label: "✅ สต็อกพร้อมใช้ (In Stock)" },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 p-6 max-w-[1600px] mx-auto">
        {/* Top Tab Bar Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => router.push("/reports/inventory")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FE9F43] text-white shadow-xs transition-all cursor-pointer"
          >
            Inventory Report (รายงานสต็อกคงคลัง)
          </button>
          <button
            onClick={() => router.push("/reports/inventory/stock-history")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
          >
            Stock History (ประวัติการเบิก-รับสต็อกจริง)
          </button>
          <button
            onClick={() => router.push("/reports/inventory/sold-stock")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
          >
            Sold Stock (ประวัติสินค้าที่ขายออก)
          </button>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Inventory Report (รายงานสินค้าและวัตถุดิบคงคลัง)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              ตรวจสอบสต็อกคงเหลือจริง, มูลค่าสินค้าคงคลัง, และรายการที่ถึงจุดเตือนสั่งซื้อ (Real-time Live Inventory)
            </p>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => window.print()}
              title="พิมพ์รายงาน PDF"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span>Print</span>
            </button>
            <button
              onClick={handleExportCSV}
              title="ส่งออก CSV"
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 transition shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              title="รีเฟรชข้อมูล"
              onClick={loadData}
              className="p-2 rounded-lg bg-white hover:bg-gray-50 text-gray-600 transition border border-gray-300 shadow-xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                จำนวนรายการสินค้า (Total SKUs)
              </span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {summary.totalItems} <span className="text-xs font-normal text-gray-500">รายการ</span>
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Boxes className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                ยอดสต็อกรวม (Total In-Stock)
              </span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {summary.totalStockQty.toLocaleString()}{" "}
                <span className="text-xs font-normal text-gray-500">หน่วย/กก.</span>
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                มูลค่าสินค้าคงคลังรวม (Value)
              </span>
              <p className="text-xl font-bold text-indigo-700 mt-1">
                ฿{summary.totalStockValue.toLocaleString()}
              </p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider block">
                จุดเตือนสั่งซื้อ (Low Stock)
              </span>
              <p className="text-xl font-bold text-rose-700 mt-1">
                {summary.lowStockCount + summary.outOfStockCount}{" "}
                <span className="text-xs font-normal text-rose-500">รายการ</span>
              </p>
            </div>
            <div className="p-2.5 bg-rose-100 text-rose-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Box with SearchableSelect */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Real Search Box */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">ค้นหา (Search SKU / Product)</label>
              <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#FE9F43] h-10">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อสินค้า หรือ รหัส SKU..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                />
              </div>
            </div>

            {/* SearchableSelect for Real Categories */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">หมวดหมู่สินค้า (Category)</label>
              <SearchableSelect
                options={categoryOptions}
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val || "All");
                  setCurrentPage(1);
                }}
                placeholder="ค้นหาหมวดหมู่สินค้า..."
                showAllOption={true}
                allOptionLabel="ทุกหมวดหมู่ (All Categories)"
                showSelectOption={false}
                size="md"
              />
            </div>

            {/* SearchableSelect for Stock Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">สถานะสต็อก (Stock Status)</label>
              <SearchableSelect
                options={stockStatusOptions}
                value={stockStatus}
                onChange={(val) => {
                  setStockStatus(val || "All");
                  setCurrentPage(1);
                }}
                placeholder="เลือกสถานะสต็อก..."
                showAllOption={true}
                allOptionLabel="ทุกสถานะ (All Status)"
                showSelectOption={false}
                size="md"
              />
            </div>

            {/* Reset / Search Actions */}
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 h-10 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
              >
                ค้นหา
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedCategory("All");
                  setStockStatus("All");
                  setCurrentPage(1);
                }}
                className="px-3 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </form>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[850px] border-collapse">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4 font-bold">SKU</th>
                  <th className="py-3 px-4 font-bold">ชื่อสินค้า / วัตถุดิบ</th>
                  <th className="py-3 px-4 font-bold">หมวดหมู่</th>
                  <th className="py-3 px-4 font-bold">หน่วยนับ</th>
                  <th className="py-3 px-4 font-bold text-right">สต็อกคงเหลือ</th>
                  <th className="py-3 px-4 font-bold text-right">จุดเตือนสั่งซื้อ</th>
                  <th className="py-3 px-4 font-bold text-right">มูลค่าสต็อก</th>
                  <th className="py-3 px-4 font-bold text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FE9F43] border-t-transparent mb-2" />
                      <p>กำลังโหลดข้อมูลรายงานสต็อก...</p>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <Package className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">ไม่พบรายการสินค้าที่ตรงกับเงื่อนไข</p>
                      <p className="text-xs text-gray-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item) => {
                    const isOut = item.instockQty <= 0;
                    const isLow = !isOut && item.instockQty <= item.minStock;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono text-gray-600 font-medium">{item.sku}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 font-bold shrink-0 overflow-hidden">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Package className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span className="font-semibold text-gray-900">{item.productName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px]">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.unit}</td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900">
                          {item.instockQty.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-500">
                          {item.minStock.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          ฿{item.stockValue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isOut ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                              สินค้าหมด
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                              ถึงจุดเตือน
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
                              พร้อมใช้
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination Footer */}
          {!loading && filteredList.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-600 gap-3">
              <div className="flex items-center space-x-2">
                <span>แสดง</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="bg-white border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                >
                  <option value={10}>10 รายการ</option>
                  <option value={25}>25 รายการ</option>
                  <option value={50}>50 รายการ</option>
                  <option value={100}>100 รายการ</option>
                </select>
                <span>
                  จากทั้งหมด {totalEntries} รายการ (หน้า {currentPage} / {totalPages})
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 border border-gray-300 rounded bg-white disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="p-1.5 border border-gray-300 rounded bg-white disabled:opacity-40 hover:bg-gray-100 transition"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
