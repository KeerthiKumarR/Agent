import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import DemoControlsModal from "@/components/DemoControlsModal";

export const metadata: Metadata = {
  title: "Commerce Agent — Autonomous AI Growth & Agentic Commerce Platform",
  description:
    "Turn Every Customer Signal Into Revenue. Autonomous growth agents, AI-readable catalogs, bounded policy engines, and explainable payments for merchants.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <script
          src="https://checkout.razorpay.com/v1/checkout.js"
          async
        ></script>
      </head>
      <body className="min-h-screen bg-[#080C14] text-text-primary antialiased selection:bg-primary selection:text-white flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <DemoControlsModal />
      </body>
    </html>
  );
}
