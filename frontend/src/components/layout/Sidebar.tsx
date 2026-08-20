"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  PlusCircle,
  AlertOctagon,
  TrendingDown,
  Layers,
  Tag,
  Scale,
  Sliders,
  ShieldCheck,
  Barcode,
  QrCode,
  Boxes,
  ArrowRightLeft,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Receipt,
  FileCheck,
  Ticket,
  Gift,
  Percent,
  ShoppingBag,
  DollarSign,
  Wallet,
  Building2,
  TrendingUp,
  Users,
  UserCheck,
  Store,
  Warehouse,
  Briefcase,
  Calendar,
  Clock,
  UserX,
  Smile,
  CircleDollarSign,
  BarChart3,
  PieChart,
  Settings,
  Shield,
  CreditCard as PaymentIcon,
  HelpCircle,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  name: string;
  href: string;
  icon: any;
  hasSub?: boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const pathname = usePathname();

  const menuGroups: MenuGroup[] = [
    {
      title: "Main",
      items: [
        { name: "Dashboard", href: "/", icon: LayoutDashboard, hasSub: true },
        { name: "Super Admin", href: "/admin", icon: Shield, hasSub: true },
        { name: "Application", href: "/apps", icon: ShoppingCart, hasSub: true },
        { name: "Layouts", href: "/layouts", icon: Layers, hasSub: true },
      ],
    },
    {
      title: "Inventory",
      items: [
        { name: "Products", href: "/products", icon: Package },
        { name: "Create Product", href: "/products/add", icon: PlusCircle },
        { name: "Expired Products", href: "/inventory/expired", icon: AlertOctagon },
        { name: "Low Stocks", href: "/inventory/low-stock", icon: TrendingDown },
        { name: "Category", href: "/categories", icon: Layers },
        { name: "Sub Category", href: "/sub-categories", icon: Layers },
        { name: "Brands", href: "/brands", icon: Tag },
        { name: "Units", href: "/units", icon: Scale },
        { name: "Variant Attributes", href: "/variant-attributes", icon: Sliders },
        { name: "Warranties", href: "/warranties", icon: ShieldCheck },
        { name: "Print Barcode", href: "/barcode/print", icon: Barcode },
        { name: "Print QR Code", href: "/qrcode/print", icon: QrCode },
      ],
    },
    {
      title: "Stock",
      items: [
        { name: "Manage Stock", href: "/stock/manage", icon: Boxes },
        { name: "Stock Adjustment", href: "/stock/adjustment", icon: FileSpreadsheet },
        { name: "Stock Transfer", href: "/stock/transfer", icon: ArrowRightLeft },
      ],
    },
    {
      title: "Sales",
      items: [
        { name: "Sales List", href: "/sales", icon: Receipt },
        { name: "Invoices", href: "/invoices", icon: FileText },
        { name: "Sales Return", href: "/sales/returns", icon: RotateCcw },
        { name: "POS Orders", href: "/orders", icon: ShoppingBag },
        { name: "Quotation", href: "/quotations", icon: FileCheck },
      ],
    },
    {
      title: "Promo",
      items: [
        { name: "Coupons", href: "/promo/coupons", icon: Ticket },
        { name: "Gift Cards", href: "/promo/gift-cards", icon: Gift },
        { name: "Discount", href: "/promo/discounts", icon: Percent },
      ],
    },
    {
      title: "Purchases",
      items: [
        { name: "Purchases", href: "/purchases", icon: ShoppingBag },
        { name: "Purchase Order", href: "/purchases/orders", icon: FileText },
        { name: "Purchase Return", href: "/purchases/returns", icon: RotateCcw },
      ],
    },
    {
      title: "Finance & Accounts",
      items: [
        { name: "Expenses", href: "/finance/expenses", icon: DollarSign },
        { name: "Income", href: "/finance/income", icon: TrendingUp },
        { name: "Bank Accounts", href: "/finance/bank-accounts", icon: Building2 },
        { name: "Cash Flow", href: "/finance/cash-flow", icon: Wallet },
        { name: "Account Statement", href: "/finance/account-statement", icon: FileSpreadsheet },
      ],
    },
    {
      title: "Peoples",
      items: [
        { name: "Customers", href: "/customers", icon: Users },
        { name: "Suppliers", href: "/suppliers", icon: UserCheck },
        { name: "Stores", href: "/stores", icon: Store },
        { name: "Warehouses", href: "/warehouses", icon: Warehouse },
      ],
    },
    {
      title: "HRM",
      items: [
        { name: "Employees", href: "/hrm/employees", icon: Briefcase },
        { name: "Departments", href: "/hrm/departments", icon: Building2 },
        { name: "Designations", href: "/hrm/designations", icon: Layers },
        { name: "Shift & Schedule", href: "/hrm/shifts", icon: Clock },
        { name: "Attendance", href: "/hrm/attendance", icon: Calendar },
        { name: "Leaves", href: "/hrm/leaves", icon: UserX },
        { name: "Holidays", href: "/hrm/holidays", icon: Smile },
        { name: "Payroll", href: "/hrm/payroll", icon: CircleDollarSign },
      ],
    },
    {
      title: "Reports",
      items: [
        { name: "Sales Report", href: "/reports/sales", icon: BarChart3 },
        { name: "Purchase Report", href: "/reports/purchases", icon: BarChart3 },
        { name: "Inventory Report", href: "/reports/inventory", icon: PieChart },
        { name: "Invoice Report", href: "/reports/invoices", icon: FileText },
        { name: "Tax Report", href: "/reports/tax", icon: Percent },
        { name: "Profit & Loss", href: "/reports/profit-loss", icon: BarChart3 },
      ],
    },
    {
      title: "Settings",
      items: [
        { name: "General Settings", href: "/settings", icon: Settings },
        { name: "Security", href: "/settings/security", icon: Shield },
        { name: "Payment Gateways", href: "/settings/payments", icon: PaymentIcon },
        { name: "Tax Rates", href: "/settings/tax", icon: Percent },
        { name: "Help & Docs", href: "/help", icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-30 bg-white border-r border-gray-100 transition-all duration-300 overflow-y-auto ${
        isOpen ? "w-56" : "w-16"
      }`}
    >
      <div className={`py-4 space-y-4 ${isOpen ? "px-3" : "px-1.5"}`}>
        {menuGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {isOpen && (
              <p className="px-3 text-[11px] font-bold text-gray-800 tracking-tight mb-1.5">
                {group.title}
              </p>
            )}

            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg font-medium text-xs transition-all ${
                      isActive
                        ? "bg-[#FFF5ED] text-[#FE9F43] font-bold"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    } ${!isOpen ? "justify-center px-0 py-2.5" : ""}`}
                    title={!isOpen ? item.name : undefined}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon
                        className={`w-4 h-4 flex-shrink-0 ${
                          isActive ? "text-[#FE9F43]" : "text-gray-500"
                        }`}
                      />
                      {isOpen && <span className="truncate">{item.name}</span>}
                    </div>

                    {isOpen && item.hasSub && (
                      <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};
