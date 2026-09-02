"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  Search,
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";

interface CashFlowItem {
  id: string;
  date: string;
  bankAccount: string;
  description: string;
  credit: string;
  debit: string;
  accountBalance: string;
  totalBalance: string;
  paymentMethod: "Stripe" | "Paypal" | "Cash";
}

export default function CashFlowPage() {
  const [search, setSearch] = useState<string>("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all");

  const sampleCashFlow: CashFlowItem[] = [
    { id: "1", date: "24 Dec 2024", bankAccount: "HBSC - 3298784309485", description: "Cash receipts from sales", credit: "$1000", debit: "$0.00", accountBalance: "$1000", totalBalance: "$889698", paymentMethod: "Stripe" },
    { id: "2", date: "10 Dec 2024", bankAccount: "SWIZ - 5475878970090", description: "Cash payments to employees", credit: "$0.00", debit: "$1500", accountBalance: "$1500", totalBalance: "$9899", paymentMethod: "Paypal" },
    { id: "3", date: "27 Nov 2024", bankAccount: "SWIZ - 3255465758698", description: "Purchase of POS equipment", credit: "$1800", debit: "$0.00", accountBalance: "$1800", totalBalance: "$35656", paymentMethod: "Cash" },
    { id: "4", date: "18 Nov 2024", bankAccount: "IDO - 4353689870544", description: "Sale of old equipment", credit: "$1000", debit: "$1000", accountBalance: "$1000", totalBalance: "$1562", paymentMethod: "Paypal" },
    { id: "5", date: "06 Nov 2024", bankAccount: "NBC - 4324356677889", description: "Loan received (short-term)", credit: "$800", debit: "$0.00", accountBalance: "$800", totalBalance: "$68896", paymentMethod: "Cash" },
    { id: "6", date: "25 Oct 2024", bankAccount: "NBC - 2343547586900", description: "Repayment of long-term loan", credit: "$0.00", debit: "$750", accountBalance: "$0.00", totalBalance: "$8963", paymentMethod: "Cash" },
    { id: "7", date: "14 Oct 2024", bankAccount: "IDO - 3453647664889", description: "Owner's equity contribution", credit: "$1300", debit: "$0.00", accountBalance: "$1300", totalBalance: "$4568", paymentMethod: "Paypal" },
    { id: "8", date: "03 Oct 2024", bankAccount: "SWIZ - 3354456565687", description: "Cash payments for operating", credit: "$1100", debit: "$0.00", accountBalance: "$1100", totalBalance: "$5899", paymentMethod: "Stripe" },
    { id: "9", date: "20 Sep 2024", bankAccount: "SWIZ - 3456565767787", description: "Cash payments to suppliers", credit: "$2300", debit: "$0.00", accountBalance: "$2300", totalBalance: "$4568", paymentMethod: "Stripe" },
    { id: "10", date: "10 Sep 2024", bankAccount: "IBO - 3434565776768", description: "Cash receipts from sales", credit: "$1700", debit: "$0.00", accountBalance: "$1700", totalBalance: "$4568", paymentMethod: "Cash" },
  ];

  const filteredDisplay = sampleCashFlow.filter((item) => {
    const matchesSearch =
      item.bankAccount.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.paymentMethod.toLowerCase().includes(search.toLowerCase());
    const matchesMethod =
      paymentMethodFilter === "all" || item.paymentMethod === paymentMethodFilter;
    return matchesSearch && matchesMethod;
  });

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Cash Flow</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">View Your Cashflows</p>
          </div>
          <div className="flex items-center space-x-2">
            <button title="Export PDF" onClick={() => alert("Exporting PDF...")} className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center border border-[#E5E7EB] shadow-2xs">
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>
            <button title="Export Excel" onClick={() => alert("Exporting Excel...")} className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center border border-[#E5E7EB] shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 fill-emerald-50 stroke-emerald-600" />
            </button>
            <button title="Refresh" className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center border border-[#E5E7EB] shadow-2xs">
              <RotateCcw className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
            <button title="Collapse" className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-center border border-[#E5E7EB] shadow-2xs">
              <ChevronUp className="w-3.5 h-3.5 text-[#6B7280]" />
            </button>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          {/* Inner Search & Filters */}
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

            <div className="relative">
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-7 py-1.5 text-xs font-normal text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
              >
                <option value="all">Payment Method</option>
                <option value="Stripe">Stripe</option>
                <option value="Paypal">Paypal</option>
                <option value="Cash">Cash</option>
              </select>
              <ChevronDown className="w-3 h-3 text-[#9CA3AF] absolute right-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] bg-white">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Bank & Account Number</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Description</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Credit</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Debit</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">
                    <div className="flex items-center space-x-1">
                      <span>Account balance</span>
                      <Info className="w-3 h-3 text-[#111827]" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">
                    <div className="flex items-center space-x-1">
                      <span>Total Balance</span>
                      <Info className="w-3 h-3 text-[#111827]" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {filteredDisplay.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-4 text-[#64748B]">{item.date}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.bankAccount}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">{item.description}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.credit}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.debit}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.accountBalance}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.totalBalance}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">{item.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-1 pt-3 text-xs text-[#64748B] gap-3 border-t border-[#F1F3F5]">
            <div className="flex items-center space-x-2">
              <span>Row Per Page</span>
              <div className="relative">
                <select className="appearance-none bg-white border border-[#E2E8F0] rounded pl-2.5 pr-6 py-1 text-xs text-[#334155] focus:outline-none cursor-pointer">
                  <option>10</option><option>25</option><option>50</option>
                </select>
                <ChevronDown className="w-3 h-3 text-[#94A3B8] absolute right-1.5 top-2 pointer-events-none" />
              </div>
              <span>Entries</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#94A3B8]">&lt;</button>
              <button className="w-6 h-6 rounded-full bg-[#FE9F43] text-white font-bold flex items-center justify-center text-xs">1</button>
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">
                &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
