"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  ShoppingCart,
  RotateCcw,
  Send,
  FileText,
  Sliders,
  Sparkles,
  Command,
} from "lucide-react";

interface NavbarProps {
  onOpenDemoControls?: () => void;
}

export default function Navbar({ onOpenDemoControls }: NavbarProps) {
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState<number>(0);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const totalItems =
          data.cart?.items?.reduce(
            (sum: number, item: any) => sum + item.quantity,
            0,
          ) || 0;
        setCartCount(totalItems);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchCart();
    const interval = setInterval(fetchCart, 4000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Shop", href: "/shop", icon: Bot },
    { name: "Cart", href: "/cart", icon: ShoppingCart, badge: cartCount },
    { name: "Recovery", href: "/recovery", icon: RotateCcw },
    { name: "Campaigns", href: "/campaigns", icon: Send },
    { name: "Audit Trail", href: "/audit", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#27272a] bg-[#09090b]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm tracking-tight transition-transform group-hover:scale-105">
            <Command className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-white">
              CommercePilot
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              Enterprise
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isActive
                    ? "bg-[#18181b] text-white border border-[#3f3f46]"
                    : "text-zinc-400 hover:text-white hover:bg-[#121214]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-zinc-500"}`}
                />
                <span>{item.name}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-700 text-zinc-200">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Demo Controls Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (onOpenDemoControls) {
                onOpenDemoControls();
              } else {
                window.dispatchEvent(new CustomEvent("open-demo-controls"));
              }
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-[#18181b] border border-[#27272a] hover:border-[#3f3f46] text-zinc-300 hover:text-white text-xs font-medium transition-colors"
            title="Open Demo Scenarios & Controls"
          >
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Demo Controls</span>
          </button>
        </div>
      </div>
    </header>
  );
}
