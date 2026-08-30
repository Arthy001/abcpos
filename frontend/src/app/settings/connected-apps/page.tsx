"use client";

import React, { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { SettingsSidebar } from "@/components/settings/SettingsSidebar";
import {
  RotateCcw,
  ChevronUp,
  CheckCircle2,
} from "lucide-react";

interface AppCard {
  id: string;
  name: string;
  connected: boolean;
  type: "calendar" | "figma" | "dropbox" | "slack" | "github" | "gmail";
}

export default function ConnectedAppsSettingsPage() {
  const [apps, setApps] = useState<AppCard[]>([
    { id: "1", name: "Calendar", connected: true, type: "calendar" },
    { id: "2", name: "Figma", connected: true, type: "figma" },
    { id: "3", name: "Dropbox", connected: true, type: "dropbox" },
    { id: "4", name: "Slack", connected: true, type: "slack" },
    { id: "5", name: "Github", connected: true, type: "github" },
    { id: "6", name: "Figma", connected: true, type: "gmail" },
  ]);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showFeedback = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleToggle = (id: string) => {
    setApps((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const next = !app.connected;
          showFeedback(`${app.name} is now ${next ? "Connected" : "Disconnected"}`);
          return { ...app, connected: next };
        }
        return app;
      })
    );
  };

  const renderIcon = (type: string) => {
    switch (type) {
      case "calendar":
        return (
          <div className="w-10 h-10 rounded-lg bg-white shadow-2xs border border-gray-100 flex flex-col items-center justify-center font-bold text-blue-600">
            <span className="text-[9px] uppercase tracking-wider text-red-500 font-extrabold -mb-0.5">Google</span>
            <span className="text-sm leading-none font-black text-blue-600">31</span>
          </div>
        );
      case "figma":
        return (
          <div className="w-10 h-10 rounded-lg bg-[#2C2D30] flex items-center justify-center text-white">
            <svg className="w-5 h-5" viewBox="0 0 38 57" fill="none">
              <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
              <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
              <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
              <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
              <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#A259FF"/>
            </svg>
          </div>
        );
      case "dropbox":
        return (
          <div className="w-10 h-10 rounded-lg bg-[#0061FE] flex items-center justify-center text-white">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M7.054 2L0 6.643l5.054 4.143L12.108 6.64 7.054 2zm9.892 0l-5.054 4.643 7.054 4.143L24 6.643 16.946 2zM0 14.93l7.054 4.643 5.054-4.143-7.054-4.143L0 14.93zm16.946-3.643l-5.054 4.143 5.054 4.643L24 15.43l-7.054-4.143zM12.108 16.035l-5.054 4.143L4.946 22l7.162-4.286L19.27 22l-2.108-1.822-5.054-4.143z" />
            </svg>
          </div>
        );
      case "slack":
        return (
          <div className="w-10 h-10 rounded-lg bg-[#4A154B] flex items-center justify-center text-white">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M6 15a2 2 0 0 1-2 2 2 2 0 0 1-2-2 2 2 0 0 1 2-2h2v2zm1 0a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-5zm2-8a2 2 0 0 1-2-2 2 2 0 0 1 2-2 2 2 0 0 1 2 2v2H9zm0 1a2 2 0 0 1 2 2 2 2 0 0 1-2 2H4a2 2 0 0 1-2-2 2 2 0 0 1 2-2h5zm8 2a2 2 0 0 1 2-2 2 2 0 0 1 2 2 2 2 0 0 1-2 2h-2v-2zm-1 0a2 2 0 0 1-2 2 2 2 0 0 1-2-2V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2v5zm-2 8a2 2 0 0 1 2 2 2 2 0 0 1-2 2 2 2 0 0 1-2-2v-2h2zm0-1a2 2 0 0 1-2-2 2 2 0 0 1 2-2h5a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-5z"/>
            </svg>
          </div>
        );
      case "github":
        return (
          <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center text-white">
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </div>
        );
      case "gmail":
      default:
        return (
          <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 shadow-2xs flex items-center justify-center">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.272H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L12 9.545l8.073-6.052C21.69 2.28 24 3.434 24 5.457z" fill="#EA4335" />
            </svg>
          </div>
        );
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
              onClick={() => showFeedback("Connected apps refreshed")}
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

          {/* Right Content Panel: Connected Apps */}
          <div className="flex-1 w-full bg-white rounded-xl border border-[#E9ECEF] shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#F1F3F5]">
              <h2 className="text-sm font-bold text-[#1E293B]">Connected Apps</h2>
            </div>

            <div className="p-6">
              {/* 3 Columns x 2 Rows Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 rounded-xl border border-[#E9ECEF] bg-white hover:shadow-xs transition-shadow flex flex-col justify-between space-y-4"
                  >
                    {/* Top Row: Icon + Connected Badge */}
                    <div className="flex items-center justify-between">
                      {renderIcon(app.type)}

                      {app.connected ? (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-[#28C76F] border border-[#28C76F]/40 bg-white">
                          Connected
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-[#64748B] border border-gray-200 bg-gray-50">
                          Disconnected
                        </span>
                      )}
                    </div>

                    {/* Bottom Row: Name + Toggle Switch */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-bold text-[#1E293B]">{app.name}</span>

                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={app.connected}
                          onChange={() => handleToggle(app.id)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#28C76F]"></div>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
