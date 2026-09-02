import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { NavigationLoader } from "@/components/common/NavigationLoader";

export const metadata: Metadata = {
  title: "A POS - Inventory & Retail Dashboard",
  description: "Modern A POS and Inventory Management Web Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Suspense fallback={null}>
          <NavigationLoader />
        </Suspense>
        {children}
      </body>
    </html>
  );
}

