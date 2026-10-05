"use client";

import React, { useState, useEffect, useRef } from "react";
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
  VolumeX,
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
  Package,
  CreditCard,
  Banknote,
  FileText,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  History,
  Sparkles,
  Clock,
  ArrowRight,
  Receipt,
  Store as StoreIcon,
  Unlock,
  Lock,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Ticket,
  Percent,
  Gift,
  Loader2,
} from "lucide-react";
import { Product, Category, Customer, Order, PosShift, PosShiftMovement, PosShiftCurrentResponse, Coupon, CompanySettings, PosSettings, GiftCard } from "@/types";
import {
  fetchProducts,
  fetchCategories,
  fetchCustomers,
  createCustomerApi,
  createOrderApi,
  fetchOrders,
  fetchCurrentShift,
  openShiftApi,
  recordShiftMovementApi,
  closeShiftApi,
  fetchCoupons,
  fetchCompanySettings,
  fetchPosSettings,
  verifyGiftCardApi,
} from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface PosCartItem {
  id: string; // product id
  product: Product;
  qty: number;
  unitPrice: number;
}

interface HeldOrder {
  id: string;
  orderRef: string;
  items: PosCartItem[];
  customer: Customer | null;
  timestamp: string;
  subtotal: number;
  tax: number;
  discount: number;
  shipping: number;
  coupon: number;
  appliedCoupon?: Coupon | null;
}

export default function POSPage() {
  const { user } = useAuthStore();
  const cashierName = user?.name || "Admin Cashier";

  // Clock
  const [timeStr, setTimeStr] = useState<string>("00:00:00");

  // Data from DB
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);

  // Filters & State
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [selectedStore, setSelectedStore] = useState<string>("Electro Mart");
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState<boolean>(false);

  // Cart
  const [cartItems, setCartItems] = useState<PosCartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showApplyBonus, setShowApplyBonus] = useState<boolean>(true);
  const [bonusApplied, setBonusApplied] = useState<boolean>(false);

  // Modifiers
  const [shippingFee, setShippingFee] = useState<number>(0);
  const [taxPercent, setTaxPercent] = useState<number>(7); // VAT 7%
  const [couponDiscount, setCouponDiscount] = useState<number>(0);
  const [customDiscount, setCustomDiscount] = useState<number>(0);
  const [roundoff, setRoundoff] = useState<boolean>(true);

  // Coupon & Promo States
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [showCouponModal, setShowCouponModal] = useState<boolean>(false);
  const [inputCouponCode, setInputCouponCode] = useState<string>("");
  const [couponError, setCouponError] = useState<string>("");

  // System & POS Settings
  const [companySettings, setCompanySettings] = useState<CompanySettings | null>(null);
  const [posSettings, setPosSettings] = useState<PosSettings | null>(null);

  // Held Orders
  const [heldOrders, setHeldOrders] = useState<HeldOrder[]>([]);
  const [showHeldOrdersModal, setShowHeldOrdersModal] = useState<boolean>(false);

  // Modals
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "PROMPTPAY" | "CREDIT_CARD" | "GIFT_CARD">("CASH");
  const [cashReceived, setCashReceived] = useState<string>("");
  const [orderNotes, setOrderNotes] = useState<string>("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState<boolean>(false);

  // Gift Card Payment State
  const [giftCardCodeInput, setGiftCardCodeInput] = useState<string>("");
  const [verifiedGiftCard, setVerifiedGiftCard] = useState<GiftCard | null>(null);
  const [isVerifyingGiftCard, setIsVerifyingGiftCard] = useState<boolean>(false);
  const [giftCardError, setGiftCardError] = useState<string | null>(null);

  // Receipt Modal
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [lastPaymentInfo, setLastPaymentInfo] = useState<{
    method: string;
    received: number;
    change: number;
    giftCardCode?: string;
    giftCardDeduction?: number;
    giftCardRemaining?: number;
  } | null>(null);
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);

  // Quick Customer Modal
  const [showAddCustomerModal, setShowAddCustomerModal] = useState<boolean>(false);
  const [newCustName, setNewCustName] = useState<string>("");
  const [newCustPhone, setNewCustPhone] = useState<string>("");
  const [newCustEmail, setNewCustEmail] = useState<string>("");
  const [isSavingCustomer, setIsSavingCustomer] = useState<boolean>(false);

  // Barcode Scanner Modal
  const [showScannerModal, setShowScannerModal] = useState<boolean>(false);
  const [scannedBarcode, setScannedBarcode] = useState<string>("");

  // Orders / History Slide-over Modal
  const [showOrdersHistoryModal, setShowOrdersHistoryModal] = useState<boolean>(false);
  const [orderSearchQuery, setOrderSearchQuery] = useState<string>("");
  const [isRefreshingOrders, setIsRefreshingOrders] = useState<boolean>(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const handleRefreshRecentOrders = async () => {
    setIsRefreshingOrders(true);
    try {
      const ords = await fetchOrders();
      setRecentOrders(ords || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  // Quick Calculator Modal
  const [showCalculator, setShowCalculator] = useState<boolean>(false);
  const [calcDisplay, setCalcDisplay] = useState<string>("0");

  // Edit Modifiers Modal
  const [editingModifier, setEditingModifier] = useState<"shipping" | "tax" | "coupon" | "discount" | null>(null);
  const [modifierValue, setModifierValue] = useState<string>("");

  // Register Shift State
  const [currentShiftData, setCurrentShiftData] = useState<{
    hasActiveShift: boolean;
    shift: PosShift | null;
    liveMetrics?: any;
  }>({ hasActiveShift: false, shift: null });
  const [showShiftDropdown, setShowShiftDropdown] = useState<boolean>(false);
  const shiftDropdownRef = useRef<HTMLDivElement>(null);

  // Shift Modals State
  const [showOpenShiftModal, setShowOpenShiftModal] = useState<boolean>(false);
  const [openCashier, setOpenCashier] = useState<string>(cashierName);
  const [openFloat, setOpenFloat] = useState<number>(1000);
  const [openNotes, setOpenNotes] = useState<string>("");
  const [isOpeningShift, setIsOpeningShift] = useState<boolean>(false);

  const [showShiftMovementModal, setShowShiftMovementModal] = useState<boolean>(false);
  const [movementType, setMovementType] = useState<"PAY_IN" | "PAY_OUT">("PAY_IN");
  const [movementAmount, setMovementAmount] = useState<number>(100);
  const [movementReason, setMovementReason] = useState<string>("");
  const [isRecordingMovement, setIsRecordingMovement] = useState<boolean>(false);

  const [showCloseShiftModal, setShowCloseShiftModal] = useState<boolean>(false);
  const [closingCashCounted, setClosingCashCounted] = useState<number>(0);
  const [closeShiftNotes, setCloseShiftNotes] = useState<string>("");
  const [isClosingShift, setIsClosingShift] = useState<boolean>(false);

  // Z-Report Slip Modal
  const [selectedZReportShift, setSelectedZReportShift] = useState<PosShift | null>(null);

  // Feedback Modal
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "edit_success" | "delete_success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "add_success",
    title: "",
    message: "",
  });

  // Close shift dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shiftDropdownRef.current && !shiftDropdownRef.current.contains(event.target as Node)) {
        setShowShiftDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const refreshShiftData = async () => {
    try {
      const res = await fetchCurrentShift();
      setCurrentShiftData(res);
      if (res.hasActiveShift && res.liveMetrics) {
        setClosingCashCounted(res.liveMetrics.expectedCash || 0);
      }
    } catch (err) {
      console.error("Failed to load shift status:", err);
    }
  };

  const handleOpenShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsOpeningShift(true);
      const newShift = await openShiftApi({
        cashierName: openCashier || cashierName,
        openingFloat: Number(openFloat),
        notes: openNotes,
      });
      setShowOpenShiftModal(false);
      setShowShiftDropdown(false);
      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Shift Opened!",
        message: `Shift #${newShift.shiftNumber} opened with opening float ฿${newShift.openingFloat.toLocaleString()}.`,
      });
      playSound("chime");
      await refreshShiftData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Open Shift",
        message: err.message || "An error occurred while opening shift.",
      });
      playSound("error");
    } finally {
      setIsOpeningShift(false);
    }
  };

  const handleRecordMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShiftData.shift) return;
    try {
      setIsRecordingMovement(true);
      await recordShiftMovementApi({
        shiftId: currentShiftData.shift.id,
        type: movementType,
        amount: Number(movementAmount),
        reason: movementReason || (movementType === "PAY_IN" ? "Cash added" : "Cash dropped"),
      });
      setShowShiftMovementModal(false);
      setShowShiftDropdown(false);
      setMovementReason("");
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Cash Movement Recorded!",
        message: `Recorded ${movementType === "PAY_IN" ? "Pay In" : "Pay Out"} of ฿${Number(movementAmount).toLocaleString()} successfully.`,
      });
      playSound("beep");
      await refreshShiftData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Movement Failed",
        message: err.message || "Failed to record cash movement.",
      });
      playSound("error");
    } finally {
      setIsRecordingMovement(false);
    }
  };

  const handleCloseShiftSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentShiftData.shift) return;
    try {
      setIsClosingShift(true);
      const closedShift = await closeShiftApi({
        shiftId: currentShiftData.shift.id,
        closingCashCounted: Number(closingCashCounted),
        notes: closeShiftNotes,
      });
      setShowCloseShiftModal(false);
      setShowShiftDropdown(false);
      setSelectedZReportShift(closedShift);
      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Shift Closed Successfully!",
        message: `Shift #${closedShift.shiftNumber} closed. Cash Variance: ฿${(closedShift.cashVariance ?? 0).toLocaleString()}. You can now print the Z-Report slip.`,
      });
      playSound("chime");
      await refreshShiftData();
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Close Shift",
        message: err.message || "An error occurred while closing shift.",
      });
      playSound("error");
    } finally {
      setIsClosingShift(false);
    }
  };

  // Audio synthesizer via Web Audio API
  const playSound = (type: "beep" | "chime" | "error") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "beep") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime); // 880Hz A5
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === "chime") {
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.09);
          gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.09);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.09 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + i * 0.09);
          osc.stop(ctx.currentTime + i * 0.09 + 0.25);
        });
      } else if (type === "error") {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) {
      // AudioContext suppressed or not allowed
    }
  };

  // Clock
  useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      setTimeStr(now.toTimeString().split(" ")[0]);
    };
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  // Initial load
  const loadMasterData = async () => {
    try {
      setLoadingProducts(true);
      const [prodsData, catsData, custsData, ordersData, _shift, couponsData, companyData, posData] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchCustomers(),
        fetchOrders().catch(() => []),
        refreshShiftData().catch(() => null),
        fetchCoupons().catch(() => []),
        fetchCompanySettings().catch(() => null),
        fetchPosSettings().catch(() => null),
      ]);
      setProducts(prodsData || []);
      setCategories(catsData || []);
      setCustomers(custsData || []);
      setRecentOrders(ordersData || []);
      setCoupons(couponsData || []);
      if (companyData) setCompanySettings(companyData);
      if (posData) {
        setPosSettings(posData);
        if (posData.soundEffect !== undefined) setSoundEnabled(posData.soundEffect);
      }
    } catch (err) {
      console.error("Failed to load POS master data:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadMasterData();
  }, []);

  // Add to cart with live stock check
  const handleAddToCart = (product: Product, quantityToAdd: number = 1) => {
    if (product.stock <= 0) {
      playSound("error");
      alert(`"${product.name}" is out of stock!`);
      return;
    }

    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      const currentQty = existing ? existing.qty : 0;

      if (currentQty + quantityToAdd > product.stock) {
        playSound("error");
        alert(
          `Cannot add more than available stock (${product.stock} available, currently in cart: ${currentQty})`
        );
        return prev;
      }

      playSound("beep");
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + quantityToAdd } : item
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          product,
          qty: quantityToAdd,
          unitPrice: product.price,
        },
      ];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCartItems((prev) => {
      const item = prev.find((i) => i.id === productId);
      if (!item) return prev;

      const newQty = item.qty + delta;
      if (newQty <= 0) {
        return prev.filter((i) => i.id !== productId);
      }

      if (newQty > item.product.stock) {
        playSound("error");
        alert(`Maximum available stock is ${item.product.stock}`);
        return prev;
      }

      playSound("beep");
      return prev.map((i) => (i.id === productId ? { ...i, qty: newQty } : i));
    });
  };

  const removeCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    setBonusApplied(false);
    setAppliedCoupon(null);
    setCouponDiscount(0);
    setCustomDiscount(0);
  };

  // Barcode / SKU direct scan
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const matched = products.find(
        (p) =>
          (p.barcode && p.barcode.toLowerCase() === query) ||
          p.sku.toLowerCase() === query ||
          p.name.toLowerCase() === query
      );

      if (matched) {
        handleAddToCart(matched, 1);
        setSearchQuery("");
      } else {
        playSound("error");
      }
    }
  };

  // Dedicated Barcode Modal Scan
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scannedBarcode.trim()) return;

    const query = scannedBarcode.trim().toLowerCase();
    const matched = products.find(
      (p) =>
        (p.barcode && p.barcode.toLowerCase() === query) ||
        p.sku.toLowerCase() === query ||
        p.name.toLowerCase() === query
    );

    if (matched) {
      handleAddToCart(matched, 1);
      setScannedBarcode("");
      playSound("beep");
    } else {
      playSound("error");
      alert(`No product found with Barcode/SKU: ${scannedBarcode}`);
    }
  };

  // Math Calculations
  const rawSubtotal = cartItems.reduce((acc, item) => acc + item.unitPrice * item.qty, 0);
  const taxAmount = (rawSubtotal * taxPercent) / 100;
  const bonusDiscount = bonusApplied ? 20 : 0;
  const activeCouponDiscount = appliedCoupon
    ? appliedCoupon.type === "Percentage"
      ? (rawSubtotal * appliedCoupon.discount) / 100
      : Math.min(appliedCoupon.discount, rawSubtotal)
    : couponDiscount;
  const totalDiscount = customDiscount + activeCouponDiscount + bonusDiscount;
  const tentativeTotal = Math.max(0, rawSubtotal + taxAmount + shippingFee - totalDiscount);
  const roundoffDifference = roundoff ? Math.round(tentativeTotal) - tentativeTotal : 0;
  const finalPayable = Math.max(0, roundoff ? Math.round(tentativeTotal) : tentativeTotal);

  // Quick Cash presets (from POS settings if configured)
  const configuredQuickCash = posSettings?.quickCashAmounts
    ? posSettings.quickCashAmounts.split(",").map((v) => Number(v.trim())).filter((v) => !isNaN(v) && v > 0)
    : [100, 500, 1000, 2000, 5000];

  const quickCashOptions = [
    finalPayable,
    ...configuredQuickCash,
  ].filter((v, idx, arr) => (arr.indexOf(v) === idx && v >= finalPayable) || v === finalPayable);

  // Coupon Handlers
  const handleApplyCoupon = (couponCode: string) => {
    setCouponError("");
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponError("Please enter a coupon code");
      return;
    }
    if (cartItems.length === 0) {
      setCouponError("Cart is empty! Add products first");
      return;
    }

    const found = coupons.find((c) => c.code.toUpperCase() === code);
    if (!found) {
      setCouponError(`Invalid coupon code: "${code}"`);
      playSound("error");
      return;
    }

    if (found.status !== "Active") {
      setCouponError(`Coupon "${found.code}" is inactive`);
      playSound("error");
      return;
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (found.validStart && todayStr < found.validStart) {
      setCouponError(`Coupon "${found.code}" is not valid until ${found.validStart}`);
      playSound("error");
      return;
    }
    if (found.validEnd && todayStr > found.validEnd) {
      setCouponError(`Coupon "${found.code}" expired on ${found.validEnd}`);
      playSound("error");
      return;
    }

    // Apply
    setAppliedCoupon(found);
    setShowCouponModal(false);
    setInputCouponCode("");
    setCouponError("");
    playSound("chime");
    const discountVal =
      found.type === "Percentage"
        ? (rawSubtotal * found.discount) / 100
        : Math.min(found.discount, rawSubtotal);
    setFeedbackModal({
      isOpen: true,
      type: "add_success",
      title: "Coupon Applied!",
      message: `Coupon "${found.code}" (${found.name}) successfully applied for -฿${discountVal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
    playSound("beep");
  };

  // Hold Order
  const handleHoldOrder = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty! Nothing to hold.");
      return;
    }
    const newHold: HeldOrder = {
      id: "HOLD-" + Date.now(),
      orderRef: `#HLD${Math.floor(100 + Math.random() * 900)}`,
      items: [...cartItems],
      customer: selectedCustomer,
      timestamp: new Date().toLocaleTimeString(),
      subtotal: rawSubtotal,
      tax: taxAmount,
      discount: totalDiscount,
      shipping: shippingFee,
      coupon: activeCouponDiscount,
      appliedCoupon: appliedCoupon,
    };
    setHeldOrders((prev) => [newHold, ...prev]);
    clearCart();
    playSound("chime");
    alert(`Order ${newHold.orderRef} placed on Hold!`);
  };

  const handleResumeHeldOrder = (held: HeldOrder) => {
    setCartItems(held.items);
    setSelectedCustomer(held.customer);
    setShippingFee(held.shipping);
    setCouponDiscount(held.coupon);
    if (held.appliedCoupon) {
      setAppliedCoupon(held.appliedCoupon);
    }
    setHeldOrders((prev) => prev.filter((h) => h.id !== held.id));
    setShowHeldOrdersModal(false);
    playSound("beep");
  };

  // Gift Card Verification Handler
  const handleVerifyGiftCard = async () => {
    if (!giftCardCodeInput.trim()) {
      setGiftCardError("Please enter a gift card code.");
      return;
    }
    try {
      setIsVerifyingGiftCard(true);
      setGiftCardError(null);
      const card = await verifyGiftCardApi(giftCardCodeInput.trim());
      setVerifiedGiftCard(card);
      playSound("beep");
    } catch (err: any) {
      setVerifiedGiftCard(null);
      setGiftCardError(err.message || "Invalid or inactive gift card.");
      playSound("error");
    } finally {
      setIsVerifyingGiftCard(false);
    }
  };

  // Checkout / Pay
  const handleProceedPayment = async () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const receivedNum = Number(cashReceived) || finalPayable;
    if (paymentMethod === "CASH" && receivedNum < finalPayable) {
      alert("Received cash amount cannot be less than total payable!");
      return;
    }

    if (paymentMethod === "GIFT_CARD") {
      if (!verifiedGiftCard) {
        setGiftCardError("Please enter and verify a valid gift card before checkout.");
        return;
      }
      if (verifiedGiftCard.balance <= 0) {
        setGiftCardError("This gift card has no remaining balance.");
        return;
      }
    }

    try {
      setIsSubmittingOrder(true);
      let noteContent = orderNotes || `POS Sale at ${selectedStore}`;
      if (appliedCoupon) {
        noteContent += ` [Coupon: ${appliedCoupon.code} (-฿${activeCouponDiscount.toFixed(2)})]`;
      }

      const payload = {
        items: cartItems.map((i) => ({
          productId: i.id,
          quantity: i.qty,
        })),
        customerId: selectedCustomer?.id || null,
        discount: totalDiscount,
        tax: taxAmount,
        paymentMethod: paymentMethod,
        cashierName: cashierName,
        notes: noteContent,
        giftCardCode: paymentMethod === "GIFT_CARD" ? verifiedGiftCard?.code : undefined,
      };

      const createdOrder = await createOrderApi(payload);

      // Play success chime
      playSound("chime");

      const deduction = verifiedGiftCard ? Math.min(verifiedGiftCard.balance, finalPayable) : 0;
      const remaining = verifiedGiftCard ? Math.max(0, verifiedGiftCard.balance - finalPayable) : 0;

      // Save info for receipt
      setCompletedOrder(createdOrder);
      setLastPaymentInfo({
        method: paymentMethod === "GIFT_CARD" ? "GIFT CARD / VOUCHER" : paymentMethod,
        received: paymentMethod === "CASH" ? receivedNum : finalPayable,
        change: paymentMethod === "CASH" ? Math.max(0, receivedNum - finalPayable) : 0,
        giftCardCode: verifiedGiftCard?.code,
        giftCardDeduction: deduction,
        giftCardRemaining: remaining,
      });

      // Refresh product list to sync live stock from SQLite and drawer cash
      fetchProducts().then((p) => setProducts(p || []));
      fetchOrders().then((o) => setRecentOrders(o || []));
      refreshShiftData();

      // Reset cart & close payment modal, open receipt modal
      clearCart();
      setShowPaymentModal(false);
      setCashReceived("");
      setOrderNotes("");
      setVerifiedGiftCard(null);
      setGiftCardCodeInput("");
      setGiftCardError(null);
      setShowReceiptModal(true);
    } catch (err: any) {
      console.error(err);
      playSound("error");
      alert(err.message || "Failed to process sale");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Quick Add Customer
  const handleSaveQuickCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim()) {
      alert("Please enter customer name");
      return;
    }
    try {
      setIsSavingCustomer(true);
      const nextCode = `CU${String(customers.length + 1).padStart(3, "0")}`;
      const newCust = await createCustomerApi({
        name: newCustName.trim(),
        code: nextCode,
        phone: newCustPhone.trim() || undefined,
        email: newCustEmail.trim() || undefined,
        status: "ACTIVE",
      });
      setCustomers((prev) => [newCust, ...prev]);
      setSelectedCustomer(newCust);
      setShowAddCustomerModal(false);
      setNewCustName("");
      setNewCustPhone("");
      setNewCustEmail("");
      playSound("beep");
    } catch (err: any) {
      alert(err.message || "Failed to add customer");
    } finally {
      setIsSavingCustomer(false);
    }
  };

  // Calculator logic
  const handleCalcInput = (val: string) => {
    if (val === "C") {
      setCalcDisplay("0");
    } else if (val === "=") {
      try {
        // Safe evaluation of basic math expressions
        const sanitized = calcDisplay.replace(/[^0-9+\-*/.]/g, "");
        const result = Function(`'use strict'; return (${sanitized})`)();
        setCalcDisplay(String(result));
      } catch {
        setCalcDisplay("Error");
      }
    } else if (val === "DEL") {
      setCalcDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : "0"));
    } else {
      setCalcDisplay((prev) => (prev === "0" || prev === "Error" ? val : prev + val));
    }
  };

  // Modifiers edit handler
  const handleOpenModifierModal = (type: "shipping" | "tax" | "coupon" | "discount") => {
    setEditingModifier(type);
    if (type === "shipping") setModifierValue(String(shippingFee));
    if (type === "tax") setModifierValue(String(taxPercent));
    if (type === "coupon") setModifierValue(String(couponDiscount));
    if (type === "discount") setModifierValue(String(customDiscount));
  };

  const handleSaveModifier = () => {
    const val = Number(modifierValue) || 0;
    if (editingModifier === "shipping") setShippingFee(val);
    if (editingModifier === "tax") setTaxPercent(val);
    if (editingModifier === "coupon") setCouponDiscount(val);
    if (editingModifier === "discount") setCustomDiscount(val);
    setEditingModifier(null);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      activeCategory === "All" ||
      (p.category && p.category.name === activeCategory) ||
      (typeof p.categoryId === "string" && p.categoryId === activeCategory);

    const matchesSearch =
      searchQuery === "" ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesBrand = selectedBrand === "All" || (p.brand && p.brand.name === selectedBrand);

    return matchesCat && matchesSearch && matchesBrand;
  });

  return (
    <div className="h-screen bg-[#F4F6F9] flex flex-col font-sans select-none text-slate-800 overflow-hidden">
      {/* 1. TOP NAVBAR HEADER */}
      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-3 sm:px-5 sticky top-0 z-30 shadow-2xs shrink-0">
        {/* Brand Logo & Live Time Badge & Shift Status */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FE9F43] to-[#FF8008] flex items-center justify-center text-white font-black text-sm shadow-xs group-hover:scale-105 transition-transform">
              A
            </div>
            <span className="font-extrabold text-slate-900 text-lg tracking-tight">
              ABC <span className="text-[#FE9F43]">POS</span>
            </span>
          </Link>

          {/* Live Clock Pill */}
          <div className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="font-mono">{timeStr}</span>
          </div>

          {/* Shift Status Indicator & Action Dropdown */}
          <div className="relative" ref={shiftDropdownRef}>
            {currentShiftData.hasActiveShift && currentShiftData.shift ? (
              <button
                onClick={() => setShowShiftDropdown(!showShiftDropdown)}
                className="flex items-center space-x-2 px-2.5 sm:px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Shift Active - Click for Cash Drawer Actions"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">Shift #{currentShiftData.shift.shiftNumber}</span>
                <span className="hidden md:inline text-emerald-700 font-extrabold border-l border-emerald-300 pl-1.5">
                  ฿{(currentShiftData.liveMetrics?.expectedCash ?? currentShiftData.shift.openingFloat).toLocaleString()}
                </span>
                <ChevronDown className="w-3 h-3 text-emerald-600" />
              </button>
            ) : (
              <button
                onClick={() => {
                  setOpenCashier(cashierName);
                  setOpenFloat(1000);
                  setShowOpenShiftModal(true);
                }}
                className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1 bg-amber-50 text-amber-700 border border-amber-300 hover:bg-amber-100 rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer animate-pulse"
                title="No active register shift - Click to open shift"
              >
                <Unlock className="w-3.5 h-3.5 text-amber-600" />
                <span>+ Open Shift</span>
              </button>
            )}

            {/* Shift Dropdown Menu */}
            {showShiftDropdown && currentShiftData.shift && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3.5 py-2 border-b border-gray-100 bg-gray-50/70 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-gray-900">
                      Shift #{currentShiftData.shift.shiftNumber}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-300">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Cashier: <span className="font-semibold text-gray-700">{currentShiftData.shift.cashierName}</span>
                  </p>
                </div>

                {/* Drawer Summary */}
                <div className="px-3.5 py-2.5 space-y-1.5 text-xs border-b border-gray-100">
                  <div className="flex justify-between text-gray-600">
                    <span>Opening Float:</span>
                    <span className="font-bold text-gray-900">
                      ฿{currentShiftData.shift.openingFloat.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Cash Sales:</span>
                    <span className="font-bold text-emerald-600">
                      +฿{(currentShiftData.liveMetrics?.cashSales ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Pay In / Out:</span>
                    <span className="font-bold text-gray-900">
                      +฿{(currentShiftData.liveMetrics?.totalPayIn ?? 0).toLocaleString()} / -฿{(currentShiftData.liveMetrics?.totalPayOut ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold pt-1.5 border-t border-dashed border-gray-200">
                    <span>Expected in Drawer:</span>
                    <span className="text-emerald-700 font-black text-sm">
                      ฿{(currentShiftData.liveMetrics?.expectedCash ?? 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1.5 space-y-1">
                  <button
                    onClick={() => {
                      setShowShiftDropdown(false);
                      setMovementType("PAY_IN");
                      setMovementAmount(100);
                      setShowShiftMovementModal(true);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                    <span>Cash In / Out (Pay In/Out)</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowShiftDropdown(false);
                      setSelectedZReportShift(currentShiftData.shift);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-blue-600" />
                    <span>View / Print Shift Summary</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowShiftDropdown(false);
                      setClosingCashCounted(currentShiftData.liveMetrics?.expectedCash ?? 0);
                      setShowCloseShiftModal(true);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl text-left transition-colors cursor-pointer"
                  >
                    <Lock className="w-4 h-4 text-rose-600" />
                    <span>Close Shift & Reconcile</span>
                  </button>

                  <div className="pt-1 border-t border-gray-100">
                    <Link
                      href="/sales/shifts"
                      className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-gray-500 hover:text-gray-900 rounded-lg transition-colors"
                    >
                      <span>All Shifts & Drawer Audit</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Actions Toolbar */}
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          {/* Dashboard Button */}
          <Link
            href="/"
            className="flex items-center space-x-1 px-3 py-1.5 bg-[#7367F0] hover:bg-[#685DD8] text-white rounded-lg text-xs font-semibold shadow-xs transition-all"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Dashboard</span>
          </Link>

          {/* Recent Orders & Reprint Button */}
          <button
            onClick={() => {
              handleRefreshRecentOrders();
              setShowOrdersHistoryModal(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer"
            title="Recent Orders & Reprint Receipt"
          >
            <Receipt className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Recent Orders</span>
            {recentOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-black">
                {recentOrders.length}
              </span>
            )}
          </button>

          {/* Store Selector */}
          <div className="relative hidden md:block">
            <button
              onClick={() => {
                const nextStore = selectedStore === "Electro Mart" ? "Prime Mart" : "Electro Mart";
                setSelectedStore(nextStore);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
              title="Click to switch store"
            >
              <StoreIcon className="w-3.5 h-3.5" />
              <span>{selectedStore}</span>
            </button>
          </div>

          {/* Quick Calculator */}
          <button
            onClick={() => setShowCalculator(!showCalculator)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-xs ${
              showCalculator ? "bg-[#FE9F43] text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
            title="Calculator"
          >
            <Calculator className="w-4 h-4" />
          </button>

          {/* Barcode Scanner Modal trigger */}
          <button
            onClick={() => setShowScannerModal(true)}
            className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center transition-colors shadow-xs"
            title="Scan Barcode"
          >
            <QrCode className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
            title={soundEnabled ? "Mute Sound" : "Enable Sound"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(() => {});
              } else {
                document.exitFullscreen().catch(() => {});
              }
            }}
            className="hidden sm:flex w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 items-center justify-center transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Held Orders Quick Badge */}
          {heldOrders.length > 0 && (
            <button
              onClick={() => setShowHeldOrdersModal(true)}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-bold animate-pulse shadow-xs cursor-pointer"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>Held ({heldOrders.length})</span>
            </button>
          )}

          {/* Cashier Avatar */}
          <div className="flex items-center space-x-2 pl-2 border-l border-gray-200">
            <div className="w-8 h-8 rounded-full bg-[#FE9F43]/15 text-[#FE9F43] font-bold text-xs flex items-center justify-center border border-[#FE9F43]/30">
              {cashierName.charAt(0)}
            </div>
            <div className="hidden lg:block text-left text-xs leading-tight">
              <p className="font-bold text-gray-900 truncate max-w-[100px]">{cashierName}</p>
              <p className="text-[10px] text-gray-400">Cashier</p>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN POS BODY */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Category Rail (Desktop) */}
        <div className="hidden md:flex w-20 bg-white border-r border-gray-200 flex-col items-center py-3 space-y-2 flex-shrink-0 overflow-y-auto">
          <button
            onClick={() => setActiveCategory("All")}
            className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center space-y-1 text-[10px] font-bold transition-all cursor-pointer ${
              activeCategory === "All"
                ? "bg-[#FFF5ED] text-[#FE9F43] border-2 border-[#FE9F43] shadow-xs"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Package className="w-4 h-4" />
            <span className="truncate max-w-[48px]">All</span>
          </button>

          {categories.map((cat) => {
            const isActive = activeCategory === cat.name;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center space-y-1 text-[10px] font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#FFF5ED] text-[#FE9F43] border-2 border-[#FE9F43] shadow-xs"
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={cat.name}
              >
                <Tag className="w-4 h-4" />
                <span className="truncate max-w-[48px]">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Center Product Catalog Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
          {/* Welcome Bar & Search Filters (Fixed Top) */}
          <div className="p-3 sm:p-4 pb-2.5 shrink-0 space-y-2.5 bg-[#F4F6F9] border-b border-gray-200/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  POS Terminal &bull; <span className="text-[#FE9F43]">{selectedStore}</span>
                </h2>
                <p className="text-xs text-gray-400">
                  {products.length} Products in catalog &bull; {filteredProducts.length} Showing
                </p>
              </div>

              <div className="flex items-center space-x-2 flex-wrap sm:flex-nowrap gap-y-2">
                {/* Real-time search & barcode input */}
                <div className="relative flex-1 sm:w-64 min-w-[200px]">
                  <input
                    type="text"
                    placeholder="Scan Barcode or Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    className="w-full pl-8 pr-8 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#FE9F43] text-gray-800 shadow-2xs"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Reset filter */}
                {(activeCategory !== "All" || searchQuery) && (
                  <button
                    onClick={() => {
                      setActiveCategory("All");
                      setSearchQuery("");
                    }}
                    className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mobile Category Horizontal Pills */}
            <div className="flex md:hidden items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setActiveCategory("All")}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeCategory === "All" ? "bg-[#FE9F43] text-white shadow-xs" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                <span>All Products</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.name)}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                    activeCategory === cat.name ? "bg-[#FE9F43] text-white shadow-xs" : "bg-white text-gray-600 border border-gray-200"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Product Cards Grid */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 pb-24 xl:pb-4">
            {loadingProducts ? (
              <div className="flex-1 flex items-center justify-center p-12">
                <div className="text-center space-y-2">
                  <div className="w-8 h-8 border-3 border-[#FE9F43] border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-gray-500 font-medium">Loading products from database...</p>
                </div>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex-1 flex items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 border-dashed">
                <div className="text-center space-y-2 max-w-xs">
                  <Package className="w-10 h-10 text-gray-300 mx-auto" />
                  <h4 className="text-sm font-bold text-gray-800">No products found</h4>
                  <p className="text-xs text-gray-400">
                    Try adjusting your search query or select another category.
                  </p>
                  <button
                    onClick={() => {
                      setActiveCategory("All");
                      setSearchQuery("");
                    }}
                    className="px-3 py-1.5 bg-[#FE9F43] text-white rounded-lg text-xs font-bold"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {filteredProducts.map((p) => {
                  const inCart = cartItems.find((i) => i.id === p.id);
                  const isOutOfStock = p.stock <= 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOutOfStock && handleAddToCart(p, 1)}
                      className={`bg-white rounded-2xl p-3 sm:p-4 border transition-all duration-150 flex flex-col justify-between relative select-none ${
                        isOutOfStock
                          ? "opacity-60 border-gray-200 cursor-not-allowed bg-gray-50/50"
                          : inCart
                          ? "border-[#28C76F] ring-2 ring-[#28C76F]/20 cursor-pointer shadow-xs"
                          : "border-gray-200 hover:border-[#FE9F43] hover:shadow-sm cursor-pointer"
                      }`}
                    >
                      {/* Badge for In-cart qty or Out of Stock */}
                      {isOutOfStock ? (
                        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-2xs">
                          Out of Stock
                        </span>
                      ) : inCart ? (
                        <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#28C76F] text-white flex items-center space-x-1 text-[10px] font-bold shadow-2xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{inCart.qty} in cart</span>
                        </div>
                      ) : (
                        <span className="absolute top-2.5 right-2.5 px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 text-[10px] font-medium">
                          Stock: {p.stock}
                        </span>
                      )}

                      {/* Product Thumbnail */}
                      <div className="w-full aspect-square rounded-xl bg-gray-50 flex items-center justify-center p-2 mb-2 relative overflow-hidden">
                        <img
                          src={p.image || "/assets/images/product-01.jpg"}
                          alt={p.name}
                          className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform hover:scale-105"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "/assets/images/product-01.jpg";
                          }}
                        />
                      </div>

                      {/* Product Meta */}
                      <div className="space-y-0.5">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 uppercase font-medium">
                          <span className="truncate">{p.category?.name || "General"}</span>
                          <span className="font-mono">{p.sku}</span>
                        </div>
                        <h3 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight" title={p.name}>
                          {p.name}
                        </h3>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-xs font-extrabold text-[#FE9F43]">
                          ${p.price.toLocaleString()}
                        </span>

                        {!isOutOfStock && inCart && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center space-x-1 bg-gray-100 px-1.5 py-0.5 rounded-lg border border-gray-200"
                          >
                            <button
                              onClick={() => updateCartQty(p.id, -1)}
                              className="w-5 h-5 rounded hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="text-xs font-bold text-gray-900 px-1">{inCart.qty}</span>
                            <button
                              onClick={() => updateCartQty(p.id, 1)}
                              className="w-5 h-5 rounded hover:bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        )}

                        {!isOutOfStock && !inCart && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToCart(p, 1);
                            }}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-[#FE9F43] hover:text-white text-gray-700 rounded-lg text-[11px] font-bold transition-colors"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* PINNED BOTTOM ACTION BUTTONS (Hold, Void, Payment, Orders, Reset, History) */}
          <div className="p-2.5 sm:p-3 bg-white border-t border-gray-200 shrink-0 shadow-md z-10">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {/* Hold Button */}
              <button
                onClick={handleHoldOrder}
                disabled={cartItems.length === 0}
                className="py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center space-x-1"
              >
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Hold</span>
              </button>

              {/* Void Button */}
              <button
                onClick={() => {
                  if (cartItems.length === 0) return;
                  if (confirm("Are you sure you want to void this current order?")) {
                    clearCart();
                    playSound("error");
                  }
                }}
                disabled={cartItems.length === 0}
                className="py-2.5 bg-[#007BFF] hover:bg-[#0069D9] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center space-x-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Void</span>
              </button>

              {/* Payment Button */}
              <button
                onClick={() => {
                  if (cartItems.length === 0) {
                    alert("Please add items to cart first!");
                    return;
                  }
                  setShowPaymentModal(true);
                }}
                disabled={cartItems.length === 0}
                className="py-2.5 bg-[#00CFE8] hover:bg-[#00BCD4] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center space-x-1"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Payment</span>
              </button>

              {/* Orders Modal Button */}
              <button
                onClick={() => setShowOrdersHistoryModal(true)}
                className="py-2.5 bg-[#1E293B] hover:bg-black text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Orders</span>
              </button>

              {/* Reset Button */}
              <button
                onClick={() => {
                  if (cartItems.length > 0 && confirm("Reset current order?")) {
                    clearCart();
                  }
                }}
                className="py-2.5 bg-[#5C60F5] hover:bg-[#4E52E0] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center space-x-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>

              {/* Transactions History */}
              <button
                onClick={() => setShowOrdersHistoryModal(true)}
                className="py-2.5 bg-[#EA5455] hover:bg-[#D9383A] text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all text-center cursor-pointer flex items-center justify-center space-x-1"
              >
                <History className="w-3.5 h-3.5" />
                <span>History</span>
              </button>
            </div>
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
          className={`fixed inset-y-0 right-0 z-40 w-full sm:w-[420px] xl:static xl:w-96 bg-white border-l border-gray-200 flex flex-col shadow-sm overflow-hidden flex-shrink-0 transition-transform duration-200 h-full ${
            isMobileCartOpen ? "translate-x-0 shadow-2xl" : "translate-x-full xl:translate-x-0"
          }`}
        >
          {/* Top: Order Header & Customer Selection (Fixed Top / Shrink-0) */}
          <div className="p-3.5 pb-2.5 shrink-0 border-b border-gray-100 space-y-2.5 bg-white">
            {/* Order Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-gray-900 text-sm">Order List</h3>
                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-white text-[10px] font-mono font-bold">
                  {cartItems.length} Items
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    title="Clear Cart"
                    className="w-7 h-7 rounded bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

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
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-800">Customer</p>
                {selectedCustomer && (
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="text-[10px] text-gray-400 hover:text-red-500 cursor-pointer"
                  >
                    Clear customer
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-1.5">
                <div className="relative flex-1">
                  <select
                    value={selectedCustomer ? selectedCustomer.id : "walk-in"}
                    onChange={(e) => {
                      const id = e.target.value;
                      if (id === "walk-in") {
                        setSelectedCustomer(null);
                      } else {
                        const matched = customers.find((c) => c.id === id);
                        setSelectedCustomer(matched || null);
                      }
                    }}
                    className="w-full appearance-none bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-800 font-medium focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
                  >
                    <option value="walk-in">&bull; Walk-in Customer</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.phone ? `(${c.phone})` : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3 h-3 text-gray-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* Add Customer Quick Button */}
                <button
                  onClick={() => setShowAddCustomerModal(true)}
                  title="Add New Customer"
                  className="w-8 h-8 rounded-lg bg-[#28C76F] hover:bg-[#22A75D] text-white flex items-center justify-center flex-shrink-0 shadow-2xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Barcode scanner trigger */}
                <button
                  onClick={() => setShowScannerModal(true)}
                  title="Scan Barcode"
                  className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-2xs cursor-pointer"
                >
                  <QrCode className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Customer Bonus Banner */}
              {selectedCustomer && showApplyBonus && (
                <div className="bg-[#FFF5ED] border border-[#FFD8B2] rounded-xl p-2 flex items-center justify-between text-xs relative mt-1.5">
                  <div>
                    <p className="font-bold text-gray-900 leading-tight">{selectedCustomer.name}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-[10px] text-gray-500">
                        Points: <span className="font-bold text-cyan-600">140 pts</span>
                      </span>
                      <span className="text-[10px] text-gray-500">
                        Loyalty: <span className="font-bold text-emerald-600">$20 Off</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setBonusApplied(!bonusApplied);
                        playSound("beep");
                      }}
                      className={`px-2 py-0.5 text-[10px] font-bold rounded shadow-2xs transition-colors cursor-pointer ${
                        bonusApplied
                          ? "bg-emerald-600 text-white"
                          : "bg-[#FE9F43] hover:bg-[#E88B32] text-white"
                      }`}
                    >
                      {bonusApplied ? "Applied ✓" : "Apply $20"}
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
          </div>

          {/* Middle: Cart Items List (Scrollable flex-1) */}
          <div className="flex-1 overflow-y-auto p-3.5 py-2 space-y-1.5 min-h-0 bg-white">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-bold text-gray-900">Order Items</span>
              <span className="text-[11px] text-gray-500">
                Total Qty: {cartItems.reduce((acc, i) => acc + i.qty, 0)}
              </span>
            </div>

            {cartItems.length === 0 ? (
              <div className="h-full min-h-[140px] flex flex-col items-center justify-center p-6 border border-dashed border-gray-200 rounded-xl text-center space-y-2">
                <ShoppingCart className="w-8 h-8 text-gray-300" />
                <p className="text-xs font-medium text-gray-400">Cart is empty</p>
                <p className="text-[10px] text-gray-400">Click products or scan barcode to add</p>
              </div>
            ) : (
              <div className="space-y-1.5 divide-y divide-gray-50">
                <div className="grid grid-cols-12 text-[10px] font-bold text-gray-400 pb-1">
                  <div className="col-span-6">ITEM</div>
                  <div className="col-span-3 text-center">QTY</div>
                  <div className="col-span-3 text-right">TOTAL</div>
                </div>

                {cartItems.map((item) => (
                  <div key={item.id} className="grid grid-cols-12 items-center text-xs py-1.5">
                    <div className="col-span-6 pr-2 truncate">
                      <p className="font-bold text-gray-800 truncate leading-tight">{item.product.name}</p>
                      <p className="text-[10px] text-gray-400">
                        ฿{item.unitPrice.toLocaleString()} each
                      </p>
                    </div>

                    <div className="col-span-3 flex items-center justify-center space-x-1">
                      <button
                        onClick={() => updateCartQty(item.id, -1)}
                        className="w-4 h-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-gray-800 text-xs w-4 text-center">{item.qty}</span>
                      <button
                        onClick={() => updateCartQty(item.id, 1)}
                        className="w-4 h-4 rounded bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="col-span-3 text-right font-bold text-gray-900 flex items-center justify-end space-x-1">
                      <span>฿{(item.unitPrice * item.qty).toLocaleString()}</span>
                      <button
                        onClick={() => removeCartItem(item.id)}
                        className="text-gray-300 hover:text-red-500 ml-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom: PINNED PAYMENT SUMMARY & PAY NOW BUTTON (Fixed Bottom / Shrink-0) */}
          <div className="p-3.5 pt-2.5 bg-gray-50/95 border-t border-gray-200 shrink-0 space-y-1.5 shadow-sm">
            {/* Promotion / Active Discount Indicator */}
            {bonusApplied && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5">
                  <Tag className="w-3 h-3 text-emerald-600" />
                  <span className="font-bold text-emerald-800 text-[11px]">Customer Loyalty applied</span>
                </div>
                <span className="font-bold text-emerald-600 text-[11px]">-฿20.00</span>
              </div>
            )}

            {/* Applied Coupon Banner */}
            {appliedCoupon ? (
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 truncate">
                  <Ticket className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold text-emerald-900 text-xs truncate">
                    {appliedCoupon.code}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700 font-bold shrink-0">
                    {appliedCoupon.type === "Percentage" ? `${appliedCoupon.discount}% OFF` : `฿${appliedCoupon.discount} OFF`}
                  </span>
                </div>
                <div className="flex items-center space-x-1 shrink-0 ml-1">
                  <span className="font-black text-emerald-700 text-xs">
                    -฿{activeCouponDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="p-1 rounded-md text-gray-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Remove Coupon"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : null}

            {/* Payment Summary */}
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>Shipping</span>
                  <Edit2
                    onClick={() => handleOpenModifierModal("shipping")}
                    className="w-2.5 h-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  />
                </span>
                <span className="font-medium text-gray-800">฿{shippingFee.toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>Tax (VAT {taxPercent}%)</span>
                  <Edit2
                    onClick={() => handleOpenModifierModal("tax")}
                    className="w-2.5 h-2.5 text-gray-400 hover:text-gray-700 cursor-pointer"
                  />
                </span>
                <span className="font-medium text-gray-800">฿{taxAmount.toFixed(2)}</span>
              </div>

              {/* Coupon Row */}
              {!appliedCoupon && (
                <div className="flex justify-between items-center text-gray-600">
                  <span className="flex items-center space-x-1">
                    <span>Coupon / Promo</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCouponError("");
                      setInputCouponCode("");
                      setShowCouponModal(true);
                    }}
                    className="flex items-center space-x-1 text-[11px] font-bold text-[#FE9F43] hover:text-[#E88B32] cursor-pointer"
                  >
                    <Ticket className="w-3 h-3" />
                    <span>+ Apply Coupon</span>
                  </button>
                </div>
              )}

              <div className="flex justify-between text-rose-500 font-medium">
                <span className="flex items-center space-x-1">
                  <span>Custom Discount</span>
                  <Edit2
                    onClick={() => handleOpenModifierModal("discount")}
                    className="w-2.5 h-2.5 text-rose-400 hover:text-rose-700 cursor-pointer"
                  />
                </span>
                <span>-฿{(customDiscount + bonusDiscount).toFixed(2)}</span>
              </div>

              {/* Roundoff Switch */}
              <div className="flex justify-between items-center text-gray-600 pt-0.5">
                <div className="flex items-center space-x-1.5">
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
                <span className="text-gray-800 font-medium text-[11px]">
                  {roundoffDifference >= 0 ? `+฿${roundoffDifference.toFixed(2)}` : `-฿${Math.abs(roundoffDifference).toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between text-gray-700 font-bold pt-1 border-t border-gray-200">
                <span>Subtotal</span>
                <span>฿{rawSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>

              {/* Total Payable Prominent */}
              <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                <span className="text-sm font-bold text-gray-900">Total Payable</span>
                <span className="text-xl font-black text-[#FE9F43]">
                  ฿{finalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              {/* Pay Now Button */}
              <button
                onClick={() => {
                  if (cartItems.length === 0) {
                    alert("Please add items to cart!");
                    return;
                  }
                  setShowPaymentModal(true);
                }}
                disabled={cartItems.length === 0}
                className="w-full py-2.5 bg-[#28C76F] hover:bg-[#22A75D] disabled:opacity-50 text-white rounded-xl font-bold text-sm shadow-md active:scale-98 transition-all flex items-center justify-center space-x-2 mt-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Pay Now (฿{finalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})</span>
              </button>
            </div>
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
              Total: <span className="text-[#FE9F43]">฿{finalPayable.toLocaleString()}</span>
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

      {/* ========================================================================= */}
      {/* 4. MODALS & POPUPS                                                        */}
      {/* ========================================================================= */}

      {/* --- PAYMENT MODAL --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
              <div>
                <h3 className="text-base font-bold text-gray-900">Complete Payment</h3>
                <p className="text-xs text-gray-500">Order for {selectedCustomer?.name || "Walk-in Customer"}</p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="w-7 h-7 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Total Due Banner */}
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl p-4 text-center shadow-xs">
                <p className="text-xs font-medium text-white/80 uppercase tracking-wider">Total Amount Due</p>
                <p className="text-3xl font-black mt-0.5">฿{finalPayable.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>

              {/* Payment Method Selector Tabs */}
              <div>
                <label className="text-xs font-bold text-gray-700 mb-1.5 block">Payment Method</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CASH")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === "CASH"
                        ? "border-[#FE9F43] bg-orange-50/50 text-[#FE9F43] ring-1 ring-[#FE9F43]"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <Banknote className="w-5 h-5" />
                    <span>Cash</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("PROMPTPAY")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === "PROMPTPAY"
                        ? "border-[#00CFE8] bg-cyan-50/50 text-[#00CFE8] ring-1 ring-[#00CFE8]"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>PromptPay QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("CREDIT_CARD")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === "CREDIT_CARD"
                        ? "border-[#7367F0] bg-purple-50/50 text-[#7367F0] ring-1 ring-[#7367F0]"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Credit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod("GIFT_CARD")}
                    className={`py-3 px-2 rounded-xl border flex flex-col items-center justify-center space-y-1 font-bold text-xs transition-all cursor-pointer ${
                      paymentMethod === "GIFT_CARD"
                        ? "border-amber-500 bg-amber-50/60 text-amber-700 ring-1 ring-amber-500"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    <Gift className="w-5 h-5 text-amber-500" />
                    <span>Gift Card</span>
                  </button>
                </div>
              </div>

              {/* Cash Mode Details */}
              {paymentMethod === "CASH" && (
                <div className="space-y-3 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Cash Received</label>
                    <input
                      type="number"
                      placeholder={`Enter amount (Min ฿${finalPayable})`}
                      value={cashReceived}
                      onChange={(e) => setCashReceived(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#FE9F43]"
                    />
                  </div>

                  {/* Quick Cash Presets */}
                  <div className="flex flex-wrap gap-1.5">
                    {quickCashOptions.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setCashReceived(String(amt))}
                        className="px-2.5 py-1 bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 rounded-lg text-xs font-semibold text-gray-700 transition-colors"
                      >
                        ฿{amt}
                      </button>
                    ))}
                  </div>

                  {/* Change calculation */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs font-bold text-gray-600">Change Due (เงินทอน):</span>
                    <span className="text-base font-extrabold text-emerald-600">
                      ฿{Math.max(0, (Number(cashReceived) || finalPayable) - finalPayable).toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {/* QR Code Mode */}
              {paymentMethod === "PROMPTPAY" && (
                <div className="bg-cyan-50/60 border border-cyan-200 rounded-xl p-4 text-center space-y-2">
                  <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl border border-cyan-100 flex items-center justify-center shadow-xs">
                    <div className="w-full h-full border-2 border-dashed border-cyan-400 rounded-lg flex flex-col items-center justify-center">
                      <QrCode className="w-16 h-16 text-cyan-600" />
                      <span className="text-[10px] font-bold text-cyan-700 mt-1">PromptPay Scan</span>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-cyan-900">Scan QR Code with Mobile Banking App</p>
                  <p className="text-[11px] text-cyan-600">Total: ฿{finalPayable.toFixed(2)}</p>
                </div>
              )}

              {/* Credit Card Mode */}
              {paymentMethod === "CREDIT_CARD" && (
                <div className="bg-purple-50/60 border border-purple-200 rounded-xl p-4 text-center space-y-2">
                  <CreditCard className="w-10 h-10 text-purple-600 mx-auto" />
                  <p className="text-xs font-bold text-purple-900">Tap or Swipe Card on EDC Terminal</p>
                  <p className="text-[11px] text-purple-600">Supports VISA, Mastercard, JCB, UnionPay</p>
                </div>
              )}

              {/* Gift Card / Voucher Mode */}
              {paymentMethod === "GIFT_CARD" && (
                <div className="space-y-3 bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-4 rounded-2xl border border-amber-200">
                  <div>
                    <label className="text-xs font-bold text-gray-800 block mb-1.5 flex items-center justify-between">
                      <span>Gift Card Code (รหัสบัตรของขวัญ)</span>
                      <span className="text-[10px] text-amber-700 font-normal">Active cards: GC-1122-5000, GC-4422-2500</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="e.g. GC-1122-5000"
                          value={giftCardCodeInput}
                          onChange={(e) => {
                            setGiftCardCodeInput(e.target.value.toUpperCase());
                            setGiftCardError(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleVerifyGiftCard();
                            }
                          }}
                          className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold tracking-wider text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyGiftCard}
                        disabled={isVerifyingGiftCard || !giftCardCodeInput.trim()}
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer flex items-center space-x-1.5 shrink-0"
                      >
                        {isVerifyingGiftCard ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>{isVerifyingGiftCard ? "Checking..." : "Verify Card"}</span>
                      </button>
                    </div>

                    {giftCardError && (
                      <p className="text-[11px] text-rose-600 mt-1.5 flex items-center gap-1 font-medium">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{giftCardError}</span>
                      </p>
                    )}
                  </div>

                  {/* Verified Card Preview */}
                  {verifiedGiftCard && (
                    <div className="p-3.5 bg-white rounded-xl border border-amber-300 shadow-xs space-y-2.5 animate-in fade-in zoom-in-95">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                            <Gift className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{verifiedGiftCard.customerName}</p>
                            <p className="text-[10px] font-mono text-gray-400">{verifiedGiftCard.code}</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {verifiedGiftCard.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-[10px] text-gray-500">Available Card Balance</p>
                          <p className="text-sm font-black text-emerald-600">฿{verifiedGiftCard.balance.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <p className="text-[10px] text-gray-500">Deduct For This Order</p>
                          <p className="text-sm font-black text-amber-600">฿{Math.min(verifiedGiftCard.balance, finalPayable).toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] pt-1 text-gray-600 border-t border-dashed border-gray-200">
                        <span>Balance Remaining After Sale:</span>
                        <span className="font-bold text-gray-900 font-mono">
                          ฿{Math.max(0, verifiedGiftCard.balance - finalPayable).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Order Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Customer requested gift box..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProceedPayment}
                disabled={isSubmittingOrder}
                className="px-5 py-2 bg-[#28C76F] hover:bg-[#22A75D] disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center space-x-1.5"
              >
                {isSubmittingOrder ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Pay (฿{finalPayable.toFixed(2)})</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- RECEIPT MODAL (PRINTABLE) --- */}
      {showReceiptModal && completedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-emerald-50">
              <div className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-900">Sale Completed!</span>
              </div>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Slip Paper */}
            <div id="pos-receipt-print" className="p-5 font-mono text-xs text-gray-800 space-y-3 overflow-y-auto">
              {/* Slip Header */}
              <div className="text-center space-y-1 pb-2 border-b border-dashed border-gray-300">
                <h2 className="font-extrabold text-sm tracking-tight text-gray-900">{companySettings?.companyName || "ABC POS STORE"}</h2>
                <p className="text-[10px] text-gray-500">{selectedStore} &bull; Tax ID: {companySettings?.taxId || "010556209999"}</p>
                <p className="text-[10px] text-gray-500">Tel: {companySettings?.phone || "+66 2 123 4567"}</p>
                {companySettings?.address && (
                  <p className="text-[9px] text-gray-400">{companySettings.address}, {companySettings.city}</p>
                )}
              </div>

              {/* Order Info */}
              <div className="text-[11px] space-y-0.5 border-b border-dashed border-gray-300 pb-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Order:</span>
                  <span className="font-bold">{completedOrder.orderNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span>
                    {completedOrder.createdAt
                      ? new Date(completedOrder.createdAt).toLocaleString()
                      : new Date().toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Cashier:</span>
                  <span>{completedOrder.cashierName || cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Customer:</span>
                  <span>{completedOrder.customer?.name || "Walk-in Customer"}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-1 border-b border-dashed border-gray-300 pb-2">
                <div className="flex justify-between font-bold text-[10px] text-gray-500 uppercase">
                  <span>Item</span>
                  <span>Qty x Price</span>
                  <span>Total</span>
                </div>
                {completedOrder.items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[120px] font-medium">{item.productName}</span>
                    <span className="text-gray-500">
                      {item.quantity} x ฿{item.unitPrice}
                    </span>
                    <span className="font-bold">฿{item.subtotal}</span>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div className="space-y-1 text-[11px] border-b border-dashed border-gray-300 pb-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>฿{completedOrder.subtotal?.toFixed(2)}</span>
                </div>
                {completedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount / Promo:</span>
                    <span>-฿{completedOrder.discount?.toFixed(2)}</span>
                  </div>
                )}
                {completedOrder.tax > 0 && (
                  <div className="flex justify-between">
                    <span>VAT (7%):</span>
                    <span>฿{completedOrder.tax?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1">
                  <span>TOTAL:</span>
                  <span>฿{completedOrder.total?.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              {lastPaymentInfo && (
                <div className="text-[11px] space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Paid by:</span>
                    <span className="font-bold">{lastPaymentInfo.method}</span>
                  </div>
                  {lastPaymentInfo.giftCardCode ? (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Gift Card:</span>
                        <span className="font-mono font-bold text-amber-700">{lastPaymentInfo.giftCardCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Deducted:</span>
                        <span className="font-bold text-amber-700">฿{lastPaymentInfo.giftCardDeduction?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-bold">
                        <span>Card Balance Left:</span>
                        <span>฿{lastPaymentInfo.giftCardRemaining?.toFixed(2)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Received:</span>
                        <span>฿{lastPaymentInfo.received.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-emerald-700">
                        <span>Change:</span>
                        <span>฿{lastPaymentInfo.change.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Footer barcode & thanks */}
              <div className="text-center pt-2 space-y-1">
                <p className="text-[10px] text-gray-500">THANK YOU FOR YOUR PURCHASE!</p>
                <div className="font-mono text-[9px] tracking-widest text-gray-400">
                  |||||| |||| |||||||| ||| |||||||
                </div>
                <p className="text-[9px] text-gray-400">{completedOrder.orderNumber}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-3 bg-gray-50 border-t border-gray-200 flex items-center space-x-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Slip</span>
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2 bg-[#28C76F] hover:bg-[#22A75D] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer text-center"
              >
                New Sale
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- QUICK ADD CUSTOMER MODAL --- */}
      {showAddCustomerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-gray-900">Add New Customer</h3>
              <button onClick={() => setShowAddCustomerModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuickCustomer} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="e.g. 0812345678"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Email</label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddCustomerModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomer}
                  className="px-4 py-1.5 bg-[#28C76F] hover:bg-[#22A75D] disabled:opacity-50 text-white rounded-lg font-bold shadow-xs cursor-pointer"
                >
                  {isSavingCustomer ? "Saving..." : "Save Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- BARCODE SCANNER MODAL --- */}
      {showScannerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <QrCode className="w-4 h-4 text-blue-500" />
                <h3 className="text-sm font-bold text-gray-900">Barcode Scanner</h3>
              </div>
              <button onClick={() => setShowScannerModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full aspect-video bg-slate-900 rounded-xl flex flex-col items-center justify-center text-white relative overflow-hidden">
              <div className="w-48 h-24 border-2 border-red-500 rounded-lg relative flex items-center justify-center">
                <div className="w-full h-0.5 bg-red-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-gray-400 mt-2">Ready to scan hardware or manual input</p>
            </div>

            <form onSubmit={handleBarcodeSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">Enter / Scan Barcode or SKU</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="e.g. 8851234567890 or SKU-001"
                  value={scannedBarcode}
                  onChange={(e) => setScannedBarcode(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-mono"
                />
              </div>

              <div className="flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowScannerModal(false)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-gray-700 font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Scan & Add
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- HELD ORDERS MODAL --- */}
      {showHeldOrdersModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <PauseCircle className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Held Orders ({heldOrders.length})</h3>
              </div>
              <button onClick={() => setShowHeldOrdersModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {heldOrders.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-6">No orders currently on hold.</p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {heldOrders.map((held) => (
                  <div
                    key={held.id}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs hover:border-amber-400 transition-colors"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-900">{held.orderRef}</span>
                        <span className="text-[10px] text-gray-400">{held.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 mt-0.5">
                        Customer: <span className="font-semibold">{held.customer?.name || "Walk-in"}</span>
                      </p>
                      <p className="text-[10px] text-gray-500">
                        {held.items.length} items &bull; Total: ${held.subtotal.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleResumeHeldOrder(held)}
                        className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-2xs cursor-pointer flex items-center space-x-1"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        <span>Resume</span>
                      </button>
                      <button
                        onClick={() => setHeldOrders((prev) => prev.filter((h) => h.id !== held.id))}
                        className="p-1.5 text-gray-400 hover:text-red-500"
                        title="Discard"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- RECENT ORDERS & REPRINT RECEIPT MODAL --- */}
      {showOrdersHistoryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[88vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Recent POS Orders & Reprint Receipt</h3>
                  <p className="text-[11px] text-gray-500">Search past sales, view line items, and reprint receipt slips</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefreshRecentOrders}
                  disabled={isRefreshingOrders}
                  title="Reload Orders"
                  className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  <RotateCcw className={`w-3.5 h-3.5 ${isRefreshingOrders ? "animate-spin text-[#FE9F43]" : ""}`} />
                </button>
                <button
                  onClick={() => setShowOrdersHistoryModal(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Search Input Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order number (PINV-...), customer, cashier, or method..."
                value={orderSearchQuery}
                onChange={(e) => setOrderSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:border-[#FE9F43] focus:bg-white transition-colors"
              />
              {orderSearchQuery && (
                <button
                  onClick={() => setOrderSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Orders List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {recentOrders.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <Receipt className="w-8 h-8 text-gray-300 mx-auto" />
                  <p className="text-xs text-gray-400">No order history recorded yet.</p>
                </div>
              ) : (
                (() => {
                  const filtered = recentOrders.filter((ord) => {
                    if (!orderSearchQuery.trim()) return true;
                    const q = orderSearchQuery.toLowerCase();
                    return (
                      ord.orderNumber.toLowerCase().includes(q) ||
                      (ord.customer?.name && ord.customer.name.toLowerCase().includes(q)) ||
                      (ord.cashierName && ord.cashierName.toLowerCase().includes(q)) ||
                      ord.paymentMethod.toLowerCase().includes(q) ||
                      (ord.notes && ord.notes.toLowerCase().includes(q))
                    );
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="py-8 text-center text-xs text-gray-400">
                        No orders matched &quot;{orderSearchQuery}&quot;
                      </div>
                    );
                  }

                  return (
                    <div className="divide-y divide-gray-100 text-xs">
                      {filtered.map((ord) => {
                        const isExpanded = expandedOrderId === ord.id;
                        return (
                          <div key={ord.id} className="py-3 hover:bg-gray-50/60 rounded-xl px-2.5 transition-colors">
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1 flex-1">
                                <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                  <span className="font-bold text-gray-900 font-mono">{ord.orderNumber}</span>
                                  <span
                                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                                      ord.paymentStatus === "PAID"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-rose-50 text-rose-700 border-rose-200"
                                    }`}
                                  >
                                    {ord.paymentStatus}
                                  </span>
                                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                    {ord.paymentMethod}
                                  </span>
                                  <span className="text-[11px] text-gray-400 font-mono flex items-center space-x-1">
                                    <Clock className="w-3 h-3 text-gray-400" />
                                    <span>
                                      {ord.createdAt
                                        ? new Date(ord.createdAt).toLocaleString("en-GB", {
                                            day: "2-digit",
                                            month: "short",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                          })
                                        : "-"}
                                    </span>
                                  </span>
                                </div>

                                <p className="text-[11px] text-gray-600">
                                  Customer: <span className="font-semibold text-gray-800">{ord.customer?.name || "Walk-in Customer"}</span> &bull; Cashier: <span className="font-medium">{ord.cashierName}</span>
                                </p>

                                {ord.notes && (
                                  <p className="text-[10px] text-amber-800 bg-amber-50/70 border border-amber-200/50 rounded-md px-2 py-0.5 inline-block">
                                    {ord.notes}
                                  </p>
                                )}
                              </div>

                              <div className="text-right shrink-0">
                                <p className="font-extrabold text-sm text-gray-900">
                                  ฿{ord.total?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>

                                <div className="flex items-center space-x-2 mt-1.5 justify-end">
                                  {ord.items && ord.items.length > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => setExpandedOrderId(isExpanded ? null : ord.id)}
                                      className="text-[11px] font-medium text-gray-500 hover:text-gray-800 cursor-pointer"
                                    >
                                      {isExpanded ? "Hide items" : `${ord.items.length} items`}
                                    </button>
                                  )}

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCompletedOrder(ord);
                                      setLastPaymentInfo({
                                        method: ord.paymentMethod === "GIFT_CARD" ? "GIFT CARD / VOUCHER" : ord.paymentMethod,
                                        received: ord.total,
                                        change: 0,
                                      });
                                      setShowOrdersHistoryModal(false);
                                      setShowReceiptModal(true);
                                    }}
                                    className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-[#E88B32] border border-amber-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 cursor-pointer transition-colors shadow-2xs"
                                  >
                                    <Printer className="w-3 h-3 text-[#FE9F43]" />
                                    <span>Reprint Receipt</span>
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Expanded items list */}
                            {isExpanded && ord.items && (
                              <div className="mt-2.5 pt-2 border-t border-gray-100 bg-gray-50/80 rounded-xl p-3 space-y-1.5 animate-in fade-in duration-100">
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">
                                  Order Line Items ({ord.items.length})
                                </span>
                                {ord.items.map((item: any, iIdx: number) => (
                                  <div key={iIdx} className="flex justify-between items-center text-[11px] text-gray-700">
                                    <span className="font-medium truncate max-w-[280px]">
                                      {item.quantity}x {item.productName}
                                    </span>
                                    <span className="font-mono text-gray-600">
                                      ฿{item.subtotal?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Total recorded: {recentOrders.length} orders</span>
              <button
                type="button"
                onClick={() => setShowOrdersHistoryModal(false)}
                className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- QUICK CALCULATOR MODAL --- */}
      {showCalculator && (
        <div className="fixed bottom-20 right-6 sm:bottom-6 sm:right-6 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-3.5 w-60 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <span className="text-xs font-bold text-gray-800 flex items-center space-x-1">
              <Calculator className="w-3.5 h-3.5 text-[#FE9F43]" />
              <span>Calculator</span>
            </span>
            <button onClick={() => setShowCalculator(false)} className="text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-gray-100 rounded-xl p-2.5 text-right font-mono text-lg font-bold text-gray-900 mb-2.5 truncate">
            {calcDisplay}
          </div>

          <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
            {["C", "DEL", "/", "*", "7", "8", "9", "-", "4", "5", "6", "+", "1", "2", "3", "=", "0", "."].map(
              (btn) => (
                <button
                  key={btn}
                  onClick={() => handleCalcInput(btn)}
                  className={`py-2 rounded-lg transition-colors cursor-pointer ${
                    btn === "="
                      ? "col-span-1 bg-[#FE9F43] text-white hover:bg-[#E88B32]"
                      : btn === "C" || btn === "DEL"
                      ? "bg-rose-100 text-rose-700 hover:bg-rose-200"
                      : ["/", "*", "-", "+"].includes(btn)
                      ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      : "bg-gray-50 text-gray-800 hover:bg-gray-100"
                  }`}
                >
                  {btn}
                </button>
              )
            )}
          </div>
        </div>
      )}

      {/* --- MODIFIER EDIT MODAL (SHIPPING, TAX, COUPON, DISCOUNT) --- */}
      {editingModifier && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-gray-900 uppercase">
                Edit {editingModifier} {editingModifier === "tax" ? "(%)" : "($)"}
              </h3>
              <button onClick={() => setEditingModifier(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div>
              <input
                type="number"
                step="any"
                autoFocus
                value={modifierValue}
                onChange={(e) => setModifierValue(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setEditingModifier(null)}
                className="px-3 py-1.5 text-xs text-gray-600 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveModifier}
                className="px-4 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* COUPON / PROMO CODE MODAL */}
      {/* ========================================================================= */}
      {showCouponModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative border border-gray-200 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-gray-900">
                <Ticket className="w-5 h-5 text-[#FE9F43]" />
                <div>
                  <h3 className="text-base font-bold">Apply Coupon & Promo Code</h3>
                  <p className="text-[11px] text-gray-500">Enter a promotion code or choose from active vouchers</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCouponModal(false);
                  setCouponError("");
                }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleApplyCoupon(inputCouponCode);
              }}
              className="space-y-2"
            >
              <label className="text-xs font-bold text-gray-700 block">Enter Promo Code</label>
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="e.g. VIP2026, SAVE100, OPENING15"
                    value={inputCouponCode}
                    onChange={(e) => {
                      setInputCouponCode(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    autoFocus
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold uppercase tracking-wider text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  Apply
                </button>
              </div>

              {couponError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center space-x-1.5 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{couponError}</span>
                </div>
              )}
            </form>

            {/* Available Coupons List from DB */}
            <div className="space-y-2 flex-1 overflow-y-auto pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                <span>Available Promotions & Coupons</span>
                <span className="text-gray-400 font-normal text-[11px]">{coupons.filter(c => c.status === "Active").length} active</span>
              </div>

              {coupons.filter(c => c.status === "Active").length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  <Ticket className="w-8 h-8 mx-auto text-gray-300 mb-1" />
                  <p>No active coupons found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {coupons
                    .filter((c) => c.status === "Active")
                    .map((coupon) => {
                      const isApplied = appliedCoupon?.id === coupon.id;
                      return (
                        <div
                          key={coupon.id}
                          className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                            isApplied
                              ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400"
                              : "bg-gray-50/60 hover:bg-orange-50/40 border-gray-200 hover:border-orange-200"
                          }`}
                        >
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-orange-100 text-[#FE9F43] border border-orange-200">
                                {coupon.code}
                              </span>
                              <span className="font-bold text-gray-900 text-xs">{coupon.name}</span>
                            </div>
                            {coupon.description && (
                              <p className="text-[11px] text-gray-500 line-clamp-1">{coupon.description}</p>
                            )}
                            <div className="flex items-center space-x-3 text-[10px] text-gray-400">
                              <span className="font-bold text-emerald-600">
                                {coupon.type === "Percentage" ? `${coupon.discount}% Discount` : `฿${coupon.discount} Flat Discount`}
                              </span>
                              {coupon.validEnd && (
                                <span>Valid till {coupon.validEnd}</span>
                              )}
                            </div>
                          </div>

                          <div className="pl-2">
                            {isApplied ? (
                              <button
                                type="button"
                                onClick={handleRemoveCoupon}
                                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleApplyCoupon(coupon.code)}
                                className="px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                              >
                                Use
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-gray-100 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowCouponModal(false);
                  setCouponError("");
                }}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHIFT MODAL 1: OPEN SHIFT MODAL */}
      {/* ========================================================================= */}
      {showOpenShiftModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-gray-900">
                <Unlock className="w-5 h-5 text-emerald-500" />
                <h3 className="text-base font-bold">Open Register Shift</h3>
              </div>
              <button
                onClick={() => setShowOpenShiftModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleOpenShiftSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Cashier Name</label>
                <input
                  type="text"
                  value={openCashier}
                  onChange={(e) => setOpenCashier(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-orange-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Opening Float (เงินทอนเริ่มต้น ฿)
                </label>
                <input
                  type="number"
                  step="any"
                  value={openFloat}
                  onChange={(e) => setOpenFloat(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-gray-900 focus:ring-2 focus:ring-orange-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Notes (Optional)</label>
                <input
                  type="text"
                  value={openNotes}
                  onChange={(e) => setOpenNotes(e.target.value)}
                  placeholder="e.g. Morning Shift"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-400 focus:bg-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOpenShiftModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isOpeningShift}
                  className="flex-1 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  {isOpeningShift ? "Opening..." : "Open Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHIFT MODAL 2: CASH DRAWER MOVEMENT (PAY IN / OUT) */}
      {/* ========================================================================= */}
      {showShiftMovementModal && currentShiftData.shift && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-gray-900">
                <DollarSign className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-bold">Cash Movement (In/Out)</h3>
              </div>
              <button
                onClick={() => setShowShiftMovementModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector */}
            <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setMovementType("PAY_IN")}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  movementType === "PAY_IN"
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Pay In (ใส่เงินเพิ่ม)</span>
              </button>
              <button
                type="button"
                onClick={() => setMovementType("PAY_OUT")}
                className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                  movementType === "PAY_OUT"
                    ? "bg-white text-rose-700 shadow-xs"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Pay Out (หยิบเงินออก)</span>
              </button>
            </div>

            <form onSubmit={handleRecordMovementSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Amount (฿)</label>
                <input
                  type="number"
                  step="any"
                  min="1"
                  value={movementAmount}
                  onChange={(e) => setMovementAmount(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-lg font-black text-gray-900 focus:ring-2 focus:ring-orange-400 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder={movementType === "PAY_IN" ? "e.g. Added change coins" : "e.g. Bank drop, petty cash"}
                  required
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-400 focus:bg-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowShiftMovementModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRecordingMovement}
                  className={`flex-1 py-2.5 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all ${
                    movementType === "PAY_IN" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                  }`}
                >
                  {isRecordingMovement ? "Saving..." : "Record Movement"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHIFT MODAL 3: CLOSE SHIFT MODAL */}
      {/* ========================================================================= */}
      {showCloseShiftModal && currentShiftData.shift && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-gray-900">
                <Lock className="w-5 h-5 text-rose-500" />
                <h3 className="text-base font-bold">Close Register & Shift</h3>
              </div>
              <button
                onClick={() => setShowCloseShiftModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Shift expected breakdown */}
            <div className="bg-gray-50 p-3 rounded-2xl space-y-1.5 text-xs border border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Shift #:</span>
                <span className="font-bold text-gray-900">{currentShiftData.shift.shiftNumber}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Opening Float:</span>
                <span className="font-bold text-gray-900">฿{currentShiftData.shift.openingFloat.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Cash Sales:</span>
                <span className="font-bold text-emerald-600">+฿{(currentShiftData.liveMetrics?.cashSales ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Pay In / Out:</span>
                <span className="font-bold text-gray-900">
                  +฿{(currentShiftData.liveMetrics?.totalPayIn ?? 0).toLocaleString()} / -฿{(currentShiftData.liveMetrics?.totalPayOut ?? 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-gray-900 font-extrabold pt-1.5 border-t border-dashed border-gray-300">
                <span>Expected in Drawer:</span>
                <span className="text-emerald-700 text-sm">฿{(currentShiftData.liveMetrics?.expectedCash ?? 0).toLocaleString()}</span>
              </div>
            </div>

            <form onSubmit={handleCloseShiftSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-900 block mb-1">
                  Counted Cash in Drawer (เงินสดที่นับได้จริง ฿)
                </label>
                <input
                  type="number"
                  step="any"
                  value={closingCashCounted}
                  onChange={(e) => setClosingCashCounted(Number(e.target.value))}
                  required
                  className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-lg font-black text-gray-900 focus:ring-2 focus:ring-orange-500"
                />

                {/* Real-time Variance Preview */}
                {(() => {
                  const expected = currentShiftData.liveMetrics?.expectedCash || 0;
                  const diff = closingCashCounted - expected;
                  const isDiffZero = Math.abs(diff) < 0.01;
                  return (
                    <div
                      className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center justify-between font-bold ${
                        isDiffZero
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : diff > 0
                          ? "bg-amber-50 border-amber-200 text-amber-800"
                          : "bg-rose-50 border-rose-200 text-rose-800"
                      }`}
                    >
                      <span>Drawer Variance:</span>
                      <span>
                        {isDiffZero
                          ? "Exact Balanced (฿0)"
                          : diff > 0
                          ? `Cash Over +฿${diff.toLocaleString()}`
                          : `Cash Short -฿${Math.abs(diff).toLocaleString()}`}
                      </span>
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Closing Notes</label>
                <input
                  type="text"
                  value={closeShiftNotes}
                  onChange={(e) => setCloseShiftNotes(e.target.value)}
                  placeholder="e.g. Shift ended, safe drop confirmed"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-orange-400 focus:bg-white"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCloseShiftModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClosingShift}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  {isClosingShift ? "Closing..." : "Close Shift & Z-Report"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SHIFT MODAL 4: PRINTABLE Z-REPORT THERMAL SLIP MODAL */}
      {/* ========================================================================= */}
      {selectedZReportShift && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl relative border border-gray-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2 text-gray-900">
                <Receipt className="w-4 h-4 text-orange-500" />
                <h3 className="text-sm font-bold">Shift Z-Report Slip</h3>
              </div>
              <button
                onClick={() => setSelectedZReportShift(null)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Thermal Receipt */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-300 font-mono text-xs text-gray-800 space-y-3">
              <div className="text-center space-y-1">
                <h2 className="text-base font-extrabold tracking-tight text-gray-900">{companySettings?.companyName || "ABC POS RETAIL"}</h2>
                <p className="text-[10px] text-gray-500">{selectedStore || "Electro Mart"} &bull; Tax ID: {companySettings?.taxId || "010556209999"}</p>
                <div className="border-b border-dashed border-gray-300 my-2"></div>
                <p className="font-black text-gray-900 text-xs">*** SHIFT Z-REPORT ***</p>
                <p className="text-[11px] text-gray-700 font-bold">Shift: {selectedZReportShift.shiftNumber}</p>
                <p className="text-[10px] text-gray-500">
                  Opened: {new Date(selectedZReportShift.openedAt).toLocaleString()}
                </p>
                <p className="text-[10px] text-gray-500">
                  Closed: {selectedZReportShift.closedAt ? new Date(selectedZReportShift.closedAt).toLocaleString() : "ACTIVE / IN-PROGRESS"}
                </p>
                <p className="text-[10px] text-gray-500">Cashier: {selectedZReportShift.cashierName}</p>
              </div>

              <div className="border-b border-dashed border-gray-300 my-2"></div>

              {/* Sales Breakdown */}
              <div className="space-y-1 text-[11px]">
                <p className="font-bold text-gray-900 uppercase">Sales By Tender:</p>
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span>฿{(selectedZReportShift.totalCashSales || currentShiftData.liveMetrics?.cashSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>PromptPay QR:</span>
                  <span>฿{(selectedZReportShift.totalPromptPaySales || currentShiftData.liveMetrics?.promptpaySales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Credit Card:</span>
                  <span>฿{(selectedZReportShift.totalCardSales || currentShiftData.liveMetrics?.cardSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-dashed border-gray-200">
                  <span>Total Sales ({selectedZReportShift.orderCount || currentShiftData.liveMetrics?.orderCount || 0} bills):</span>
                  <span>฿{(selectedZReportShift.totalSales || currentShiftData.liveMetrics?.totalSales || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="border-b border-dashed border-gray-300 my-2"></div>

              {/* Drawer Reconciliation */}
              <div className="space-y-1 text-[11px]">
                <p className="font-bold text-gray-900 uppercase">Cash Reconciliation:</p>
                <div className="flex justify-between">
                  <span>Opening Float:</span>
                  <span>฿{selectedZReportShift.openingFloat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash Sales:</span>
                  <span>+฿{(selectedZReportShift.totalCashSales || currentShiftData.liveMetrics?.cashSales || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pay In:</span>
                  <span>+฿{(selectedZReportShift.cashIn || currentShiftData.liveMetrics?.totalPayIn || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-rose-600">
                  <span>Pay Out:</span>
                  <span>-฿{(selectedZReportShift.cashOut || currentShiftData.liveMetrics?.totalPayOut || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-dashed border-gray-200">
                  <span>Expected in Drawer:</span>
                  <span>฿{(selectedZReportShift.expectedCash || currentShiftData.liveMetrics?.expectedCash || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Actual Counted:</span>
                  <span>฿{(selectedZReportShift.closingCashCounted ?? currentShiftData.liveMetrics?.expectedCash ?? 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-black text-sm pt-1 border-t border-dashed border-gray-300">
                  <span>Variance:</span>
                  <span
                    className={
                      (selectedZReportShift.cashVariance || 0) === 0
                        ? "text-emerald-700"
                        : (selectedZReportShift.cashVariance || 0) > 0
                        ? "text-amber-700"
                        : "text-rose-700"
                    }
                  >
                    {(selectedZReportShift.cashVariance || 0) >= 0 ? "+฿" : "-฿"}
                    {Math.abs(selectedZReportShift.cashVariance || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="border-b border-dashed border-gray-300 my-2"></div>
              <div className="text-center text-[10px] text-gray-400">
                <p>*** END OF SHIFT REPORT ***</p>
                <p>Manager Signature: __________________</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2 pt-1">
              <button
                onClick={() => setSelectedZReportShift(null)}
                className="flex-1 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 bg-[#FE9F43] hover:bg-[#E88B32] text-white rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Z-Report</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-gray-100">
            {feedbackModal.type === "add_success" && (
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <Sparkles className="w-7 h-7 stroke-[1.75]" />
              </div>
            )}
            {feedbackModal.type === "edit_success" && (
              <div className="w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
                <CheckCircle2 className="w-7 h-7 stroke-[1.75]" />
              </div>
            )}
            {feedbackModal.type === "error" && (
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-8 ring-rose-50/50">
                <AlertTriangle className="w-7 h-7 stroke-[1.75]" />
              </div>
            )}

            <div className="space-y-1">
              <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{feedbackModal.message}</p>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-2">
              <button
                onClick={() => setFeedbackModal({ ...feedbackModal, isOpen: false })}
                className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
