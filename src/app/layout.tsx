import "@/styles/globals.css";

import { GeistMono } from "geist/font/mono";
import { type Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: "HopV3",
  description: "AI-powered chat engine",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={GeistMono.variable}>
      <body className="bg-[#1C1C1C] text-white">
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
