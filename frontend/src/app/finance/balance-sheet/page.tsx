"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BankAccount, Expense, Income } from "@/types";
import { fetchBankAccounts, fetchExpenses, fetchIncomes } from "@/lib/api";
import {
  FileText,
  RotateCcw,
} from "lucide-react";

export default function BalanceSheetPage() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [accs, exps, incs] = await Promise.all([
        fetchBankAccounts(),
        fetchExpenses(),
        fetchIncomes(),
      ]);
      setBankAccounts(accs || []);
      setExpenses(exps || []);
      setIncomes(incs || []);
    } catch (err) {
      console.error("Failed to fetch balance sheet:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalBankBalance = useMemo(() => {
    return bankAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [bankAccounts]);

  const netIncome = useMemo(() => {
    const inc = incomes.reduce((s, i) => s + (i.amount || 0), 0);
    const exp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    return inc - exp;
  }, [incomes, expenses]);

  const inventoryValue = 420000;
  const totalAssets = totalBankBalance + inventoryValue;
  const totalLiabilities = 85000;
  const totalEquity = totalAssets - totalLiabilities;

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Balance Sheet</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Real-time Statement of Financial Position</p>
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
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={"w-3.5 h-3.5 " + (loading ? "animate-spin text-[#FE9F43]" : "")} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets Section */}
          <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#111827] border-b pb-2 flex justify-between items-center">
              <span>Assets</span>
              <span className="text-emerald-600 font-extrabold text-base">฿{totalAssets.toLocaleString()}</span>
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">Liquid Bank Balances</span>
                <span className="font-bold text-gray-900">฿{totalBankBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">Current Inventory Value</span>
                <span className="font-bold text-gray-900">฿{inventoryValue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity Section */}
          <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs p-6 space-y-4">
            <h2 className="text-sm font-bold text-[#111827] border-b pb-2 flex justify-between items-center">
              <span>Liabilities & Equity</span>
              <span className="text-blue-600 font-extrabold text-base">฿{(totalLiabilities + totalEquity).toLocaleString()}</span>
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">Current Liabilities & Accounts Payable</span>
                <span className="font-bold text-gray-900">฿{totalLiabilities.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">Retained Earnings (Net Profit YTD)</span>
                <span className="font-bold text-emerald-600">฿{netIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-gray-50">
                <span className="text-gray-600">Owner's Equity & Capital</span>
                <span className="font-bold text-gray-900">฿{(totalEquity - netIncome).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
