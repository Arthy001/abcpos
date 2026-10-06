"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import {
  OtpSettings,
  getOtpSettingsApi,
  updateOtpSettingsApi,
} from "@/lib/api";
import {
  RotateCcw,
  ChevronUp,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Smartphone,
  Mail,
  Clock,
  RefreshCw,
  Save,
  Loader2,
} from "lucide-react";

export default function OtpSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<OtpSettings>({
    otpType: "SMS",
    otpDigits: 6,
    otpExpiryMinutes: 5,
    maxAttempts: 3,
    resendCooldownSeconds: 60,
    status: "ACTIVE",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getOtpSettingsApi();
      setFormData(data);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load OTP settings");
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
      await updateOtpSettingsApi(formData);
      setShowSuccessModal(true);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to save OTP settings");
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
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">OTP & 2-Factor Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage one-time password security parameters, expiration limits & verification channels</p>
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
                <p className="text-sm font-medium text-gray-500">Loading OTP settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
                <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#FE9F43] flex items-center justify-center border border-orange-100">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-[#1E293B]">One-Time Password Configuration</h2>
                      <p className="text-xs text-[#64748B] mt-0.5">Used for sensitive voids, employee shift handovers, and admin actions</p>
                    </div>
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
                  {/* Delivery Channel */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Verification Channel & Status</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Primary OTP Channel</label>
                        <SearchableSelect
                          options={[
                            { value: "SMS", label: "SMS Gateway (Phone Number)" },
                            { value: "Email", label: "Email SMTP (Registered Address)" },
                            { value: "Both", label: "Multi-Channel (Both SMS & Email)" },
                          ]}
                          value={formData.otpType}
                          onChange={(val) => setFormData({ ...formData, otpType: val })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">System 2FA State</label>
                        <SearchableSelect
                          options={[
                            { value: "ACTIVE", label: "Enforced & Active" },
                            { value: "INACTIVE", label: "Disabled / Optional" },
                          ]}
                          value={formData.status}
                          onChange={(val) => setFormData({ ...formData, status: val })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Code Length & Security Limits */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 pb-2 border-b border-gray-100">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <h3 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider">Security & Time Limits</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Code Length (Digits)</label>
                        <SearchableSelect
                          options={[
                            { value: "4", label: "4 Digits (e.g. 5821)" },
                            { value: "6", label: "6 Digits (Standard e.g. 849201)" },
                            { value: "8", label: "8 Digits (High Security)" },
                          ]}
                          value={String(formData.otpDigits)}
                          onChange={(val) => setFormData({ ...formData, otpDigits: Number(val) })}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expiry Time (Minutes)</label>
                        <input
                          type="number"
                          min={1}
                          max={30}
                          value={formData.otpExpiryMinutes}
                          onChange={(e) => setFormData({ ...formData, otpExpiryMinutes: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Max Failed Attempts</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={formData.maxAttempts}
                          onChange={(e) => setFormData({ ...formData, maxAttempts: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Resend Cooldown (Seconds)</label>
                        <input
                          type="number"
                          min={15}
                          max={300}
                          value={formData.resendCooldownSeconds}
                          onChange={(e) => setFormData({ ...formData, resendCooldownSeconds: Number(e.target.value) })}
                          className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 focus:outline-hidden focus:border-orange-500"
                        />
                      </div>
                    </div>

                    {/* Preview Box */}
                    <div className="p-4 bg-orange-50/50 rounded-xl border border-orange-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-orange-950">Security Summary:</span>
                        <p className="text-[11px] text-orange-700 mt-0.5">
                          Sends a {formData.otpDigits}-digit token via {formData.otpType} valid for {formData.otpExpiryMinutes} minutes. Lockout after {formData.maxAttempts} incorrect tries.
                        </p>
                      </div>
                      <div className="text-right font-mono font-bold text-orange-600 bg-white px-3 py-1.5 rounded-lg border border-orange-200 shadow-2xs">
                        {"•".repeat(formData.otpDigits)}
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
                    Reset Defaults
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center space-x-2 px-6 py-2 rounded-lg bg-[#FE9F43] hover:bg-[#e88e35] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{saving ? "Saving Changes..." : "Save OTP Settings"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Edit Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-2xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-2xl border border-gray-100 transform animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-gray-900 mb-1">OTP Settings Updated!</h3>
            <p className="text-xs text-gray-500 mb-6">One-time password and two-factor verification policies have been saved.</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
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
