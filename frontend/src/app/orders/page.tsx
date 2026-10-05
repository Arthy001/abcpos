"use client";

import React from "react";
import { PosOrdersManager } from "@/components/pos/PosOrdersManager";

export default function OrdersPage() {
  return <PosOrdersManager pageTitle="Sales Orders & Receipts" pageSubtitle="Complete sales history from all POS terminals" />;
}
