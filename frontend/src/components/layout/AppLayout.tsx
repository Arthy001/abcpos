"use client";

import React, { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { ThemeCustomizer } from "./ThemeCustomizer";
import { useThemeStore } from "@/store/useThemeStore";
import { Settings } from "lucide-react";

interface AppLayoutProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { toggleCustomizer, layoutMode, layoutWidth } = useThemeStore();

  // If layout mode is "mini", force collapsed sidebar
  const isMini = layoutMode === "mini" || !sidebarOpen;
  const isWithoutHeader = layoutMode === "without-header";
  const isRtl = layoutMode === "rtl";

  return (
    <div
      dir={isRtl ? "rtl" : "ltr"}
      className="min-h-screen bg-[#f2f2f2] flex flex-col antialiased"
    >
      {/* Top Navbar (hidden if without-header layout) */}
      {!isWithoutHeader && (
        <Header
          sidebarOpen={!isMini}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      <div className="flex flex-1 relative bg-[#f2f2f2]">
        {/* Left Sidebar */}
        <Sidebar isOpen={!isMini} />

        {/* Main Content Area */}
        <main
          className={`flex-1 transition-all duration-300 p-4 md:p-6 min-h-[calc(100vh-4rem)] flex flex-col justify-between bg-[#f2f2f2] w-full ${
            !isMini ? (isRtl ? "mr-56" : "ml-56") : isRtl ? "mr-16" : "ml-16"
          }`}
        >
          <div className={`${layoutWidth === "boxed" ? "max-w-6xl mx-auto w-full" : "w-full"}`}>
            {children}
          </div>

          {/* Bottom Copyright Footer */}
          <footer
            className={`mt-8 pt-4 border-t border-gray-300/60 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#646B72] ${
              layoutWidth === "boxed" ? "max-w-6xl mx-auto w-full" : "w-full"
            }`}
          >
            <p>2014 - 2026 © A POS. All Right Reserved</p>
            <p className="mt-1 sm:mt-0">
              Designed & Developed by <span className="font-semibold text-[#111827]">A POS</span>
            </p>
          </footer>
        </main>
      </div>

      {/* Floating Orange Settings Cog Button (Right screen edge) */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={toggleCustomizer}
          className="w-8 h-8 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-l-lg flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer"
          title="Theme Customizer"
        >
          <Settings className="w-4 h-4 animate-spin-slow" />
        </button>
      </div>

      {/* Slide-out Theme Customizer Drawer */}
      <ThemeCustomizer />
    </div>
  );
};
