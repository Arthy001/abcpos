"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { SupplierDueReportItem } from "@/types";
import { fetchSupplierDueReport } from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Calendar,
  Printer,
} from "lucide-react";

export default function SupplierDueReportPage() {
  const router = useRouter();
  const [items, setItems] = useState<SupplierDueReportItem[]>([]);
  const [totals, setTotals] = useState({ totalAmount: 33268, paid: "$33268.53", due: "$0.0" });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSupplier, setSelectedSupplier] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [referenceFilter, setReferenceFilter] = useState<string>("");
  const [dateRange, setDateRange] = useState<string>("15/08/2026 - 21/08/2026");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sample fallback matching screenshot
  const sampleItems: SupplierDueReportItem[] = [
    { id: "1", reference: "INV/PO2026", supplierId: "SU001", supplierName: "Apex Computers", supplierImage: "/assets/images/product-01.jpg", totalAmount: 1000, paid: 1000, due: 0, status: "PAID" },
    { id: "2", reference: "INV/PO2042", supplierId: "SU003", supplierName: "Dazzle Shoes", supplierImage: "/assets/images/product-03.jpg", totalAmount: 1500, paid: 1500, due: 0, status: "PAID" },
    { id: "3", reference: "INV/PO2033", supplierId: "SU004", supplierName: "Best Accessories", supplierImage: "/assets/images/product-04.jpg", totalAmount: 2000, paid: 2000, due: 0, status: "PAID" },
    { id: "4", reference: "INV/PO2042", supplierId: "SU005", supplierName: "A-Z Store", supplierImage: "/assets/images/product-05.jpg", totalAmount: 800, paid: 800, due: 0, status: "PAID" },
    { id: "5", reference: "INV/PO2011", supplierId: "SU006", supplierName: "Hatimi Hardwares", supplierImage: "/assets/images/product-06.jpg", totalAmount: 750, paid: 750, due: 0, status: "PAID" },
    { id: "6", reference: "INV/PO2014", supplierId: "SU007", supplierName: "Aesthetic Bags", supplierImage: "/assets/images/product-07.jpg", totalAmount: 1300, paid: 1300, due: 0, status: "OVERDUE" },
    { id: "7", reference: "INV/PO2056", supplierId: "SU008", supplierName: "Alpha Mobiles", supplierImage: "/assets/images/product-08.jpg", totalAmount: 1100, paid: 1100, due: 0, status: "PAID" },
    { id: "8", reference: "INV/PO2047", supplierId: "SU009", supplierName: "Sigma Chairs", supplierImage: "/assets/images/product-09.jpg", totalAmount: 2300, paid: 2300, due: 0, status: "PAID" },
    { id: "9", reference: "INV/PO2017", supplierId: "SU010", supplierName: "Zenith Bags", supplierImage: "/assets/images/product-10.jpg", totalAmount: 1700, paid: 1700, due: 0, status: "UNPAID" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchSupplierDueReport({
        supplier: selectedSupplier,
        status: selectedStatus,
        reference: referenceFilter,
      });
      if (res.items && res.items.length > 0) {
        setItems(res.items);
      } else {
        setItems(sampleItems);
      }
      setTotals({
        totalAmount: res.totalAmount || 33268,
        paid: res.paid || "$33268.53",
        due: res.due || "$0.0",
      });
    } catch (e) {
      setItems(sampleItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateReport = () => {
    loadData();
  };

  const displayList = items.length > 0 ? items : sampleItems;
  const totalEntries = displayList.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedList = displayList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    const headers = ["Reference,ID,Supplier,Total Amount,Paid,Due,Status"];
    const rows = displayList.map(
      (item) => `"${item.reference}","${item.supplierId}","${item.supplierName}","$${item.totalAmount}","$${item.paid}","$${item.due}","${item.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `supplier_due_report_${new Date().toISOString().slice(0, 10)}.csv`);
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
        {/* Top Tab Bar Navigation */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => router.push("/reports/suppliers")}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E2E8F0] text-[#64748B] hover:bg-gray-200 transition-all cursor-pointer"
          >
            Supplier Report
          </button>
          <button
            onClick={() => router.push("/reports/suppliers/due")}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#FE9F43] text-white shadow-xs transition-all cursor-pointer"
          >
            Supplier Due
          </button>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Supplier Due</h1>
            <p className="text-xs text-[#64748B] mt-0.5">View Reports of Supplier Due</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Refresh */}
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>

            {/* Collapse */}
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Box */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 items-end">
            {/* Choose Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Choose Date</label>
              <div className="relative flex items-center border border-[#E5E7EB] rounded-lg px-3 py-2 bg-white">
                <Calendar className="w-4 h-4 text-[#9CA3AF] mr-2 shrink-0" />
                <input
                  type="text"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="w-full bg-transparent text-xs text-[#374151] focus:outline-none"
                />
              </div>
            </div>

            {/* Supplier */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Supplier</label>
              <div className="relative">
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Apex Computers">Apex Computers</option>
                  <option value="Dazzle Shoes">Dazzle Shoes</option>
                  <option value="Best Accessories">Best Accessories</option>
                  <option value="A-Z Store">A-Z Store</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Payment Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Payment Status</label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="PAID">Paid</option>
                  <option value="OVERDUE">Overdue</option>
                  <option value="UNPAID">Unpaid</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Reference */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Reference</label>
              <input
                type="text"
                placeholder="e.g. INV/PO2026"
                value={referenceFilter}
                onChange={(e) => setReferenceFilter(e.target.value)}
                className="w-full border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
              />
            </div>

            {/* Generate Report Button */}
            <div>
              <button
                onClick={handleGenerateReport}
                className="w-full py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Table Header & Export Buttons */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#F1F3F5]">
            <h2 className="text-sm font-bold text-[#1E293B]">Supplier Due Report</h2>

            <div className="flex items-center space-x-2">
              {/* PDF Export Button (Red) */}
              <button
                onClick={handlePrint}
                title="Export PDF"
                className="w-7 h-7 rounded bg-[#FF4D4F]/10 hover:bg-[#FF4D4F]/20 text-[#FF4D4F] flex items-center justify-center transition-colors border border-[#FF4D4F]/20 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-9.5 8.5h-1v-2h1c.55 0 1 .45 1 1s-.45 1-1 1zm5.5 0c0 .55-.45 1-1 1h-2v-4h2c.55 0 1 .45 1 1v2zm-2.5-1h1v-1h-1v1z" />
                </svg>
              </button>

              {/* Excel Export Button (Green) */}
              <button
                onClick={handleExportCSV}
                title="Export Excel"
                className="w-7 h-7 rounded bg-[#52C41A]/10 hover:bg-[#52C41A]/20 text-[#52C41A] flex items-center justify-center transition-colors border border-[#52C41A]/20 shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-2.5-4.5L7 17H4.5l3.5-5.5L4.8 6h2.5l2.2 4.2L11.7 6h2.5l-3.2 5.5 3.5 5.5H12z" />
                </svg>
              </button>

              {/* Print */}
              <button
                onClick={handlePrint}
                title="Print"
                className="w-7 h-7 rounded bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">ID</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Supplier</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Total Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Paid</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Due</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {paginatedList.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Reference */}
                      <td className="py-3.5 px-4 text-[#64748B] font-medium">{item.reference}</td>

                      {/* ID */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.supplierId}</td>

                      {/* Supplier with Thumbnail */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.supplierImage || "/assets/images/product-01.jpg"}
                            alt={item.supplierName}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                          />
                          <span className="font-medium text-[#1E293B]">{item.supplierName}</span>
                        </div>
                      </td>

                      {/* Total Amount */}
                      <td className="py-3.5 px-4 text-[#1E293B] font-semibold">${item.totalAmount}</td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 text-[#64748B]">${item.paid}</td>

                      {/* Due */}
                      <td className="py-3.5 px-4 text-[#64748B]">${item.due.toFixed(1)}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {item.status === "PAID" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Paid
                          </span>
                        ) : item.status === "OVERDUE" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#7367F0] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Overdue
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EA5455] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Unpaid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Total Footer */}
          <div className="flex items-center justify-between pt-2 px-4 text-xs font-bold text-[#1E293B]">
            <span>Total</span>
            <div className="flex items-center space-x-12 pr-28">
              <span>{totals.totalAmount}</span>
              <span>{totals.paid}</span>
              <span>{totals.due}</span>
            </div>
          </div>

          {/* Table Pagination Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-[#64748B] gap-3 border-t border-[#F1F3F5]">
            <div className="flex items-center space-x-2">
              <span>Row Per Page</span>
              <div className="relative">
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="appearance-none bg-white border border-[#E2E8F0] rounded pl-2.5 pr-6 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer"
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>Entries</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  currentPage === 1
                    ? "text-[#CBD5E1] cursor-not-allowed"
                    : "hover:bg-gray-100 text-[#64748B]"
                }`}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                <button
                  key={pg}
                  onClick={() => setCurrentPage(pg)}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                    currentPage === pg
                      ? "bg-[#FE9F43] text-white font-bold shadow-xs"
                      : "hover:bg-gray-100 text-[#64748B]"
                  }`}
                >
                  {pg}
                </button>
              ))}

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={`w-6 h-6 rounded flex items-center justify-center transition-colors ${
                  currentPage === totalPages
                    ? "text-[#CBD5E1] cursor-not-allowed"
                    : "hover:bg-gray-100 text-[#64748B]"
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
