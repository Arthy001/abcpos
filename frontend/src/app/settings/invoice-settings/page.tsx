"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  Upload,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  ImageIcon,
  X,
} from "lucide-react";
import {
  InvoiceSettingsType,
  getInvoiceSettingsApi,
  updateInvoiceSettingsApi,
} from "@/lib/api";

const ROUND_OFF_OPTIONS = ["Round Off Up", "Round Off Down", "Nearest Decimal"];
const DUE_DAY_OPTIONS = [5, 7, 10, 15, 20, 30, 45, 60, 90];

// ─── Component ────────────────────────────────────────────────────────────────
export default function InvoiceSettingsPage() {
  const [settings, setSettings] = useState<InvoiceSettingsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // Form fields (derived from settings)
  const [invoicePrefix, setInvoicePrefix] = useState("INV - ");
  const [invoiceDueDays, setInvoiceDueDays] = useState(5);
  const [roundOff, setRoundOff] = useState(true);
  const [roundOffType, setRoundOffType] = useState("Round Off Up");
  const [showCompanyDetails, setShowCompanyDetails] = useState(true);
  const [headerTerms, setHeaderTerms] = useState("");
  const [footerTerms, setFooterTerms] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Feedback
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // ─── Load Data ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInvoiceSettingsApi();
      setSettings(data);
      setInvoicePrefix(data.invoicePrefix);
      setInvoiceDueDays(data.invoiceDueDays);
      setRoundOff(data.roundOff);
      setRoundOffType(data.roundOffType);
      setShowCompanyDetails(data.showCompanyDetails);
      setHeaderTerms(data.headerTerms);
      setFooterTerms(data.footerTerms);
      setLogoUrl(data.logoUrl ?? null);
      setLogoPreview(data.logoUrl ?? null);
      setIsDirty(false);
    } catch (e: any) {
      setFeedbackMsg(e.message || "Failed to load invoice settings");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Mark dirty on any change
  const markDirty = () => setIsDirty(true);

  // ─── Logo Upload (client-side preview; in real app would upload to server) ─
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFeedbackMsg("Logo file must be under 5MB");
      setFeedbackType("error");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLogoPreview(dataUrl);
      setLogoUrl(dataUrl);
      markDirty();
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    markDirty();
  };

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoicePrefix.trim()) {
      setFeedbackMsg("Invoice Prefix cannot be empty.");
      setFeedbackType("error");
      return;
    }
    setSaving(true);
    try {
      await updateInvoiceSettingsApi({
        invoicePrefix: invoicePrefix.trim(),
        invoiceDueDays,
        roundOff,
        roundOffType,
        showCompanyDetails,
        headerTerms,
        footerTerms,
        logoUrl: logoUrl ?? undefined,
      });
      setIsDirty(false);
      setFeedbackMsg("Invoice settings have been saved successfully.");
      setFeedbackType("success");
      await fetchData();
    } catch (e: any) {
      setFeedbackMsg(e.message || "Failed to save invoice settings");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (settings) {
      setInvoicePrefix(settings.invoicePrefix);
      setInvoiceDueDays(settings.invoiceDueDays);
      setRoundOff(settings.roundOff);
      setRoundOffType(settings.roundOffType);
      setShowCompanyDetails(settings.showCompanyDetails);
      setHeaderTerms(settings.headerTerms);
      setFooterTerms(settings.footerTerms);
      setLogoUrl(settings.logoUrl ?? null);
      setLogoPreview(settings.logoUrl ?? null);
      setIsDirty(false);
    }
  };

  // ─── Toggle Helper ─────────────────────────────────────────────────────────
  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <label className="relative inline-flex items-center cursor-pointer" onClick={onChange}>
      <input type="checkbox" checked={checked} onChange={() => {}} className="sr-only peer" readOnly />
      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
    </label>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your settings on portal</p>
          </div>
          <button
            onClick={fetchData}
            title="Refresh"
            className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer self-end sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <SettingsSidebar />

          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            {/* Form Header */}
            <div className="p-5 border-b border-[#F1F3F5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Invoice Settings</h2>
                {isDirty && <p className="text-[10px] text-amber-600 mt-0.5">● Unsaved changes</p>}
              </div>
              {loading && <span className="text-xs text-[#94A3B8]">Loading...</span>}
            </div>

            <div className="p-6 space-y-6">
              {/* 1. Invoice Logo */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#F1F3F5]">
                <div>
                  <h4 className="text-xs font-semibold text-[#1E293B]">Invoice Logo</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Upload your company logo to display on invoices</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="space-y-1.5 text-right sm:text-left">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                    <p className="text-[10px] text-[#64748B]">Recommended: 450×450px. Max 5MB.</p>
                  </div>

                  {/* Logo Preview */}
                  <div className="relative w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                    {logoPreview ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center cursor-pointer hover:bg-rose-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <ImageIcon className="w-6 h-6 text-[#94A3B8]" />
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Invoice Prefix */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-[#1E293B]">Invoice Prefix</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Add prefix to your invoice number</p>
                </div>
                <div className="min-w-[200px]">
                  <input
                    type="text"
                    value={invoicePrefix}
                    onChange={(e) => { setInvoicePrefix(e.target.value); markDirty(); }}
                    placeholder="e.g. INV - "
                    className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>
              </div>

              {/* 3. Invoice Due Days */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-[#1E293B]">Invoice Due</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Select due date to display on invoice</p>
                </div>
                <div className="flex items-center space-x-2 min-w-[200px]">
                  <div className="relative flex-1">
                    <select
                      value={invoiceDueDays}
                      onChange={(e) => { setInvoiceDueDays(Number(e.target.value)); markDirty(); }}
                      className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                    >
                      {DUE_DAY_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                  <span className="text-xs text-[#64748B] whitespace-nowrap">Days</span>
                </div>
              </div>

              {/* 4. Round Off */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h4 className="text-xs font-semibold text-[#1E293B]">Invoice Round Off</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Round off values in invoice</p>
                </div>
                <div className="flex items-center space-x-4 min-w-[200px]">
                  <Toggle checked={roundOff} onChange={() => { setRoundOff(!roundOff); markDirty(); }} />
                  <div className="relative flex-1">
                    <select
                      value={roundOffType}
                      onChange={(e) => { setRoundOffType(e.target.value); markDirty(); }}
                      disabled={!roundOff}
                      className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer disabled:opacity-50"
                    >
                      {ROUND_OFF_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 5. Show Company Details */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-semibold text-[#1E293B]">Show Company Details</h4>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Show / hide company details on invoice</p>
                </div>
                <Toggle checked={showCompanyDetails} onChange={() => { setShowCompanyDetails(!showCompanyDetails); markDirty(); }} />
              </div>

              {/* 6. Invoice Header Terms */}
              <div className="space-y-1.5">
                <div>
                  <label className="text-xs font-semibold text-[#1E293B]">Invoice Header Terms</label>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Terms shown at the top of the invoice</p>
                </div>
                <textarea
                  rows={3}
                  value={headerTerms}
                  onChange={(e) => { setHeaderTerms(e.target.value); markDirty(); }}
                  placeholder="Type your header message..."
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] resize-none"
                />
              </div>

              {/* 7. Invoice Footer Terms */}
              <div className="space-y-1.5">
                <div>
                  <label className="text-xs font-semibold text-[#1E293B]">Invoice Footer Terms</label>
                  <p className="text-[11px] text-[#64748B] mt-0.5">Terms shown at the bottom of the invoice</p>
                </div>
                <textarea
                  rows={3}
                  value={footerTerms}
                  onChange={(e) => { setFooterTerms(e.target.value); markDirty(); }}
                  placeholder="e.g. Thank you for your business!"
                  className="w-full bg-white border border-[#E2E8F0] rounded-lg p-3 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 p-5 bg-white border-t border-[#F1F3F5]">
              <button
                type="button"
                onClick={handleCancel}
                disabled={!isDirty || saving}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── Success Modal ────────────────────────────────────────────────────── */}
      {feedbackType === "success" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Invoice Settings Updated!</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackMsg}</p>
            </div>
            <button
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ─── Error Modal ──────────────────────────────────────────────────────── */}
      {feedbackType === "error" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Operation Failed</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackMsg}</p>
            </div>
            <button
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
