"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { PurchaseTaxReportItem } from "@/types";
import { fetchPurchaseTaxReport } from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Calendar,
  Printer,
} from "lucide-react";

export default function PurchaseTaxReportPage() {
  const router = useRouter();
  const [items, setItems] = useState<PurchaseTaxReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedStore, setSelectedStore] = useState<string>("All");
  const [selectedSupplier, setSelectedSupplier] = useState<string>("All");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("All");
  const [dateRange, setDateRange] = useState<string>("15/08/2026 - 21/08/2026");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPurchaseTaxReport({
        store: selectedStore,
        supplier: selectedSupplier,
        paymentMethod: selectedPaymentMethod,
      });
      if (data && data.length > 0) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (e) {
      setItems([]);
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

  const displayList = items || [];
  const totalEntries = displayList.length;
  const totalPages = Math.ceil(totalEntries / pageSize) || 1;
  const paginatedList = displayList.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleExportCSV = () => {
    const headers = ["Reference,Supplier,Date,Store,Amount,Payment Method,Discount,Tax Amount"];
    const rows = displayList.map(
      (item) => `"${item.reference}","${item.supplier}","${item.taxDate}","${item.store}","$${item.amount}","${item.paymentMethod}","$${item.discount}","$${item.taxAmount}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `purchase_tax_report_${new Date().toISOString().slice(0, 10)}.csv`);
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
            onClick={() => router.push("/reports/tax")}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#FE9F43] text-white shadow-xs transition-all cursor-pointer"
          >
            Purchase tax
          </button>
          <button
            onClick={() => router.push("/reports/tax/sales")}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E2E8F0] text-[#64748B] hover:bg-gray-200 transition-all cursor-pointer"
          >
            Sales Tax
          </button>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Purchase Tax</h1>
            <p className="text-xs text-[#64748B] mt-0.5">View Reports of Purchase Tax</p>
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

            {/* Store */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Store</label>
              <div className="relative">
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Electro Mart">Electro Mart</option>
                  <option value="Quantum Gadgets">Quantum Gadgets</option>
                  <option value="Prime Bazaar">Prime Bazaar</option>
                  <option value="Gadget World">Gadget World</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-3 top-3 pointer-events-none" />
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
                  <option value="Beats Headphones">Beats Headphones</option>
                  <option value="Dazzle Shoes">Dazzle Shoes</option>
                  <option value="Best Accessories">Best Accessories</option>
                  <option value="A-Z Store">A-Z Store</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Payment Method</label>
              <div className="relative">
                <select
                  value={selectedPaymentMethod}
                  onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Cash">Cash</option>
                  <option value="Paypal">Paypal</option>
                  <option value="Stripe">Stripe</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-3 top-3 pointer-events-none" />
              </div>
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
            <h2 className="text-sm font-bold text-[#1E293B]">Purchase Tax Report</h2>

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
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Supplier</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Store</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Payment Method</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Discount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Tax Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {paginatedList.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Reference */}
                      <td className="py-3.5 px-4 text-[#1E293B] font-medium">{item.reference}</td>

                      {/* Supplier */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.supplier}</td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.taxDate}</td>

                      {/* Store */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.store}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-[#1E293B] font-semibold">${item.amount}</td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.paymentMethod}</td>

                      {/* Discount */}
                      <td className="py-3.5 px-4 text-[#64748B]">${item.discount}</td>

                      {/* Tax Amount */}
                      <td className="py-3.5 px-4 text-[#1E293B] font-semibold">${item.taxAmount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
