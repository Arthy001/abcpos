"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  EyeOff,
  Shield,
  Smartphone,
  Phone,
  Mail,
  Wrench,
  Activity,
  Ban,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function SecuritySettingsPage() {
  const [twoFactor, setTwoFactor] = useState(true);
  const [googleAuth, setGoogleAuth] = useState(true);
  const [phoneVerified, setPhoneVerified] = useState(true);
  const [emailVerified, setEmailVerified] = useState(true);

  // Modal / Feedback state
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
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
              onClick={() => showFeedback("Security settings refreshed")}
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

          {/* Right Content Panel: Security */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Security</h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Item 1: Password */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E9ECEF] gap-4">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <EyeOff className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Password</h3>
                    <p className="text-[11px] text-[#64748B]">Last Changed 22 Dec 2024, 10:30 AM</p>
                  </div>
                </div>

                <button
                  onClick={() => showFeedback("Change password modal requested")}
                  className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all self-start sm:self-auto cursor-pointer"
                >
                  Change Password
                </button>
              </div>

              {/* Item 2: Two Factor Authentication */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Two Factor Authentication</h3>
                    <p className="text-[11px] text-[#64748B]">Receive codes via SMS or email every time you login</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={twoFactor}
                    onChange={() => {
                      setTwoFactor(!twoFactor);
                      showFeedback(!twoFactor ? "Two Factor Authentication enabled" : "Two Factor Authentication disabled");
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                </label>
              </div>

              {/* Item 3: Google Authentication */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <span className="font-bold text-xs">G</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Google Authentication</h3>
                    <p className="text-[11px] text-[#64748B]">Connect to Google</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 shrink-0">
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-md text-[10px] font-semibold text-[#28C76F] border border-[#28C76F]/30 bg-[#28C76F]/5">
                    Connected
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={googleAuth}
                      onChange={() => {
                        setGoogleAuth(!googleAuth);
                        showFeedback(!googleAuth ? "Google Authentication connected" : "Google Authentication disconnected");
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                  </label>
                </div>
              </div>

              {/* Item 4: Phone Number Verification */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E9ECEF] gap-4">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Phone Number Verification</h3>
                    <p className="text-[11px] text-[#64748B]">Verified Mobile Number : +81699799974</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                  <span className="w-5 h-5 rounded-full bg-[#28C76F] text-white flex items-center justify-center text-[10px] font-bold mr-1">
                    ✓
                  </span>
                  <button
                    onClick={() => showFeedback("Change phone verification number")}
                    className="px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => showFeedback("Phone number removed")}
                    className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Item 5: Email Verification */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-[#E9ECEF] gap-4">
                <div className="flex items-start sm:items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Email Verification</h3>
                    <p className="text-[11px] text-[#64748B]">Verified Email : info@example.com</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-auto shrink-0">
                  <span className="w-5 h-5 rounded-full bg-[#28C76F] text-white flex items-center justify-center text-[10px] font-bold mr-1">
                    ✓
                  </span>
                  <button
                    onClick={() => showFeedback("Change verified email")}
                    className="px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Change
                  </button>
                  <button
                    onClick={() => showFeedback("Email removed")}
                    className="px-3.5 py-1.5 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              </div>

              {/* Item 6: Device Management */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Device Management</h3>
                    <p className="text-[11px] text-[#64748B]">Manage devices associated with the account</p>
                  </div>
                </div>

                <button
                  onClick={() => showFeedback("Open device management")}
                  className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  Manage
                </button>
              </div>

              {/* Item 7: Account Activity */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Account Activity</h3>
                    <p className="text-[11px] text-[#64748B]">Manage activities associated with the account</p>
                  </div>
                </div>

                <button
                  onClick={() => showFeedback("Open account activity")}
                  className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  View
                </button>
              </div>

              {/* Item 8: Deactivate Account */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Ban className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Deactivate Account</h3>
                    <p className="text-[11px] text-[#64748B]">This will shutdown your account. Your account will be reactive when you sign in again</p>
                  </div>
                </div>

                <button
                  onClick={() => showFeedback("Deactivate account requested")}
                  className="px-4 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  Deactivate
                </button>
              </div>

              {/* Item 9: Delete Account */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-[#E9ECEF]">
                <div className="flex items-center space-x-3.5">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 text-[#64748B] flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#1E293B]">Delete Account</h3>
                    <p className="text-[11px] text-[#64748B]">Your account will be permanently deleted</p>
                  </div>
                </div>

                <button
                  onClick={() => showFeedback("Delete account requested")}
                  className="px-4 py-2 bg-[#EA5455] hover:bg-[#D94344] text-white rounded-lg text-xs font-bold shadow-xs active:scale-98 transition-all cursor-pointer shrink-0"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
