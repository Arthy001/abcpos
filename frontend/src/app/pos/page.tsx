"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  LayoutDashboard,
  User,
  PlusCircle,
  QrCode,
  Calculator,
  Maximize2,
  Printer,
  RotateCcw,
  Volume2,
  X,
  Tag,
  Edit2,
  Check,
  ChevronDown,
  CheckCircle2,
  Headphones,
  Footprints,
  Smartphone,
  Watch,
  Laptop,
} from "lucide-react";

interface PosProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  qty: number;
  selected?: boolean;
}

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export default function POS1Page() {
  const [timeStr, setTimeStr] = useState<string>("09:25:32");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [roundoff, setRoundoff] = useState<boolean>(true);
  const [showApplyBonus, setShowApplyBonus] = useState<boolean>(true);
  const [selectedStore, setSelectedStore] = useState<string>("Freshmart");
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Initial Product Catalog matching screenshot
  const [products, setProducts] = useState<PosProduct[]>([
    {
      id: "1",
      name: "iPhone 14 64GB",
      category: "Mobiles",
      price: 15800,
      image: "/assets/images/product-09.jpg",
      qty: 4,
    },
    {
      id: "2",
      name: "MacBook Pro",
      category: "Computer",
      price: 1000,
      image: "/assets/images/product-01.jpg",
      qty: 4,
    },
    {
      id: "3",
      name: "Rolex Tribute V3",
      category: "Watches",
      price: 6800,
      image: "/assets/images/product-05.jpg",
      qty: 4,
    },
    {
      id: "4",
      name: "Red Nike Angelo",
      category: "Shoes",
      price: 7800,
      image: "/assets/images/product-04.jpg",
      qty: 4,
    },
    {
      id: "5",
      name: "Airpod 2",
      category: "Headphones",
      price: 5478,
      image: "/assets/images/product-03.jpg",
      qty: 4,
      selected: true,
    },
    {
      id: "6",
      name: "Blue White OGR",
      category: "Shoes",
      price: 987,
      image: "/assets/images/product-07.jpg",
      qty: 4,
    },
    {
      id: "7",
      name: "IdeaPad Slim 5 Gen 7",
      category: "Laptop",
      price: 1454,
      image: "/assets/images/product-10.jpg",
      qty: 4,
    },
    {
      id: "8",
      name: "SWAGME",
      category: "Headphones",
      price: 6587,
      image: "/assets/images/product-03.jpg",
      qty: 4,
    },
  ]);

  // Initial Cart Items matching screenshot
  const [cartItems, setCartItems] = useState<CartItem[]>([
    { id: "1", name: "iPhone 14 64GB", price: 15800, qty: 1 },
    { id: "4", name: "Red Nike Angelo", price: 398, qty: 4 },
    { id: "9", name: "Tablet 1.02 inch", price: 3000, qty: 4 },
    { id: "10", name: "IdeaPad Slim 3i", price: 3000, qty: 4 },
  ]);

  // Live ticking clock
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(" ")[0]);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleProductCardQty = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty + delta) } : p))
    );
  };

  const handleAddToCart = (product: PosProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + product.qty } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, qty: product.qty }];
    });
  };

  const updateCartQty = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shipping = 40.21;
  const tax = 25.0;
  const coupon = 25.0;
  const discountVal = 15.21;
  const roundoffVal = roundoff ? 0.11 : 0.0;
  const totalPayable = Math.max(0, subtotal + shipping + tax - coupon - discountVal + roundoffVal);

  const categoriesRail = [
    { name: "All", icon: Smartphone },
    { name: "Headset", icon: Headphones },
    { name: "Shoes", icon: Footprints },
    { name: "Mobiles", icon: Smartphone },
    { name: "Watches", icon: Watch },
    { name: "Laptop", icon: Laptop },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat = activeCategory === "All" || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col font-sans select-none">
      {/* 1. TOP NAVBAR HEADER */}
      <header className="h-16 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-4 sticky top-0 z-30 shadow-2xs">
        {/* Brand Logo & Live Time Badge */}
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FE9F43] to-[#FF8008] flex items-center justify-center text-white font-black text-sm shadow-xs">
              A
            </div>
            <span className="font-bold text-gray-900 text-lg tracking-tight">
              A <span className="text-[#FE9F43]">POS</span>
            </span>
          </Link>

          {/* Live Clock (Green pill) */}
          <div className="flex items-center space-x-1.5 px-3 py-1 bg-[#28C76F] text-white rounded-md text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-mono">{timeStr}</span>
          </div>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center space-x-1.5 sm:space-x-2.5">
          {/* Dashboard Button (Purple) */}
          <Link
            href="/"
            className="flex items-center space-x-1.5 px-2.5 sm:px-3.5 py-1.5 bg-[#7367F0] hover:bg-[#685DD8] text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Store Selector (Freshmart Green badge) */}
          <div className="relative hidden md:block">
            <button className="flex items-center space-x-1.5 px-3 py-1.5 bg-[#00CFE8] text-white hover:bg-[#00BCD4] rounded-lg text-xs font-bold transition-all shadow-xs">
              <span>{selectedStore}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Calculator Icon (Orange) */}
          <button
            onClick={() => alert("Quick Calculator")}
            className="w-8 h-8 rounded-lg bg-[#FE9F43] hover:bg-[#E88B32] text-white flex items-center justify-center transition-colors shadow-xs"
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* Fullscreen Icon */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen();
              } else {
                document.exitFullscreen();
              }
            }}
            className="hidden sm:flex w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 items-center justify-center transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Print Receipt Icon */}
          <button
            onClick={() => window.print()}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <Printer className="w-4 h-4" />
          </button>

          {/* Reset Icon */}
          <button
            onClick={() => {
              setCartItems([]);
              alert("Order reset!");
            }}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound/Audio Icon */}
          <button
            onClick={() => alert("Audio announcement toggled")}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Cashier Avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
            <div className="relative">
              <img
                src="/assets/images/avatar-01.jpg"
                alt="Wesley Adrian"
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#28C76F] border-2 border-white rounded-full" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN POS BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Category Rail (Desktop) */}
        <div className="hidden md:flex w-16 bg-white border-r border-[#E9ECEF] flex-col items-center py-4 space-y-3 flex-shrink-0">
          {categoriesRail.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.name;

            return (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`w-12 h-14 rounded-xl flex flex-col items-center justify-center space-y-1 text-[10px] font-bold transition-all ${
                  isActive
                    ? "bg-[#FFF5ED] text-[#FE9F43] border-l-3 border-[#FE9F43] shadow-xs"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-[#FE9F43]" : "text-gray-400"}`} />
                <span className="truncate max-w-[44px]">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Center Product Catalog Area */}
        <div className="flex-1 flex flex-col p-3 sm:p-4 md:p-5 overflow-y-auto space-y-4 pb-24 xl:pb-4">
          {/* Welcome Bar & Search Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-gray-900">Welcome, Wesley Adrian</h2>
              <p className="text-xs text-gray-400">December 24, 2024</p>
            </div>

            <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap gap-y-2">
              <div className="relative flex-1 sm:w-56 min-w-[180px]">
                <input
                  type="text"
                  placeholder="Search Product"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E5E7EB] rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#FE9F43] text-gray-800 placeholder-gray-400"
                />
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              </div>

              {/* View All Brands (Navy) */}
              <button className="px-3 py-1.5 bg-[#0E1422] hover:bg-black text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap">
                Brands
              </button>

              {/* Featured (Orange) */}
              <button className="px-3 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-semibold shadow-xs transition-colors whitespace-nowrap">
                Featured
              </button>
            </div>
          </div>

          {/* Mobile Category Horizontal Pills (Visible on small screens) */}
          <div className="flex md:hidden items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categoriesRail.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.name;

              return (
                <button
                  key={cat.name}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    isActive
                      ? "bg-[#FE9F43] text-white shadow-xs"
                      : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 flex-1">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                onClick={() => handleAddToCart(p)}
                className={`bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between cursor-pointer hover:shadow-md relative ${
                  p.selected ? "border-[#28C76F] ring-1 ring-[#28C76F]/30" : "border-[#E9ECEF] hover:border-[#FE9F43]"
                }`}
              >
                {/* Selected Checkmark Badge */}
                {p.selected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-[#28C76F] text-white flex items-center justify-center">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}

                {/* Product Thumbnail */}
                <div className="w-full aspect-square rounded-xl bg-gray-50 flex items-center justify-center p-3 mb-2">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="max-h-full max-w-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                    }}
                  />
                </div>

                {/* Product Meta */}
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-medium tracking-wide">
                    {p.category}
                  </p>
                  <h3 className="text-xs font-bold text-gray-900 line-clamp-1">{p.name}</h3>
                </div>

                {/* Price & Quantity Controls */}
                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100">
                  <span className="text-xs font-extrabold text-gray-900">${p.price}</span>

                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1.5 bg-gray-50 px-2 py-0.5 rounded-lg border border-gray-200"
                  >
                    <button
                      onClick={() => handleProductCardQty(p.id, -1)}
                      className="text-gray-400 hover:text-gray-700 text-xs font-bold"
                    >
                      <Minus className="w-2.5 h-2.5" />
                    </button>
                    <span className="text-xs font-bold text-gray-800 px-1">{p.qty}</span>
                    <button
                      onClick={() => handleProductCardQty(p.id, 1)}
                      className="text-gray-400 hover:text-gray-700 text-xs font-bold"
                    >
                      <Plus className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action Operation Buttons (Hold, Void, Payment, View Orders, Reset, Transaction) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2">
            <button
              onClick={() => alert("Order put on Hold")}
              className="py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all text-center"
            >
              Hold
            </button>
            <button
              onClick={() => alert("Order Voided")}
              className="py-2.5 bg-[#007BFF] hover:bg-[#0069D9] text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all text-center"
            >
              Void
            </button>
            <button
              onClick={() => alert("Quick Payment")}
              className="py-2.5 bg-[#00CFE8] hover:bg-[#00BCD4] text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all text-center"
            >
              Payment
            </button>
            <button
              onClick={() => (window.location.href = "/sales/pos-orders")}
              className="py-2.5 bg-[#1E293B] hover:bg-black text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all text-center"
            >
              Orders
            </button>
            <button
              onClick={() => setCartItems([])}
              className="py-2.5 bg-[#5C60F5] hover:bg-[#4E52E0] text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all text-center"
            >
              Reset
            </button>
            <button
              onClick={() => alert("Transactions List")}
              className="py-2.5 bg-[#EA5455] hover:bg-[#D9383A] text-white rounded-lg text-xs font-bold shadow-xs active:scale-95 transition-all text-center"
            >
              History
            </button>
          </div>
        </div>

        {/* Mobile Backdrop for Cart Drawer */}
        {isMobileCartOpen && (
          <div
            onClick={() => setIsMobileCartOpen(false)}
            className="xl:hidden fixed inset-0 bg-black/50 z-35 backdrop-blur-[2px] transition-opacity"
          />
        )}

        {/* 3. RIGHT SIDE ORDER & CHECKOUT PANEL */}
        <div
          className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[400px] xl:static xl:w-96 bg-white border-l border-[#E9ECEF] flex flex-col justify-between shadow-sm overflow-y-auto p-4 space-y-4 flex-shrink-0 transition-transform duration-300 ${
            isMobileCartOpen ? "translate-x-0 shadow-2xl" : "translate-x-full xl:translate-x-0"
          }`}
        >
          {/* Order Header */}
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center space-x-2">
              <h3 className="font-bold text-gray-900 text-sm">Order List</h3>
              <span className="px-2 py-0.5 rounded-md bg-[#111827] text-white text-[10px] font-mono font-bold">
                #ORD123
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCartItems([])}
                title="Clear Cart"
                className="w-7 h-7 rounded bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>

              {/* Close Drawer Button on Mobile */}
              <button
                onClick={() => setIsMobileCartOpen(false)}
                title="Close Cart"
                className="xl:hidden w-7 h-7 rounded bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Customer Information Selector */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-800">Customer Information</p>
            <div className="flex items-center space-x-1.5">
              <div className="relative flex-1">
                <select className="w-full appearance-none bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 text-xs text-gray-700 font-medium focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer">
                  <option value="walk-in">Walk in Customer</option>
                  <option value="james">James Anderson</option>
                  <option value="carl">Carl Evans</option>
                </select>
                <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
              <button
                title="Add Customer"
                className="w-8 h-8 rounded-lg bg-[#28C76F] hover:bg-[#22A75D] text-white flex items-center justify-center flex-shrink-0 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                title="Scan Barcode"
                className="w-8 h-8 rounded-lg bg-[#007BFF] hover:bg-[#0069D9] text-white flex items-center justify-center flex-shrink-0 shadow-2xs"
              >
                <QrCode className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Customer Bonus Banner */}
            {showApplyBonus && (
              <div className="bg-[#FFF5ED] border border-[#FFD8B2] rounded-xl p-2.5 flex items-center justify-between text-xs relative">
                <div>
                  <p className="font-bold text-gray-900">James Anderson</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-[10px] text-gray-500">
                      Bonus: <span className="font-bold text-[#00CFE8] bg-cyan-50 px-1 py-0.5 rounded">140</span>
                    </span>
                    <span className="text-[10px] text-gray-500">
                      Loyalty: <span className="font-bold text-[#28C76F] bg-emerald-50 px-1 py-0.5 rounded">$20</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => alert("Bonus applied!")}
                    className="px-2.5 py-1 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-[10px] font-bold rounded shadow-2xs transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => setShowApplyBonus(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Details List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-bold text-gray-900">Order Details</span>
                <span className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                  Items: {cartItems.length}
                </span>
              </div>
              <button
                onClick={() => setCartItems([])}
                className="text-[11px] text-red-500 hover:text-red-700 font-bold"
              >
                Clear all
              </button>
            </div>

            {/* Cart items list */}
            <div className="space-y-2 max-h-44 overflow-y-auto divide-y divide-gray-50">
              <div className="grid grid-cols-12 text-[11px] font-bold text-gray-400 pb-1">
                <div className="col-span-6">Item</div>
                <div className="col-span-3 text-center">QTY</div>
                <div className="col-span-3 text-right">Cost</div>
              </div>

              {cartItems.map((item) => (
                <div key={item.id} className="grid grid-cols-12 items-center text-xs py-1.5">
                  <div className="col-span-6 flex items-center space-x-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FE9F43]" />
                    <span className="truncate font-medium text-gray-800">{item.name}</span>
                  </div>

                  <div className="col-span-3 flex items-center justify-center space-x-1">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-4 h-4 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-[10px]"
                    >
                      -
                    </button>
                    <span className="font-bold text-gray-800 text-xs w-4 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-4 h-4 rounded bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-[10px]"
                    >
                      +
                    </button>
                  </div>

                  <div className="col-span-3 text-right font-bold text-gray-900">
                    ${(item.price * item.qty).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promotion / Discount Card (Purple) */}
          <div className="bg-[#F3E8FF] border border-[#D8B4FE] rounded-xl p-3 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#7367F0] text-white flex items-center justify-center flex-shrink-0">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-bold text-[#7367F0]">Discount 5%</p>
                <p className="text-[10px] text-gray-500">For $20 Minimum Purchase, all Items</p>
              </div>
            </div>
            <button
              onClick={() => alert("Promo removed")}
              className="text-gray-400 hover:text-red-500"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Payment Summary */}
          <div className="space-y-2 text-xs border-t border-gray-100 pt-3">
            <p className="font-bold text-gray-900 mb-1">Payment Summary</p>

            <div className="flex justify-between text-gray-600">
              <span className="flex items-center space-x-1">
                <span>Shipping</span>
                <Edit2 className="w-2.5 h-2.5 text-gray-400 cursor-pointer" />
              </span>
              <span className="font-medium text-gray-800">${shipping}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span className="flex items-center space-x-1">
                <span>Tax</span>
                <Edit2 className="w-2.5 h-2.5 text-gray-400 cursor-pointer" />
              </span>
              <span className="font-medium text-gray-800">${tax}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span className="flex items-center space-x-1">
                <span>Coupon</span>
                <Edit2 className="w-2.5 h-2.5 text-gray-400 cursor-pointer" />
              </span>
              <span className="font-medium text-gray-800">${coupon}</span>
            </div>

            <div className="flex justify-between text-red-500 font-medium">
              <span className="flex items-center space-x-1">
                <span>Discount</span>
                <Edit2 className="w-2.5 h-2.5 text-red-400 cursor-pointer" />
              </span>
              <span>-${discountVal}</span>
            </div>

            {/* Roundoff Switch */}
            <div className="flex justify-between items-center text-gray-600 pt-1">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setRoundoff(!roundoff)}
                  className={`w-7 h-4 flex items-center rounded-full p-0.5 cursor-pointer transition-colors ${
                    roundoff ? "bg-[#FE9F43]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-3 h-3 rounded-full shadow-md transform transition-transform ${
                      roundoff ? "translate-x-3" : "translate-x-0"
                    }`}
                  />
                </button>
                <span className="text-[11px] font-medium">Roundoff</span>
              </div>
              <span className="text-gray-800 font-medium">+{roundoffVal}</span>
            </div>

            <div className="flex justify-between text-gray-700 font-bold pt-1 border-t border-gray-100">
              <span>Sub Total</span>
              <span>${subtotal.toLocaleString()}</span>
            </div>

            {/* Total Payable Prominent */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-900">Total Payable</span>
              <span className="text-xl font-extrabold text-[#FE9F43]">
                ${Math.round(totalPayable).toLocaleString()}
              </span>
            </div>

            {/* Pay Now Button */}
            <button
              onClick={() => alert(`Processing Payment of $${Math.round(totalPayable).toLocaleString()}!`)}
              className="w-full py-3 bg-[#28C76F] hover:bg-[#22A75D] text-white rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center justify-center space-x-2 mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Pay Now (${Math.round(totalPayable).toLocaleString()})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Floating Cart Sticky Bar (Visible on < xl) */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl z-30 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <button
              onClick={() => setIsMobileCartOpen(true)}
              className="w-10 h-10 rounded-xl bg-[#FE9F43] hover:bg-[#E88B32] text-white flex items-center justify-center shadow-xs active:scale-95 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
            </button>
            {cartItems.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                {cartItems.reduce((sum, item) => sum + item.qty, 0)}
              </span>
            )}
          </div>
          <div>
            <p className="text-[11px] text-gray-500 font-medium">{cartItems.length} items in order</p>
            <p className="text-sm font-extrabold text-gray-900">
              Total: <span className="text-[#FE9F43]">${Math.round(totalPayable).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsMobileCartOpen(true)}
          className="px-4 py-2 bg-[#0E1422] hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all flex items-center space-x-1.5"
        >
          <span>View Cart</span>
          <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
        </button>
      </div>
    </div>
  );
}
