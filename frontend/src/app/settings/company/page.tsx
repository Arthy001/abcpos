"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { fetchCompanySettings, updateCompanySettingsApi } from "@/lib/api";
import { CompanySettings } from "@/types";
import {
  RotateCcw,
  ChevronUp,
  Upload,
  X,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Building2,
} from "lucide-react";

export default function CompanySettingsPage() {
  const [formData, setFormData] = useState<CompanySettings>({
    companyName: "ABC POS Retail Co., Ltd.",
    email: "contact@abcpos.com",
    phone: "+66 2 123 4567",
    fax: "+66 2 123 4568",
    website: "https://abcpos.com",
    taxId: "010556209999",
    address: "88/9 Sukhumvit Road, Khlong Toei",
    country: "Thailand",
    state: "Bangkok",
    city: "Bangkok",
    postalCode: "10110",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchCompanySettings();
      if (data) {
        setFormData({
          id: data.id,
          companyName: data.companyName || "",
          email: data.email || "",
          phone: data.phone || "",
          fax: data.fax || "",
          website: data.website || "",
          taxId: data.taxId || "",
          address: data.address || "",
          country: data.country || "Thailand",
          state: data.state || "Bangkok",
          city: data.city || "Bangkok",
          postalCode: data.postalCode || "10110",
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to load company settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (field: keyof CompanySettings, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMessage(null);
      const res = await updateCompanySettingsApi(formData);
      if (res) {
        setFormData((prev) => ({ ...prev, ...res }));
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Failed to save company settings");
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
            <p className="text-xs text-[#64748B] mt-0.5">Manage your settings and company profile on portal</p>
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

          {/* Right Content Panel: Company Settings */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#FE9F43]" />
                  Company Settings
                </h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">Real database profile for receipt headers, invoices and tax documents</p>
              </div>
              {loading && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FE9F43]" />
                  <span>Loading...</span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-8">
              {/* 1. Company Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>
                  <span>Company Information</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Company Name */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-[#1E293B]">Company Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleChange("companyName", e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Tax ID */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Tax ID (เลขประจำตัวผู้เสียภาษี) <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.taxId || ""}
                      onChange={(e) => handleChange("taxId", e.target.value)}
                      placeholder="e.g. 010556209999"
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Company Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Company Email Address <span className="text-rose-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Phone Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Fax */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Fax</label>
                    <input
                      type="text"
                      value={formData.fax || ""}
                      onChange={(e) => handleChange("fax", e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1.5 sm:col-span-3">
                    <label className="text-xs font-medium text-[#1E293B]">Website</label>
                    <input
                      type="text"
                      value={formData.website || ""}
                      onChange={(e) => handleChange("website", e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Company Images & Branding */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>
                  <span>Company Branding</span>
                </div>

                <div className="space-y-4">
                  {/* Row: Company Logo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E9ECEF] bg-[#FDFDFE]">
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Store Receipt Brand</h4>
                      <p className="text-[11px] text-[#64748B]">Displays on top of Thermal Print Slips & Invoices</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="h-10 px-4 rounded-xl border border-gray-200 bg-white flex items-center justify-center shrink-0 shadow-2xs font-extrabold text-sm text-[#0F172A]">
                        <span className="text-[#FE9F43] mr-0.5">ABC</span> POS STORE
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Address Information */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>
                  <span>Address Information</span>
                </div>

                <div className="space-y-4">
                  {/* Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Address <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Country, State, City, Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Country */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#1E293B]">Country <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <select
                          value={formData.country}
                          onChange={(e) => handleChange("country", e.target.value)}
                          className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                        >
                          <option value="Thailand">Thailand</option>
                          <option value="United States">United States</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Malaysia">Malaysia</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* State */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#1E293B]">Province / State <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                      />
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#1E293B]">City / District <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                      />
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#1E293B]">Postal Code <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={formData.postalCode}
                        onChange={(e) => handleChange("postalCode", e.target.value)}
                        className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                      />
                    </div>
                  </div>
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
              <h3 className="text-base font-bold text-gray-900">Company Settings Updated!</h3>
              <p className="text-xs text-gray-500 mt-1">
                Company profile "{formData.companyName}" has been successfully saved to database.
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
