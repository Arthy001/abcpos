"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  PlusCircle,
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  MoreVertical,
  ChevronDown,
  Eye,
  Trash2,
  Download,
} from "lucide-react";

interface SalesOrderTemplateProps {
  pageTitle?: string;
  pageSubtitle?: string;
}

export const SalesOrderTemplate: React.FC<SalesOrderTemplateProps> = ({
  pageTitle = "Sales",
  pageSubtitle = "Manage Your Sales",
}) => {
  const [search, setSearch] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Sample sales orders exactly matching Screenshot
  const sampleSalesOrders = [
    {
      id: "1",
      customer: "Carl Evans",
      customerAvatar: "/assets/images/avatar-01.jpg",
      reference: "SL001",
      date: "24 Dec 2024",
      status: "Completed" as const,
      grandTotal: "$1000",
      paid: "$1000",
      due: "$0.00",
      paymentStatus: "Paid" as const,
      biller: "Admin",
    },
    {
      id: "2",
      customer: "Minerva Ramirez",
      customerAvatar: "/assets/images/avatar-02.jpg",
      reference: "SL002",
      date: "10 Dec 2024",
      status: "Pending" as const,
      grandTotal: "$1500",
      paid: "$0.00",
      due: "$1500",
      paymentStatus: "Unpaid" as const,
      biller: "Admin",
    },
    {
      id: "3",
      customer: "Robert Lamon",
      customerAvatar: "/assets/images/avatar-03.jpg",
      reference: "SL003",
      date: "08 Feb 2023",
      status: "Completed" as const,
      grandTotal: "$1500",
      paid: "$0.00",
      due: "$1500",
      paymentStatus: "Paid" as const,
      biller: "Admin",
    },
    {
      id: "4",
      customer: "Patricia Lewis",
      customerAvatar: "/assets/images/avatar-04.jpg",
      reference: "SL004",
      date: "12 Feb 2023",
      status: "Completed" as const,
      grandTotal: "$2000",
      paid: "$1000",
      due: "$1000",
      paymentStatus: "Overdue" as const,
      biller: "Admin",
    },
    {
      id: "5",
      customer: "Mark Joslyn",
      customerAvatar: "/assets/images/avatar-05.jpg",
      reference: "SL005",
      date: "17 Mar 2023",
      status: "Completed" as const,
      grandTotal: "$800",
      paid: "$800",
      due: "$0.00",
      paymentStatus: "Paid" as const,
      biller: "Admin",
    },
    {
      id: "6",
      customer: "Marsha Betts",
      customerAvatar: "/assets/images/avatar-06.jpg",
      reference: "SL006",
      date: "24 Mar 2023",
      status: "Pending" as const,
      grandTotal: "$750",
      paid: "$0.00",
      due: "$750",
      paymentStatus: "Unpaid" as const,
      biller: "Admin",
    },
    {
      id: "7",
      customer: "Daniel Jude",
      customerAvatar: "/assets/images/avatar-07.jpg",
      reference: "SL007",
      date: "06 Apr 2023",
      status: "Completed" as const,
      grandTotal: "$1300",
      paid: "$1300",
      due: "$0.00",
      paymentStatus: "Paid" as const,
      biller: "Admin",
    },
    {
      id: "8",
      customer: "Emma Bates",
      customerAvatar: "/assets/images/avatar-08.jpg",
      reference: "SL008",
      date: "16 Apr 2023",
      status: "Completed" as const,
      grandTotal: "$1100",
      paid: "$1100",
      due: "$0.00",
      paymentStatus: "Paid" as const,
      biller: "Admin",
    },
    {
      id: "9",
      customer: "Richard Fralick",
      customerAvatar: "/assets/images/avatar-09.jpg",
      reference: "SL009",
      date: "04 May 2023",
      status: "Pending" as const,
      grandTotal: "$2300",
      paid: "$2300",
      due: "$0.00",
      paymentStatus: "Paid" as const,
      biller: "Admin",
    },
    {
      id: "10",
      customer: "Michelle Robison",
      customerAvatar: "/assets/images/avatar-10.jpg",
      reference: "SL010",
      date: "29 May 2023",
      status: "Pending" as const,
      grandTotal: "$1700",
      paid: "$1700",
      due: "$0.00",
      paymentStatus: "Paid" as const,
      biller: "Admin",
    },
  ];

  const filteredDisplay = sampleSalesOrders.filter((item) => {
    const matchesSearch =
      item.customer.toLowerCase().includes(search.toLowerCase()) ||
      item.reference.toLowerCase().includes(search.toLowerCase()) ||
      item.biller.toLowerCase().includes(search.toLowerCase());
    const matchesCustomer =
      customerFilter === "all" || item.customer.toLowerCase() === customerFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesPaymentStatus =
      paymentStatusFilter === "all" || item.paymentStatus === paymentStatusFilter;

    return matchesSearch && matchesCustomer && matchesStatus && matchesPaymentStatus;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredDisplay.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDisplay.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">{pageTitle}</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">{pageSubtitle}</p>
          </div>

          <div className="flex items-center space-x-2">
            {/* PDF Export (Red) */}
            <button
              title="Export PDF"
              onClick={() => alert("Exporting PDF report...")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>

            {/* Excel Export (Green) */}
            <button
              title="Export Excel"
              onClick={() => alert("Exporting Excel report...")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#10B981] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>

            {/* Refresh */}
            <button
              title="Refresh"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Collapse */}
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>

            {/* + Add Sales Button (Orange) */}
            <Link
              href="/pos"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Sales</span>
            </Link>
          </div>
        </div>

        {/* Sales Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & 4 Filters Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-60">
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-[#1F2937] placeholder-[#9CA3AF]"
              />
              <Search className="w-3.5 h-3.5 text-[#9CA3AF] absolute left-2.5 top-2.5" />
            </div>

            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <div className="relative">
                <select
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Customer</option>
                  <option value="Carl Evans">Carl Evans</option>
                  <option value="Minerva Ramirez">Minerva Ramirez</option>
                  <option value="Robert Lamon">Robert Lamon</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Status</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="all">Payment Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Overdue">Overdue</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>

              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="last7days">Sort By : Last 7 Days</option>
                  <option value="last30days">Sort By : Last 30 Days</option>
                  <option value="newest">Sort By : Newest</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Clean Table with White Thead */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] text-[#111827] bg-white">
                <tr>
                  <th className="py-3 px-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredDisplay.length}
                      onChange={toggleSelectAll}
                      className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                    />
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Customer</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Reference</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Grand Total</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Paid</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Due</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Payment Status</th>
                  <th className="py-3 px-3 font-bold text-[#111827]">Biller</th>
                  <th className="py-3 px-3 text-right font-bold text-[#111827]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {filteredDisplay.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isDropdownOpen = openDropdownId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#F9FAFB] transition-colors ${
                        isSelected ? "bg-[#FFF8F2]" : ""
                      }`}
                    >
                      <td className="py-3.5 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded accent-[#FE9F43] w-3.5 h-3.5 cursor-pointer border-[#D1D5DB]"
                        />
                      </td>

                      {/* Customer with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {item.customer.slice(0, 1)}
                          </div>
                          <span className="text-[#334155] font-medium">{item.customer}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 text-[#64748B] font-mono">{item.reference}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.date}</td>

                      {/* Status badge: Completed (Green) / Pending (Cyan) */}
                      <td className="py-3.5 px-3">
                        {item.status === "Completed" ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#28C76F] text-white">
                            Completed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-[#00CFE8] text-white">
                            Pending
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-[#1E293B]">{item.grandTotal}</td>
                      <td className="py-3.5 px-3 text-[#64748B]">{item.paid}</td>
                      <td className="py-3.5 px-3 text-[#64748B]">{item.due}</td>

                      {/* Payment Status with dot */}
                      <td className="py-3.5 px-3">
                        {item.paymentStatus === "Paid" && (
                          <span className="inline-flex items-center space-x-1 text-[#28C76F] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F]" />
                            <span>Paid</span>
                          </span>
                        )}
                        {item.paymentStatus === "Unpaid" && (
                          <span className="inline-flex items-center space-x-1 text-[#EA5455] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EA5455]" />
                            <span>Unpaid</span>
                          </span>
                        )}
                        {item.paymentStatus === "Overdue" && (
                          <span className="inline-flex items-center space-x-1 text-[#FF9F43] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F43]" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-3 text-[#64748B]">{item.biller}</td>

                      {/* Actions 3-dots Menu */}
                      <td className="py-3.5 px-3 text-right relative">
                        <button
                          onClick={() => setOpenDropdownId(isDropdownOpen ? null : item.id)}
                          className="w-7 h-7 rounded hover:bg-gray-100 text-gray-500 inline-flex items-center justify-center transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {/* Context Dropdown */}
                        {isDropdownOpen && (
                          <div className="absolute right-3 top-10 w-36 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1 text-left text-xs">
                            <button
                              onClick={() => {
                                alert(`View details for ${item.reference}`);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Eye className="w-3.5 h-3.5 text-gray-400" />
                              <span>View Detail</span>
                            </button>
                            <button
                              onClick={() => {
                                alert(`Download invoice ${item.reference}`);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                            >
                              <Download className="w-3.5 h-3.5 text-gray-400" />
                              <span>Download PDF</span>
                            </button>
                            <button
                              onClick={() => {
                                alert(`Delete order ${item.reference}`);
                                setOpenDropdownId(null);
                              }}
                              className="w-full px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
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
                <select className="appearance-none bg-white border border-[#E2E8F0] rounded pl-2.5 pr-6 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer">
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>Entries</span>
            </div>

            <div className="flex items-center space-x-1.5">
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#94A3B8]">
                &lt;
              </button>
              <button className="w-6 h-6 rounded-full bg-[#FE9F43] text-white font-bold flex items-center justify-center text-xs shadow-xs">
                1
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
