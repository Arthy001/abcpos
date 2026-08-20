"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  Eye,
  Trash2,
  ChevronDown,
  X,
  Printer,
  Download,
} from "lucide-react";

interface InvoiceItem {
  id: string;
  invoiceNo: string;
  customer: string;
  customerAvatar: string;
  dueDate: string;
  amount: string;
  paid: string;
  amountDue: string;
  status: "Paid" | "Unpaid" | "Overdue";
}

export default function InvoicesPage() {
  const [search, setSearch] = useState<string>("");
  const [customerFilter, setCustomerFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("last7days");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [viewInvoice, setViewInvoice] = useState<InvoiceItem | null>(null);

  // 10 Sample invoices matching Screenshot exactly
  const sampleInvoices: InvoiceItem[] = [
    {
      id: "1",
      invoiceNo: "INV001",
      customer: "Carl Evans",
      customerAvatar: "/assets/images/avatar-01.jpg",
      dueDate: "24 Dec 2024",
      amount: "$1000",
      paid: "$1000",
      amountDue: "$0.00",
      status: "Paid",
    },
    {
      id: "2",
      invoiceNo: "INV002",
      customer: "Minerva Ramirez",
      customerAvatar: "/assets/images/avatar-02.jpg",
      dueDate: "24 Dec 2024",
      amount: "$1500",
      paid: "$0.00",
      amountDue: "$1500",
      status: "Unpaid",
    },
    {
      id: "3",
      invoiceNo: "INV003",
      customer: "Robert Lamon",
      customerAvatar: "/assets/images/avatar-03.jpg",
      dueDate: "24 Dec 2024",
      amount: "$1500",
      paid: "$0.00",
      amountDue: "$1500",
      status: "Unpaid",
    },
    {
      id: "4",
      invoiceNo: "INV004",
      customer: "Patricia Lewis",
      customerAvatar: "/assets/images/avatar-04.jpg",
      dueDate: "24 Dec 2024",
      amount: "$2000",
      paid: "$1000",
      amountDue: "$1000",
      status: "Overdue",
    },
    {
      id: "5",
      invoiceNo: "INV005",
      customer: "Mark Joslyn",
      customerAvatar: "/assets/images/avatar-05.jpg",
      dueDate: "24 Dec 2024",
      amount: "$800",
      paid: "$800",
      amountDue: "$0.00",
      status: "Paid",
    },
    {
      id: "6",
      invoiceNo: "INV006",
      customer: "Marsha Betts",
      customerAvatar: "/assets/images/avatar-06.jpg",
      dueDate: "24 Dec 2024",
      amount: "$750",
      paid: "$0.00",
      amountDue: "$750",
      status: "Unpaid",
    },
    {
      id: "7",
      invoiceNo: "INV007",
      customer: "Daniel Jude",
      customerAvatar: "/assets/images/avatar-07.jpg",
      dueDate: "24 Dec 2024",
      amount: "$1300",
      paid: "$1300",
      amountDue: "$0.00",
      status: "Paid",
    },
    {
      id: "8",
      invoiceNo: "INV008",
      customer: "Emma Bates",
      customerAvatar: "/assets/images/avatar-08.jpg",
      dueDate: "24 Dec 2024",
      amount: "$1100",
      paid: "$1100",
      amountDue: "$0.00",
      status: "Paid",
    },
    {
      id: "9",
      invoiceNo: "INV009",
      customer: "Richard Fralick",
      customerAvatar: "/assets/images/avatar-09.jpg",
      dueDate: "24 Dec 2024",
      amount: "$2300",
      paid: "$2300",
      amountDue: "$0.00",
      status: "Paid",
    },
    {
      id: "10",
      invoiceNo: "INV010",
      customer: "Michelle Robison",
      customerAvatar: "/assets/images/avatar-10.jpg",
      dueDate: "24 Dec 2024",
      amount: "$1700",
      paid: "$1700",
      amountDue: "$0.00",
      status: "Paid",
    },
  ];

  const filteredDisplay = sampleInvoices.filter((item) => {
    const matchesSearch =
      item.customer.toLowerCase().includes(search.toLowerCase()) ||
      item.invoiceNo.toLowerCase().includes(search.toLowerCase());
    const matchesCustomer =
      customerFilter === "all" || item.customer.toLowerCase() === customerFilter.toLowerCase();
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesCustomer && matchesStatus;
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

  const handleDelete = (invoiceNo: string) => {
    if (confirm(`Are you sure you want to delete invoice ${invoiceNo}?`)) {
      alert(`Invoice ${invoiceNo} deleted`);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Balance Sheet</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">View Your Balance Sheet</p>
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
          </div>
        </div>

        {/* Invoices Table Card Container */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & 3 Filters Bar */}
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
                  <th className="py-3 px-4 font-bold text-[#111827]">Invoice No</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Customer</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Due Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Paid</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount Due</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Status</th>
                  <th className="py-3 px-4 text-right font-bold text-[#111827]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {filteredDisplay.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

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

                      <td className="py-3.5 px-4 text-[#64748B] font-mono">{item.invoiceNo}</td>

                      {/* Customer with Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                            {item.customer.slice(0, 1)}
                          </div>
                          <span className="text-[#334155] font-medium">{item.customer}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#64748B]">{item.dueDate}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.amount}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.paid}</td>
                      <td className="py-3.5 px-4 text-[#64748B]">{item.amountDue}</td>

                      {/* Status dot badge */}
                      <td className="py-3.5 px-4">
                        {item.status === "Paid" && (
                          <span className="inline-flex items-center space-x-1 text-[#28C76F] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#28C76F]" />
                            <span>Paid</span>
                          </span>
                        )}
                        {item.status === "Unpaid" && (
                          <span className="inline-flex items-center space-x-1 text-[#EA5455] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EA5455]" />
                            <span>Unpaid</span>
                          </span>
                        )}
                        {item.status === "Overdue" && (
                          <span className="inline-flex items-center space-x-1 text-[#FF9F43] font-semibold text-[11px]">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F43]" />
                            <span>Overdue</span>
                          </span>
                        )}
                      </td>

                      {/* Action buttons: View (Eye) and Delete (Trash) */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => setViewInvoice(item)}
                            title="View Invoice"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-gray-100 text-[#94A3B8] hover:text-[#334155] flex items-center justify-center transition-colors bg-white"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.invoiceNo)}
                            title="Delete Invoice"
                            className="w-7 h-7 rounded border border-[#E2E8F0] hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center transition-colors bg-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
                2
              </button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Invoice Detail Modal */}
        {viewInvoice && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative animate-in fade-in zoom-in duration-150">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#FE9F43] to-[#FF8008] text-white flex items-center justify-center font-bold text-xs">
                    A
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Invoice {viewInvoice.invoiceNo}</h3>
                    <p className="text-[11px] text-gray-500">Issued by A POS Retail Store</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewInvoice(null)}
                  className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Invoice Meta */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-4 rounded-xl">
                <div>
                  <p className="text-gray-400 font-medium">Billed To:</p>
                  <p className="font-bold text-gray-800 mt-0.5">{viewInvoice.customer}</p>
                  <p className="text-gray-500 text-[11px]">customer@example.com</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 font-medium">Due Date:</p>
                  <p className="font-bold text-gray-800 mt-0.5">{viewInvoice.dueDate}</p>
                  <p className="text-[11px] font-semibold text-emerald-600">Status: {viewInvoice.status}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-2 text-xs border-t border-b border-gray-100 py-3">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">{viewInvoice.amount}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Amount Paid</span>
                  <span className="font-medium text-emerald-600">{viewInvoice.paid}</span>
                </div>
                <div className="flex justify-between text-gray-900 font-bold text-sm pt-1 border-t border-gray-100">
                  <span>Amount Due</span>
                  <span className="text-red-500">{viewInvoice.amountDue}</span>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end space-x-2 pt-1">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => {
                    alert(`Downloading invoice ${viewInvoice.invoiceNo}`);
                    setViewInvoice(null);
                  }}
                  className="flex items-center space-x-1.5 px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl shadow-sm active:scale-95 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
