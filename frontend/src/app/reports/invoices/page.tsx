"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { InvoiceReportItem } from "@/types";
import { fetchInvoiceReport } from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
} from "lucide-react";

export default function InvoiceReportPage() {
  const [items, setItems] = useState<InvoiceReportItem[]>([]);
  const [summary, setSummary] = useState({
    totalAmount: "$4,56,000",
    totalPaid: "$2,56,42",
    totalUnpaid: "$1,52,45",
    overdue: "$2,56,12",
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [dateRange, setDateRange] = useState<string>("15/08/2026 - 21/08/2026");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sample fallback matching screenshot
  const sampleItems: InvoiceReportItem[] = [
    { id: "1", invoiceNo: "INV001", customer: "Carl Evans", dueDate: "24 Dec 2024", amount: 500, paid: 500, amountDue: 500, status: "PAID" },
    { id: "2", invoiceNo: "INV002", customer: "Minerva Rameriz", dueDate: "10 Dec 2024", amount: 1500, paid: 1500, amountDue: 1500, status: "PAID" },
    { id: "3", invoiceNo: "INV003", customer: "Robert Lamon", dueDate: "27 Nov 2024", amount: 600, paid: 600, amountDue: 600, status: "PAID" },
    { id: "4", invoiceNo: "INV004", customer: "Patricia Lewis", dueDate: "18 Nov 2024", amount: 1000, paid: 1000, amountDue: 1000, status: "PAID" },
    { id: "5", invoiceNo: "INV005", customer: "Mark Joslyn", dueDate: "06 Nov 2024", amount: 1200, paid: 1200, amountDue: 1200, status: "PAID" },
    { id: "6", invoiceNo: "INV006", customer: "Marsha Betts", dueDate: "25 Oct 2024", amount: 800, paid: 800, amountDue: 800, status: "PAID" },
    { id: "7", invoiceNo: "INV007", customer: "Daniel Jude", dueDate: "14 Oct 2024", amount: 2000, paid: 2000, amountDue: 2000, status: "PAID" },
    { id: "8", invoiceNo: "INV008", customer: "Emma Bates", dueDate: "03 Oct 2024", amount: 100, paid: 100, amountDue: 100, status: "PAID" },
    { id: "9", invoiceNo: "INV009", customer: "Richard Fralick", dueDate: "20 Sep 2024", amount: 300, paid: 300, amountDue: 300, status: "PAID" },
    { id: "10", invoiceNo: "INV010", customer: "Michelle Robison", dueDate: "10 Sep 2024", amount: 5000, paid: 5000, amountDue: 5000, status: "UNPAID" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchInvoiceReport({
        customer: selectedCustomer,
        status: selectedStatus,
      });
      if (res.items && res.items.length > 0) {
        setItems(res.items);
      } else {
        setItems(sampleItems);
      }
      if (res.summary) {
        setSummary(res.summary);
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

  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedList.map((i) => i.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleExportCSV = () => {
    const headers = ["Invoice No,Customer,Due Date,Amount,Paid,Amount Due,Status"];
    const rows = displayList.map(
      (item) => `"${item.invoiceNo}","${item.customer}","${item.dueDate}","$${item.amount}","$${item.paid}","$${item.amountDue}","${item.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `invoice_report_${new Date().toISOString().slice(0, 10)}.csv`);
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
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Invoice Report</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage Your Invoice Report</p>
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

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Amount */}
          <div className="bg-white p-4 rounded-xl border border-[#28C76F]/40 shadow-2xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#28C76F] flex items-center justify-center text-white shadow-xs">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-medium">Total Amount</p>
              <h3 className="text-lg font-bold text-[#1E293B] mt-0.5">{summary.totalAmount}</h3>
            </div>
          </div>

          {/* Total Paid */}
          <div className="bg-white p-4 rounded-xl border border-[#007AFF]/40 shadow-2xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#007AFF] flex items-center justify-center text-white shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-medium">Total Paid</p>
              <h3 className="text-lg font-bold text-[#1E293B] mt-0.5">{summary.totalPaid}</h3>
            </div>
          </div>

          {/* Total Unpaid */}
          <div className="bg-white p-4 rounded-xl border border-[#FF9F43]/40 shadow-2xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#FF9F43] flex items-center justify-center text-white shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-medium">Total Unpaid</p>
              <h3 className="text-lg font-bold text-[#1E293B] mt-0.5">{summary.totalUnpaid}</h3>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white p-4 rounded-xl border border-[#EA5455]/40 shadow-2xs flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-lg bg-[#EA5455] flex items-center justify-center text-white shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#64748B] font-medium">Overdue</p>
              <h3 className="text-lg font-bold text-[#1E293B] mt-0.5">{summary.overdue}</h3>
            </div>
          </div>
        </div>

        {/* Filter Box */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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

            {/* Customer */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#1E293B]">Customer</label>
              <div className="relative">
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="All">All</option>
                  <option value="Carl Evans">Carl Evans</option>
                  <option value="Minerva Rameriz">Minerva Rameriz</option>
                  <option value="Robert Lamon">Robert Lamon</option>
                  <option value="Patricia Lewis">Patricia Lewis</option>
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
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
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
            <h2 className="text-sm font-bold text-[#1E293B]">Invoice Report</h2>

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
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedList.length > 0 && selectedIds.length === paginatedList.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Invoice No</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Customer</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Due Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Paid</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount Due</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {paginatedList.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F9FAFB] transition-colors ${
                        isSelected ? "bg-[#FFF8F2]" : ""
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                        />
                      </td>

                      {/* Invoice No */}
                      <td className="py-3.5 px-4 text-[#64748B] font-medium">{item.invoiceNo}</td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 text-[#1E293B] font-medium">{item.customer}</td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.dueDate}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-[#1E293B] font-semibold">${item.amount}</td>

                      {/* Paid */}
                      <td className="py-3.5 px-4 text-[#64748B]">${item.paid}</td>

                      {/* Amount Due */}
                      <td className="py-3.5 px-4 text-[#64748B]">${item.amountDue}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {item.status === "PAID" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                            <span className="w-1.5 h-1.5 rounded-full bg-white mr-1.5"></span>
                            Paid
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
