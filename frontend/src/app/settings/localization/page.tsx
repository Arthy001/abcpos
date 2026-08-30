"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle2,
} from "lucide-react";

export default function LocalizationSettingsPage() {
  // Basic Info
  const [language, setLanguage] = useState("English");
  const [langSwitcher, setLangSwitcher] = useState(true);
  const [timezone, setTimezone] = useState("UTC +07:00 (Bangkok)");
  const [dateFormat, setDateFormat] = useState("01 Jan 2026");
  const [timeFormat, setTimeFormat] = useState("12 Hours");
  const [financialYear, setFinancialYear] = useState("2026");
  const [startingMonth, setStartingMonth] = useState("January");

  // Currency Settings
  const [currency, setCurrency] = useState("USA");
  const [currencySymbol, setCurrencySymbol] = useState("$");
  const [currencyPosition, setCurrencyPosition] = useState("$100");
  const [decimalSeparator, setDecimalSeparator] = useState(".");
  const [thousandSeparator, setThousandSeparator] = useState(",");

  // Country Settings
  const [countryRestriction, setCountryRestriction] = useState("Allow All Countries");

  // File Settings
  const [allowedFiles, setAllowedFiles] = useState(["JPG", "GIF", "PNG"]);
  const [maxFileSize, setMaxFileSize] = useState(5000);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const removeFileType = (type: string) => {
    setAllowedFiles((prev) => prev.filter((t) => t !== type));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showFeedback("Localization settings saved successfully!");
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
              onClick={() => showFeedback("Localization settings refreshed")}
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

          {/* Right Content Panel: Localization */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Localization</h2>
            </div>

            <div className="p-6 space-y-8">
              {/* 1. Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>
                  <span>Basic Information</span>
                </div>

                <div className="space-y-4">
                  {/* Language */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Language</h4>
                      <p className="text-[11px] text-[#64748B]">Select Language of the Website</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="English">English</option>
                        <option value="ไทย (Thai)">ไทย (Thai)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Language Switcher */}
                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Language Switcher</h4>
                      <p className="text-[11px] text-[#64748B]">To display in all the pages</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={langSwitcher}
                        onChange={() => setLangSwitcher(!langSwitcher)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                    </label>
                  </div>

                  {/* Timezone */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Timezone</h4>
                      <p className="text-[11px] text-[#64748B]">Select Time zone in website</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="UTC +07:00 (Bangkok)">UTC +07:00 (Bangkok)</option>
                        <option value="UTC 5:30">UTC 5:30</option>
                        <option value="UTC +00:00 (GMT)">UTC +00:00 (GMT)</option>
                        <option value="UTC -05:00 (EST)">UTC -05:00 (EST)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Date format */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Date format</h4>
                      <p className="text-[11px] text-[#64748B]">Select date format to display in website</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="01 Jan 2026">01 Jan 2026</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Time Format */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Time Format</h4>
                      <p className="text-[11px] text-[#64748B]">Select time format to display in website</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={timeFormat}
                        onChange={(e) => setTimeFormat(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="12 Hours">12 Hours</option>
                        <option value="24 Hours">24 Hours</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Financial Year */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Financial Year</h4>
                      <p className="text-[11px] text-[#64748B]">Select year for finance</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={financialYear}
                        onChange={(e) => setFinancialYear(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="2026">2026</option>
                        <option value="2025">2025</option>
                        <option value="2024">2024</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Starting Month */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Starting Month</h4>
                      <p className="text-[11px] text-[#64748B]">Select starting month to display</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={startingMonth}
                        onChange={(e) => setStartingMonth(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="January">January</option>
                        <option value="April">April</option>
                        <option value="July">July</option>
                        <option value="October">October</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Currency Settings */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>
                  <span>Currency Settings</span>
                </div>

                <div className="space-y-4">
                  {/* Currency */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Currency</h4>
                      <p className="text-[11px] text-[#64748B]">Select currency in website</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="USA">USA</option>
                        <option value="THB (Thai Baht)">THB (Thai Baht)</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Currency Symbol */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Currency Symbol</h4>
                      <p className="text-[11px] text-[#64748B]">Select currency symbol to display in website</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={currencySymbol}
                        onChange={(e) => setCurrencySymbol(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="$">$</option>
                        <option value="฿">฿</option>
                        <option value="€">€</option>
                        <option value="£">£</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Currency Position */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Currency Position</h4>
                      <p className="text-[11px] text-[#64748B]">Select currency format to display in website</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={currencyPosition}
                        onChange={(e) => setCurrencyPosition(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value="$100">$100</option>
                        <option value="100$">100$</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Decimal Separator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Decimal Separator</h4>
                      <p className="text-[11px] text-[#64748B]">Select decimal separator character</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={decimalSeparator}
                        onChange={(e) => setDecimalSeparator(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value=".">. (Dot)</option>
                        <option value=",">, (Comma)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  {/* Thousand Separator */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Thousand Separator</h4>
                      <p className="text-[11px] text-[#64748B]">Select thousand separator character</p>
                    </div>
                    <div className="relative min-w-[200px]">
                      <select
                        value={thousandSeparator}
                        onChange={(e) => setThousandSeparator(e.target.value)}
                        className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                      >
                        <option value=",">, (Comma)</option>
                        <option value=".">. (Dot)</option>
                        <option value=" "> (Space)</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Country Settings */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>
                  <span>Country Settings</span>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-medium text-[#1E293B]">Countries Restriction</h4>
                    <p className="text-[11px] text-[#64748B]">Select countries restriction</p>
                  </div>
                  <div className="relative min-w-[200px]">
                    <select
                      value={countryRestriction}
                      onChange={(e) => setCountryRestriction(e.target.value)}
                      className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                    >
                      <option value="Allow All Countries">Allow All Countries</option>
                      <option value="Restrict Specific Countries">Restrict Specific Countries</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* 4. File Settings */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>
                  <span>File Settings</span>
                </div>

                <div className="space-y-4">
                  {/* Allowed Files */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Allowed Files</h4>
                      <p className="text-[11px] text-[#64748B]">Select files</p>
                    </div>
                    <div className="flex items-center space-x-2 p-1.5 border border-[#E2E8F0] rounded-lg bg-white min-w-[200px]">
                      {allowedFiles.map((type) => (
                        <span
                          key={type}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded-md bg-gray-100 text-[#374151] text-[11px] font-semibold"
                        >
                          <span>{type}</span>
                          <button
                            type="button"
                            onClick={() => removeFileType(type)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Max File Size */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2">
                    <div>
                      <h4 className="text-xs font-medium text-[#1E293B]">Max File Size</h4>
                      <p className="text-[11px] text-[#64748B]">File size</p>
                    </div>
                    <div className="flex items-center border border-[#E2E8F0] rounded-lg px-3 py-2 bg-white min-w-[200px]">
                      <input
                        type="number"
                        value={maxFileSize}
                        onChange={(e) => setMaxFileSize(Number(e.target.value))}
                        className="w-full bg-transparent text-xs text-[#374151] focus:outline-none"
                      />
                      <span className="text-xs font-semibold text-[#64748B] ml-2">MB</span>
                    </div>
                  </div>
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
