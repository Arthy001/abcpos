"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  fetchProductById,
  fetchCategories,
  fetchBrands,
  fetchUnits,
  fetchWarehouses,
  fetchStores,
  updateProductApi,
} from "@/lib/api";
import { Category, Brand, Unit, Warehouse, Store, Product } from "@/types";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  UploadCloud,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Sparkles,
  Info,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  CalendarDays,
  Clock,
  Plus,
  ShieldCheck,
  Lock,
} from "lucide-react";

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { canEditProduct, fetchRolePermissions } = useAuthStore();
  const productId = String(params?.id || "");

  // Reference lists from DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form State
  const [storeId, setStoreId] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("ACTIVE");

  // Pricing & Stocks
  const [quantity, setQuantity] = useState<number>(0);
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);

  // Custom Fields / Dates
  const [manufacturedDate, setManufacturedDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  // Expiry Batches State (Master Data Correction)
  const [expiryTrackingMode, setExpiryTrackingMode] = useState<"SINGLE_DATE" | "MULTI_BATCH">("SINGLE_DATE");
  const [expiryBatches, setExpiryBatches] = useState<
    {
      id: string;
      batchNo: string;
      manufacturedDate: string;
      expiredDate: string;
      quantity: number;
      costPrice: number;
      notes: string;
      isNew?: boolean;
    }[]
  >([]);

  useEffect(() => {
    fetchRolePermissions().then(() => {
      if (!canEditProduct()) {
        alert("Permission Denied: คุณไม่มีสิทธิ์ในการแก้ไขข้อมูลสินค้าหลัก");
        router.replace("/products");
      }
    });

    if (!productId) return;

    setInitialLoading(true);
    Promise.all([
      fetchProductById(productId),
      fetchCategories(),
      fetchBrands(),
      fetchUnits(),
      fetchWarehouses(),
      fetchStores(),
    ])
      .then(([prod, cats, brds, unts, whs, strs]) => {
        setCategories(cats);
        setBrands(brds);
        setUnits(unts);
        setWarehouses(whs);
        setStores(strs);

        // Fill form
        setName(prod.name || "");
        setSku(prod.sku || "");
        setCategoryId(prod.categoryId || "");
        setBrandId(prod.brandId || "");
        setUnitId(prod.unitId || "");
        setWarehouseId(prod.warehouseId || "");
        setStoreId(prod.storeId || "");
        setBarcode(prod.barcode || "");
        setDescription(prod.description || "");

        // Parse images
        if (prod.image) {
          if (prod.image.startsWith("[")) {
            try {
              const parsed = JSON.parse(prod.image);
              if (Array.isArray(parsed)) setImages(parsed);
              else setImages([prod.image]);
            } catch {
              setImages([prod.image]);
            }
          } else {
            setImages([prod.image]);
          }
        } else {
          setImages([]);
        }

        setStatus(prod.status || "ACTIVE");
        setPrice(prod.price || 0);
        setCostPrice(prod.costPrice || 0);
        setQuantity(prod.stock || 0);
        setMinStockAlert(prod.minStockAlert || 5);

        if (prod.manufacturedDate) {
          setManufacturedDate(new Date(prod.manufacturedDate).toISOString().split("T")[0]);
        }
        if (prod.expiredDate) {
          setExpiryDate(new Date(prod.expiredDate).toISOString().split("T")[0]);
        }

        if (prod.expiryBatches && prod.expiryBatches.length > 0) {
          setExpiryTrackingMode("MULTI_BATCH");
          setExpiryBatches(
            prod.expiryBatches.map((b) => ({
              id: b.id || `batch-${Date.now()}`,
              batchNo: b.batchNo || "",
              manufacturedDate: b.manufacturedDate
                ? new Date(b.manufacturedDate).toISOString().split("T")[0]
                : "",
              expiredDate: b.expiredDate
                ? new Date(b.expiredDate).toISOString().split("T")[0]
                : "",
              quantity: b.quantity || 0,
              costPrice: b.costPrice || 0,
              notes: b.notes || "",
            }))
          );
        }
      })
      .catch((err: any) => {
        console.error("Error loading product for edit:", err);
        setErrorMessage(err.message || "Failed to load product data");
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [productId]);

  // Handle multi-image file selection
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImages((prev) => [...prev, event.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Generate random Barcode
  const generateBarcode = () => {
    const random = Math.floor(100000000000 + Math.random() * 900000000000);
    setBarcode(`885${random}`);
  };

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "edit_success" | "error";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "edit_success",
    title: "",
    message: "",
  });

  // Add new batch row (for newly received goods without formal adjustment)
  const handleAddBatchRow = () => {
    setExpiryBatches((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        batchNo: "",
        manufacturedDate: "",
        expiredDate: "",
        quantity: 0,
        costPrice: Number(costPrice) || 0,
        notes: "",
        isNew: true,
      },
    ]);
  };

  // Update specific field in expiry batch (Master Data Correction: Dates/Lot/Notes)
  const handleUpdateBatchField = (id: string, field: string, val: any) => {
    setExpiryBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: val } : b))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing Product Name",
        message: "Please enter a valid Product Name before saving.",
      });
      return;
    }
    if (!sku.trim()) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Missing SKU",
        message: "Please enter or generate a SKU for this product.",
      });
      return;
    }

    try {
      setLoading(true);
      const imagePayload = images.length > 0 ? JSON.stringify(images) : undefined;

      await updateProductApi(productId, {
        name: name.trim(),
        sku: sku.trim(),
        barcode: barcode.trim() || undefined,
        description: description.trim() || undefined,
        price: Number(price || 0),
        costPrice: Number(costPrice || 0),
        stock: Number(quantity || 0),
        minStockAlert: Number(minStockAlert || 5),
        categoryId: categoryId || undefined,
        brandId: brandId || undefined,
        unitId: unitId || undefined,
        warehouseId: warehouseId || undefined,
        storeId: storeId || undefined,
        image: imagePayload,
        status: status || (Number(quantity) > 0 ? "ACTIVE" : "OUT_OF_STOCK"),
        manufacturedDate: manufacturedDate || undefined,
        expiredDate: expiryDate || undefined,
        expiryBatches:
          expiryTrackingMode === "MULTI_BATCH"
            ? expiryBatches.map((b) => ({
                id: b.id,
                batchNo: b.batchNo.trim() || undefined,
                manufacturedDate: b.manufacturedDate || undefined,
                expiredDate: b.expiredDate,
                quantity: b.quantity,
                costPrice: b.costPrice,
                notes: b.notes || undefined,
              }))
            : undefined,
      });

      setFeedbackModal({
        isOpen: true,
        type: "edit_success",
        title: "Product Updated!",
        message: `Product "${name.trim()}" (SKU: ${sku.trim()}) has been updated successfully.`,
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Update Product",
        message: err.message || "An error occurred while updating product.",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
          <RotateCcw className="w-8 h-8 animate-spin text-[#FE9F43]" />
          <p className="text-sm font-medium text-gray-500">Loading product details...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <form onSubmit={handleSubmit} className="space-y-5 w-full pb-12 font-sans">
        {/* Top Action Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <Link
              href="/products"
              className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Edit Product</h1>
              <p className="text-xs text-gray-400 mt-0.5">Update product details, pricing, and stock levels</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              href="/products"
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center space-x-1.5"
            >
              {loading ? (
                <span>Saving Changes...</span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Product updated successfully! Redirecting to products list...</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Card: Product Information */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center space-x-2">
            <Info className="w-4 h-4 text-[#FE9F43]" />
            <h3 className="font-bold text-gray-900 text-sm">Product Information</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Store */}
            <div>
              <SearchableSelect
                label="Store"
                placeholder="Select Store..."
                options={stores.map((s) => ({ value: s.id, label: s.name }))}
                value={storeId}
                onChange={setStoreId}
              />
            </div>

            {/* Warehouse */}
            <div>
              <SearchableSelect
                label="Warehouse"
                placeholder="Select Warehouse..."
                options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
                value={warehouseId}
                onChange={setWarehouseId}
              />
            </div>

            {/* Product Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                SKU <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Category */}
            <div>
              <SearchableSelect
                label="Category"
                placeholder="Search or Select Category..."
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                value={categoryId}
                onChange={setCategoryId}
              />
            </div>

            {/* Brand */}
            <div>
              <SearchableSelect
                label="Brand"
                placeholder="Search or Select Brand..."
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
                value={brandId}
                onChange={setBrandId}
              />
            </div>

            {/* Unit */}
            <div>
              <SearchableSelect
                label="Unit"
                placeholder="Search or Select Unit..."
                options={units.map((u) => ({ value: u.id, label: `${u.name} (${u.shortName})` }))}
                value={unitId}
                onChange={setUnitId}
              />
            </div>

            {/* Barcode */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700">Item Barcode</label>
                <button
                  type="button"
                  onClick={generateBarcode}
                  className="text-[11px] font-bold text-[#FE9F43] hover:text-[#E88B32] flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 pt-2">
            <label className="text-xs font-bold text-gray-700">Description</label>
            <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
              <div className="flex items-center space-x-1 p-2 bg-gray-50 border-b border-gray-200 text-gray-600">
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <Italic className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <Underline className="w-3.5 h-3.5" />
                </button>
                <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <List className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <ListOrdered className="w-3.5 h-3.5" />
                </button>
                <button type="button" className="p-1 rounded hover:bg-gray-200">
                  <Link2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 text-xs text-gray-800 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Card: Pricing & Stocks */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-5">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 text-sm">Pricing & Stocks</h3>
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-gray-700">Status:</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] cursor-pointer"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="OUT_OF_STOCK">OUT OF STOCK</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {/* Stock Quantity (ERP Standard: Read-only with Stock Adjustment link) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-gray-700 flex items-center space-x-1">
                  <span>Current Stock (คงเหลือ)</span>
                  <Lock className="w-3 h-3 text-gray-400" />
                </label>
                <Link
                  href="/stock/adjustment"
                  target="_blank"
                  className="text-[10px] font-bold text-[#FE9F43] hover:underline flex items-center space-x-0.5"
                  title="ปรับยอดสต็อกผ่านเอกสารตรวจนับ (Stock Adjustment)"
                >
                  <span>ปรับยอดสต็อก</span>
                  <span>→</span>
                </Link>
              </div>
              <div className="relative">
                <input
                  type="number"
                  readOnly
                  disabled
                  value={quantity}
                  className="w-full px-3.5 py-2 bg-gray-100 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 cursor-not-allowed select-none"
                />
                <span className="absolute right-3 top-2.5 text-[10px] text-gray-400 font-semibold flex items-center space-x-1">
                  <Lock className="w-3 h-3 text-gray-400" />
                  <span>Locked</span>
                </span>
              </div>
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Selling Price (฿) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={price || ""}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-orange-600 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Cost Price */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Cost Price (฿)</label>
              <input
                type="number"
                min="0"
                step="any"
                value={costPrice || ""}
                onChange={(e) => setCostPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Quantity Alert (Min Stock) */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                Quantity Alert <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                value={minStockAlert}
                onChange={(e) => setMinStockAlert(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-amber-600 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* 3. Card: Product Images (Multi-upload & Individual Delete) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Product Images ({images.length})</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Upload new images, manage, or remove existing photos</p>
            </div>
            {images.length > 0 && (
              <button
                type="button"
                onClick={() => setImages([])}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold flex items-center space-x-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove All</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Upload Box button */}
            <label className="h-32 border-2 border-dashed border-gray-300 hover:border-[#FE9F43] rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:text-[#FE9F43] transition-all cursor-pointer bg-gray-50/70 hover:bg-orange-50/30 group">
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <UploadCloud className="w-7 h-7 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-700 group-hover:text-[#FE9F43]">Add Images</span>
              <span className="text-[10px] text-gray-400">PNG, JPG, WebP</span>
            </label>

            {/* Uploaded Images List */}
            {images.map((imgData, idx) => (
              <div
                key={idx}
                className="relative h-32 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden group shadow-2xs hover:shadow-md transition-all"
              >
                <img
                  src={imgData}
                  alt={`Product Image ${idx + 1}`}
                  className="w-full h-full object-contain p-2"
                />

                {/* Primary / Cover Badge */}
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[9px] font-bold bg-[#FE9F43] text-white shadow-xs">
                    Cover Photo
                  </span>
                )}

                {/* Individual Delete Button */}
                <button
                  type="button"
                  title="Delete this image"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-lg bg-rose-500/90 hover:bg-rose-600 text-white flex items-center justify-center shadow-xs transition-all opacity-90 group-hover:opacity-100 group-hover:scale-105 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Card: Tracking & Expiry Dates (Master Data Correction) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-sm flex items-center">
                <CalendarDays className="w-4 h-4 mr-1.5 text-[#FE9F43]" />
                Tracking & Expiry Dates (Master Data Correction)
              </h3>
              <p className="text-[11px] text-gray-500">Correct manufacturing and expiry dates directly without altering ledger stock</p>
            </div>

            {/* Mode Switcher */}
            <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setExpiryTrackingMode("SINGLE_DATE")}
                className={`px-3 py-1 rounded-lg transition-all ${
                  expiryTrackingMode === "SINGLE_DATE"
                    ? "bg-white text-gray-900 shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                Single Date
              </button>
              <button
                type="button"
                onClick={() => setExpiryTrackingMode("MULTI_BATCH")}
                className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
                  expiryTrackingMode === "MULTI_BATCH"
                    ? "bg-[#FE9F43] text-white shadow-xs font-bold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                <span>Multi-Batch ({expiryBatches.length})</span>
                <span className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[10px]">ERP Safe</span>
              </button>
            </div>
          </div>

          {/* SINGLE DATE MODE */}
          {expiryTrackingMode === "SINGLE_DATE" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Manufactured Date (MFG)</label>
                <input
                  type="date"
                  value={manufacturedDate}
                  onChange={(e) => setManufacturedDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Expiry Date (EXP)</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                />
              </div>
            </div>
          )}

          {/* MULTI-BATCH / MASTER DATA CORRECTION MODE */}
          {expiryTrackingMode === "MULTI_BATCH" && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>ERP Master Data Correction:</strong> สามารถคลิกแก้ไข <strong>วันผลิต (MFG)</strong>, <strong>วันหมดอายุ (EXP)</strong>, และ <strong>เลข Lot</strong> ที่คีย์ผิดพลาดได้โดยตรงอย่างปลอดภัย{" "}
                  <span className="text-blue-800 font-semibold">(จำนวนชิ้นถูกล็อคไว้เพื่อรักษาความถูกต้องของงบบัญชีและประวัติสต็อก)</span>
                </div>
              </div>

              {expiryBatches.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-200 rounded-2xl bg-gray-50/50 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-gray-400" />
                  <p className="text-xs text-gray-500 font-medium">สินค้านี้ยังไม่มีรายการ Expiry Batch</p>
                  <button
                    type="button"
                    onClick={handleAddBatchRow}
                    className="px-3.5 py-1.5 bg-[#FE9F43] hover:bg-[#e88930] text-white rounded-xl text-xs font-bold inline-flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มรอบวันหมดอายุ</span>
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white">
                  <table className="w-full text-left text-xs min-w-[650px]">
                    <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                      <tr>
                        <th className="py-2.5 px-3">Batch / Lot No.</th>
                        <th className="py-2.5 px-3">MFG Date (แก้ไขได้)</th>
                        <th className="py-2.5 px-3">EXP Date (แก้ไขได้) <span className="text-red-500">*</span></th>
                        <th className="py-2.5 px-3">
                          <span className="flex items-center space-x-1">
                            <span>คงเหลือ (Locked)</span>
                            <Lock className="w-3 h-3 text-gray-400" />
                          </span>
                        </th>
                        <th className="py-2.5 px-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {expiryBatches.map((b) => (
                        <tr key={b.id} className="hover:bg-gray-50/60 transition-colors">
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              placeholder="เว้นว่างได้"
                              value={b.batchNo}
                              onChange={(e) => handleUpdateBatchField(b.id, "batchNo", e.target.value)}
                              className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-[#FE9F43]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="date"
                              value={b.manufacturedDate}
                              onChange={(e) => handleUpdateBatchField(b.id, "manufacturedDate", e.target.value)}
                              className="w-full px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs focus:ring-1 focus:ring-[#FE9F43]"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="date"
                              required
                              value={b.expiredDate}
                              onChange={(e) => handleUpdateBatchField(b.id, "expiredDate", e.target.value)}
                              className="w-full px-2.5 py-1 bg-amber-50/50 border border-amber-300 rounded-lg text-xs font-bold text-rose-700 focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                            />
                          </td>
                          <td className="py-2 px-3 font-semibold text-gray-700 bg-gray-50/50">
                            <span className="px-2 py-1 bg-gray-100 border border-gray-200 rounded-md font-mono text-xs flex items-center justify-between w-24">
                              <span>{b.quantity}</span>
                              <Lock className="w-3 h-3 text-gray-400" />
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              b.quantity > 0 ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"
                            }`}>
                              {b.quantity > 0 ? "ACTIVE" : "DEPLETED"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Bottom Action Footer */}
        <div className="flex justify-end items-center space-x-3 pt-2">
          <Link
            href="/products"
            className="px-6 py-2.5 bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] disabled:bg-orange-300 text-white text-xs font-bold rounded-xl shadow-md active:scale-95 transition-all flex items-center space-x-1.5"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* ========================================================= */}
        {/* Action Feedback / Alert Modal (Product Updated / Error)   */}
        {/* ========================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in fade-in zoom-in duration-150">
              {/* Top Icon Badge */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xs ${
                  feedbackModal.type === "edit_success"
                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}
              >
                {feedbackModal.type === "edit_success" ? (
                  <CheckCircle className="w-7 h-7 text-blue-600" />
                ) : (
                  <AlertTriangle className="w-7 h-7 text-rose-600" />
                )}
              </div>

              {/* Title & Message */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feedbackModal.message}</p>
              </div>

              {/* Buttons */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                    if (feedbackModal.type === "edit_success") {
                      router.push("/products");
                    }
                  }}
                  className={`w-full py-2.5 text-white text-xs font-bold rounded-xl shadow-xs transition-colors ${
                    feedbackModal.type === "error"
                      ? "bg-rose-500 hover:bg-rose-600"
                      : "bg-[#FE9F43] hover:bg-[#E88B32]"
                  }`}
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </form>
    </AppLayout>
  );
}
