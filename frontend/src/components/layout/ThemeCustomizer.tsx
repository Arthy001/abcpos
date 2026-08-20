"use client";

import React from "react";
import { useThemeStore, LayoutMode, LayoutWidth } from "@/store/useThemeStore";
import {
  X,
  RotateCcw,
  Check,
  ChevronDown,
  Maximize2,
  Minimize2,
} from "lucide-react";

export const ThemeCustomizer: React.FC = () => {
  const {
    isCustomizerOpen,
    closeCustomizer,
    layoutMode,
    setLayoutMode,
    layoutWidth,
    setLayoutWidth,
    topBarColor,
    setTopBarColor,
    resetTheme,
  } = useThemeStore();

  if (!isCustomizerOpen) return null;

  const layoutOptions: { id: LayoutMode; name: string; image: string }[] = [
    { id: "default", name: "Default", image: "/assets/images/default.svg" },
    { id: "mini", name: "Mini", image: "/assets/images/mini.svg" },
    { id: "two-column", name: "Two Column", image: "/assets/images/two-column.svg" },
    { id: "horizontal", name: "Horizontal", image: "/assets/images/horizontal.svg" },
    { id: "detached", name: "Detached", image: "/assets/images/detached.svg" },
    { id: "without-header", name: "Without Header", image: "/assets/images/without-header.svg" },
    { id: "rtl", name: "RTL", image: "/assets/images/rtl.svg" },
  ];

  const solidColors = [
    { name: "White", bg: "#ffffff", border: true },
    { name: "Dark Navy", bg: "#1e293b" },
    { name: "Charcoal", bg: "#0f172a" },
    { name: "Royal Blue", bg: "#2563eb" },
    { name: "Purple", bg: "#7c3aed" },
    { name: "Teal", bg: "#0d9488" },
  ];

  const gradientColors = [
    { name: "Ocean Blue", bg: "linear-gradient(to right, #1e3a8a, #0284c7)", isGradient: true },
    { name: "Sky Cyan", bg: "linear-gradient(to right, #0284c7, #38bdf8)", isGradient: true },
    { name: "Deep Indigo", bg: "linear-gradient(to right, #312e81, #4f46e5)", isGradient: true },
    { name: "Violet Magic", bg: "linear-gradient(to right, #6b21a8, #a855f7)", isGradient: true },
    { name: "Emerald Teal", bg: "linear-gradient(to right, #065f46, #10b981)", isGradient: true },
    { name: "Sunset Orange", bg: "linear-gradient(to right, #f97316, #fb923c)", isGradient: true },
    { name: "Ruby Crimson", bg: "linear-gradient(to right, #991b1b, #ef4444)", isGradient: true },
    { name: "Cosmic Purple", bg: "linear-gradient(to right, #581c87, #818cf8)", isGradient: true },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={closeCustomizer}
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-over Panel from Right */}
      <aside className="fixed top-0 right-0 bottom-0 w-80 sm:w-96 bg-white z-50 shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-out animate-in slide-in-from-right font-sans">
        {/* Header (Dark Navy #0e1726) */}
        <div className="bg-[#0E1726] text-white p-4.5 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight">Theme Customizer</h3>
            <p className="text-[11px] text-gray-300 mt-0.5">
              Choose your themes & layouts etc.
            </p>
          </div>
          <button
            onClick={closeCustomizer}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs text-[#334155]">
          {/* 1. Select Layouts */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100 font-bold text-gray-800 text-[13px]">
              <span>Select Layouts</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              {layoutOptions.map((layout) => {
                const isSelected = layoutMode === layout.id;

                return (
                  <div
                    key={layout.id}
                    onClick={() => setLayoutMode(layout.id)}
                    className="cursor-pointer group text-center space-y-1.5"
                  >
                    <div
                      className={`relative rounded-xl border p-1.5 transition-all bg-[#F8F9FA] group-hover:border-[#FE9F43] ${
                        isSelected
                          ? "border-[#FE9F43] ring-2 ring-[#FE9F43]/20 bg-orange-50/20"
                          : "border-gray-200"
                      }`}
                    >
                      <img
                        src={layout.image}
                        alt={layout.name}
                        className="w-full h-12 object-contain"
                        onError={(e) => {
                          // fallback if image not found
                          (e.target as HTMLImageElement).src = "/assets/images/default.svg";
                        }}
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 bg-[#28C76F] rounded-full text-white flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <p className={`text-[11px] font-medium ${isSelected ? "text-[#FE9F43] font-bold" : "text-gray-600"}`}>
                      {layout.name}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Layout Width */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100 font-bold text-gray-800 text-[13px]">
              <span>Layout Width</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={() => setLayoutWidth("fluid")}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  layoutWidth === "fluid"
                    ? "border-[#FE9F43] bg-[#FFF5ED] text-[#FE9F43] ring-1 ring-[#FE9F43]"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Fluid Layout</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutWidth("boxed")}
                className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border text-xs font-semibold transition-all ${
                  layoutWidth === "boxed"
                    ? "border-[#FE9F43] bg-[#FFF5ED] text-[#FE9F43] ring-1 ring-[#FE9F43]"
                    : "border-gray-200 hover:bg-gray-50 text-gray-700"
                }`}
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Boxed Layout</span>
              </button>
            </div>
          </div>

          {/* 3. Top Bar Color */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-gray-100 font-bold text-gray-800 text-[13px]">
              <span>Top Bar Color</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </div>

            {/* Solid Colors */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-semibold text-gray-500">Solid Colors</p>
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                {solidColors.map((color, idx) => {
                  const isSelected = topBarColor === color.bg;

                  return (
                    <button
                      key={idx}
                      onClick={() => setTopBarColor(color.bg, false)}
                      style={{ backgroundColor: color.bg }}
                      className={`w-7 h-7 rounded-lg relative transition-transform active:scale-90 flex items-center justify-center ${
                        color.border ? "border border-gray-300 shadow-2xs" : ""
                      } ${isSelected ? "ring-2 ring-offset-2 ring-[#FE9F43]" : ""}`}
                      title={color.name}
                    >
                      {isSelected && (
                        <div className="w-3.5 h-3.5 bg-[#28C76F] rounded-full text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gradient Colors */}
            <div className="space-y-1.5 pt-2">
              <p className="text-[11px] font-semibold text-gray-500">Gradient Colors</p>
              <div className="flex items-center space-x-2 flex-wrap gap-y-2">
                {gradientColors.map((color, idx) => {
                  const isSelected = topBarColor === color.bg;

                  return (
                    <button
                      key={idx}
                      onClick={() => setTopBarColor(color.bg, true)}
                      style={{ background: color.bg }}
                      className={`w-7 h-7 rounded-lg relative transition-transform active:scale-90 flex items-center justify-center ${
                        isSelected ? "ring-2 ring-offset-2 ring-[#FE9F43]" : ""
                      }`}
                      title={color.name}
                    >
                      {isSelected && (
                        <div className="w-3.5 h-3.5 bg-white text-[#111827] rounded-full flex items-center justify-center shadow-xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white">
          <button
            onClick={resetTheme}
            className="flex items-center space-x-1.5 text-xs text-gray-600 hover:text-gray-900 font-semibold px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            onClick={closeCustomizer}
            className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-lg shadow-sm active:scale-95 transition-all"
          >
            Apply Changes
          </button>
        </div>
      </aside>
    </>
  );
};
