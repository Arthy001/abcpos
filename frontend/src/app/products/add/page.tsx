"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  fetchCategories,
  fetchBrands,
  fetchUnits,
  fetchWarehouses,
  fetchStores,
  fetchVariantAttributes,
  createProductApi,
} from "@/lib/api";
import { Category, Brand, Unit, Warehouse, Store, VariantAttribute } from "@/types";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
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
  Sliders,
  Layers,
  Copy,
  Settings2,
  Check,
  Calendar,
  CalendarDays,
  Clock,
} from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();
  const { canCreateProduct, fetchRolePermissions } = useAuthStore();

  // Reference lists from DB
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stores, setStores] = useState<Store[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Form State
  const [storeId, setStoreId] = useState<string>("");
  const [warehouseId, setWarehouseId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [sku, setSku] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [brandId, setBrandId] = useState<string>("");
  const [unitId, setUnitId] = useState<string>("");
  const [barcode, setBarcode] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  // Pricing & Stocks
  const [productType, setProductType] = useState<"SINGLE" | "VARIABLE">("SINGLE");
  const [quantity, setQuantity] = useState<number>(20);
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [taxType, setTaxType] = useState("Exclusive");
  const [taxRate, setTaxRate] = useState("7% VAT");
  const [minStockAlert, setMinStockAlert] = useState<number>(5);

  // Custom Fields / Dates
  const [manufacturedDate, setManufacturedDate] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");

  // Multi-Expiry Batches State (Lot Optional)
  const [expiryTrackingMode, setExpiryTrackingMode] = useState<"SINGLE_DATE" | "MULTI_BATCH">("SINGLE_DATE");
  const [expiryBatchRows, setExpiryBatchRows] = useState<
    {
      id: string;
      batchNo: string;
      manufacturedDate: string;
      expiredDate: string;
      quantity: number;
      costPrice: number;
    }[]
  >([
    {
      id: "batch-1",
      batchNo: "",
      manufacturedDate: "",
      expiredDate: "",
      quantity: 10,
      costPrice: 0,
    },
  ]);

  // Variable Product Attributes & Combination Matrix State
  const [variantAttributesList, setVariantAttributesList] = useState<VariantAttribute[]>([]);
  const [selectedAttributeId, setSelectedAttributeId] = useState<string>("");
  const [selectedAttrs, setSelectedAttrs] = useState<
    { attributeId: string; attributeName: string; values: string[]; allValues: string[] }[]
  >([]);
  const [variantRows, setVariantRows] = useState<
    {
      id: string;
      name: string;
      attributes: Record<string, string>;
      sku: string;
      barcode: string;
      price: number;
      costPrice: number;
      stock: number;
      minStockAlert: number;
    }[]
  >([]);

  // Bulk Variant Controls
  const [bulkPrice, setBulkPrice] = useState<string>("");
  const [bulkCost, setBulkCost] = useState<string>("");
  const [bulkStock, setBulkStock] = useState<string>("");

  useEffect(() => {
    fetchRolePermissions().then(() => {
      if (!canCreateProduct()) {
        alert("Permission Denied: คุณไม่มีสิทธิ์ในการเพิ่มสินค้าใหม่");
        router.replace("/products");
      }
    });

    // Generate initial random SKU
    generateSku();

    // Fetch dropdown data
    Promise.all([
      fetchCategories(),
      fetchBrands(),
      fetchUnits(),
      fetchWarehouses(),
      fetchStores(),
      fetchVariantAttributes(),
    ])
      .then(([cats, brds, unts, whs, strs, vAttrs]) => {
        setVariantAttributesList(vAttrs || []);
        setCategories(cats);
        if (cats.length > 0) setCategoryId(cats[0].id);

        setBrands(brds);
        if (brds.length > 0) setBrandId(brds[0].id);

        setUnits(unts);
        if (unts.length > 0) setUnitId(unts[0].id);

        setWarehouses(whs);
        if (whs.length > 0) setWarehouseId(whs[0].id);

        setStores(strs);
        if (strs.length > 0) setStoreId(strs[0].id);
      })
      .catch((err) => {
        console.error("Error loading dropdown data:", err);
      });
  }, []);

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
    // Reset file input value so user can re-select same file if desired
    e.target.value = "";
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  // Auto generate slug
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
    );
  };

  // Generate random SKU
  const generateSku = () => {
    const random = Math.floor(1000 + Math.random() * 9000);
    setSku(`PROD-${random}`);
  };

  // Generate random Barcode
  const generateBarcode = () => {
    const random = Math.floor(100000000000 + Math.random() * 900000000000);
    setBarcode(`885${random}`);
  };

  // Add a new expiry batch row
  const handleAddBatchRow = () => {
    setExpiryBatchRows((prev) => [
      ...prev,
      {
        id: `batch-${Date.now()}`,
        batchNo: "",
        manufacturedDate: "",
        expiredDate: "",
        quantity: 10,
        costPrice: Number(costPrice) || 0,
      },
    ]);
  };

  // Remove an expiry batch row
  const handleRemoveBatchRow = (id: string) => {
    setExpiryBatchRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  };

  // Update field in expiry batch row
  const handleUpdateBatchRow = (id: string, field: string, val: any) => {
    setExpiryBatchRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  // Add an attribute to the product
  const handleAddAttribute = () => {
    if (!selectedAttributeId) return;
    const attr = variantAttributesList.find((a) => a.id === selectedAttributeId);
    if (!attr) return;
    if (selectedAttrs.some((item) => item.attributeId === attr.id)) return;

    const parsedValues = attr.values
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean);

    setSelectedAttrs((prev) => [
      ...prev,
      {
        attributeId: attr.id,
        attributeName: attr.name,
        values: [...parsedValues], // default all selected
        allValues: parsedValues,
      },
    ]);
    setSelectedAttributeId("");
  };

  // Toggle value in an attribute
  const handleToggleValue = (attrId: string, val: string) => {
    setSelectedAttrs((prev) =>
      prev.map((item) => {
        if (item.attributeId !== attrId) return item;
        const exists = item.values.includes(val);
        const nextVals = exists
          ? item.values.filter((v) => v !== val)
          : [...item.values, val];
        return { ...item, values: nextVals };
      })
    );
  };

  // Remove attribute
  const handleRemoveAttribute = (attrId: string) => {
    setSelectedAttrs((prev) => prev.filter((item) => item.attributeId !== attrId));
  };

  // Cartesian generator for variants
  const handleGenerateMatrix = () => {
    const activeAttrs = selectedAttrs.filter((a) => a.values.length > 0);
    if (activeAttrs.length === 0) {
      setVariantRows([]);
      return;
    }

    // Cartesian product
    const cartesian = (arrays: string[][]): string[][] => {
      return arrays.reduce(
        (acc, curr) => acc.flatMap((c) => curr.map((n) => [...c, n])),
        [[]] as string[][]
      );
    };

    const valueArrays = activeAttrs.map((a) => a.values);
    const combinations = cartesian(valueArrays);

    const baseSku = sku.trim() || "PRD";
    const baseSellingPrice = Number(price) || 0;
    const baseCostPrice = Number(costPrice) || 0;
    const baseAlert = Number(minStockAlert) || 5;

    const newRows = combinations.map((combo) => {
      const attrRecord: Record<string, string> = {};
      const comboTags: string[] = [];
      const skuSuffixParts: string[] = [];

      combo.forEach((val, idx) => {
        const attrName = activeAttrs[idx].attributeName;
        attrRecord[attrName] = val;
        comboTags.push(`${attrName}: ${val}`);
        skuSuffixParts.push(val.toUpperCase().replace(/[^A-Z0-9]/g, ""));
      });

      const variantName = comboTags.join(" / ");
      const variantSku = `${baseSku}-${skuSuffixParts.join("-")}`;

      // Check if existing variant has custom price/stock
      const existing = variantRows.find((r) => r.name === variantName);
      if (existing) {
        return existing;
      }

      return {
        id: `v-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: variantName,
        attributes: attrRecord,
        sku: variantSku,
        barcode: "",
        price: baseSellingPrice,
        costPrice: baseCostPrice,
        stock: 10,
        minStockAlert: baseAlert,
      };
    });

    setVariantRows(newRows);
  };

  // Apply Bulk Values to all variants
  const handleApplyBulk = (type: "price" | "cost" | "stock") => {
    if (type === "price") {
      const p = parseFloat(bulkPrice);
      if (isNaN(p)) return;
      setVariantRows((prev) => prev.map((r) => ({ ...r, price: p })));
      setBulkPrice("");
    } else if (type === "cost") {
      const c = parseFloat(bulkCost);
      if (isNaN(c)) return;
      setVariantRows((prev) => prev.map((r) => ({ ...r, costPrice: c })));
      setBulkCost("");
    } else if (type === "stock") {
      const s = parseInt(bulkStock, 10);
      if (isNaN(s)) return;
      setVariantRows((prev) => prev.map((r) => ({ ...r, stock: s })));
      setBulkStock("");
    }
  };

  // Update specific variant row field
  const handleUpdateVariantRow = (id: string, field: string, val: any) => {
    setVariantRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
    );
  };

  // Delete specific variant row
  const handleDeleteVariantRow = (id: string) => {
    setVariantRows((prev) => prev.filter((r) => r.id !== id));
  };

  // Feedback Modal State
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    type: "add_success" | "error";
    title: string;
    message: string;
    productName?: string;
  }>({
    isOpen: false,
    type: "add_success",
    title: "",
    message: "",
  });

  const resetForm = () => {
    setName("");
    setSlug("");
    generateSku();
    generateBarcode();
    setDescription("");
    setImages([]);
    setPrice(0);
    setCostPrice(0);
    setQuantity(20);
    setMinStockAlert(5);
    setManufacturedDate("");
    setExpiryDate("");
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

      // Serialize images if multiple or single
      const imagePayload = images.length > 0 ? JSON.stringify(images) : undefined;

      const validBatchesPayload =
        expiryTrackingMode === "MULTI_BATCH"
          ? expiryBatchRows
              .filter((b) => b.expiredDate && b.expiredDate.trim())
              .map((b) => ({
                batchNo: b.batchNo.trim() || undefined,
                manufacturedDate: b.manufacturedDate || undefined,
                expiredDate: b.expiredDate,
                quantity: Number(b.quantity) || 0,
                costPrice: Number(b.costPrice) || 0,
              }))
          : undefined;

      if (expiryTrackingMode === "MULTI_BATCH" && (!validBatchesPayload || validBatchesPayload.length === 0)) {
        setFeedbackModal({
          isOpen: true,
          type: "error",
          title: "Missing Expiry Dates",
          message: "Please specify at least one valid Expiry Date for the multi-expiry batches mode.",
        });
        return;
      }

      const totalBatchStock = validBatchesPayload
        ? validBatchesPayload.reduce((acc, b) => acc + (Number(b.quantity) || 0), 0)
        : 0;

      if (productType === "VARIABLE") {
        if (variantRows.length === 0) {
          setFeedbackModal({
            isOpen: true,
            type: "error",
            title: "No Variants Configured",
            message: "Please configure and generate at least one variant combination for this Variable Product.",
          });
          return;
        }

        // Validate variant SKUs
        const emptySkuIndex = variantRows.findIndex((r) => !r.sku.trim());
        if (emptySkuIndex !== -1) {
          setFeedbackModal({
            isOpen: true,
            type: "error",
            title: "Missing Variant SKU",
            message: `Variant #${emptySkuIndex + 1} (${variantRows[emptySkuIndex].name}) is missing a SKU.`,
          });
          return;
        }

        const totalStock = variantRows.reduce((acc, v) => acc + (Number(v.stock) || 0), 0);
        const minPrice = Math.min(...variantRows.map((v) => Number(v.price) || 0));

        await createProductApi({
          name: name.trim(),
          sku: sku.trim(),
          barcode: barcode.trim() || undefined,
          description: description.trim() || undefined,
          productType: "VARIABLE",
          price: minPrice,
          costPrice: Number(costPrice || variantRows[0]?.costPrice || 0),
          stock: totalStock,
          minStockAlert: Number(minStockAlert || 5),
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
          unitId: unitId || undefined,
          warehouseId: warehouseId || undefined,
          storeId: storeId || undefined,
          image: imagePayload,
          status: totalStock > 0 ? "ACTIVE" : "OUT_OF_STOCK",
          manufacturedDate: manufacturedDate || undefined,
          expiredDate: expiryDate || undefined,
          expiryBatches: validBatchesPayload,
          variants: variantRows.map((v) => ({
            name: v.name,
            sku: v.sku.trim(),
            barcode: v.barcode.trim() || undefined,
            attributes: v.attributes,
            price: Number(v.price || 0),
            costPrice: Number(v.costPrice || 0),
            stock: Number(v.stock || 0),
            minStockAlert: Number(v.minStockAlert || 5),
          })),
        });
      } else {
        await createProductApi({
          name: name.trim(),
          sku: sku.trim(),
          barcode: barcode.trim() || undefined,
          description: description.trim() || undefined,
          productType: "SINGLE",
          price: Number(price || 0),
          costPrice: Number(costPrice || 0),
          stock: validBatchesPayload && totalBatchStock > 0 ? totalBatchStock : Number(quantity || 0),
          minStockAlert: Number(minStockAlert || 5),
          categoryId: categoryId || undefined,
          brandId: brandId || undefined,
          unitId: unitId || undefined,
          warehouseId: warehouseId || undefined,
          storeId: storeId || undefined,
          image: imagePayload,
          status: (validBatchesPayload && totalBatchStock > 0 ? totalBatchStock : Number(quantity)) > 0 ? "ACTIVE" : "OUT_OF_STOCK",
          manufacturedDate: manufacturedDate || undefined,
          expiredDate: expiryDate || undefined,
          expiryBatches: validBatchesPayload,
        });
      }

      setFeedbackModal({
        isOpen: true,
        type: "add_success",
        title: "Product Created!",
        message: `Product "${name.trim()}" (SKU: ${sku.trim()}) has been added to your inventory.`,
        productName: name.trim(),
      });
    } catch (err: any) {
      setFeedbackModal({
        isOpen: true,
        type: "error",
        title: "Failed to Create Product",
        message: err.message || "An error occurred while creating product.",
      });
    } finally {
      setLoading(false);
    }
  };

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
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Create Product</h1>
              <p className="text-xs text-gray-400 mt-0.5">Add a new item to your store & warehouse inventory</p>
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
                <span>Saving Product...</span>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Save Product</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Alerts */}
        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center space-x-3 text-sm font-semibold animate-in fade-in">
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>Product created successfully! Redirecting to products list...</span>
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
                placeholder="e.g. Apple MacBook Air M3"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">Slug</label>
              <input
                type="text"
                placeholder="auto-generated-slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* SKU */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-700">
                  SKU <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={generateSku}
                  className="text-[11px] font-bold text-[#FE9F43] hover:text-[#E88B32] flex items-center space-x-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Generate</span>
                </button>
              </div>
              <input
                type="text"
                required
                placeholder="e.g. PROD-1024"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>

            {/* Category */}
            <div>
              <SearchableSelect
                label="Category"
                required
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
                placeholder="e.g. 885123456789"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
              />
            </div>
          </div>

          {/* Description with Toolbar */}
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
                placeholder="Provide details about product features, dimensions, technical specifications..."
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
            {/* Product Type Radio */}
            <div className="flex items-center space-x-4 text-xs font-semibold text-gray-700">
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  checked={productType === "SINGLE"}
                  onChange={() => setProductType("SINGLE")}
                  className="accent-[#FE9F43]"
                />
                <span>Single Product</span>
              </label>
              <label className="flex items-center space-x-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="productType"
                  checked={productType === "VARIABLE"}
                  onChange={() => setProductType("VARIABLE")}
                  className="accent-[#FE9F43]"
                />
                <span>Variable Product</span>
              </label>
            </div>
          </div>

          {/* Standard Single Product Pricing */}
          {productType === "SINGLE" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {/* Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Quantity (Stock) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                />
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
                  placeholder="0.00"
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
                  placeholder="0.00"
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#FE9F43] focus:bg-white"
                />
              </div>

              {/* Tax Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tax Type</label>
                <select
                  value={taxType}
                  onChange={(e) => setTaxType(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                >
                  <option value="Exclusive">Exclusive</option>
                  <option value="Inclusive">Inclusive</option>
                </select>
              </div>

              {/* Tax Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Tax Rate</label>
                <select
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                >
                  <option value="7% VAT">7% Standard VAT</option>
                  <option value="0% Zero Tax">0% Exempted</option>
                </select>
              </div>

              {/* Quantity Alert (Min Stock) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  Quantity Alert (Min Stock) <span className="text-red-500">*</span>
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
          )}

          {/* Variable Product Configuration & Matrix */}
          {productType === "VARIABLE" && (
            <div className="space-y-6">
              {/* Base Defaults Info Banner */}
              <div className="p-4 bg-orange-50/60 border border-orange-100 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center space-x-2 text-orange-900">
                  <Sliders className="w-4 h-4 text-[#FE9F43] flex-shrink-0" />
                  <span>
                    <strong>Variable Product Mode:</strong> Select attributes (e.g. Size, Color) below to generate sub-SKUs and individual variant stocks.
                  </span>
                </div>
                <Link
                  href="/variant-attributes"
                  target="_blank"
                  className="text-xs font-bold text-[#FE9F43] hover:underline flex items-center space-x-1 flex-shrink-0"
                >
                  <Settings2 className="w-3.5 h-3.5" />
                  <span>Manage Master Attributes</span>
                </Link>
              </div>

              {/* Step 1: Attribute Selector */}
              <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1.5 text-[#FE9F43]" />
                      1. Choose Variant Attributes
                    </h4>
                    <p className="text-[11px] text-gray-500">Pick attributes from your database to generate combination choices</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={selectedAttributeId}
                      onChange={(e) => setSelectedAttributeId(e.target.value)}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-1 focus:ring-[#FE9F43]"
                    >
                      <option value="">Select Attribute...</option>
                      {variantAttributesList
                        .filter((a) => !selectedAttrs.some((item) => item.attributeId === a.id))
                        .map((a) => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.values})
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      disabled={!selectedAttributeId}
                      onClick={handleAddAttribute}
                      className="px-3 py-1.5 bg-[#FE9F43] hover:bg-[#e88930] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1 transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Selected Attributes Badges & Value Pills */}
                {selectedAttrs.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">
                    No attributes selected yet. Select an attribute above (e.g. Size or Color) to begin.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedAttrs.map((attr) => (
                      <div
                        key={attr.attributeId}
                        className="bg-white p-3 rounded-xl border border-gray-200 shadow-2xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-md">
                            {attr.attributeName}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttribute(attr.attributeId)}
                            className="text-gray-400 hover:text-rose-500 p-1 rounded-md"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Values Checkboxes/Pills */}
                        <div className="flex flex-wrap gap-1.5">
                          {attr.allValues.map((val) => {
                            const isSelected = attr.values.includes(val);
                            return (
                              <button
                                type="button"
                                key={val}
                                onClick={() => handleToggleValue(attr.attributeId, val)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all flex items-center space-x-1 ${
                                  isSelected
                                    ? "bg-orange-50 border-[#FE9F43] text-orange-800"
                                    : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100"
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-[#FE9F43]" />}
                                <span>{val}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleGenerateMatrix}
                        className="px-4 py-2 bg-gradient-to-r from-[#FE9F43] to-amber-500 hover:from-[#e88930] hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-xs flex items-center space-x-1.5 transition-all"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>⚡ Generate / Refresh Variant Matrix</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Variant Combinations Table */}
              {variantRows.length > 0 && (
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 flex items-center">
                        <Sliders className="w-3.5 h-3.5 mr-1.5 text-[#FE9F43]" />
                        2. Variant Matrix ({variantRows.length} Variants | Total Stock:{" "}
                        {variantRows.reduce((acc, r) => acc + (Number(r.stock) || 0), 0)} Units)
                      </h4>
                      <p className="text-[11px] text-gray-500">Customize SKU, stock, and pricing for each individual variant</p>
                    </div>

                    {/* Bulk Fast Controls */}
                    <div className="flex items-center space-x-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 text-xs">
                      <span className="font-bold text-gray-500 text-[10px] pl-1">Batch Apply:</span>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          placeholder="Price ฿"
                          value={bulkPrice}
                          onChange={(e) => setBulkPrice(e.target.value)}
                          className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyBulk("price")}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-[10px] font-bold"
                        >
                          Set
                        </button>
                      </div>
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          placeholder="Stock"
                          value={bulkStock}
                          onChange={(e) => setBulkStock(e.target.value)}
                          className="w-16 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyBulk("stock")}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded-lg text-[10px] font-bold"
                        >
                          Set
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white">
                    <table className="w-full text-left text-xs min-w-[700px]">
                      <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                        <tr>
                          <th className="py-2.5 px-3">Variant Combination</th>
                          <th className="py-2.5 px-3">SKU <span className="text-red-500">*</span></th>
                          <th className="py-2.5 px-3">Barcode</th>
                          <th className="py-2.5 px-3">Selling Price (฿)</th>
                          <th className="py-2.5 px-3">Cost Price (฿)</th>
                          <th className="py-2.5 px-3">Stock Qty</th>
                          <th className="py-2.5 px-3">Min Alert</th>
                          <th className="py-2.5 px-2 text-center w-10">Del</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {variantRows.map((row) => (
                          <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                            <td className="py-2 px-3 font-semibold text-gray-900">
                              <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-orange-800 border border-orange-100">
                                {row.name}
                              </span>
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                required
                                value={row.sku}
                                onChange={(e) => handleUpdateVariantRow(row.id, "sku", e.target.value)}
                                className="w-full px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs font-bold focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="text"
                                placeholder="Auto/Barcode"
                                value={row.barcode}
                                onChange={(e) => handleUpdateVariantRow(row.id, "barcode", e.target.value)}
                                className="w-full px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg font-mono text-xs focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={row.price}
                                onChange={(e) => handleUpdateVariantRow(row.id, "price", parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-orange-600 focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                step="any"
                                value={row.costPrice}
                                onChange={(e) => handleUpdateVariantRow(row.id, "costPrice", parseFloat(e.target.value) || 0)}
                                className="w-24 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="0"
                                value={row.stock}
                                onChange={(e) => handleUpdateVariantRow(row.id, "stock", parseInt(e.target.value, 10) || 0)}
                                className="w-20 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                              />
                            </td>
                            <td className="py-2 px-3">
                              <input
                                type="number"
                                min="1"
                                value={row.minStockAlert}
                                onChange={(e) => handleUpdateVariantRow(row.id, "minStockAlert", parseInt(e.target.value, 10) || 5)}
                                className="w-16 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-amber-600 focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                              />
                            </td>
                            <td className="py-2 px-2 text-center">
                              <button
                                type="button"
                                title="Remove Variant"
                                onClick={() => handleDeleteVariantRow(row.id)}
                                className="p-1 text-gray-400 hover:text-rose-500 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 3. Card: Product Images (Multi-upload & Individual Delete) */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Product Images ({images.length})</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Upload one or multiple images for this product</p>
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

        {/* 4. Card: Dates & Expiry Management */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div>
              <h3 className="font-bold text-gray-900 text-sm flex items-center">
                <CalendarDays className="w-4 h-4 mr-1.5 text-[#FE9F43]" />
                Tracking & Expiry Dates
              </h3>
              <p className="text-[11px] text-gray-500">Manage manufacturing and expiry dates (Single or Multi-Batch tracking)</p>
            </div>

            {/* Mode Toggle */}
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
                <span>Multi-Batch / Expiries</span>
                <span className="px-1.5 py-0.2 bg-white/20 text-white rounded text-[10px]">Lot Optional</span>
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

          {/* MULTI-BATCH / EXPIRIES MODE */}
          {expiryTrackingMode === "MULTI_BATCH" && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                <Clock className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>บันทึกหลายรอบวันหมดอายุ:</strong> กำหนดวันผลิต วันหมดอายุ และจำนวนชิ้นของสินค้าแต่ละรอบได้อย่างอิสระ{" "}
                  <span className="text-amber-700 font-semibold">(ช่อง Lot No. เป็นทางเลือก ไม่จำเป็นต้องระบุก็ได้)</span>
                </div>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-2xl bg-white">
                <table className="w-full text-left text-xs min-w-[650px]">
                  <thead className="bg-gray-50 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3">Batch / Lot No. (ไม่บังคับ)</th>
                      <th className="py-2.5 px-3">MFG Date (วันผลิต)</th>
                      <th className="py-2.5 px-3">EXP Date (วันหมดอายุ) <span className="text-red-500">*</span></th>
                      <th className="py-2.5 px-3">Quantity (ชิ้น) <span className="text-red-500">*</span></th>
                      <th className="py-2.5 px-3">Cost Price (฿)</th>
                      <th className="py-2.5 px-2 text-center w-10">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {expiryBatchRows.map((batch, index) => (
                      <tr key={batch.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="py-2 px-3">
                          <input
                            type="text"
                            placeholder="เช่น LOT-01 หรือเว้นว่างได้"
                            value={batch.batchNo}
                            onChange={(e) => handleUpdateBatchRow(batch.id, "batchNo", e.target.value)}
                            className="w-full px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            value={batch.manufacturedDate}
                            onChange={(e) => handleUpdateBatchRow(batch.id, "manufacturedDate", e.target.value)}
                            className="w-full px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="date"
                            required
                            value={batch.expiredDate}
                            onChange={(e) => handleUpdateBatchRow(batch.id, "expiredDate", e.target.value)}
                            className="w-full px-2.5 py-1 bg-gray-50 border border-amber-300 rounded-lg text-xs font-semibold text-rose-700 focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            required
                            value={batch.quantity}
                            onChange={(e) => handleUpdateBatchRow(batch.id, "quantity", parseInt(e.target.value, 10) || 0)}
                            className="w-24 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-900 focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                          />
                        </td>
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            step="any"
                            value={batch.costPrice}
                            onChange={(e) => handleUpdateBatchRow(batch.id, "costPrice", parseFloat(e.target.value) || 0)}
                            className="w-24 px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-700 focus:bg-white focus:ring-1 focus:ring-[#FE9F43]"
                          />
                        </td>
                        <td className="py-2 px-2 text-center">
                          {expiryBatchRows.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveBatchRow(batch.id)}
                              className="p-1 text-gray-400 hover:text-rose-500 rounded"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAddBatchRow}
                  className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all w-fit"
                >
                  <Plus className="w-3.5 h-3.5 text-[#FE9F43]" />
                  <span>+ เพิ่มรอบวันหมดอายุ (Add Expiry Date)</span>
                </button>

                <div className="text-xs text-gray-600 font-medium bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
                  รวมสต็อกทุกล็อต:{" "}
                  <strong className="text-emerald-700 font-bold">
                    {expiryBatchRows.reduce((a, b) => a + (Number(b.quantity) || 0), 0)} ชิ้น
                  </strong>{" "}
                  ({expiryBatchRows.filter((b) => b.expiredDate).length} รอบวันหมดอายุ)
                </div>
              </div>
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
            {loading ? "Saving..." : "Add to Product"}
          </button>
        </div>

        {/* ========================================================= */}
        {/* Action Feedback / Alert Modal (Product Created / Error)   */}
        {/* ========================================================= */}
        {feedbackModal.isOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-sm w-full border border-gray-100 shadow-2xl p-6 space-y-4 text-center animate-in fade-in zoom-in duration-150">
              {/* Top Icon Badge */}
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto shadow-xs ${
                  feedbackModal.type === "add_success"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-rose-50 text-rose-600 border border-rose-100"
                }`}
              >
                {feedbackModal.type === "add_success" ? (
                  <Sparkles className="w-7 h-7" />
                ) : (
                  <AlertTriangle className="w-7 h-7" />
                )}
              </div>

              {/* Title & Message */}
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-900">{feedbackModal.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{feedbackModal.message}</p>
              </div>

              {/* Buttons */}
              <div className="flex items-center space-x-2 pt-2">
                {feedbackModal.type === "add_success" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                        resetForm();
                      }}
                      className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-colors"
                    >
                      + Add Another
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedbackModal((prev) => ({ ...prev, isOpen: false }));
                        router.push("/products");
                      }}
                      className="flex-1 py-2.5 bg-[#FE9F43] hover:bg-[#E88B32] text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                    >
                      View Products
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setFeedbackModal((prev) => ({ ...prev, isOpen: false }))}
                    className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </form>
    </AppLayout>
  );
}
