"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

export default function PrefixesSettingsPage() {
  const [prefixes, setPrefixes] = useState({
    productSku: "SKU - ",
    supplier: "SUP - ",
    purchase: "PU - ",
    purchaseReturn: "PR - ",
    sales: "SA - ",
    salesReturn: "SR - ",
    customer: "CT - ",
    expense: "EX - ",
    stockTransfer: "ST - ",
    stockAdjustment: "SA - ",
    salesOrder: "SO - ",
    posInvoice: "PINV - ",
    estimation: "EST - ",
    transaction: "TRN - ",
    employee: "EMP - ",
  });

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleChange = (field: string, val: string) => {
    setPrefixes((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showFeedback("Prefixes saved successfully!");
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your settings on portal</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={() => showFeedback("Prefixes refreshed")}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Settings Sidebar */}
          <SettingsSidebar />

          {/* Right Content Panel: Prefixes */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Prefixes</h2>
            </div>

            <div className="p-6">
              {/* 4-Columns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Product (SKU) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Product (SKU)</label>
                  <input
                    type="text"
                    value={prefixes.productSku}
                    onChange={(e) => handleChange("productSku", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Supplier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Supplier</label>
                  <input
                    type="text"
                    value={prefixes.supplier}
                    onChange={(e) => handleChange("supplier", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Purchase */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Purchase</label>
                  <input
                    type="text"
                    value={prefixes.purchase}
                    onChange={(e) => handleChange("purchase", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Purchase Return */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Purchase Return</label>
                  <input
                    type="text"
                    value={prefixes.purchaseReturn}
                    onChange={(e) => handleChange("purchaseReturn", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Sales */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Sales</label>
                  <input
                    type="text"
                    value={prefixes.sales}
                    onChange={(e) => handleChange("sales", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Sales Return */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Sales Return</label>
                  <input
                    type="text"
                    value={prefixes.salesReturn}
                    onChange={(e) => handleChange("salesReturn", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Customer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Customer</label>
                  <input
                    type="text"
                    value={prefixes.customer}
                    onChange={(e) => handleChange("customer", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Expense */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Expense</label>
                  <input
                    type="text"
                    value={prefixes.expense}
                    onChange={(e) => handleChange("expense", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Stock Transfer */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Stock Transfer</label>
                  <input
                    type="text"
                    value={prefixes.stockTransfer}
                    onChange={(e) => handleChange("stockTransfer", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Stock Adjustment */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Stock Adjustmentt</label>
                  <input
                    type="text"
                    value={prefixes.stockAdjustment}
                    onChange={(e) => handleChange("stockAdjustment", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Sales Order */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Sales Order</label>
                  <input
                    type="text"
                    value={prefixes.salesOrder}
                    onChange={(e) => handleChange("salesOrder", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* POS Invoice */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">POS Invoice</label>
                  <input
                    type="text"
                    value={prefixes.posInvoice}
                    onChange={(e) => handleChange("posInvoice", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Estimation */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Estimation</label>
                  <input
                    type="text"
                    value={prefixes.estimation}
                    onChange={(e) => handleChange("estimation", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Transaction */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Transaction</label>
                  <input
                    type="text"
                    value={prefixes.transaction}
                    onChange={(e) => handleChange("transaction", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Employee */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">Employee</label>
                  <input
                    type="text"
                    value={prefixes.employee}
                    onChange={(e) => handleChange("employee", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 p-5 bg-white border-t border-[#F1F3F5]">
              <button
                type="button"
                onClick={() => showFeedback("Cancelled changes")}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
