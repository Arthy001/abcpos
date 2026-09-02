"use client";

import React from "react";

interface BrandPageLoaderProps {
  message?: string;
  fullScreen?: boolean;
}

export const BrandPageLoader: React.FC<BrandPageLoaderProps> = ({
  message = "Loading ABCPOS...",
  fullScreen = true,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullScreen ? "fixed inset-0 z-50 bg-[#F8F9FA]/90 backdrop-blur-xs" : "w-full py-16"
      } animate-in fade-in duration-200 select-none`}
    >
      <div className="relative flex flex-col items-center">
        {/* Breathing Glow Outer Ring */}
        <div className="absolute -inset-4 rounded-3xl bg-[#FE9F43]/15 blur-xl animate-pulse" />

        {/* Logo Card Container */}
        <div className="relative bg-white/95 px-6 py-4 rounded-2xl shadow-xl border border-gray-100/80 flex items-center justify-center transition-transform hover:scale-105">
          <img
            src="/assets/images/abcposlogo.png"
            alt="ABCPOS Logo"
            className="h-10 sm:h-12 w-auto object-contain animate-pulse"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/assets/images/logo.svg";
            }}
          />
        </div>

        {/* Animated Loading Dots */}
        <div className="flex items-center space-x-2 mt-5">
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#FE9F43] animate-bounce"
            style={{ animationDelay: "0ms", animationDuration: "800ms" }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#FE9F43] animate-bounce"
            style={{ animationDelay: "150ms", animationDuration: "800ms" }}
          />
          <div
            className="w-2.5 h-2.5 rounded-full bg-[#FE9F43] animate-bounce"
            style={{ animationDelay: "300ms", animationDuration: "800ms" }}
          />
        </div>

        {/* Message */}
        {message && (
          <p className="mt-3 text-xs font-semibold text-gray-500 tracking-wide">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
