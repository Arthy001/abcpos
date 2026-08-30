"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  Upload,
  X,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";

export default function CompanySettingsPage() {
  const [companyName, setCompanyName] = useState("Dreams POS Retail Co., Ltd.");
  const [email, setEmail] = useState("contact@dreamspos.com");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [fax, setFax] = useState("+1 (555) 019-2835");
  const [website, setWebsite] = useState("https://dreamspos.com");

  const [address, setAddress] = useState("8890 Technology Blvd, Suite 400");
  const [country, setCountry] = useState("United States");
  const [stateName, setStateName] = useState("California");
  const [city, setCity] = useState("Los Angeles");
  const [postalCode, setPostalCode] = useState("90001");

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showFeedback("Company Settings saved successfully!");
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
              onClick={() => showFeedback("Company settings refreshed")}
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

          {/* Right Content Panel: Company Settings */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Company Settings</h2>
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
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Company Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Company Email Address */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Company Email Address <span className="text-rose-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Phone Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Fax */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Fax <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={fax}
                      onChange={(e) => setFax(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Website */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-[#1E293B]">Website <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Company Images */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>
                  <span>Company Images</span>
                </div>

                <div className="space-y-5">
                  {/* Row 1: Company Icon */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E9ECEF] bg-[#FDFDFE]">
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Company Icon</h4>
                      <p className="text-[11px] text-[#64748B]">Upload Icon of your Company</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="space-y-1 text-right sm:text-left">
                        <button
                          type="button"
                          className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                        </button>
                        <p className="text-[10px] text-[#64748B]">Recommended size is 450px x 450px. Max size 5mb.</p>
                      </div>

                      <div className="relative w-12 h-12 rounded-xl border border-gray-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-2xs">
                        <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-black text-xs">
                          D
                        </div>
                        <button type="button" className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Favicon */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E9ECEF] bg-[#FDFDFE]">
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Favicon</h4>
                      <p className="text-[11px] text-[#64748B]">Upload Favicon of your Company</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="space-y-1 text-right sm:text-left">
                        <button
                          type="button"
                          className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                        </button>
                        <p className="text-[10px] text-[#64748B]">Recommended size is 450px x 450px. Max size 5mb.</p>
                      </div>

                      <div className="relative w-12 h-12 rounded-xl border border-gray-200 bg-white p-2 flex items-center justify-center shrink-0 shadow-2xs">
                        <div className="w-7 h-7 rounded-lg bg-[#0F172A] text-white flex items-center justify-center font-black text-xs">
                          D
                        </div>
                        <button type="button" className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Company Logo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E9ECEF] bg-[#FDFDFE]">
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Company Logo</h4>
                      <p className="text-[11px] text-[#64748B]">Upload Logo of your Company</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="space-y-1 text-right sm:text-left">
                        <button
                          type="button"
                          className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                        </button>
                        <p className="text-[10px] text-[#64748B]">Recommended size is 450px x 450px. Max size 5mb.</p>
                      </div>

                      <div className="relative h-12 px-3 rounded-xl border border-gray-200 bg-white flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="font-extrabold text-sm text-[#0F172A] tracking-tight">
                          <span className="text-[#FE9F43]">D</span>reams<span className="text-[9px] bg-rose-500 text-white px-1 ml-0.5 rounded-xs font-bold">POS</span>
                        </span>
                        <button type="button" className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Row 4: Company Dark Logo */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-[#E9ECEF] bg-[#FDFDFE]">
                    <div>
                      <h4 className="text-xs font-bold text-[#1E293B]">Company Dark Logo</h4>
                      <p className="text-[11px] text-[#64748B]">Upload Logo of your Company</p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="space-y-1 text-right sm:text-left">
                        <button
                          type="button"
                          className="flex items-center space-x-1.5 px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Upload Image</span>
                        </button>
                        <p className="text-[10px] text-[#64748B]">Recommended size is 450px x 450px. Max size 5mb.</p>
                      </div>

                      <div className="relative h-12 px-3 rounded-xl border border-gray-800 bg-[#0F172A] flex items-center justify-center shrink-0 shadow-2xs">
                        <span className="font-extrabold text-sm text-white tracking-tight">
                          <span className="text-[#FE9F43]">D</span>reams<span className="text-[9px] bg-rose-500 text-white px-1 ml-0.5 rounded-xs font-bold">POS</span>
                        </span>
                        <button type="button" className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold">
                          <X className="w-2.5 h-2.5" />
                        </button>
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
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Country, State, City, Postal Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Country */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#1E293B]">Country <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <select
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                        >
                          <option value="United States">United States</option>
                          <option value="Thailand">Thailand</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Singapore">Singapore</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* State */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#1E293B]">State <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <select
                          value={stateName}
                          onChange={(e) => setStateName(e.target.value)}
                          className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                        >
                          <option value="California">California</option>
                          <option value="New York">New York</option>
                          <option value="Bangkok">Bangkok</option>
                          <option value="Texas">Texas</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* City */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#1E293B]">City <span className="text-rose-500">*</span></label>
                      <div className="relative">
                        <select
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                        >
                          <option value="Los Angeles">Los Angeles</option>
                          <option value="San Francisco">San Francisco</option>
                          <option value="New York City">New York City</option>
                          <option value="Bangkok">Bangkok</option>
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 top-3 pointer-events-none" />
                      </div>
                    </div>

                    {/* Postal Code */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#1E293B]">Postal Code <span className="text-rose-500">*</span></label>
                      <input
                        type="text"
                        required
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
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
