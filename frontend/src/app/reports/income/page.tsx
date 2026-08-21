"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { IncomeReportItem } from "@/types";
import { fetchIncomeReport } from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Calendar,
  Printer,
} from "lucide-react";

export default function IncomeReportPage() {
  const [items, setItems] = useState<IncomeReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [dateRange, setDateRange] = useState<string>("15/08/2026 - 21/08/2026");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sample fallback matching realistic data & image
  const sampleItems: IncomeReportItem[] = [
    { id: "1", incomeName: "Product Sales", category: "Sales", description: "Monthly store sales", incomeDate: "24 Dec 2024", amount: 4565, paymentMethod: "Cash", status: "RECEIVED" },
    { id: "2", incomeName: "Consulting Fee", category: "Consulting", description: "Client strategy consulting", incomeDate: "10 Dec 2024", amount: 4494, paymentMethod: "Paypal", status: "RECEIVED" },
    { id: "3", incomeName: "Store Rent", category: "Rental Income", description: "Branch office rental", incomeDate: "27 Nov 2024", amount: 65945, paymentMethod: "Bank Transfer", status: "RECEIVED" },
    { id: "4", incomeName: "Investment Dividend", category: "Investments", description: "Quarterly dividend payout", incomeDate: "18 Nov 2024", amount: 1948, paymentMethod: "Bank Transfer", status: "RECEIVED" },
    { id: "5", incomeName: "Web Development", category: "Services", description: "Custom web app service", incomeDate: "06 Nov 2024", amount: 1686, paymentMethod: "Stripe", status: "RECEIVED" },
    { id: "6", incomeName: "Service Charge", category: "Services", description: "POS setup and training", incomeDate: "25 Oct 2024", amount: 16547, paymentMethod: "Cash", status: "PENDING" },
    { id: "7", incomeName: "Affiliate Commission", category: "Marketing", description: "Referral commission", incomeDate: "14 Oct 2024", amount: 141845, paymentMethod: "Paypal", status: "RECEIVED" },
    { id: "8", incomeName: "Maintenance Retainer", category: "Maintenance", description: "Annual maintenance contract", incomeDate: "03 Oct 2024", amount: 44188, paymentMethod: "Bank Transfer", status: "RECEIVED" },
    { id: "9", incomeName: "Licensing Fee", category: "Royalties", description: "Brand licensing", incomeDate: "20 Sep 2024", amount: 614848, paymentMethod: "Bank Transfer", status: "RECEIVED" },
    { id: "10", incomeName: "Software Subscription", category: "Software", description: "Cloud POS subscription", incomeDate: "10 Sep 2024", amount: 77818, paymentMethod: "Stripe", status: "PENDING" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchIncomeReport({
        category: selectedCategory,
        paymentMethod: selectedPaymentMethod,
        status: selectedStatus,
      });
      if (data && data.length > 0) {
        setItems(data);
      } else {
        setItems(sampleItems);
      }
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
    const headers = ["Income Name,Category,Description,Date,Amount,Status"];
    const rows = displayList.map(
      (item) => `"${item.incomeName}","${item.category}","${item.description}","${item.incomeDate}","$${item.amount}","${item.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `income_report_${new Date().toISOString().slice(0, 10)}.csv`);
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Income Report</h1>
            <p className="text-xs text-[#64748B] mt-0.5">View Reports of Income</p>
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

            {/* Income Category */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Income Category</label>
              <div className="relative">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Sales">Sales</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Rental Income">Rental Income</option>
                  <option value="Investments">Investments</option>
                  <option value="Services">Services</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Royalties">Royalties</option>
                  <option value="Software">Software</option>
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
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-3 top-3 pointer-events-none" />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Status</label>
              <div className="relative">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="RECEIVED">Received</option>
                  <option value="PENDING">Pending</option>
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
            <h2 className="text-sm font-bold text-[#1E293B]">Income Report</h2>

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
                  <th className="py-3 px-4 font-bold text-[#111827]">Income Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Description</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {paginatedList.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Income Name */}
                      <td className="py-3.5 px-4 text-[#1E293B] font-medium">{item.incomeName}</td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.category}</td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.description}</td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.incomeDate}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-[#1E293B] font-semibold">${item.amount}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {item.status === "RECEIVED" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            Received
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#00CFDD] text-white">
                            Pending
                          </span>
                        )}
                      </td>
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
