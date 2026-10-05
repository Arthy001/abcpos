"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BalanceSheetData } from "@/types";
import { fetchBalanceSheetApi } from "@/lib/api";
import {
  FileText,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  Building2,
  Package,
  Layers,
  ArrowRight,
  Loader2,
  CreditCard,
  Users,
} from "lucide-react";

export default function BalanceSheetPage() {
  const [data, setData] = useState<BalanceSheetData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetchBalanceSheetApi();
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error("Failed to fetch balance sheet:", err);
    } finally {
      setLoading(false);
    }
  };

  const assets = data?.assets;
  const liabilities = data?.liabilities;
  const equity = data?.equity;

  const totalAssets = assets?.totalAssets || 0;
  const totalLiabilitiesAndEquity = (liabilities?.totalLiabilities || 0) + (equity?.totalEquity || 0);
  const isBalanced = Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01;

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#FE9F43]" />
              Balance Sheet (งบดุล)
            </h1>
            <p className="text-xs text-[#6B7280] mt-0.5">
              Real-time Statement of Financial Position &bull; Connected to SQLite Inventory & Bank Ledgers
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Print"
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

        {/* Status Banner */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold text-emerald-950">
                {isBalanced ? "Accounting Equation Balanced" : "Balance Reconciliation in Progress"}
              </p>
              <p className="text-emerald-700 text-[11px]">
                Total Assets (฿{totalAssets.toLocaleString()}) = Liabilities (฿{(liabilities?.totalLiabilities || 0).toLocaleString()}) + Equity (฿{(equity?.totalEquity || 0).toLocaleString()})
              </p>
            </div>
          </div>
          <div className="px-3 py-1 bg-white rounded-lg border border-emerald-300 font-mono font-bold text-emerald-800 text-[11px]">
            Inventory Stock: {assets?.totalStockQty || 0} Units across {assets?.totalProductsCount || 0} Items
          </div>
        </div>

        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center space-y-3 bg-white rounded-xl border border-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-[#FE9F43]" />
            <p className="text-xs text-gray-500 font-medium">Calculating real inventory valuation & bank balances...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Assets Section */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-6 space-y-5">
              <div className="border-b pb-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <h2 className="text-sm font-bold text-[#111827]">Current Assets (สินทรัพย์หมุนเวียน)</h2>
                </div>
                <span className="text-emerald-600 font-extrabold text-base">฿{totalAssets.toLocaleString()}</span>
              </div>

              {/* Sub-item: Liquid Bank Accounts */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-gray-50 p-2 rounded-lg">
                  <span className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600" />
                    Liquid Bank Balances & Cash
                  </span>
                  <span>฿{(assets?.totalBankBalance || 0).toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-1.5 text-[11px]">
                  {assets?.bankAccounts.map((acc) => (
                    <div key={acc.id} className="flex justify-between py-0.5 text-gray-600 border-b border-gray-50">
                      <span>{acc.accountName} <span className="text-gray-400">({acc.bankName})</span></span>
                      <span className="font-semibold text-gray-900">฿{(acc.balance || 0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sub-item: Real Inventory Valuation */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                  <span className="flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-amber-600" />
                    Current Inventory Asset (มูลค่าสต็อกจริง)
                  </span>
                  <span className="text-amber-900 font-extrabold">฿{(assets?.inventoryValue || 0).toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-1 text-[11px] text-gray-600">
                  <div className="flex justify-between">
                    <span>Valuation Basis:</span>
                    <span className="font-mono text-gray-800">&Sigma;(stock &times; costPrice)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Tracked Products:</span>
                    <span className="font-semibold">{assets?.totalProductsCount || 0} SKUs</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Physical Units on Hand:</span>
                    <span className="font-semibold">{assets?.totalStockQty || 0} units</span>
                  </div>
                </div>
              </div>

              {/* Sub-item: Accounts Receivable */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-gray-50 p-2 rounded-lg">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    Accounts Receivable (ลูกหนี้การค้า)
                  </span>
                  <span>฿{(assets?.accountsReceivable || 0).toLocaleString()}</span>
                </div>
                <p className="pl-4 text-[10px] text-gray-400">Outstanding balances from unpaid customer sales</p>
              </div>
            </div>

            {/* Right: Liabilities & Equity Section */}
            <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-6 space-y-5">
              <div className="border-b pb-3 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
                  <h2 className="text-sm font-bold text-[#111827]">Liabilities & Equity (หนี้สินและทุน)</h2>
                </div>
                <span className="text-blue-600 font-extrabold text-base">฿{totalLiabilitiesAndEquity.toLocaleString()}</span>
              </div>

              {/* 1. Liabilities */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                  <span className="text-rose-900">Current Liabilities & Accounts Payable</span>
                  <span className="text-rose-700 font-extrabold">฿{(liabilities?.totalLiabilities || 0).toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-1 text-[11px] text-gray-600">
                  <div className="flex justify-between">
                    <span>Supplier Dues Payable:</span>
                    <span className="font-semibold text-rose-600">฿{(liabilities?.accountsPayable || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* 2. Equity */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs font-bold text-gray-800 bg-blue-50/60 p-2 rounded-lg border border-blue-100">
                  <span className="text-blue-900">Shareholder Equity & Reserves (ส่วนของเจ้าของ)</span>
                  <span className="text-blue-700 font-extrabold">฿{(equity?.totalEquity || 0).toLocaleString()}</span>
                </div>
                <div className="pl-4 space-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">Retained Earnings (Net Profit YTD)</span>
                    <span className="font-bold text-emerald-600">฿{(equity?.retainedEarnings || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-gray-50">
                    <span className="text-gray-600">Owner's Capital & Net Worth</span>
                    <span className="font-bold text-gray-900">฿{(equity?.ownerCapital || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-1 text-gray-500 text-[10px]">
                    <span>Total Sales Income: ฿{(equity?.totalIncome || 0).toLocaleString()}</span>
                    <span>Total Operating Expenses: ฿{(equity?.totalExpense || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
