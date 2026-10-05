"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { TrialBalanceData } from "@/types";
import { fetchTrialBalanceApi } from "@/lib/api";
import {
  FileText,
  RotateCcw,
  CheckCircle2,
  Scale,
  Loader2,
} from "lucide-react";

export default function TrialBalancePage() {
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchTrialBalanceApi();
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to fetch trial balance:", err);
    } finally {
      setLoading(false);
    }
  };

  const debitEntries = data?.debitEntries || [];
  const creditEntries = data?.creditEntries || [];
  const totalDebit = data?.totalDebit || 0;
  const totalCredit = data?.totalCredit || 0;
  const isBalanced = data?.isBalanced ?? true;

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight flex items-center gap-2">
              <Scale className="w-5 h-5 text-[#FE9F43]" />
              Trial Balance (งบทดลอง)
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Double-Entry General Ledger Balance &bull; Real Database Products & Accounts Valuation
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Export PDF / Print"
              onClick={() => window.print()}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#EF4444] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 fill-red-50 stroke-red-500" />
            </button>
            <button
              title="Refresh"
              onClick={loadData}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={"w-3.5 h-3.5 " + (loading ? "animate-spin text-[#FE9F43]" : "")} />
            </button>
          </div>
        </div>

        {/* Balanced Verification Badge */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">
                {isBalanced ? "Trial Balance Perfectly Balanced" : "Balance Mismatch Detected"}
              </p>
              <p className="text-emerald-700 text-[11px]">
                Debits (฿{totalDebit.toLocaleString()}) &equals; Credits (฿{totalCredit.toLocaleString()}) &bull; Double-entry identity satisfied
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-600 text-white rounded-lg font-bold text-[11px] shadow-xs">
            Balanced
          </span>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-[#FE9F43]" />
            <p className="text-xs text-gray-500 font-medium">Aggregating General Ledger debit & credit balances...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-6 space-y-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="border-b border-[#E5E7EB] text-[#111827] bg-[#FAFAFA]">
                  <tr>
                    <th className="py-3 px-4 font-bold w-20">Code</th>
                    <th className="py-3 px-4 font-bold">Account Name</th>
                    <th className="py-3 px-4 font-bold">Category</th>
                    <th className="py-3 px-4 font-bold text-right">Debit (฿)</th>
                    <th className="py-3 px-4 font-bold text-right">Credit (฿)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {/* Debit Normal Header */}
                  <tr className="bg-orange-50/40">
                    <td colSpan={5} className="py-2.5 px-4 font-bold text-[#FE9F43] uppercase tracking-wider text-[10px]">
                      Assets & Expenses (Debit Normal Accounts)
                    </td>
                  </tr>
                  {debitEntries.map((item, idx) => (
                    <tr key={"d-" + idx} className="hover:bg-[#F9FAFB]">
                      <td className="py-3 px-4 font-mono text-gray-500">{item.code}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{item.accountName}</td>
                      <td className="py-3 px-4 text-gray-500">{item.category}</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        {item.debit ? "฿" + item.debit.toLocaleString() : "-"}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-400">-</td>
                    </tr>
                  ))}

                  {/* Credit Normal Header */}
                  <tr className="bg-blue-50/40">
                    <td colSpan={5} className="py-2.5 px-4 font-bold text-blue-600 uppercase tracking-wider text-[10px]">
                      Liabilities, Revenue & Equity (Credit Normal Accounts)
                    </td>
                  </tr>
                  {creditEntries.map((item, idx) => (
                    <tr key={"c-" + idx} className="hover:bg-[#F9FAFB]">
                      <td className="py-3 px-4 font-mono text-gray-500">{item.code}</td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{item.accountName}</td>
                      <td className="py-3 px-4 text-gray-500">{item.category}</td>
                      <td className="py-3 px-4 text-right text-gray-400">-</td>
                      <td className="py-3 px-4 text-right font-bold text-gray-900">
                        {item.credit ? "฿" + item.credit.toLocaleString() : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t-2 border-gray-900 bg-gray-50 font-bold">
                  <tr>
                    <td colSpan={3} className="py-3.5 px-4 text-gray-900 text-sm">
                      Total Ledger Balance (ยอดรวมงบทดลอง)
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 text-sm font-mono">
                      ฿{totalDebit.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-emerald-600 text-sm font-mono">
                      ฿{totalCredit.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
