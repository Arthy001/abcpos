"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  LocalizationSettings,
  getLocalizationSettingsApi,
  updateLocalizationSettingsApi,
} from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Globe,
  DollarSign,
  MapPin,
  Calendar,
  Save,
  Loader2,
} from "lucide-react";

export default function LocalizationSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [formData, setFormData] = useState<LocalizationSettings>({
    language: "English",
    langSwitcher: true,
    timezone: "UTC +07:00 (Bangkok)",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24 Hours",
    financialYear: "January - December",
    startingMonth: "January",
    currencySymbol: "฿",
    currencyPosition: "Before Amount",
    decimalSeparator: ".",
    thousandSeparator: ",",
    decimals: 2,
    country: "Thailand",
    state: "Bangkok",
    city: "Bangkok",
    address: "88/1 Sukhumvit Rd, Khlong Toei",
    zipCode: "10110",
  });

  // Feedback Modals
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getLocalizationSettingsApi();
      setFormData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load localization settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      await updateLocalizationSettingsApi(formData);
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save localization settings");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Localization Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Configure regional language, timezones, currency display & formats</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadData}
              disabled={loading}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs disabled:opacity-50"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-orange-500" : ""}`} />
            </button>
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <SettingsSidebar />

          <div className="flex-1 w-full">
            {loading ? (
              <div className="bg-white rounded-xl border border-[#E9ECEF] p-12 flex flex-col items-center justify-center shadow-xs">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mb-3" />
                <p className="text-sm font-medium text-gray-500">Loading localization settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
                  <div>
                    <h2 className="text-sm font-bold text-[#1E293B]">Localization & Currency Configuration</h2>
                    <p className="text-xs text-[#64748B] mt-0.5">Applied across reports, POS terminals, invoices and receipts</p>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-[#FE9F43] hover:bg-[#e88e35] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
                  </button>
                </div>

                <div className="p-6 space-y-8">
                  {/* Regional & Language */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Globe className="w-4 h-4 text-orange-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Regional & Language</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Default Language</label>
                        <SearchableSelect
                          options={[
                            { value: "English", label: "English (US)" },
                            { value: "Thai", label: "ภาษาไทย (Thai)" },
                            { value: "Chinese", label: "中文 (Chinese)" },
                            { value: "Japanese", label: "日本語 (Japanese)" },
                          ]}
                          value={formData.language}
                          onChange={(val) => setFormData({ ...formData, language: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Timezone</label>
                        <SearchableSelect
                          options={[
                            { value: "UTC +07:00 (Bangkok)", label: "UTC +07:00 (Bangkok, Hanoi, Jakarta)" },
                            { value: "UTC +08:00 (Singapore)", label: "UTC +08:00 (Singapore, Hong Kong)" },
                            { value: "UTC +09:00 (Tokyo)", label: "UTC +09:00 (Tokyo, Seoul)" },
                            { value: "UTC +00:00 (London)", label: "UTC +00:00 (London, GMT)" },
                            { value: "UTC -05:00 (New York)", label: "UTC -05:00 (New York, EST)" },
                          ]}
                          value={formData.timezone}
                          onChange={(val) => setFormData({ ...formData, timezone: val })}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-gray-50/80 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-xs font-semibold text-gray-800">Language Switcher</span>
                        <p className="text-[11px] text-gray-500">Allow employees & cashier staff to switch UI language on top navigation</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.langSwitcher}
                          onChange={(e) => setFormData({ ...formData, langSwitcher: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-10 h-5 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FE9F43]"></div>
                      </label>
                    </div>
                  </div>

                  {/* Date & Time Formats */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Date & Time Formats</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date Format</label>
                        <SearchableSelect
                          options={[
                            { value: "DD/MM/YYYY", label: "DD/MM/YYYY (31/12/2026)" },
                            { value: "YYYY-MM-DD", label: "YYYY-MM-DD (2026-12-31)" },
                            { value: "MM/DD/YYYY", label: "MM/DD/YYYY (12/31/2026)" },
                            { value: "DD MMM YYYY", label: "DD MMM YYYY (31 Dec 2026)" },
                          ]}
                          value={formData.dateFormat}
                          onChange={(val) => setFormData({ ...formData, dateFormat: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Time Format</label>
                        <SearchableSelect
                          options={[
                            { value: "24 Hours", label: "24 Hours (14:30)" },
                            { value: "12 Hours", label: "12 Hours (02:30 PM)" },
                          ]}
                          value={formData.timeFormat}
                          onChange={(val) => setFormData({ ...formData, timeFormat: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Financial Year</label>
                        <SearchableSelect
                          options={[
                            { value: "January - December", label: "January - December" },
                            { value: "April - March", label: "April - March" },
                            { value: "October - September", label: "October - September" },
                          ]}
                          value={formData.financialYear}
                          onChange={(val) => setFormData({ ...formData, financialYear: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Starting Month</label>
                        <SearchableSelect
                          options={[
                            { value: "January", label: "January" },
                            { value: "April", label: "April" },
                            { value: "July", label: "July" },
                            { value: "October", label: "October" },
                          ]}
                          value={formData.startingMonth}
                          onChange={(val) => setFormData({ ...formData, startingMonth: val })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Currency & Separator Formats */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Currency & Number Formats</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Currency Symbol</label>
                        <SearchableSelect
                          options={[
                            { value: "฿", label: "฿ (Thai Baht)" },
                            { value: "$", label: "$ (US Dollar)" },
                            { value: "€", label: "€ (Euro)" },
                            { value: "¥", label: "¥ (Yen / Yuan)" },
                            { value: "£", label: "£ (British Pound)" },
                          ]}
                          value={formData.currencySymbol}
                          onChange={(val) => setFormData({ ...formData, currencySymbol: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Symbol Position</label>
                        <SearchableSelect
                          options={[
                            { value: "Before Amount", label: "Before Amount (฿100)" },
                            { value: "After Amount", label: "After Amount (100 ฿)" },
                          ]}
                          value={formData.currencyPosition}
                          onChange={(val) => setFormData({ ...formData, currencyPosition: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Decimal Precision</label>
                        <SearchableSelect
                          options={[
                            { value: "0", label: "0 (1,000)" },
                            { value: "2", label: "2 (1,000.00)" },
                            { value: "3", label: "3 (1,000.000)" },
                            { value: "4", label: "4 (1,000.0000)" },
                          ]}
                          value={String(formData.decimals)}
                          onChange={(val) => setFormData({ ...formData, decimals: Number(val) })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Decimal Separator</label>
                        <SearchableSelect
                          options={[
                            { value: ".", label: "Dot (.)" },
                            { value: ",", label: "Comma (,)" },
                          ]}
                          value={formData.decimalSeparator}
                          onChange={(val) => setFormData({ ...formData, decimalSeparator: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Thousand Separator</label>
                        <SearchableSelect
                          options={[
                            { value: ",", label: "Comma (,)" },
                            { value: ".", label: "Dot (.)" },
                            { value: " ", label: "Space ( )" },
                          ]}
                          value={formData.thousandSeparator}
                          onChange={(val) => setFormData({ ...formData, thousandSeparator: val })}
                        />
                      </div>
                    </div>

                    {/* Preview Box */}
                    <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-orange-950">Number & Currency Live Preview:</span>
                        <p className="text-[11px] text-orange-700 mt-0.5">Sample calculation formatted based on your choices above</p>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-extrabold text-orange-600 bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-2xs">
                          {formData.currencyPosition === "Before Amount"
                            ? `${formData.currencySymbol} 125${formData.thousandSeparator}450${formData.decimals > 0 ? formData.decimalSeparator + "50".padEnd(formData.decimals, "0").slice(0, formData.decimals) : ""}`
                            : `125${formData.thousandSeparator}450${formData.decimals > 0 ? formData.decimalSeparator + "50".padEnd(formData.decimals, "0").slice(0, formData.decimals) : ""} ${formData.currencySymbol}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Country & Store Location Defaults */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <MapPin className="w-4 h-4 text-purple-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Default Location & Address</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Country</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">State / Province</label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">City</label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Address</label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Postal / Zip Code</label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    onClick={loadData}
                    className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reset Changes
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-[#FE9F43] hover:bg-[#e88e35] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving Changes..." : "Save Localization"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Edit/Update Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Localization Updated!</h3>
            <p className="text-xs text-gray-500 mb-6">Regional formats and currency settings have been saved successfully.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error / Validation Modal */}
      {errorMessage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">Operation Failed</h3>
            <p className="text-xs text-gray-500 mb-6">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="w-full py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
