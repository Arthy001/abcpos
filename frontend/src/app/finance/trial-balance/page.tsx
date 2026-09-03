"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { BankAccount, Expense, Income } from "@/types";
import { fetchBankAccounts, fetchExpenses, fetchIncomes } from "@/lib/api";
import {
  FileText,
  FileSpreadsheet,
  RotateCcw,
} from "lucide-react";

export default function TrialBalancePage() {
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
      console.error("Failed to fetch trial balance:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalBankBalance = useMemo(() => {
    return bankAccounts.reduce((sum, a) => sum + (a.balance || 0), 0);
  }, [bankAccounts]);

  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  const totalIncome = useMemo(() => {
    return incomes.reduce((sum, i) => sum + (i.amount || 0), 0);
  }, [incomes]);

  const assets = [
    { name: "Cash in Banks & Registers", debit: totalBankBalance, credit: 0 },
    { name: "Operating Expenses (YTD)", debit: totalExpense, credit: 0 },
    { name: "Estimated POS Inventory Asset", debit: 350000, credit: 0 },
  ];

  const liabilitiesAndEquity = [
    { name: "Sales & Revenue Income (YTD)", debit: 0, credit: totalIncome },
    { name: "Capital & Retained Earnings", debit: 0, credit: (totalBankBalance + totalExpense + 350000) - totalIncome },
  ];

  const totalDebit = assets.reduce((s, a) => s + a.debit, 0);
  const totalCredit = liabilitiesAndEquity.reduce((s, l) => s + l.credit, 0);

  return (
    <AppLayout>
      <div className="space-y-4 w-full font-sans pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h1 className="text-lg font-bold text-[#111827] tracking-tight">Trial Balance</h1>
            <p className="text-xs text-[#6B7280] mt-0.5">Real-time Debit & Credit Trial Balance Sheet</p>
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
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className={"w-3.5 h-3.5 " + (loading ? "animate-spin text-[#FE9F43]" : "")} />
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden p-6 space-y-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="border-b border-[#E5E7EB] text-[#111827] bg-[#FAFAFA]">
                <tr>
                  <th className="py-3 px-4 font-bold">Account Name</th>
                  <th className="py-3 px-4 font-bold text-right">Debit (฿)</th>
                  <th className="py-3 px-4 font-bold text-right">Credit (฿)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F8F9FA]">
                <tr className="bg-orange-50/40">
                  <td colSpan={3} className="py-2 px-4 font-bold text-[#FE9F43] uppercase tracking-wider text-[10px]">
                    Assets & Expenses (Debit Normal)
                  </td>
                </tr>
                {assets.map((item, idx) => (
                  <tr key={"a-" + idx} className="hover:bg-[#F9FAFB]">
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {item.debit ? "฿" + item.debit.toLocaleString() : "-"}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400">-</td>
                  </tr>
                ))}

                <tr className="bg-emerald-50/40">
                  <td colSpan={3} className="py-2 px-4 font-bold text-emerald-600 uppercase tracking-wider text-[10px]">
                    Liabilities, Revenue & Equity (Credit Normal)
                  </td>
                </tr>
                {liabilitiesAndEquity.map((item, idx) => (
                  <tr key={"l-" + idx} className="hover:bg-[#F9FAFB]">
                    <td className="py-3 px-4 font-medium text-gray-900">{item.name}</td>
                    <td className="py-3 px-4 text-right text-gray-400">-</td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {item.credit ? "฿" + item.credit.toLocaleString() : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-900 bg-gray-50 font-bold">
                <tr>
                  <td className="py-3.5 px-4 text-gray-900 text-sm">Total Balance</td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 text-sm">
                    ฿{totalDebit.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-right text-emerald-600 text-sm">
                    ฿{totalCredit.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
