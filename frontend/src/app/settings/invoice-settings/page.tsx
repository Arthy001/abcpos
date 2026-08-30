"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Upload,
  CheckCircle2,
} from "lucide-react";

export default function InvoiceSettingsPage() {
  const [invoicePrefix, setInvoicePrefix] = useState("INV - ");
  const [invoiceDue, setInvoiceDue] = useState("5");
  const [roundOff, setRoundOff] = useState(true);
  const [roundOffType, setRoundOffType] = useState("Round Off Up");
  const [showCompanyDetails, setShowCompanyDetails] = useState(true);
  const [headerTerms, setHeaderTerms] = useState("");
  const [footerTerms, setFooterTerms] = useState("");

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showFeedback("Invoice settings saved successfully!");
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
              onClick={() => showFeedback("Invoice settings refreshed")}
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

          {/* Right Content Panel: Invoice Settings */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Invoice Settings</h2>
            </div>

            <div className="p-6 space-y-6">
              {/* 1. Invoice Logo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F1F3F5]">
                <div>
                  <h4 className="text-xs font-medium text-[#1E293B]">Invoice Logo</h4>
                  <p className="text-[11px] text-[#64748B]">Upload Logo of your Company to display in Invoice</p>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="space-y-1 text-right sm:text-left">
                    <button
                      type="button"
                      className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <p className="text-[10px] text-[#64748B]">For better preview recommended size is 450px x 450px. Max size 5mb.</p>
                  </div>

                  <div className="relative w-12 h-12 rounded-xl border border-gray-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-2xs">
                    <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-black text-xs">
                      D
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Invoice Prefix */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-medium text-[#1E293B]">Invoice Prefix</h4>
                  <p className="text-[11px] text-[#64748B]">Add prefix to your invoice</p>
                </div>
                <div className="min-w-[200px]">
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => setInvoicePrefix(e.target.value)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>
              </div>

              {/* 3. Invoice Due */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-medium text-[#1E293B]">Invoice Due</h4>
                  <p className="text-[11px] text-[#64748B]">Select due date to display in Invoice</p>
                </div>
                <div className="flex items-center space-x-2 min-w-[200px]">
                  <div className="relative flex-1">
                    <select
                      value={invoiceDue}
                      onChange={(e) => setInvoiceDue(e.target.value)}
                      className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                    >
                      <option value="5">5</option>
                      <option value="7">7</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                  </div>
                  <span className="text-xs text-[#64748B]">Days</span>
                </div>
              </div>

              {/* 4. Invoice Round Off */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-medium text-[#1E293B]">Invoice Round Off</h4>
                  <p className="text-[11px] text-[#64748B]">Value Roundoff in Invoice</p>
                </div>
                <div className="flex items-center space-x-4 min-w-[200px]">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={roundOff}
                      onChange={() => setRoundOff(!roundOff)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>

                  <div className="relative flex-1">
                    <select
                      value={roundOffType}
                      onChange={(e) => setRoundOffType(e.target.value)}
                      className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                    >
                      <option value="Round Off Up">Round Off Up</option>
                      <option value="Round Off Down">Round Off Down</option>
                      <option value="Nearest Decimal">Nearest Decimal</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 5. Show Company Details */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-medium text-[#1E293B]">Show Company Details</h4>
                  <p className="text-[11px] text-[#64748B]">Show / Hide Company Details in Invoice</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showCompanyDetails}
                    onChange={() => setShowCompanyDetails(!showCompanyDetails)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                </label>
              </div>

              {/* 6. Invoice Header Terms */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1E293B]">Invoice Header Terms</label>
                <textarea
                  rows={3}
                  value={headerTerms}
                  onChange={(e) => setHeaderTerms(e.target.value)}
                  placeholder="Type your message"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] resize-none"
                />
              </div>

              {/* 7. Invoice Footer Terms */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#1E293B]">Invoice Footer Terms</label>
                <textarea
                  rows={3}
                  value={footerTerms}
                  onChange={(e) => setFooterTerms(e.target.value)}
                  placeholder="Type your message"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] resize-none"
                />
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
