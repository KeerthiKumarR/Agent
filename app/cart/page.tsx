"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Trash2,
  ArrowRight,
  Sparkles,
  Plus,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Cart } from "@/lib/types";
import { UpsellRecommendation } from "@/lib/agents/growthAgent";

export default function SmartCartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [upsell, setUpsell] = useState<UpsellRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dismissedUpsell, setDismissedUpsell] = useState(false);

  const fetchCartData = async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        setUpsell(data.upsell);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleRemoveItem = async (itemId: string) => {
    setActionLoading(`remove_${itemId}`);
    try {
      const res = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        setUpsell(data.upsell);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddUpsell = async () => {
    if (!upsell) return;
    setActionLoading("add_upsell");
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: upsell.product.id,
          quantity: 1,
          isUpsell: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCart(data.cart);
        setUpsell(data.upsell);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mx-auto" />
        <p className="text-xs text-zinc-400 font-mono">
          Loading smart cart & running telemetry...
        </p>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-zinc-300" />
            Smart Cart
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Autonomous growth analysis and real-time complementary product matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            className="px-3 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#202024] border border-[#27272a] text-xs text-zinc-300 hover:text-white transition-colors"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 rounded-xl bg-[#121214] border border-[#27272a] text-center space-y-4 max-w-md mx-auto">
          <div className="w-10 h-10 rounded-lg bg-[#18181b] border border-[#27272a] flex items-center justify-center text-zinc-400 mx-auto">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-white">
              Your Cart is Empty
            </h3>
            <p className="text-xs text-zinc-400">
              Explore Velocity Sports catalog to add running footwear and gear.
            </p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-black text-xs font-semibold transition-colors"
          >
            Browse AI Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* CART ITEMS COLUMN (7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-mono text-zinc-400 uppercase font-semibold">
              Cart Items ({items.length})
            </div>

            <div className="space-y-2.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-lg bg-[#121214] border border-[#27272a] flex items-center gap-3.5"
                >
                  <div className="relative w-16 h-16 rounded-md overflow-hidden bg-[#18181b] shrink-0 border border-[#27272a]">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-white truncate">
                        {item.product.name}
                      </h4>
                      <span className="text-xs font-semibold text-white whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-400">
                      Qty: {item.quantity} × ₹{item.price.toLocaleString("en-IN")}
                    </div>

                    {item.isUpsell && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        <Sparkles className="w-2.5 h-2.5" /> Growth Upsell
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={actionLoading === `remove_${item.id}`}
                    className="p-1.5 rounded text-zinc-500 hover:text-red-400 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* GROWTH AGENT COMPLEMENTARY UPSELL CARD */}
            {upsell && !dismissedUpsell && (
              <div className="p-4 rounded-xl bg-[#18181b] border border-[#27272a] space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between pb-2.5 border-b border-[#27272a]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-zinc-800 flex items-center justify-center text-zinc-300">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold text-white uppercase tracking-wide flex items-center gap-2">
                        Growth Insight
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-400 border border-zinc-700 font-semibold">
                          {(upsell.confidence * 100).toFixed(0)}% Match
                        </span>
                      </h3>
                    </div>
                  </div>
                </div>

                {/* Reasoning Quote */}
                <div className="p-2.5 rounded bg-[#121214] border border-[#27272a] text-xs text-zinc-300 leading-relaxed">
                  <span className="font-semibold text-white">
                    Why Recommended:{" "}
                  </span>
                  &quot;{upsell.reasoning}&quot;
                </div>

                {/* Upsell Product Mini-Card */}
                <div className="p-2.5 rounded-lg bg-[#121214] border border-[#27272a] flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded overflow-hidden shrink-0 bg-[#18181b]">
                    <Image
                      src={upsell.product.image}
                      alt={upsell.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-white truncate">
                      {upsell.product.name}
                    </div>
                    <div className="text-xs font-semibold text-zinc-200">
                      ₹{upsell.product.price.toLocaleString("en-IN")}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDismissedUpsell(true)}
                      className="px-2 py-1 rounded text-xs text-zinc-400 hover:text-white transition-colors"
                    >
                      Dismiss
                    </button>
                    <button
                      onClick={handleAddUpsell}
                      disabled={actionLoading === "add_upsell"}
                      className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      {actionLoading === "add_upsell" ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Add
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY COLUMN (5 COLS) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-5 rounded-xl bg-[#121214] border border-[#27272a] space-y-4">
              <h3 className="text-sm font-semibold text-white pb-3 border-b border-[#27272a]">
                Order Summary
              </h3>

              <div className="space-y-2 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">
                    ₹{cart?.total.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-medium">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (GST Included)</span>
                  <span className="text-white font-medium">₹0</span>
                </div>
                <div className="pt-2.5 border-t border-[#27272a] flex justify-between text-sm font-bold text-white">
                  <span>Total</span>
                  <span>
                    ₹{cart?.total.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="p-2.5 rounded bg-[#18181b] border border-[#27272a] text-[11px] text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Bounded Autonomous Security
                </div>
                <p className="leading-snug">
                  Zero silent charges. Payment requires explicit authorization at checkout.
                </p>
              </div>

              <Link
                href="/checkout"
                className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
