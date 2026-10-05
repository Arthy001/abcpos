"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { fetchPosSettings, updatePosSettingsApi } from "@/lib/api";
import { PosSettings } from "@/types";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  MonitorCheck,
  Printer,
  Volume2,
  CreditCard,
} from "lucide-react";

export default function PosSettingsPage() {
  const [posPrinter, setPosPrinter] = useState("HP Printer");
  const [paperSize, setPaperSize] = useState("80mm");
  const [soundEffect, setSoundEffect] = useState(true);
  const [autoPrintReceipt, setAutoPrintReceipt] = useState(true);
  const [quickCashAmounts, setQuickCashAmounts] = useState("20,50,100,500,1000");

  const [paymentMethods, setPaymentMethods] = useState({
    promptpay: true,
    cash: true,
    card: true,
    bankTransfer: true,
    cod: true,
    paypal: true,
    cheque: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchPosSettings();
      if (data) {
        setPosPrinter(data.posPrinter || "HP Printer");
        setPaperSize(data.paperSize || "80mm");
        setSoundEffect(data.soundEffect ?? true);
        setAutoPrintReceipt(data.autoPrintReceipt ?? true);
        setQuickCashAmounts(data.quickCashAmounts || "20,50,100,500,1000");
        setPaymentMethods({
          promptpay: data.promptpay ?? true,
          cash: data.cash ?? true,
          card: data.card ?? true,
          bankTransfer: data.bankTransfer ?? true,
          cod: data.cod ?? true,
          paypal: data.paypal ?? true,
          cheque: data.cheque ?? false,
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load POS settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTogglePayment = (key: keyof typeof paymentMethods) => {
    setPaymentMethods((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMessage(null);
      const payload: Partial<PosSettings> = {
        posPrinter,
        paperSize,
        soundEffect,
        autoPrintReceipt,
        quickCashAmounts,
        promptpay: paymentMethods.promptpay,
        cash: paymentMethods.cash,
        card: paymentMethods.card,
        bankTransfer: paymentMethods.bankTransfer,
        cod: paymentMethods.cod,
        paypal: paymentMethods.paypal,
        cheque: paymentMethods.cheque,
      };
      const res = await updatePosSettingsApi(payload);
      if (res) {
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to save POS settings");
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
            <p className="text-xs text-[#64748B] mt-0.5">Manage your POS terminal checkout preferences</p>
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

          {/* Right Content Panel: POS Settings */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                  <MonitorCheck className="w-4 h-4 text-[#FE9F43]" />
                  POS Terminal Settings
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">Control printers, sounds, and active payment tenders</p>
              </div>
              {loading && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FE9F43]" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* 1. POS Hardware & Printer */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <Printer className="w-3.5 h-3.5 text-[#FE9F43]" />
                  <span>Hardware & Thermal Printing</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* POS Printer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Default POS Printer</label>
                    <div className="relative">
                      <select
                        value={posPrinter}
                        onChange={(e) => setPosPrinter(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="HP Printer">HP Printer (Direct USB)</option>
                        <option value="Epson Thermal POS">Epson TM-T88VI (Thermal 80mm)</option>
                        <option value="Star Micronics TSP100">Star Micronics TSP100 (LAN/WiFi)</option>
                        <option value="Xprinter XP-58">Xprinter XP-58 (Mini 58mm)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Paper Size */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Paper Size</label>
                    <div className="relative">
                      <select
                        value={paperSize}
                        onChange={(e) => setPaperSize(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="80mm">80mm (Standard Full Thermal Slip)</option>
                        <option value="58mm">58mm (Compact Mobile Slip)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Quick Cash Buttons Setup */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-medium text-[#1E293B]">
                    Quick Cash Preset Amounts (฿) <span className="text-[11px] text-gray-400 font-normal">(Comma separated)</span>
                  </label>
                  <input
                    type="text"
                    value={quickCashAmounts}
                    onChange={(e) => setQuickCashAmounts(e.target.value)}
                    placeholder="20,50,100,500,1000"
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>
              </div>

              {/* 2. Payment Method Toggles */}
              <div className="space-y-3 pt-3 border-t border-[#F1F3F5]">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <CreditCard className="w-3.5 h-3.5 text-[#FE9F43]" />
                  <span>Active Payment Methods in POS Checkout</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentMethods.promptpay}
                      onChange={() => handleTogglePayment("promptpay")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] cursor-pointer"
                    />
                    <span className="font-semibold text-emerald-700">PromptPay QR</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentMethods.cash}
                      onChange={() => handleTogglePayment("cash")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] cursor-pointer"
                    />
                    <span className="font-semibold">Cash (เงินสด)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentMethods.card}
                      onChange={() => handleTogglePayment("card")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] cursor-pointer"
                    />
                    <span className="font-semibold">Credit/Debit Card</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentMethods.bankTransfer}
                      onChange={() => handleTogglePayment("bankTransfer")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] cursor-pointer"
                    />
                    <span>Bank Transfer</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentMethods.cod}
                      onChange={() => handleTogglePayment("cod")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] cursor-pointer"
                    />
                    <span>COD (เก็บเงินปลายทาง)</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentMethods.paypal}
                      onChange={() => handleTogglePayment("paypal")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] cursor-pointer"
                    />
                    <span>PayPal</span>
                  </label>

                  <label className="flex items-center space-x-2 text-xs text-[#374151] cursor-pointer p-2.5 rounded-lg border border-gray-100 hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={paymentMethods.cheque}
                      onChange={() => handleTogglePayment("cheque")}
                      className="rounded-xs border-gray-300 text-[#FE9F43] focus:ring-[#FE9F43] cursor-pointer"
                    />
                    <span>Cheque</span>
                  </label>
                </div>
              </div>

              {/* 3. Terminal Audio & Auto Print */}
              <div className="space-y-3 pt-3 border-t border-[#F1F3F5]">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <Volume2 className="w-3.5 h-3.5 text-[#FE9F43]" />
                  <span>Terminal Automation & Sounds</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Barcode Scanner Beep Sound</p>
                    <p className="text-[11px] text-gray-500">Play confirmation tone when barcode is scanned or item added</p>
                  </div>
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-3.5 rounded-xl border border-gray-200">
                  <div>
                    <p className="text-xs font-bold text-gray-800">Auto Print Receipt After Sale</p>
                    <p className="text-[11px] text-gray-500">Automatically open printable receipt modal immediately upon payment success</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoPrintReceipt}
                      onChange={() => setAutoPrintReceipt(!autoPrintReceipt)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
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
              <h3 className="text-base font-bold text-gray-900">POS Settings Updated!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Hardware printer options and active payment tenders have been successfully saved to database.
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
