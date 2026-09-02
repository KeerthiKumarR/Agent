"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  LayoutDashboard,
  ShoppingBag,
  ShoppingCart,
  ShieldCheck,
  RotateCcw,
  Send,
  FileText,
  Sliders,
  Sparkles,
  Zap,
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
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchCart();
    const interval = setInterval(fetchCart, 3000);
    return () => clearInterval(interval);
  }, [pathname]);

  const navItems = [
    { name: "Home", href: "/", icon: Sparkles },
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "AI Shop", href: "/shop", icon: Bot },
    { name: "Cart", href: "/cart", icon: ShoppingCart, badge: cartCount },
    { name: "Recovery", href: "/recovery", icon: RotateCcw },
    { name: "Campaigns", href: "/campaigns", icon: Send },
    { name: "Audit Trail", href: "/audit", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-[#080C14]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
              Commerce<span className="gradient-text-indigo">Pilot</span>
            </span>
            <span className="block text-[10px] font-mono tracking-widest text-accent-cyan uppercase font-semibold">
              Autonomous Growth Agent
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1 lg:space-x-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all duration-200 ${
                  isActive
                    ? "bg-primary/20 text-white border border-primary/40 shadow-sm shadow-primary/20"
                    : "text-text-secondary hover:text-white hover:bg-surface-elevated"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${isActive ? "text-primary-light" : "text-text-muted"}`}
                />
                <span>{item.name}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-primary text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action: Demo Controls Trigger */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (onOpenDemoControls) {
                onOpenDemoControls();
              } else {
                window.dispatchEvent(new CustomEvent("open-demo-controls"));
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-purple/20 to-primary/20 border border-primary/40 text-primary-light hover:text-white hover:border-primary text-xs font-semibold shadow-md shadow-primary/10 transition-all hover:scale-105 active:scale-95"
            title="Open Interactive Demo Controls"
          >
            <Sliders className="w-3.5 h-3.5 text-accent-purple" />
            <span className="hidden sm:inline">Demo Controls</span>
            <span className="px-1 py-0.5 rounded text-[9px] bg-primary/40 text-accent-cyan uppercase font-mono font-bold">
              Live
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
