import React from "react";
import { BrandPageLoader } from "@/components/common/BrandPageLoader";

export default function Loading() {
  return <BrandPageLoader message="Loading ABCPOS..." fullScreen={true} />;
}
