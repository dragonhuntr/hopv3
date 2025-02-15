import "@/styles/globals.css";
import 'katex/dist/katex.min.css';

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
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.css" />
      </head>
      <body className="bg-[#1C1C1C] text-white">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
