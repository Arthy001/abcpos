import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
