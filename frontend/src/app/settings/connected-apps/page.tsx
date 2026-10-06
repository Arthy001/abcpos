"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  HardDrive,
  Mail,
  ExternalLink,
  Settings,
  X,
  ShieldCheck,
  Globe,
} from "lucide-react";
import {
  ConnectedAppItem,
  getConnectedAppsApi,
  toggleConnectedAppApi,
} from "@/lib/api";

export default function ConnectedAppsSettingsPage() {
  const [apps, setApps] = useState<ConnectedAppItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Modal states
  const [configuringApp, setConfiguringApp] = useState<ConnectedAppItem | null>(null);
  const [accountEmailInput, setAccountEmailInput] = useState("");
  const [disconnectingApp, setDisconnectingApp] = useState<ConnectedAppItem | null>(null);

  // Feedback modals
  const [feedbackType, setFeedbackType] = useState<"success" | "error" | null>(null);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // ─── Load Apps ─────────────────────────────────────────────────────────────
  const loadApps = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getConnectedAppsApi();
      // Filter or ensure Google Calendar, Google Drive, and Gmail are displayed
      const googleOnly = data.filter((a) =>
        ["google calendar", "google drive", "gmail"].some((g) =>
          a.appName.toLowerCase().includes(g)
        )
      );
      setApps(googleOnly.length > 0 ? googleOnly : data);
    } catch (err: any) {
      setFeedbackTitle("Error Loading Apps");
      setFeedbackMsg(err.message || "Failed to load connected apps");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadApps();
  }, [loadApps]);

  // ─── Toggle Status ─────────────────────────────────────────────────────────
  const handleToggle = async (app: ConnectedAppItem) => {
    if (app.status === "CONNECTED") {
      // Prompt disconnect confirmation
      setDisconnectingApp(app);
    } else {
      // Connect directly or open configuration
      setConfiguringApp(app);
      setAccountEmailInput(app.connectedAccount || "admin@abcpos.com");
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!disconnectingApp) return;
    setSaving(true);
    try {
      const updated = await toggleConnectedAppApi(disconnectingApp.id, "DISCONNECTED");
      setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setDisconnectingApp(null);
      setFeedbackTitle("App Disconnected");
      setFeedbackMsg(`${disconnectingApp.appName} has been disconnected.`);
      setFeedbackType("success");
    } catch (err: any) {
      setFeedbackTitle("Action Failed");
      setFeedbackMsg(err.message || "Failed to disconnect app");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveConfiguration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!configuringApp) return;
    if (!accountEmailInput.includes("@")) {
      setFeedbackTitle("Validation Error");
      setFeedbackMsg("Please enter a valid Google Workspace email address.");
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    try {
      const updated = await toggleConnectedAppApi(
        configuringApp.id,
        "CONNECTED",
        accountEmailInput.trim()
      );
      setApps((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      setConfiguringApp(null);
      setFeedbackTitle("App Connected!");
      setFeedbackMsg(
        `${configuringApp.appName} is now connected with ${accountEmailInput.trim()}.`
      );
      setFeedbackType("success");
    } catch (err: any) {
      setFeedbackTitle("Connection Failed");
      setFeedbackMsg(err.message || "Failed to connect app");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Icon Helper ───────────────────────────────────────────────────────────
  const renderAppIcon = (appName: string) => {
    const name = appName.toLowerCase();
    if (name.includes("calendar")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex flex-col items-center justify-center shadow-2xs">
          <Calendar className="w-6 h-6 text-blue-600" />
        </div>
      );
    }
    if (name.includes("drive")) {
      return (
        <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-2xs">
          <HardDrive className="w-6 h-6 text-emerald-600" />
        </div>
      );
    }
    return (
      <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center shadow-2xs">
        <Mail className="w-6 h-6 text-rose-500" />
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage Google Workspace and external cloud integrations</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadApps}
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

          {/* Right Content Panel: Connected Apps */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1E293B]">Google Integrations</h2>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Connect Google Workspace apps to automate scheduling, receipts, and cloud backups
                </p>
              </div>
              {loading && <span className="text-xs text-[#94A3B8]">Loading apps...</span>}
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {apps.map((app) => {
                  const isConnected = app.status === "CONNECTED";
                  return (
                    <div
                      key={app.id}
                      className="p-5 rounded-xl border border-[#E9ECEF] hover:border-gray-300 hover:shadow-xs transition-all flex flex-col justify-between bg-white relative group"
                    >
                      {/* Top App Info */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3.5">
                          <div className="flex items-center gap-3">
                            {renderAppIcon(app.appName)}
                            <div>
                              <h3 className="text-xs font-bold text-[#1E293B]">{app.appName}</h3>
                              <span className="text-[10px] text-[#64748B] block font-medium">
                                {app.appCategory}
                              </span>
                            </div>
                          </div>

                          {/* Toggle Switch */}
                          <label className="relative inline-flex items-center cursor-pointer shrink-0">
                            <input
                              type="checkbox"
                              checked={isConnected}
                              onChange={() => handleToggle(app)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                          </label>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-[#64748B] leading-relaxed mb-4 min-h-[40px]">
                          {app.description}
                        </p>
                      </div>

                      {/* Bottom Status & Account */}
                      <div className="pt-3.5 border-t border-[#F8F9FA] flex items-center justify-between">
                        <div>
                          {isConnected ? (
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-[#28C76F] inline-block animate-pulse"></span>
                                <span className="text-[10px] font-bold text-[#28C76F]">Connected</span>
                              </div>
                              <span className="text-[10px] text-[#64748B] font-mono block truncate max-w-[150px]">
                                {app.connectedAccount || "Linked"}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-gray-300 inline-block"></span>
                              <span className="text-[10px] font-bold text-[#94A3B8]">Disconnected</span>
                            </div>
                          )}
                        </div>

                        {isConnected && (
                          <button
                            type="button"
                            onClick={() => {
                              setConfiguringApp(app);
                              setAccountEmailInput(app.connectedAccount || "");
                            }}
                            className="flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold text-[#64748B] hover:text-[#FE9F43] border border-gray-200 rounded-lg hover:border-[#FE9F43] transition-colors cursor-pointer"
                          >
                            <Settings className="w-3 h-3" />
                            <span>Settings</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modal 1: Configure / Connect Account ─────────────────────────────── */}
      {configuringApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <div className="flex items-center gap-2.5">
                {renderAppIcon(configuringApp.appName)}
                <div>
                  <h3 className="text-sm font-bold text-[#1E293B]">Connect {configuringApp.appName}</h3>
                  <p className="text-[11px] text-[#64748B]">Google Workspace Account Link</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfiguringApp(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <form onSubmit={handleSaveConfiguration} className="p-5 space-y-4">
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-900 leading-relaxed">
                  Connecting your Google Workspace account allows ABCPOS to sync business schedules, cloud backups, and dispatch customer receipts automatically.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">
                  Google Workspace / Gmail Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={accountEmailInput}
                    onChange={(e) => setAccountEmailInput(e.target.value)}
                    placeholder="e.g. operations@abcpos.com"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#F1F3F5]">
                <button
                  type="button"
                  onClick={() => setConfiguringApp(null)}
                  className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? "Connecting..." : "Connect Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Disconnect Confirmation ─────────────────────────────────── */}
      {disconnectingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7 text-rose-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Disconnect {disconnectingApp.appName}?</h3>
              <p className="text-xs text-[#64748B] mt-1.5">
                Automated syncing for {disconnectingApp.appName} ({disconnectingApp.connectedAccount}) will be paused.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setDisconnectingApp(null)}
                className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Keep Connected
              </button>
              <button
                type="button"
                onClick={handleConfirmDisconnect}
                disabled={saving}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer disabled:opacity-60"
              >
                {saving ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Feedback Modals (GEMINI.md Standards) ────────────────────────────── */}
      {/* Success Modal (Blue CheckCircle2) */}
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

      {/* Error Modal (Rose AlertTriangle) */}
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
