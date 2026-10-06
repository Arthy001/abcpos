"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  Mail,
  Send,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Server,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  EmailSettings,
  getEmailSettingsApi,
  updateEmailSettingsApi,
  sendTestEmailApi,
} from "@/lib/api";

const DRIVER_OPTIONS = ["SMTP", "SendGrid", "Mailgun"];
const ENCRYPTION_OPTIONS = ["TLS", "SSL", "NONE"];

export default function EmailSettingsPage() {
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [mailDriver, setMailDriver] = useState("SMTP");
  const [mailHost, setMailHost] = useState("smtp.gmail.com");
  const [mailPort, setMailPort] = useState("587");
  const [mailUsername, setMailUsername] = useState("billing@abcpos.com");
  const [mailPassword, setMailPassword] = useState("••••••••••••");
  const [mailEncryption, setMailEncryption] = useState("TLS");
  const [fromName, setFromName] = useState("ABCPOS Retail");
  const [fromEmail, setFromEmail] = useState("billing@abcpos.com");

  // Test Email Modal
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState("");

  // Feedback Modals
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEmailSettingsApi();
      setSettings(data);
      setMailDriver(data.mailDriver);
      setMailHost(data.mailHost);
      setMailPort(data.mailPort.toString());
      setMailUsername(data.mailUsername);
      setMailPassword(data.mailPassword || "••••••••••••");
      setMailEncryption(data.mailEncryption);
      setFromName(data.fromName);
      setFromEmail(data.fromEmail);
      setIsDirty(false);
    } catch (err: any) {
      setFeedbackTitle("Error Loading Settings");
      setFeedbackMsg(err.message || "Failed to load email settings");
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
    if (!mailHost.trim() || !mailUsername.trim() || !fromEmail.trim()) {
      setFeedbackTitle("Validation Error");
      setFeedbackMsg("SMTP Host, Username, and From Email are required.");
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateEmailSettingsApi({
        mailDriver,
        mailHost: mailHost.trim(),
        mailPort: parseInt(mailPort) || 587,
        mailUsername: mailUsername.trim(),
        mailPassword: mailPassword !== "••••••••••••" ? mailPassword : undefined,
        mailEncryption,
        fromName: fromName.trim(),
        fromEmail: fromEmail.trim(),
      });
      setSettings(updated);
      setIsDirty(false);
      setFeedbackTitle("Email Settings Saved!");
      setFeedbackMsg("SMTP configuration has been saved successfully.");
      setFeedbackType("success");
    } catch (err: any) {
      setFeedbackTitle("Save Failed");
      setFeedbackMsg(err.message || "Failed to save email settings");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Send Test Email ───────────────────────────────────────────────────────
  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput.includes("@")) {
      setFeedbackTitle("Validation Error");
      setFeedbackMsg("Please provide a valid recipient email address.");
      setFeedbackType("error");
      return;
    }

    setTesting(true);
    try {
      const res = await sendTestEmailApi(testEmailInput.trim());
      setShowTestModal(false);
      setFeedbackTitle("Test Email Sent!");
      setFeedbackMsg(res.message);
      setFeedbackType("success");
    } catch (err: any) {
      setFeedbackTitle("Test Dispatch Failed");
      setFeedbackMsg(err.message || "Failed to send test email");
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
            <p className="text-xs text-[#64748B] mt-0.5">Manage SMTP server, mail gateways, and receipt email dispatch</p>
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

          {/* Right Content Panel: Email Settings */}
          <form onSubmit={handleSave} className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-[#FE9F43]" />
                  <h2 className="text-sm font-bold text-[#1E293B]">Email Server & SMTP Settings</h2>
                </div>
                {isDirty && <p className="text-[10px] text-amber-600 mt-0.5">● Unsaved changes</p>}
              </div>

              <button
                type="button"
                onClick={() => {
                  setTestEmailInput(fromEmail);
                  setShowTestModal(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Test Email</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Info banner */}
              <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl flex items-start gap-3">
                <Server className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <span className="font-bold block">SMTP Mail Gateway Configuration</span>
                  Configure your business SMTP mailer to dispatch automatic e-invoices, customer receipt slips, password resets, and shift closing reports directly from your domain.
                </div>
              </div>

              {/* Grid Form */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Mail Driver */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">Mail Driver / Service</label>
                  <select
                    value={mailDriver}
                    onChange={(e) => {
                      setMailDriver(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                  >
                    {DRIVER_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mail Host */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">
                    SMTP Host <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={mailHost}
                    onChange={(e) => {
                      setMailHost(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. smtp.gmail.com"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs font-mono text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Mail Port */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">SMTP Port</label>
                  <input
                    type="number"
                    required
                    value={mailPort}
                    onChange={(e) => {
                      setMailPort(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="587 or 465"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs font-mono text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Mail Encryption */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">Encryption Protocol</label>
                  <select
                    value={mailEncryption}
                    onChange={(e) => {
                      setMailEncryption(e.target.value);
                      setIsDirty(true);
                    }}
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                  >
                    {ENCRYPTION_OPTIONS.map((enc) => (
                      <option key={enc} value={enc}>
                        {enc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mail Username */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">
                    SMTP Username / Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={mailUsername}
                    onChange={(e) => {
                      setMailUsername(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. billing@yourdomain.com"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* Mail Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">SMTP Password / App Secret</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={mailPassword}
                      onChange={(e) => {
                        setMailPassword(e.target.value);
                        setIsDirty(true);
                      }}
                      placeholder="Enter SMTP password"
                      className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs font-mono text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* From Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">Sender Name (From Name)</label>
                  <input
                    type="text"
                    value={fromName}
                    onChange={(e) => {
                      setFromName(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. ABC POS Retail Store"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>

                {/* From Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#374151]">
                    Sender Email Address (From Email) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={fromEmail}
                    onChange={(e) => {
                      setFromEmail(e.target.value);
                      setIsDirty(true);
                    }}
                    placeholder="e.g. no-reply@abcpos.com"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
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

      {/* ─── Send Test Email Modal ───────────────────────────────────────────── */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-[#1E293B]">Send Test Email</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTestModal(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <form onSubmit={handleSendTestEmail} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">
                  Recipient Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={testEmailInput}
                  onChange={(e) => setTestEmailInput(e.target.value)}
                  placeholder="e.g. admin@example.com"
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
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{testing ? "Dispatching..." : "Send Test"}</span>
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
