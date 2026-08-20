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
} from "lucide-react";

interface BalanceSheetItem {
  id: string;
  name: string;
  bankAccount: string;
  credit: string;
  debit: string;
  balance: string;
}

export default function BalanceSheetPage() {
  const [search, setSearch] = useState<string>("");

  const sampleBalanceSheet: BalanceSheetItem[] = [
    { id: "1", name: "Zephyr Indira", bankAccount: "HBSC - 3298784309485", credit: "$4565", debit: "-$200", balance: "$4365" },
    { id: "2", name: "Quillon Elysia", bankAccount: "SWIZ - 5475878970090", credit: "$4494", debit: "-$50", balance: "$4444" },
    { id: "3", name: "Thaddeus Juniper", bankAccount: "SWIZ - 3255465758698", credit: "$65945", debit: "-$800", balance: "$65145" },
    { id: "4", name: "Orion Astrid", bankAccount: "IDO - 4353689870544", credit: "$1948", debit: "-$100", balance: "$1848" },
    { id: "5", name: "Caspian Marigold", bankAccount: "NDC - 4324356677889", credit: "$1686", debit: "-$700", balance: "$986" },
    { id: "6", name: "Emma James", bankAccount: "NBC - 2343547586900", credit: "$16547", debit: "-$1000", balance: "$15547" },
    { id: "7", name: "Olivia Ethan", bankAccount: "IBO - 3453647664889", credit: "$141845", debit: "-$1200", balance: "$141645" },
    { id: "8", name: "Sophia Liam", bankAccount: "SWIZ - 3354456565687", credit: "$44180", debit: "-$750", balance: "$4356" },
    { id: "9", name: "Ava Mason", bankAccount: "SWIZ - 3456565767787", credit: "$614848", debit: "-$450", balance: "$614389" },
    { id: "10", name: "Isabella Jackson", bankAccount: "IBO - 3434565776768", credit: "$77818", debit: "-$300", balance: "$77518" },
  ];

  const filteredDisplay = sampleBalanceSheet.filter((item) => {
    return (
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.bankAccount.toLowerCase().includes(search.toLowerCase())
    );
  });

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
          {/* Search Box */}
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#F1F3F5] bg-white">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Name</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Bank & Account Number</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Credit</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Debit</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {filteredDisplay.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.name}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">{item.bankAccount}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.credit}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.debit}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.balance}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[#E5E7EB] font-bold text-xs text-[#111827]">
                <tr>
                  <td className="py-4 px-4 font-bold text-[#111827]">Total</td>
                  <td className="py-4 px-4"></td>
                  <td className="py-4 px-4 font-bold text-[#111827]">$332642.53</td>
                  <td className="py-4 px-4 font-bold text-[#111827]">-$16590.96</td>
                  <td className="py-4 px-4 font-bold text-[#111827]">$332687442.53</td>
                </tr>
              </tfoot>
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
              <button className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 text-[#64748B]">&gt;</button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
