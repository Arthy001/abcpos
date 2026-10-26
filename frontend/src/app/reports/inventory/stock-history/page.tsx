"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { StockHistoryItem, Category } from "@/types";
import { fetchStockHistoryReport, fetchCategories } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  RotateCcw,
  Search,
  Printer,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";

export default function StockHistoryPage() {
  const router = useRouter();
  const [items, setItems] = useState<StockHistoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedType, setSelectedType] = useState<string>("All");

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [historyData, catData] = await Promise.all([
        fetchStockHistoryReport({
          category: selectedCategory !== "All" ? selectedCategory : undefined,
          type: selectedType !== "All" ? selectedType : undefined,
          search: search.trim() || undefined,
        }),
        fetchCategories(),
      ]);
      setItems(historyData || []);
      setCategories(catData || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, selectedType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  // Filtered List
  const filteredList = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (it) =>
        it.productName.toLowerCase().includes(q) ||
        it.sku.toLowerCase().includes(q) ||
        (it.reference && it.reference.toLowerCase().includes(q)) ||
        (it.notes && it.notes.toLowerCase().includes(q)) ||
        (it.category && it.category.toLowerCase().includes(q))
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
      "Date",
      "Reference No",
      "SKU",
      "Product Name",
      "Category",
      "Type",
      "Quantity Change",
      "Balance After",
      "Warehouse",
      "Notes",
    ];

    const rows = filteredList.map((item) => [
      `"${item.date ? new Date(item.date).toLocaleString("th-TH") : "-"}"`,
      `"${item.reference || "-"}"`,
      `"${item.sku}"`,
      `"${item.productName.replace(/"/g, '""')}"`,
      `"${item.category || "-"}"`,
      `"${item.type || "-"}"`,
      item.quantity != null ? item.quantity : item.addedQuantity || 0,
      item.balanceAfter != null ? item.balanceAfter : item.finalQuantity || 0,
      `"${item.warehouse || "-"}"`,
      `"${(item.notes || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `stock_history_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case "INTERNAL_ISSUE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            เบิกผลิต (Manufacturing)
          </span>
        );
      case "ADJUSTMENT_PLUS":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            รับเข้าผลิต / ปรับยอด +
          </span>
        );
      case "SALE_ISSUE":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            ขายออก (Sale Issue)
          </span>
        );
      case "PURCHASE_RECEIPT":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            รับเข้าจัดซื้อ (Purchase)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
            {type || "ทั่วไป"}
          </span>
        );
    }
  };

  const movementTypeOptions = [
    { value: "INTERNAL_ISSUE", label: "🏭 เบิกวัตถุดิบเข้าสายผลิต (INTERNAL_ISSUE)" },
    { value: "ADJUSTMENT_PLUS", label: "📦 รับสินค้าสำเร็จรูปเข้าคลัง (ADJUSTMENT_PLUS)" },
    { value: "SALE_ISSUE", label: "🛒 ขายสินค้าออก (SALE_ISSUE)" },
    { value: "PURCHASE_RECEIPT", label: "📥 รับสินค้าจากการจัดซื้อ (PURCHASE_RECEIPT)" },
  ];

  const categoryOptions = useMemo(() => {
    return categories.map((cat) => ({
      value: cat.name,
      label: cat.name,
    }));
  }, [categories]);

  return (
    <AppLayout>
      <div className="space-y-5 p-6 max-w-[1600px] mx-auto">
        {/* Top Tab Bar Navigation */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3">
          <button
            onClick={() => router.push("/reports/inventory")}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-all cursor-pointer"
          >
            Inventory Report (รายงานสต็อกคงคลัง)
          </button>
          <button
            onClick={() => router.push("/reports/inventory/stock-history")}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FE9F43] text-white shadow-xs transition-all cursor-pointer"
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
              Stock Movement History (ประวัติการเคลื่อนไหวสต็อกจริง)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              บันทึกบัญชีสินค้าคงเหลือ (Stock Ledger) การเบิกวัตถุดิบฝ่ายผลิต, รับสินค้าสำเร็จรูป, และขายสินค้าจริง
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

        {/* Filter Box with SearchableSelect */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">ค้นหา (Search)</label>
              <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#FE9F43] h-10">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="เลขอ้างอิง WO/PO, SKU, ชื่อสินค้า..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Movement Type Filter Searchable */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">ประเภทรายการ (Movement Type)</label>
              <SearchableSelect
                options={movementTypeOptions}
                value={selectedType}
                onChange={(val) => {
                  setSelectedType(val || "All");
                  setCurrentPage(1);
                }}
                placeholder="เลือกประเภทความเคลื่อนไหว..."
                showAllOption={true}
                allOptionLabel="ทุกประเภทรายการ (All Types)"
                showSelectOption={false}
                size="md"
              />
            </div>

            {/* Category Filter Searchable */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">หมวดหมู่สินค้า (Category)</label>
              <SearchableSelect
                options={categoryOptions}
                value={selectedCategory}
                onChange={(val) => {
                  setSelectedCategory(val || "All");
                  setCurrentPage(1);
                }}
                placeholder="เลือกหมวดหมู่สินค้า..."
                showAllOption={true}
                allOptionLabel="ทุกหมวดหมู่ (All Categories)"
                showSelectOption={false}
                size="md"
              />
            </div>

            {/* Buttons */}
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
                  setSelectedType("All");
                  setCurrentPage(1);
                }}
                className="px-3 h-10 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-xs font-medium transition cursor-pointer"
              >
                ล้างตัวกรอง
              </button>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[950px] border-collapse">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4 font-bold">วันที่ / เวลา</th>
                  <th className="py-3 px-4 font-bold">เลขอ้างอิง (Ref)</th>
                  <th className="py-3 px-4 font-bold">สินค้า / วัตถุดิบ</th>
                  <th className="py-3 px-4 font-bold">หมวดหมู่</th>
                  <th className="py-3 px-4 font-bold text-center">ประเภท</th>
                  <th className="py-3 px-4 font-bold text-right">จำนวน (+/-)</th>
                  <th className="py-3 px-4 font-bold text-right">คงเหลือหลังทำ</th>
                  <th className="py-3 px-4 font-bold">บันทึกช่วยจำ (Notes)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FE9F43] border-t-transparent mb-2" />
                      <p>กำลังโหลดประวัติความเคลื่อนไหวสต็อก...</p>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <History className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">ไม่พบประวัติความเคลื่อนไหวสต็อก</p>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item) => {
                    const delta = item.quantity != null ? item.quantity : item.addedQuantity || 0;
                    const isPositive = delta > 0;
                    const isNegative = delta < 0;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                          {item.date ? new Date(item.date).toLocaleString("th-TH") : "-"}
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                          {item.reference || "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{item.productName}</div>
                          <div className="font-mono text-[11px] text-gray-500">{item.sku}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[11px]">
                            {item.category || "ทั่วไป"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {getTypeBadge(item.type)}
                        </td>
                        <td className="py-3 px-4 text-right font-bold whitespace-nowrap">
                          <span
                            className={
                              isPositive
                                ? "text-emerald-600"
                                : isNegative
                                ? "text-rose-600"
                                : "text-gray-600"
                            }
                          >
                            {isPositive ? `+${delta.toLocaleString()}` : delta.toLocaleString()}{" "}
                            {item.unit || "กก."}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-gray-900 whitespace-nowrap">
                          {(item.balanceAfter != null ? item.balanceAfter : item.finalQuantity || 0).toLocaleString()}{" "}
                          {item.unit || "กก."}
                        </td>
                        <td className="py-3 px-4 text-gray-600 max-w-[250px] truncate" title={item.notes || ""}>
                          {item.notes || "-"}
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
