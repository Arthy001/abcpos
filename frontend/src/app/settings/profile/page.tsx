"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { UserProfileSettings } from "@/types";
import { fetchProfileSettings, updateProfileSettingsApi } from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  Plus,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
} from "lucide-react";

export default function ProfileSettingsPage() {
  const [profile, setProfile] = useState<UserProfileSettings>({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 234-5678",
    userName: "johndoe",
    address: "4517 Washington Ave.",
    city: "Manchester",
    country: "United States",
    postalCode: "39401",
    bio: "Senior Store Operations Manager",
    avatar: "/assets/images/customer11.jpg",
  });
  const [stateName, setStateName] = useState<string>("New York");
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await fetchProfileSettings();
      if (data) setProfile(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      setErrorMsg(null);
      const updated = await updateProfileSettingsApi(profile);
      setProfile(updated);
      setSuccessMsg("Profile information saved successfully!");
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile");
      setTimeout(() => setErrorMsg(null), 4000);
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
            <p className="text-xs text-[#64748B] mt-0.5">Manage your settings on portal</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadProfile}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#FE9F43]" : ""}`} />
            </button>
            <button
              title="Collapse"
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Alerts */}
        {successMsg && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center space-x-2 p-3.5 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Settings Sidebar */}
          <SettingsSidebar />

          {/* Right Content Panel: Profile */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Profile</h2>
            </div>

            <div className="p-6 space-y-8">
              {/* 1. Basic Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1E293B]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]"></span>
                  <span>Basic Information</span>
                </div>

                {/* Upload Image Section */}
                <div className="flex items-center space-x-4 pb-2">
                  <div className="w-24 h-24 rounded-lg border-2 border-dashed border-[#CBD5E1] flex flex-col items-center justify-center text-center p-2 text-[#94A3B8] hover:border-[#FE9F43] hover:text-[#FE9F43] transition-colors cursor-pointer bg-[#F8FAFC]">
                    <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center mb-1">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-medium">Add Image</span>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      type="button"
                      className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
                    >
                      Upload Image
                    </button>
                    <p className="text-[11px] text-[#64748B]">Upload an image below 2 MB, Accepted File format JPG, PNG</p>
                  </div>
                </div>

                {/* Form Fields: Row 1 & 2 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* First Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">First Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">Last Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* User Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#1E293B]">User Name <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={profile.userName}
                      onChange={(e) => setProfile({ ...profile, userName: e.target.value })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5 sm:col-span-1">
                    <label className="text-xs font-medium text-[#1E293B]">Phone Number <span className="text-rose-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-xs font-medium text-[#1E293B]">Email <span className="text-rose-500">*</span></label>
                    <input
                      type="email"
                      required
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Address Information */}
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
                      value={profile.address}
                      onChange={(e) => setProfile({ ...profile, address: e.target.value })}
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
                          value={profile.country}
                          onChange={(e) => setProfile({ ...profile, country: e.target.value })}
                          className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                        >
                          <option value="United States">United States</option>
                          <option value="Thailand">Thailand</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Canada">Canada</option>
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
                          <option value="New York">New York</option>
                          <option value="California">California</option>
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
                          value={profile.city}
                          onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                          className="w-full appearance-none bg-white border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                        >
                          <option value="Manchester">Manchester</option>
                          <option value="New York City">New York City</option>
                          <option value="Los Angeles">Los Angeles</option>
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
                        value={profile.postalCode}
                        onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
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
                onClick={loadProfile}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
