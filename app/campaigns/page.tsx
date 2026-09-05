"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  CheckCheck,
  ExternalLink,
  Sparkles,
  Loader2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Product, Customer } from "@/lib/types";

export default function CampaignComposerPage() {
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer>({
    id: "cust_demo_01",
    name: "Rohan Sharma",
    email: "rohan.sharma@example.com",
    phone: "+91 98765 43210",
    messagesSentThisWeek: 1,
  });

  const [product, setProduct] = useState<Product>({
    id: "shoe_001",
    name: "AeroRun Waterproof Shoes",
    slug: "aerorun-waterproof",
    price: 4999,
    currency: "INR",
    category: "Running Shoes",
    description: "HydroShield waterproof membrane running shoes",
    features: ["100% HydroShield Waterproof", "Nitrogen-infused EVA Midsole"],
    attributes: { waterproof: true, usage: ["running", "outdoor"] },
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    stock: 18,
    tags: ["shoes", "running", "waterproof"],
  });

  const [messageCopy, setMessageCopy] = useState<string>(
    `Hey Rohan! 👋\n\nStill thinking about the *AeroRun Waterproof Shoes*?\n\nYou spent some time comparing them, and based on your interest in outdoor running, their waterproof design makes them a strong fit for your training.\n\nThey're still saved in your cart whenever you're ready 😊`,
  );

  const [simulateFailure, setSimulateFailure] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deliveryResult, setDeliveryResult] = useState<any>(null);
  const [cartId, setCartId] = useState<string>("cart_abandoned_01");

  useEffect(() => {
    const initPage = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryCartId = urlParams.get("cartId") || "cart_abandoned_01";
        setCartId(queryCartId);

        // Fetch recent campaigns and carts
        const campRes = await fetch("/api/campaigns");
        if (campRes.ok) {
          const { campaigns } = await campRes.json();
          const latestCamp = campaigns?.find(
            (c: any) => c.cartId === queryCartId,
          ) || campaigns?.[0];

          if (latestCamp) {
            setMessageCopy(latestCamp.message);
            if (latestCamp.product) setProduct(latestCamp.product);
            if (latestCamp.customerId) {
              setCustomer({
                id: latestCamp.customerId,
                name: latestCamp.customerName,
                email: "customer@example.com",
                phone: latestCamp.customerPhone,
                messagesSentThisWeek: 1,
              });
            }
            if (latestCamp.deliveryStatus) {
              setDeliveryResult({
                success: latestCamp.deliveryStatus === "DELIVERED",
                status: latestCamp.deliveryStatus,
                messageId: latestCamp.id,
                error: latestCamp.deliveryError,
              });
            }
          }
        }
      } catch (e) {
        console.error("Failed to load campaign data:", e);
      }
    };

    initPage();
  }, []);

  const handleDispatch = async () => {
    setIsSending(true);
    setDeliveryResult(null);

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          simulateFailure,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setDeliveryResult({
          success: data.campaign?.deliveryStatus === "DELIVERED",
          status: data.campaign?.deliveryStatus,
          messageId: data.campaign?.id,
          error: data.campaign?.deliveryError,
        });
      } else {
        setDeliveryResult({
          success: false,
          status: "FAILED",
          error: data.error || "Provider communication error",
        });
      }
    } catch (e: any) {
      setDeliveryResult({
        success: false,
        status: "FAILED",
        error: e.message,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCtaClick = () => {
    // Restores cart and navigates to checkout
    fetch("/api/demo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SIMULATE_RESTORE_CART",
        payload: { cartId },
      }),
    });
    router.push(`/checkout?cartId=${cartId}&restored=true`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Send className="w-5 h-5 text-zinc-300" />
              Campaign Composer & WhatsApp Simulator
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold uppercase">
              Demo Provider
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Personalized, non-aggressive recovery messaging bounded by merchant safety policies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recovery"
            className="px-3.5 py-1.5 rounded-lg bg-[#18181b] hover:bg-[#202024] border border-[#27272a] text-xs text-zinc-300 hover:text-white transition-colors"
          >
            ← Recovery Center
          </Link>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: SETTINGS & PHONE MOCKUP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CAMPAIGN CONFIG & DISPATCH (6 COLS) */}
        <div className="lg:col-span-6 space-y-5">
          {/* Target Customer Card */}
          <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#27272a]">
              <h3 className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                Target Recipient
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 font-medium">
                Opted-In Customer
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-zinc-400">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="text-white font-medium">{customer.name}</span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp:</span>
                <span className="font-mono text-white">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Outreach This Week:</span>
                <span className="font-mono text-zinc-200">
                  {customer.messagesSentThisWeek} / 2 max
                </span>
              </div>
            </div>
          </div>

          {/* Copy Editor & Agent Tone */}
          <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                AI Generated Copy (Non-Aggressive)
              </label>
              <span className="text-[10px] text-zinc-500">
                Dynamic Personalization
              </span>
            </div>

            <textarea
              value={messageCopy}
              onChange={(e) => setMessageCopy(e.target.value)}
              rows={6}
              className="w-full p-3 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-white leading-relaxed focus:outline-none focus:border-zinc-500 font-sans"
            />

            <div className="p-2.5 rounded bg-black/40 border border-white/5 text-[11px] text-zinc-400">
              <span className="font-semibold text-zinc-200">
                Tone Guardrail:
              </span>{" "}
              Helpful and non-intrusive. Avoids high-pressure spam tactics and respects customer attention.
            </div>
          </div>

          {/* Delivery Mode & Provider Dispatch Controls */}
          <div className="p-4 rounded-xl bg-[#121214] border border-[#27272a] space-y-3.5">
            <div className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
              CampaignProvider Controls (Simulator)
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#18181b] border border-[#27272a]">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-white">
                  Simulate Delivery Failure
                </div>
                <div className="text-[10px] text-zinc-400">
                  Tests failure logging & retry logic without spamming
                </div>
              </div>
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-white"
              />
            </div>

            <button
              onClick={handleDispatch}
              disabled={isSending}
              className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching via Demo Provider...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Campaign Message</span>
                </>
              )}
            </button>

            {/* Delivery Result Feedback */}
            {deliveryResult && (
              <div
                className={`p-3 rounded-lg border text-xs space-y-1 ${
                  deliveryResult.success
                    ? "bg-emerald-950/60 border-emerald-800/50 text-emerald-300"
                    : "bg-red-950/60 border-red-800/50 text-red-300"
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold">
                  {deliveryResult.success ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>
                        Simulated Delivery Confirmed (ID: {deliveryResult.messageId})
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>Delivery Failed: {deliveryResult.error}</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] opacity-80">
                  {deliveryResult.success
                    ? 'Customer can click "View My Cart" in simulator to restore saved checkout.'
                    : "Failure logged in audit trail. Bounded retry recorded."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REALISTIC WHATSAPP SMARTPHONE MOCKUP (6 COLS) */}
        <div className="lg:col-span-6 flex justify-center">
          {/* Smartphone Frame */}
          <div className="w-[330px] sm:w-[360px] rounded-[36px] bg-[#1a1a1e] p-3 shadow-2xl border border-[#27272a] relative">
            {/* Phone Screen */}
            <div className="w-full h-[580px] rounded-[26px] whatsapp-chat-bg overflow-hidden flex flex-col justify-between border border-black/40 relative">
              {/* WhatsApp Header Bar */}
              <div className="bg-[#18181b] px-3.5 py-2.5 flex items-center justify-between text-white border-b border-[#27272a] z-10">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center font-semibold text-xs text-white">
                    VS
                  </div>
                  <div>
                    <div className="text-xs font-semibold leading-tight">
                      Velocity Sports
                    </div>
                    <div className="text-[9px] text-zinc-400 font-mono">
                      WhatsApp Simulator
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-zinc-500">Today</span>
              </div>

              {/* Chat Bubble Area */}
              <div className="flex-1 p-3 space-y-2.5 overflow-y-auto">
                {/* Security Encryption Notice */}
                <div className="text-center">
                  <span className="text-[9px] bg-[#121214] text-zinc-400 px-2 py-0.5 rounded border border-[#27272a] font-mono inline-block">
                    WhatsApp Demo Provider
                  </span>
                </div>

                {/* WhatsApp Message Card */}
                <div className="bg-[#18181b] rounded-xl rounded-tl-sm p-3 border border-[#27272a] space-y-2.5 max-w-[95%]">
                  {/* Hero Product Media */}
                  <div className="relative w-full h-36 rounded-lg overflow-hidden bg-black/40">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white">
                      ₹{product.price.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="text-xs text-zinc-200 whitespace-pre-line leading-relaxed font-sans">
                    {messageCopy}
                  </div>

                  {/* Delivery Timestamp & Blue Double Ticks */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-zinc-500 font-mono">
                    <span>10:22 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-zinc-300" />
                  </div>

                  {/* Interactive WhatsApp CTA Button */}
                  <div className="pt-2 border-t border-[#27272a]">
                    <button
                      onClick={handleCtaClick}
                      className="w-full py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>View My Cart</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                    <span className="block text-[9px] text-center text-zinc-500 mt-1">
                      Restores cart & navigates to checkout
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock WhatsApp Input Bar */}
              <div className="bg-[#18181b] px-3 py-2 flex items-center gap-2 border-t border-[#27272a]">
                <div className="flex-1 bg-[#121214] rounded-full px-3 py-1 text-[11px] text-zinc-500">
                  Message...
                </div>
                <div className="w-7 h-7 rounded-full bg-zinc-700 flex items-center justify-center text-white">
                  <Send className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
