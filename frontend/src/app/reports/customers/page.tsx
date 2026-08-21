"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { CustomerReportItem } from "@/types";
import { fetchCustomerReport } from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Calendar,
  Printer,
} from "lucide-react";

export default function CustomerReportPage() {
  const router = useRouter();
  const [items, setItems] = useState<CustomerReportItem[]>([]);
  const [total, setTotal] = useState<string>("$33268.53");
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("All");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [dateRange, setDateRange] = useState<string>("15/08/2026 - 21/08/2026");
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Sample fallback matching screenshot
  const sampleItems: CustomerReportItem[] = [
    { id: "1", reference: "INV2026", customerCode: "CU001", customerName: "Carl Evans", customerImage: "/assets/images/customer11.jpg", totalOrders: 10, amount: 1000, paymentMethod: "Cash", status: "COMPLETED" },
    { id: "2", reference: "INV2031", customerCode: "CU002", customerName: "Minerva Rameriz", customerImage: "/assets/images/customer12.jpg", totalOrders: 15, amount: 1500, paymentMethod: "Paypal", status: "COMPLETED" },
    { id: "3", reference: "INV2042", customerCode: "CU003", customerName: "Robert Lamon", customerImage: "/assets/images/customer13.jpg", totalOrders: 22, amount: 1500, paymentMethod: "Paypal", status: "COMPLETED" },
    { id: "4", reference: "INV2033", customerCode: "CU004", customerName: "Patricia Lewis", customerImage: "/assets/images/customer14.jpg", totalOrders: 14, amount: 2000, paymentMethod: "Stripe", status: "COMPLETED" },
    { id: "5", reference: "INV2042", customerCode: "CU005", customerName: "Mark Joslyn", customerImage: "/assets/images/customer15.jpg", totalOrders: 12, amount: 800, paymentMethod: "Paypal", status: "COMPLETED" },
    { id: "6", reference: "INV2011", customerCode: "CU006", customerName: "Marsha Betts", customerImage: "/assets/images/customer16.jpg", totalOrders: 45, amount: 750, paymentMethod: "Cash", status: "COMPLETED" },
    { id: "7", reference: "INV2014", customerCode: "CU007", customerName: "Daniel Jude", customerImage: "/assets/images/customer17.jpg", totalOrders: 21, amount: 1300, paymentMethod: "Credit Card", status: "COMPLETED" },
    { id: "8", reference: "INV2056", customerCode: "CU008", customerName: "Emma Bates", customerImage: "/assets/images/customer18.jpg", totalOrders: 78, amount: 1100, paymentMethod: "Stripe", status: "COMPLETED" },
    { id: "9", reference: "INV2047", customerCode: "CU009", customerName: "Richard Fralick", customerImage: "/assets/images/avatar-01.jpg", totalOrders: 15, amount: 1700, paymentMethod: "Credit Card", status: "COMPLETED" },
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchCustomerReport({
        customer: selectedCustomer,
        paymentMethod: selectedPaymentMethod,
        status: selectedStatus,
      });
      if (res.items && res.items.length > 0) {
        setItems(res.items);
      } else {
        setItems(sampleItems);
      }
      if (res.total) setTotal(res.total);
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
    const headers = ["Reference,Code,Customer,Total Orders,Amount,Payment Method,Status"];
    const rows = displayList.map(
      (item) => `"${item.reference}","${item.customerCode}","${item.customerName}","${item.totalOrders}","$${item.amount}","${item.paymentMethod}","${item.status}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer_report_${new Date().toISOString().slice(0, 10)}.csv`);
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
            onClick={() => router.push("/reports/customers")}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#FE9F43] text-white shadow-xs transition-all cursor-pointer"
          >
            Customer Report
          </button>
          <button
            onClick={() => router.push("/reports/customers/due")}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#E2E8F0] text-[#64748B] hover:bg-gray-200 transition-all cursor-pointer"
          >
            Customer Due
          </button>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Customer Report</h1>
            <p className="text-xs text-[#64748B] mt-0.5">View Reports of Customer</p>
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
                  <option value="COMPLETED">Completed</option>
                  <option value="PAID">Paid</option>
                  <option value="UNPAID">Unpaid</option>
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
            <h2 className="text-sm font-bold text-[#1E293B]">Customer Report</h2>

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
                  <th className="py-3 px-4 font-bold text-[#111827]">Code</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Customer</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Total Orders</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Payment Method</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {paginatedList.map((item) => {
                  return (
                    <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                      {/* Reference */}
                      <td className="py-3.5 px-4 text-[#64748B] font-medium">{item.reference}</td>

                      {/* Code */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.customerCode}</td>

                      {/* Customer with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={item.customerImage || "/assets/images/customer11.jpg"}
                            alt={item.customerName}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200"
                          />
                          <span className="font-medium text-[#1E293B]">{item.customerName}</span>
                        </div>
                      </td>

                      {/* Total Orders */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.totalOrders}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 text-[#1E293B] font-semibold">${item.amount}</td>

                      {/* Payment Method */}
                      <td className="py-3.5 px-4 text-[#64748B]">{item.paymentMethod}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#28C76F] text-white">
                          Completed
                        </span>
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
            <span className="pr-48">{total}</span>
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
