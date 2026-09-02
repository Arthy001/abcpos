"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  FileText,
  FileSpreadsheet,
  RotateCcw,
  ChevronUp,
  Calendar,
  ChevronDown,
} from "lucide-react";

interface StatementItem {
  id: string;
  referenceNumber: string;
  date: string;
  category: string;
  description: string;
  amount: string;
  type: "Credit" | "Debit";
  balance: string;
}

export default function AccountStatementPage() {
  const [selectedAccount, setSelectedAccount] = useState<string>("HBSC - 3298784309485");
  const [dateRange] = useState<string>("01-Jan-2026 - 12-Dec-2026");

  const sampleStatements: StatementItem[] = [
    { id: "1", referenceNumber: "#AS842", date: "24 Dec 2024", category: "Sale", description: "Sale of goods", amount: "+$200", type: "Credit", balance: "$4365" },
    { id: "2", referenceNumber: "#AS821", date: "10 Dec 2024", category: "Refund", description: "Refund Issued", amount: "-$50", type: "Debit", balance: "$4444" },
    { id: "3", referenceNumber: "#AS847", date: "27 Nov 2024", category: "Purchase", description: "Inventory restocking", amount: "-$800", type: "Debit", balance: "$65145" },
    { id: "4", referenceNumber: "#AS874", date: "18 Nov 2024", category: "Sale", description: "Sale of goods", amount: "+$100", type: "Credit", balance: "$1848" },
    { id: "5", referenceNumber: "#AS887", date: "06 Nov 2024", category: "Purchase", description: "Inventory restocking", amount: "-$700", type: "Debit", balance: "$986" },
    { id: "6", referenceNumber: "#AS856", date: "25 Oct 2024", category: "Utility Payment", description: "Electricity Bill", amount: "-$1000", type: "Debit", balance: "$15547" },
    { id: "7", referenceNumber: "#AS822", date: "14 Oct 2024", category: "Equipment Purchase", description: "New POS terminal purchased", amount: "-$1200", type: "Debit", balance: "$141645" },
    { id: "8", referenceNumber: "#AS844", date: "03 Oct 2024", category: "Refund", description: "Refund Issued", amount: "-$750", type: "Debit", balance: "$4356" },
    { id: "9", referenceNumber: "#AS832", date: "20 Sep 2024", category: "Withdraw", description: "Withdraw by accountant", amount: "-$450", type: "Debit", balance: "$614389" },
  ];

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Account Statement</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">View Your Statement</p>
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

        {/* Filter Card */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-5">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-4">
            <div className="space-y-1.5 w-full md:w-64">
              <label className="text-xs font-semibold text-[#374151]">Choose Your Date</label>
              <div className="flex items-center space-x-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg text-xs text-[#374151]">
                <Calendar className="w-4 h-4 text-[#9CA3AF]" />
                <span>{dateRange}</span>
              </div>
            </div>
            <div className="space-y-1.5 w-full md:w-64">
              <label className="text-xs font-semibold text-[#374151]">Account</label>
              <div className="relative">
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg pl-3 pr-8 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                >
                  <option value="">Select</option>
                  <option value="HBSC - 3298784309485">HBSC - 3298784309485</option>
                  <option value="SWIZ - 5475878970090">SWIZ - 5475878970090</option>
                  <option value="SWIZ - 3255465758698">SWIZ - 3255465758698</option>
                  <option value="IDO - 4353689870544">IDO - 4353689870544</option>
                  <option value="NBC - 4324356677889">NBC - 4324356677889</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#9CA3AF] absolute right-2.5 top-3 pointer-events-none" />
              </div>
            </div>
            <button
              onClick={() => {}}
              className="px-6 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs active:scale-95 transition-all"
            >
              Submit
            </button>
          </div>
        </div>

        {/* Statement Card */}
        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#111827]">
            <span>Statement of Account :</span>
            <span className="text-[#FE9F43] bg-[#FFF5ED] px-2 py-0.5 rounded border border-[#FED7AA]/50 font-mono text-[11px]">
              {selectedAccount || "HBSC - 3298784309485"}
            </span>
          </div>

          <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
            <table className="w-full text-left text-xs min-w-[850px]">
              <thead className="border-b border-[#F1F3F5] bg-white">
                <tr>
                  <th className="py-3 px-4 font-bold text-[#111827]">Reference Number</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Date</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Category</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Description</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Amount</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Transaction Type</th>
                  <th className="py-3 px-4 font-bold text-[#111827]">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                {sampleStatements.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[#64748B]">{item.referenceNumber}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">{item.date}</td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.category}</td>
                    <td className="py-3.5 px-4 text-[#64748B]">{item.description}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#1E293B]">{item.amount}</td>
                    <td className="py-3.5 px-4">
                      {item.type === "Credit" ? (
                        <span className="inline-flex items-center space-x-1 text-white font-semibold text-[10px] bg-[#28C76F] px-2 py-0.5 rounded">
                          <span>•</span>
                          <span>Credit</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-white font-semibold text-[10px] bg-[#EA5455] px-2 py-0.5 rounded">
                          <span>•</span>
                          <span>Debit</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">{item.balance}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[#E5E7EB] font-bold text-xs text-[#111827]">
                <tr>
                  <td colSpan={6} className="py-4 px-4">Total</td>
                  <td className="py-4 px-4 font-bold text-[#111827]">$33268.53</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
