"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  MessageSquare,
  Send,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  X,
  Radio,
} from "lucide-react";
import {
  SmsSettings,
  getSmsSettingsApi,
  updateSmsSettingsApi,
  sendTestSmsApi,
} from "@/lib/api";

const PROVIDER_OPTIONS = [
  { id: "ThaiBulkSMS", name: "ThaiBulkSMS (Thailand)", desc: "Direct route to all Thai mobile networks (AIS, True, Dtac)" },
  { id: "Twilio", name: "Twilio SMS Gateway", desc: "Global SMS delivery platform with international coverage" },
  { id: "Nexmo", name: "Vonage / Nexmo", desc: "Enterprise cloud communications and OTP messaging" },
];

export default function SmsSettingsPage() {
  const [settings, setSettings] = useState<SmsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showSecret, setShowSecret] = useState(false);

  // Form fields
  const [smsProvider, setSmsProvider] = useState("ThaiBulkSMS");
  const [apiKey, setApiKey] = useState("tb_live_key_94820193");
  const [apiSecret, setApiSecret] = useState("••••••••••••");
  const [senderId, setSenderId] = useState("ABCPOS");
  const [status, setStatus] = useState("ACTIVE");

  // Test SMS Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testPhoneInput, setTestPhoneInput] = useState("");

  // Feedback Modals
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSmsSettingsApi();
      setSettings(data);
      setSmsProvider(data.smsProvider);
      setApiKey(data.apiKey);
      setApiSecret(data.apiSecret || "••••••••••••");
      setSenderId(data.senderId);
      setStatus(data.status);
      setIsDirty(false);
    } catch (err: any) {
      setFeedbackTitle("Error Loading Settings");
      setFeedbackMsg(err.message || "Failed to load SMS settings");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim() || !senderId.trim()) {
      setFeedbackTitle("Validation Error");
      setFeedbackMsg("API Key and Sender ID are required.");
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateSmsSettingsApi({
        smsProvider,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret !== "••••••••••••" ? apiSecret : undefined,
        senderId: senderId.trim(),
        status,
      });
      setSettings(updated);
      setIsDirty(false);
      setFeedbackTitle("SMS Gateway Saved!");
      setFeedbackMsg("SMS Provider configuration has been saved successfully.");
      setFeedbackType("success");
    } catch (err: any) {
      setFeedbackTitle("Save Failed");
      setFeedbackMsg(err.message || "Failed to save SMS settings");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Send Test SMS ─────────────────────────────────────────────────────────
  const handleSendTestSms = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhoneInput.trim()) {
      setFeedbackTitle("Validation Error");
      setFeedbackMsg("Please provide a valid recipient phone number.");
      setFeedbackType("error");
      return;
    }

    setTesting(true);
    try {
      const res = await sendTestSmsApi(testPhoneInput.trim());
      setShowTestModal(false);
      setFeedbackTitle("Test SMS Sent!");
      setFeedbackMsg(res.message);
      setFeedbackType("success");
    } catch (err: any) {
      setFeedbackTitle("Test Dispatch Failed");
      setFeedbackMsg(err.message || "Failed to send test SMS");
      setFeedbackType("error");
    } finally {
      setTesting(false);
    }
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage cellular SMS gateways, API credentials, and OTP delivery</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadSettings}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Left Settings Sidebar */}
          <SettingsSidebar />

          {/* Right Content Panel: SMS Settings */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4 text-[#FE9F43]" />
                  <h2 className="text-sm font-bold text-[#1E293B]">SMS Gateway Settings</h2>
                </div>
                {isDirty && <p className="text-[10px] text-amber-600 mt-0.5">● Unsaved changes</p>}
              </div>

              <button
                type="button"
                onClick={() => {
                  setTestPhoneInput("+66 81 234 5678");
                  setShowTestModal(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test SMS</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info banner */}
              <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-950 leading-relaxed">
                  <span className="font-bold block">SMS Gateway API Integration</span>
                  Deliver instant SMS notifications, customer loyalty points alerts, promotional SMS blasts, and 2-Factor OTP codes straight to Thai & international mobile handsets.
                </div>
              </div>

              {/* Provider Selection Cards */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1E293B]">Select SMS Provider</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PROVIDER_OPTIONS.map((p) => {
                    const selected = smsProvider === p.id;
                    return (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSmsProvider(p.id);
                          setIsDirty(true);
                        }}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          selected
                            ? "border-[#FE9F43] bg-amber-50/20 shadow-xs"
                            : "border-[#E9ECEF] hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-[#1E293B]">{p.name}</span>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selected
                                ? "border-[#FE9F43] bg-[#FE9F43] text-white"
                                : "border-gray-300"
                            }`}
                          >
                            {selected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                        </div>
                        <p className="text-[10px] text-[#64748B] leading-normal">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Credentials Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                {/* API Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">
                    API Key / Account SID <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. tb_live_key_94820193"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs font-mono text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* API Secret */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">API Secret / Auth Token</label>
                  <div className="relative">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={apiSecret}
                      onChange={(e) => {
                        setApiSecret(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Enter API Secret"
                      className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs font-mono text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                    >
                      {showSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Sender ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">
                    SMS Sender ID (Header) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={senderId}
                    onChange={(e) => {
                      setSenderId(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. ABCPOS (Max 11 chars)"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                  <span className="text-[10px] text-[#94A3B8] block">Alphanumeric Sender ID registered with telecom network</span>
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">Gateway Status</label>
                  <select
                    value={status}
                    onChange={(e) => {
                      setStatus(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE (Enabled)</option>
                    <option value="INACTIVE">INACTIVE (Disabled)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end space-x-3 p-5 bg-white border-t border-[#F1F3F5]">
              <button
                type="button"
                onClick={loadSettings}
                disabled={!isDirty || saving}
                className="px-5 py-2 bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={saving || loading}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : "Save Settings"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ─── Send Test SMS Modal ─────────────────────────────────────────────── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-amber-600" />
                <h3 className="text-sm font-bold text-[#1E293B]">Send Test SMS</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <form onSubmit={handleSendTestSms} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">
                  Recipient Mobile Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={testPhoneInput}
                  onChange={(e) => setTestPhoneInput(e.target.value)}
                  placeholder="e.g. +66 81 234 5678"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F1F3F5]">
                <button
                  type="button"
                  onClick={() => setShowTestModal(false)}
                  className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={testing}
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testing ? "Dispatching..." : "Send Test SMS"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Feedback Modals (GEMINI.md Standards) ────────────────────────────── */}
      {feedbackType === "success" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">{feedbackTitle}</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackMsg}</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {feedbackType === "error" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">{feedbackTitle || "Operation Failed"}</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackMsg}</p>
            </div>
            <button
              type="button"
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
