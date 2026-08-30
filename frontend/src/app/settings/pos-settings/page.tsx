"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function PosSettingsPage() {
  const [posPrinter, setPosPrinter] = useState("HP Printer");
  const [soundEffect, setSoundEffect] = useState(true);
  const [paymentMethods, setPaymentMethods] = useState({
    cod: true,
    cheque: false,
    card: true,
    paypal: true,
    bankTransfer: true,
    cash: true,
  });

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleTogglePayment = (key: keyof typeof paymentMethods) => {
    setPaymentMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showFeedback("POS settings saved successfully!");
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
              onClick={() => showFeedback("POS settings refreshed")}
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

          {/* Right Content Panel: POS Settings */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">POS Settings</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* 1. POS Printer */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-medium text-[#1E293B]">POS Printer</label>
                <div className="relative min-w-[240px]">
                  <select
                    value={posPrinter}
                    onChange={(e) => setPosPrinter(e.target.value)}
                    className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                  >
                    <option value="HP Printer">HP Printer</option>
                    <option value="Epson Thermal POS">Epson Thermal POS</option>
                    <option value="Star Micronics TSP100">Star Micronics TSP100</option>
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              {/* 2. Payment Method */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-medium text-[#1E293B]">Payment Method</label>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.cod}
                      onChange={() => handleTogglePayment("cod")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43]"
                    />
                    <span>COD</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.cheque}
                      onChange={() => handleTogglePayment("cheque")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43]"
                    />
                    <span>Cheque</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.card}
                      onChange={() => handleTogglePayment("card")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43]"
                    />
                    <span>Card</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.paypal}
                      onChange={() => handleTogglePayment("paypal")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43]"
                    />
                    <span>Paypal</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.bankTransfer}
                      onChange={() => handleTogglePayment("bankTransfer")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43]"
                    />
                    <span>Bank Transfer</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentMethods.cash}
                      onChange={() => handleTogglePayment("cash")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43]"
                    />
                    <span>Cash</span>
                  </label>
                </div>
              </div>

              {/* 3. Enable Sound Effect */}
              <div className="flex items-center justify-between pt-2">
                <label className="text-xs font-medium text-[#1E293B]">Enable Sound Effect</label>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={soundEffect}
                    onChange={() => setSoundEffect(!soundEffect)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                </label>
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
