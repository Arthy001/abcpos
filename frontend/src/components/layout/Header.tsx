"use client";

import React from "react";
import Link from "next/link";
import {
  Search,
  Store,
  ChevronDown,
  PlusCircle,
  Maximize,
  Mail,
  Bell,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Monitor,
  ShoppingBag,
} from "lucide-react";

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ sidebarOpen, onToggleSidebar }) => {
  return (
    <header className="h-16 bg-white border-b border-gray-100 sticky top-0 z-40 flex items-center justify-between px-4 lg:px-6">
      {/* Left Section: A POS Logo, Circle Toggle Button (<< / >>), Search Bar */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1">
        {/* Brand Logo: A POS */}
        <Link href="/" className="flex items-center space-x-2 mr-1 sm:mr-2 flex-shrink-0 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FE9F43] to-[#FF8008] flex items-center justify-center text-white font-black text-base shadow-sm group-hover:scale-105 transition-transform">
            A
          </div>
          <span className="font-extrabold text-base sm:text-lg tracking-tight text-[#111827]">
            A <span className="text-[#FE9F43]">POS</span>
          </span>
        </Link>

        {/* Circular Toggle Button (Orange << / >>) - Not hamburger */}
        <button
          onClick={onToggleSidebar}
          className="w-7 h-7 rounded-full bg-[#FE9F43] hover:bg-[#E88B32] text-white flex items-center justify-center shadow-xs transition-all active:scale-90 flex-shrink-0"
          title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
        >
          {sidebarOpen ? (
            <ChevronsLeft className="w-4 h-4" />
          ) : (
            <ChevronsRight className="w-4 h-4" />
          )}
        </button>

        {/* Search Bar with ⌘ K */}
        <div className="hidden md:flex items-center relative max-w-xs w-full ml-1">
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-8 pr-12 py-1.5 bg-gray-50/80 hover:bg-gray-100/80 focus:bg-white border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] transition-all"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          <div className="absolute right-2 top-1.5 flex items-center px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[10px] text-gray-400 font-mono shadow-2xs">
            ⌘ K
          </div>
        </div>
      </div>

      {/* Right Section: Store Pill, + Add New, POS Button, Utility Icons, User Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Store Selector Pill */}
        <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-50/70 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold cursor-pointer hover:bg-emerald-100/60 transition-colors">
          <Store className="w-3.5 h-3.5 text-emerald-600" />
          <span>Freshmart</span>
          <ChevronDown className="w-3 h-3 text-emerald-600 ml-0.5" />
        </div>

        {/* + Add New Button (Orange) */}
        <Link
          href="/products/add"
          className="hidden md:flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add New</span>
        </Link>

        {/* POS Button (Dark Navy) */}
        <Link
          href="/pos"
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#0E1422] hover:bg-[#1E293B] text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all"
        >
          <Monitor className="w-3.5 h-3.5 text-orange-400" />
          <span>POS</span>
        </Link>

        {/* Language / US Flag */}
        <div className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center cursor-pointer">
          <img
            src="/assets/images/english.svg"
            alt="English"
            className="w-5 h-5 rounded-full object-cover"
            onError={(e) => {
              (e.target as HTMLElement).innerText = "🇺🇸";
            }}
          />
        </div>

        {/* Fullscreen Icon */}
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="hidden sm:flex w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 items-center justify-center transition-colors"
          title="Fullscreen"
        >
          <Maximize className="w-4 h-4" />
        </button>

        {/* Email/Messages with red badge */}
        <button
          className="relative w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
          title="Messages"
        >
          <Mail className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-red-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center">
            1
          </span>
        </button>

        {/* Notifications */}
        <button
          className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>

        {/* Settings */}
        <Link
          href="/settings"
          className="w-8 h-8 rounded-lg hover:bg-gray-100 text-gray-500 flex items-center justify-center transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </Link>

        {/* User Profile Avatar */}
        <div className="relative pl-1 cursor-pointer">
          <img
            src="/assets/images/avatar-01.jpg"
            alt="User Profile"
            className="w-8 h-8 rounded-lg object-cover ring-2 ring-gray-100"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop";
            }}
          />
          <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white"></span>
        </div>
      </div>
    </header>
  );
};
