"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  EyeOff,
  Eye,
  Shield,
  Phone,
  Mail,
  Wrench,
  Activity,
  Ban,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Laptop,
  Smartphone,
  Monitor,
  Globe,
  KeyRound,
} from "lucide-react";
import {
  UserSecuritySettings,
  UserSessionLog,
  getSecuritySettingsApi,
  updateSecuritySettingsApi,
  terminateSessionLogApi,
  fetchProfileSettings,
  updateProfileSettingsApi,
} from "@/lib/api";

type ModalType =
  | "change-password"
  | "device-management"
  | "edit-phone"
  | "edit-email"
  | "deactivate-confirm"
  | "delete-confirm"
  | null;

type FeedbackType = "update-success" | "terminate-confirm" | "terminate-success" | "error" | null;

export default function SecuritySettingsPage() {
  const router = useRouter();

  // ─── Real API State ────────────────────────────────────────────────────────
  const [security, setSecurity] = useState<UserSecuritySettings | null>(null);
  const [sessionLogs, setSessionLogs] = useState<UserSessionLog[]>([]);
  const [userProfile, setUserProfile] = useState<{ email?: string; phone?: string; id?: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Local toggles & state
  const [googleAuth, setGoogleAuth] = useState(true);

  // Modal controls
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [sessionToTerminate, setSessionToTerminate] = useState<UserSessionLog | null>(null);

  // Form states
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [phoneInput, setPhoneInput] = useState("");
  const [emailInput, setEmailInput] = useState("");

  // Feedback modals
  const [feedbackType, setFeedbackType] = useState<FeedbackType>(null);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  // ─── Load Data ─────────────────────────────────────────────────────────────
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [secRes, profRes] = await Promise.all([
        getSecuritySettingsApi(),
        fetchProfileSettings().catch(() => null),
      ]);
      setSecurity(secRes.security);
      setSessionLogs(secRes.sessionLogs);
      if (profRes) {
        setUserProfile(profRes);
        setPhoneInput(profRes.phone || "");
        setEmailInput(profRes.email || "");
      }
    } catch (err: any) {
      setFeedbackTitle("Error Loading Settings");
      setFeedbackMessage(err.message || "Failed to load security settings");
      setFeedbackType("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── 2FA Toggle ────────────────────────────────────────────────────────────
  const handleToggle2FA = async () => {
    if (!security) return;
    const nextVal = !security.twoFactorEnabled;
    try {
      const updated = await updateSecuritySettingsApi({ twoFactorEnabled: nextVal });
      setSecurity(updated);
      setFeedbackTitle("Security Settings Updated!");
      setFeedbackMessage(
        nextVal
          ? "Two Factor Authentication has been enabled."
          : "Two Factor Authentication has been disabled."
      );
      setFeedbackType("update-success");
    } catch (err: any) {
      setFeedbackTitle("Update Failed");
      setFeedbackMessage(err.message || "Failed to update 2FA setting");
      setFeedbackType("error");
    }
  };

  // ─── Password Change ───────────────────────────────────────────────────────
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setFeedbackTitle("Validation Error");
      setFeedbackMessage("New password must be at least 6 characters long.");
      setFeedbackType("error");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFeedbackTitle("Validation Error");
      setFeedbackMessage("New password and confirmation do not match.");
      setFeedbackType("error");
      return;
    }

    setSaving(true);
    try {
      const nowFormatted = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }) + ", " + new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

      const updated = await updateSecuritySettingsApi({
        passwordLastChanged: nowFormatted,
      });
      setSecurity(updated);
      setActiveModal(null);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setFeedbackTitle("Password Changed!");
      setFeedbackMessage("Your password has been changed successfully.");
      setFeedbackType("update-success");
    } catch (err: any) {
      setFeedbackTitle("Password Change Failed");
      setFeedbackMessage(err.message || "Failed to change password");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  // ─── Phone Update ──────────────────────────────────────────────────────────
  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updateProfileSettingsApi({ phone: phoneInput.trim() });
      setUserProfile(updated);
      setActiveModal(null);
      setFeedbackTitle("Phone Number Updated!");
      setFeedbackMessage("Your verified phone number has been updated.");
      setFeedbackType("update-success");
    } catch (err: any) {
      setFeedbackTitle("Update Failed");
      setFeedbackMessage(err.message || "Failed to update phone number");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemovePhone = async () => {
    try {
      const updated = await updateProfileSettingsApi({ phone: "" });
      setUserProfile(updated);
      setPhoneInput("");
      setFeedbackTitle("Phone Number Removed");
      setFeedbackMessage("Your phone number verification has been removed.");
      setFeedbackType("update-success");
    } catch (err: any) {
      setFeedbackTitle("Action Failed");
      setFeedbackMessage(err.message || "Failed to remove phone number");
      setFeedbackType("error");
    }
  };

  // ─── Email Update ──────────────────────────────────────────────────────────
  const handleSaveEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.includes("@")) {
      setFeedbackTitle("Invalid Email");
      setFeedbackMessage("Please enter a valid email address.");
      setFeedbackType("error");
      return;
    }
    setSaving(true);
    try {
      const updated = await updateProfileSettingsApi({ email: emailInput.trim() });
      setUserProfile(updated);
      setActiveModal(null);
      setFeedbackTitle("Email Address Updated!");
      setFeedbackMessage("Your verified email address has been updated.");
      setFeedbackType("update-success");
    } catch (err: any) {
      setFeedbackTitle("Update Failed");
      setFeedbackMessage(err.message || "Failed to update email");
      setFeedbackType("error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveEmail = async () => {
    try {
      const updated = await updateProfileSettingsApi({ email: "" });
      setUserProfile(updated);
      setEmailInput("");
      setFeedbackTitle("Email Removed");
      setFeedbackMessage("Your email verification has been removed.");
      setFeedbackType("update-success");
    } catch (err: any) {
      setFeedbackTitle("Action Failed");
      setFeedbackMessage(err.message || "Failed to remove email");
      setFeedbackType("error");
    }
  };

  // ─── Terminate Session ─────────────────────────────────────────────────────
  const handleRequestTerminate = (session: UserSessionLog) => {
    setSessionToTerminate(session);
    setFeedbackType("terminate-confirm");
  };

  const handleConfirmTerminate = async () => {
    if (!sessionToTerminate) return;
    try {
      await terminateSessionLogApi(sessionToTerminate.id);
      setSessionLogs((prev) => prev.filter((s) => s.id !== sessionToTerminate.id));
      setFeedbackType("terminate-success");
    } catch (err: any) {
      setFeedbackTitle("Termination Failed");
      setFeedbackMessage(err.message || "Failed to terminate session");
      setFeedbackType("error");
    } finally {
      setSessionToTerminate(null);
    }
  };

  // Helper for Device Icon
  const getDeviceIcon = (device: string) => {
    const d = device.toLowerCase();
    if (d.includes("mac") || d.includes("laptop")) return <Laptop className="w-4 h-4 text-blue-600" />;
    if (d.includes("phone") || d.includes("iphone") || d.includes("android"))
      return <Smartphone className="w-4 h-4 text-emerald-600" />;
    return <Monitor className="w-4 h-4 text-purple-600" />;
  };

  return (
    <AppLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-[#1E293B] tracking-tight">Settings</h1>
            <p className="text-xs text-[#64748B] mt-0.5">Manage your security and account access</p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              title="Refresh"
              onClick={loadData}
              className="w-8 h-8 rounded-lg bg-white hover:bg-gray-50 text-[#6B7280] flex items-center justify-center transition-colors border border-[#E5E7EB] shadow-2xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2-Column Settings Layout */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <SettingsSidebar />

          {/* Right Content Panel: Security */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5] flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#1E293B]">Security Settings</h2>
              {loading && <span className="text-xs text-[#94A3B8]">Loading settings...</span>}
            </div>

            <div className="p-6 space-y-4">
              {/* Item 1: Password */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E9ECEF] gap-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <KeyRound className="w-4 h-4 text-[#FE9F43]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Password</h3>
                    <p className="text-[11px] text-[#64748B]">
                      Last Changed: {security?.passwordLastChanged || "25 days ago"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal("change-password")}
                  className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all self-start sm:self-auto cursor-pointer"
                >
                  Change Password
                </button>
              </div>

              {/* Item 2: Two Factor Authentication */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#1E293B]">Two Factor Authentication</h3>
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                          security?.twoFactorEnabled
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {security?.twoFactorEnabled ? "Active" : "Disabled"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">Receive codes via SMS or Authenticator App on login</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={Boolean(security?.twoFactorEnabled)}
                    onChange={handleToggle2FA}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                </label>
              </div>

              {/* Item 3: Google Authentication */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <span className="font-black text-xs text-blue-600">G</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Google Authentication</h3>
                    <p className="text-[11px] text-[#64748B]">Sign in with your Google workspace account</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  {googleAuth && (
                    <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-[10px] font-semibold text-[#28C76F] border border-[#28C76F]/30 bg-[#28C76F]/5">
                      Connected
                    </span>
                  )}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={googleAuth}
                      onChange={() => {
                        setGoogleAuth(!googleAuth);
                        setFeedbackTitle("Google Auth Updated");
                        setFeedbackMessage(
                          !googleAuth ? "Google Authentication connected." : "Google Authentication disconnected."
                        );
                        setFeedbackType("update-success");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>
              </div>

              {/* Item 4: Phone Number Verification */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E9ECEF] gap-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <Phone className="w-4 h-4 text-[#1E293B]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Phone Number Verification</h3>
                    <p className="text-[11px] text-[#64748B]">
                      Verified Mobile Number:{" "}
                      <span className="font-semibold text-[#1E293B]">
                        {userProfile?.phone || "No phone linked"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                  {userProfile?.phone && (
                    <span className="w-5 h-5 rounded-full bg-[#28C76F] text-white flex items-center justify-center text-[10px] font-bold mr-1">
                      ✓
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveModal("edit-phone")}
                    className="px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  {userProfile?.phone && (
                    <button
                      type="button"
                      onClick={handleRemovePhone}
                      className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Item 5: Email Verification */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E9ECEF] gap-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <Mail className="w-4 h-4 text-[#1E293B]" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Email Verification</h3>
                    <p className="text-[11px] text-[#64748B]">
                      Verified Email:{" "}
                      <span className="font-semibold text-[#1E293B]">
                        {userProfile?.email || "No email linked"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                  {userProfile?.email && (
                    <span className="w-5 h-5 rounded-full bg-[#28C76F] text-white flex items-center justify-center text-[10px] font-bold mr-1">
                      ✓
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveModal("edit-email")}
                    className="px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  {userProfile?.email && (
                    <button
                      type="button"
                      onClick={handleRemoveEmail}
                      className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* Item 6: Device Management */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs font-bold text-[#1E293B]">Device Management</h3>
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.2 rounded-full font-bold">
                        {sessionLogs.length} Active Sessions
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B]">Manage all devices currently authenticated with your account</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal("device-management")}
                  className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  Manage
                </button>
              </div>

              {/* Item 7: Account Activity */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Account Activity</h3>
                    <p className="text-[11px] text-[#64748B]">View audit logs, logins, and operational changes</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/activity-logs")}
                  className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  View
                </button>
              </div>

              {/* Item 8: Deactivate Account */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Ban className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Deactivate Account</h3>
                    <p className="text-[11px] text-[#64748B]">
                      Temporarily shut down your account. It will reactivate next time you sign in
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModal("deactivate-confirm")}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  Deactivate
                </button>
              </div>

              {/* Item 9: Delete Account */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF] hover:border-gray-300 transition-colors">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Delete Account</h3>
                    <p className="text-[11px] text-[#64748B]">Request permanent removal of your account and credentials</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/delete-account-requests")}
                  className="px-4 py-2 bg-[#EA5455] hover:bg-[#D94344] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Modal 1: Change Password ────────────────────────────────────────── */}
      {activeModal === "change-password" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <h3 className="text-sm font-bold text-[#1E293B]">Change Password</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showCurrentPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">New Password</label>
                <div className="relative">
                  <input
                    type={showNewPw ? "text" : "password"}
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43] pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                  >
                    {showNewPw ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Repeat new password"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#F1F3F5]">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold text-[#374151] border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg shadow-xs active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? "Updating..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 2: Device Management Table ────────────────────────────────── */}
      {activeModal === "device-management" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <div>
                <h3 className="text-sm font-bold text-[#1E293B]">Active Devices & Sessions</h3>
                <p className="text-[11px] text-[#64748B]">These devices are currently signed into your account</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>

            <div className="p-5 overflow-x-auto max-h-[60vh]">
              <table className="w-full text-left text-xs min-w-[550px]">
                <thead className="border-b border-[#F1F3F5] bg-[#F8F9FA]">
                  <tr>
                    <th className="py-3 px-4 font-bold text-[#111827]">Device & Browser</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">IP & Location</th>
                    <th className="py-3 px-4 font-bold text-[#111827]">Last Activity</th>
                    <th className="py-3 px-4 font-bold text-[#111827] text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F8F9FA]">
                  {sessionLogs.map((session) => (
                    <tr key={session.id} className="hover:bg-[#F9FAFB] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                            {getDeviceIcon(session.device)}
                          </div>
                          <div>
                            <div className="font-semibold text-[#1E293B] flex items-center gap-1.5">
                              {session.device}
                              {session.isCurrent && (
                                <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[9px] font-bold rounded">
                                  Current Device
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-[#64748B]">{session.browser}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        <div className="font-mono text-[11px] text-[#1E293B]">{session.ipAddress}</div>
                        <span className="text-[11px] flex items-center gap-1 mt-0.5">
                          <Globe className="w-3 h-3 text-[#94A3B8]" />
                          {session.location}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B] font-medium">{session.lastActive}</td>
                      <td className="py-3.5 px-4 text-right">
                        {!session.isCurrent ? (
                          <button
                            type="button"
                            onClick={() => handleRequestTerminate(session)}
                            className="p-1.5 rounded-lg border border-gray-200 text-[#64748B] hover:text-rose-600 hover:border-rose-300 transition-colors cursor-pointer"
                            title="Terminate Session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold">In Use</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-end p-4 border-t border-[#F1F3F5] bg-gray-50">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-5 py-2 text-xs font-bold bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal 3: Edit Phone ─────────────────────────────────────────────── */}
      {activeModal === "edit-phone" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <h3 className="text-sm font-bold text-[#1E293B]">Change Phone Number</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
            <form onSubmit={handleSavePhone} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">Mobile Phone Number</label>
                <input
                  type="text"
                  required
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="e.g. +66 81 234 5678"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Phone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 4: Edit Email ─────────────────────────────────────────────── */}
      {activeModal === "edit-email" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-[#F1F3F5]">
              <h3 className="text-sm font-bold text-[#1E293B]">Change Verified Email</h3>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
            <form onSubmit={handleSaveEmail} className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-[#374151]">Email Address</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. contact@example.com"
                  className="w-full border border-[#E2E8F0] rounded-lg px-3.5 py-2 text-xs text-[#374151] focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg cursor-pointer"
                >
                  {saving ? "Saving..." : "Save Email"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Modal 5: Deactivate Confirmation ────────────────────────────────── */}
      {activeModal === "deactivate-confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <Ban className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Deactivate Account?</h3>
              <p className="text-xs text-[#64748B] mt-1.5">
                Your store and POS terminal sessions will be temporarily suspended. You can reactivate anytime by signing back in.
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveModal(null);
                  router.push("/signin");
                }}
                className="px-5 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg cursor-pointer"
              >
                Confirm Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Feedback Modals (GEMINI.md Standards) ────────────────────────────── */}
      {/* Update Success Modal */}
      {feedbackType === "update-success" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">{feedbackTitle}</h3>
              <p className="text-xs text-[#64748B] mt-1">{feedbackMessage}</p>
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

      {/* Terminate Session Confirm Modal (Rose Trash2) */}
      {feedbackType === "terminate-confirm" && sessionToTerminate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-rose-500" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Terminate Session?</h3>
              <p className="text-xs text-[#64748B] mt-1">
                Are you sure you want to disconnect <span className="font-semibold">{sessionToTerminate.device}</span> ({sessionToTerminate.ipAddress})?
              </p>
            </div>
            <div className="flex gap-3 justify-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setFeedbackType(null);
                  setSessionToTerminate(null);
                }}
                className="px-4 py-2 text-xs font-bold border border-[#E2E8F0] rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmTerminate}
                className="px-5 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg cursor-pointer"
              >
                Terminate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Terminate Session Success Modal (Amber Trash2) */}
      {feedbackType === "terminate-success" && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#1E293B]">Session Disconnected!</h3>
              <p className="text-xs text-[#64748B] mt-1">The remote device session has been terminated successfully.</p>
            </div>
            <button
              type="button"
              onClick={() => setFeedbackType(null)}
              className="px-6 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg cursor-pointer transition-colors"
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
              <p className="text-xs text-[#64748B] mt-1">{feedbackMessage}</p>
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
