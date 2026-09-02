"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Search, X, Check } from "lucide-react";

export interface OptionItem {
  value: string;
  label: string;
  subLabel?: string;
  icon?: React.ReactNode;
}

interface SearchableSelectProps {
  options: OptionItem[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  showSelectOption?: boolean;
  selectOptionLabel?: string;
  size?: "sm" | "md" | "lg";
  searchable?: boolean;
}

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  label,
  required = false,
  disabled = false,
  className = "",
  error,
  showAllOption = false,
  allOptionLabel = "All",
  showSelectOption = true,
  selectOptionLabel,
  size = "md",
  searchable = true,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const uniqueId = useId();

  // Selected Option display
  const selectedOption = options.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opt.subLabel && opt.subLabel.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
    setSearchQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(showAllOption ? "all" : "");
    setSearchQuery("");
  };

  const sizeClasses = {
    sm: "min-h-[32px] px-2.5 py-1 text-xs rounded-lg bg-white",
    md: "min-h-[38px] px-3.5 py-2 text-xs rounded-xl bg-gray-50",
    lg: "min-h-[44px] px-4 py-2.5 text-sm rounded-xl bg-gray-50",
  };

  const defaultSelectText =
    selectOptionLabel || (placeholder && placeholder !== "Select an option..." ? placeholder : "Select...");

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <label
          htmlFor={uniqueId}
          className="block text-xs font-semibold text-gray-700 mb-1.5"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Main Trigger Box */}
      <div
        id={uniqueId}
        onClick={() => {
          if (!disabled) setIsOpen(!isOpen);
        }}
        className={`w-full ${sizeClasses[size]} border flex items-center justify-between transition-all cursor-pointer select-none ${
          disabled
            ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
            : isOpen
            ? "bg-white border-[#FE9F43] ring-2 ring-orange-100"
            : error
            ? "bg-white border-red-300 ring-1 ring-red-100 text-gray-800"
            : "border-gray-200 hover:border-gray-300 text-gray-800"
        }`}
      >
        <span
          className={`truncate flex items-center gap-1.5 ${
            selectedOption || (showAllOption && (value === "all" || !value))
              ? "font-medium text-gray-900"
              : "text-gray-400"
          }`}
        >
          {selectedOption?.icon}
          <span className="truncate">
            {showAllOption && (value === "all" || !value)
              ? allOptionLabel
              : selectedOption
              ? selectedOption.label
              : placeholder}
          </span>
        </span>

        <div className="flex items-center space-x-1 pl-1.5 flex-shrink-0 text-gray-400">
          {value && value !== "all" && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 hover:text-gray-600 rounded-full hover:bg-gray-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isOpen ? "transform rotate-180 text-[#FE9F43]" : ""
            }`}
          />
        </div>
      </div>

      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[9999] left-0 min-w-full sm:min-w-[270px] mt-1.5 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Input Box (if searchable) */}
          {searchable && (
            <div className="p-2 border-b border-gray-100 bg-gray-50/70">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-7 pr-3 py-1 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:border-[#FE9F43]"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2 top-1.5" />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1.5 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options List */}
          <div className="max-h-56 overflow-y-auto py-1 divide-y divide-gray-50 text-xs">
            {/* 1. Show "All" Option (e.g. for filter bars) */}
            {showAllOption && (
              <div
                onClick={() => handleSelect("all")}
                className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                  value === "all" || !value
                    ? "bg-orange-50/70 text-[#FE9F43] font-bold"
                    : "hover:bg-gray-50 text-gray-700"
                }`}
              >
                <span>{allOptionLabel}</span>
                {(value === "all" || !value) && <Check className="w-3.5 h-3.5 text-[#FE9F43]" />}
              </div>
            )}

            {/* 2. Show "Select" Option as the first item (for form selects) */}
            {showSelectOption && !showAllOption && (
              <div
                onClick={() => handleSelect("")}
                className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                  !value || value === ""
                    ? "bg-orange-50/70 text-[#FE9F43] font-bold"
                    : "hover:bg-gray-50 text-gray-500 font-medium"
                }`}
              >
                <span>{defaultSelectText}</span>
                {(!value || value === "") && <Check className="w-3.5 h-3.5 text-[#FE9F43]" />}
              </div>
            )}

            {filteredOptions.length === 0 ? (
              <div className="px-3.5 py-4 text-center text-gray-400 text-xs">
                No matching options found
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                      isSelected
                        ? "bg-orange-50/70 text-[#FE9F43] font-bold"
                        : "hover:bg-gray-50 text-gray-700 font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      {opt.icon}
                      <div className="flex flex-col truncate">
                        <span className="truncate">{opt.label}</span>
                        {opt.subLabel && (
                          <span className="text-[10px] text-gray-400">{opt.subLabel}</span>
                        )}
                      </div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-[#FE9F43] flex-shrink-0" />}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
