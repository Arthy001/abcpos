import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { NavigationLoader } from "@/components/common/NavigationLoader";

export const metadata: Metadata = {
  title: "Prime ERP - Modern Enterprise Management",
  description: "Prime ERP - Complete Supply Chain, Manufacturing, and Retail Management",
  icons: {
    icon: "/assets/images/primeicon.ico",
    shortcut: "/assets/images/primeicon.ico",
    apple: "/assets/images/primeicon.ico",
  },
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

