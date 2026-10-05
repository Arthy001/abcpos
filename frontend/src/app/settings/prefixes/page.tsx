"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { fetchPrefixSettings, updatePrefixSettingsApi } from "@/lib/api";
import { PrefixSettings } from "@/types";
import {
  RotateCcw,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Hash,
} from "lucide-react";

export default function PrefixesSettingsPage() {
  const [prefixes, setPrefixes] = useState<PrefixSettings>({
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
    shift: "SFT - ",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPrefixSettings();
      if (data) {
        setPrefixes(data);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load prefix settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field: keyof PrefixSettings, val: string) => {
    setPrefixes((prev) => ({ ...prev, [field]: val }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMessage(null);
      const res = await updatePrefixSettingsApi(prefixes);
      if (res) {
        setPrefixes(res);
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to save prefix settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage document sequence and prefix rules on portal</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              title="Refresh"
              onClick={loadData}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              type="button"
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Settings Sidebar */}
          <SettingsSidebar />

          {/* Right Content Panel: Prefixes */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                  <Hash className="w-4 h-4 text-[#FE9F43]" />
                  Document Prefixes
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">Configure transaction codes and running number prefixes</p>
              </div>
              {loading && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FE9F43]" />
                  <span>Loading...</span>
                </div>
              )}
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
                  <label className="text-xs font-medium text-[#1E293B]">Stock Adjustment</label>
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

                {/* POS Shift */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#1E293B]">POS Shift</label>
                  <input
                    type="text"
                    value={prefixes.shift || "SFT - "}
                    onChange={(e) => handleChange("shift", e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 p-5 bg-white border-t border-[#F1F3F5]">
              <button
                type="button"
                onClick={loadData}
                disabled={saving || loading}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="flex items-center space-x-1.5 px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* GEMINI Rule #3: Edit Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Prefixes Updated!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Document numbering prefixes have been successfully saved to database.
              </p>
            </div>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-98 transition-all cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* GEMINI Rule #3: Error / Validation Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center shadow-2xl border border-gray-100 space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-8 h-8 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">Operation Failed</h3>
              <p className="text-xs text-rose-600 mt-1">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 active:scale-98 transition-all cursor-pointer"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
