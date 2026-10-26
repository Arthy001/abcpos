"use client";

import React, { useEffect, useState, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { PurchaseReportItem, Supplier } from "@/types";
import { fetchPurchaseReport, fetchSuppliers } from "@/lib/api";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  RotateCcw,
  Search,
  Printer,
  FileSpreadsheet,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
  Building,
  DollarSign,
} from "lucide-react";

export default function PurchaseReportPage() {
  const [items, setItems] = useState<PurchaseReportItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters
  const [search, setSearch] = useState<string>("");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  // Pagination
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportData, suppData] = await Promise.all([
        fetchPurchaseReport({
          supplier: selectedSupplier !== "All" ? selectedSupplier : undefined,
          status: selectedStatus !== "All" ? selectedStatus : undefined,
          search: search.trim() || undefined,
        }),
        fetchSuppliers(),
      ]);
      setItems(reportData || []);
      setSuppliers(suppData || []);
    } catch (e) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSupplier, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadData();
  };

  // KPI Calculations
  const summary = useMemo(() => {
    const totalOrders = items.length;
    let grandTotal = 0;
    let totalPaid = 0;
    let totalDue = 0;

    items.forEach((it) => {
      grandTotal += it.total || it.purchaseAmount || 0;
      totalPaid += it.paid || 0;
      totalDue += it.due || 0;
    });

    return {
      totalOrders,
      grandTotal,
      totalPaid,
      totalDue,
    };
  }, [items]);

  // Client-side search filtering
  const filteredList = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (it) =>
        it.reference.toLowerCase().includes(q) ||
        (it.supplierName && it.supplierName.toLowerCase().includes(q)) ||
        (it.productName && it.productName.toLowerCase().includes(q))
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
      "PO Reference",
      "Supplier",
      "Date",
      "Products",
      "Total Amount (THB)",
      "Paid",
      "Due",
      "Status",
    ];

    const rows = filteredList.map((item) => [
      `"${item.reference}"`,
      `"${(item.supplierName || "").replace(/"/g, '""')}"`,
      `"${item.date ? new Date(item.date).toISOString().slice(0, 10) : "-"}"`,
      `"${(item.productName || "-").replace(/"/g, '""')}"`,
      item.total || item.purchaseAmount || 0,
      item.paid || 0,
      item.due || 0,
      item.status || "-",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `purchase_report_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const supplierOptions = useMemo(() => {
    return suppliers.map((s) => ({
      value: s.name,
      label: s.name,
    }));
  }, [suppliers]);

  const statusOptions = [
    { value: "ORDERED", label: "สั่งซื้อแล้ว (ORDERED)" },
    { value: "RECEIVED", label: "รับสินค้าแล้ว (RECEIVED)" },
    { value: "PENDING", label: "รอดำเนินการ (PENDING)" },
    { value: "CANCELLED", label: "ยกเลิก (CANCELLED)" },
  ];

  return (
    <AppLayout>
      <div className="space-y-5 p-6 max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Purchase Report (รายงานการจัดซื้อสินค้าและวัตถุดิบ)
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              สรุปข้อมูลใบสั่งซื้อ (PO), ประวัติการสั่งซื้อจากผู้ผลิตและซัพพลายเออร์จริง (Real-time Live Purchases)
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
                จำนวนใบสั่งซื้อ (Total POs)
              </span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                {summary.totalOrders} <span className="text-xs font-normal text-gray-500">ใบ</span>
              </p>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                ยอดจัดซื้อรวม (Total Value)
              </span>
              <p className="text-xl font-bold text-gray-900 mt-1">
                ฿{summary.grandTotal.toLocaleString()}
              </p>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider block">
                ชำระแล้ว (Paid Amount)
              </span>
              <p className="text-xl font-bold text-indigo-700 mt-1">
                ฿{summary.totalPaid.toLocaleString()}
              </p>
            </div>
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider block">
                ยอดค้างจ่ายเจ้าหนี้ (Due)
              </span>
              <p className="text-xl font-bold text-amber-700 mt-1">
                ฿{summary.totalDue.toLocaleString()}
              </p>
            </div>
            <div className="p-2.5 bg-amber-100 text-amber-700 rounded-xl">
              <Building className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Box with SearchableSelect */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs p-4">
          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Search */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">ค้นหา (Search PO / Supplier)</label>
              <div className="relative flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-white focus-within:ring-2 focus-within:ring-[#FE9F43] h-10">
                <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
                <input
                  type="text"
                  placeholder="พิมพ์เลข PO หรือ ชื่อซัพพลายเออร์..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-transparent text-xs text-gray-800 focus:outline-none"
                />
              </div>
            </div>

            {/* Real Searchable Suppliers */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">ผู้จัดจำหน่าย (Supplier)</label>
              <SearchableSelect
                options={supplierOptions}
                value={selectedSupplier}
                onChange={(val) => {
                  setSelectedSupplier(val || "All");
                  setCurrentPage(1);
                }}
                placeholder="เลือกผู้จัดจำหน่าย/ซัพพลายเออร์..."
                showAllOption={true}
                allOptionLabel="ซัพพลายเออร์ทั้งหมด (All Suppliers)"
                showSelectOption={false}
                size="md"
              />
            </div>

            {/* Searchable Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700">สถานะคำสั่งซื้อ (Status)</label>
              <SearchableSelect
                options={statusOptions}
                value={selectedStatus}
                onChange={(val) => {
                  setSelectedStatus(val || "All");
                  setCurrentPage(1);
                }}
                placeholder="เลือกสถานะคำสั่งซื้อ..."
                showAllOption={true}
                allOptionLabel="ทุกสถานะ (All Status)"
                showSelectOption={false}
                size="md"
              />
            </div>

            {/* Action Buttons */}
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
                  setSelectedSupplier("All");
                  setSelectedStatus("All");
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
            <table className="w-full text-left text-xs min-w-[850px] border-collapse">
              <thead className="border-b border-gray-200 bg-gray-50 text-gray-700">
                <tr>
                  <th className="py-3 px-4 font-bold">เลขที่ PO</th>
                  <th className="py-3 px-4 font-bold">ซัพพลายเออร์ (Supplier)</th>
                  <th className="py-3 px-4 font-bold">วันที่</th>
                  <th className="py-3 px-4 font-bold">รายการสินค้า / วัตถุดิบ</th>
                  <th className="py-3 px-4 font-bold text-right">ยอดรวม</th>
                  <th className="py-3 px-4 font-bold text-right">ชำระแล้ว</th>
                  <th className="py-3 px-4 font-bold text-right">คงค้าง</th>
                  <th className="py-3 px-4 font-bold text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-[#FE9F43] border-t-transparent mb-2" />
                      <p>กำลังโหลดรายงานการจัดซื้อ...</p>
                    </td>
                  </tr>
                ) : paginatedList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-500">
                      <ShoppingCart className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-gray-700">ไม่พบรายการสั่งซื้อที่ตรงกับเงื่อนไข</p>
                    </td>
                  </tr>
                ) : (
                  paginatedList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-blue-600">
                        {item.reference}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        {item.supplierName || "ทั่วไป"}
                      </td>
                      <td className="py-3 px-4 text-gray-500 whitespace-nowrap">
                        {item.date ? new Date(item.date).toLocaleDateString("th-TH") : "-"}
                      </td>
                      <td className="py-3 px-4 text-gray-700 max-w-[280px] truncate" title={item.productName || ""}>
                        {item.productName || "-"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        ฿{Number(item.total || item.purchaseAmount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-emerald-600">
                        ฿{Number(item.paid || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-rose-600">
                        ฿{Number(item.due || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            item.status === "RECEIVED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : item.status === "ORDERED"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          {item.status || "PENDING"}
                        </span>
                      </td>
                    </tr>
                  ))
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
