"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Send,
  Smartphone,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Send className="w-6 h-6 text-accent-cyan" />
              Campaign Composer & WhatsApp Simulator
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold uppercase">
              Provider Abstraction Active
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Personalized, non-aggressive messaging orchestrated by Campaign
            Agent and bounded by the Policy Engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/recovery"
            className="px-3.5 py-1.5 rounded-lg bg-surface border border-border text-xs text-text-secondary hover:text-white transition-colors"
          >
            ← Recovery Center
          </Link>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: SETTINGS & PHONE MOCKUP */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: CAMPAIGN CONFIG & DISPATCH (6 COLS) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Target Customer Card */}
          <div className="p-5 rounded-2xl glass-panel border border-border space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                Target Recipient
              </h3>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                Opted-In Customer
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-text-secondary">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="text-white font-semibold">
                  {customer.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span>WhatsApp Phone:</span>
                <span className="font-mono text-white">{customer.phone}</span>
              </div>
              <div className="flex justify-between">
                <span>Messages Sent This Week:</span>
                <span className="font-mono text-accent-cyan">
                  {customer.messagesSentThisWeek} / 2 allowed
                </span>
              </div>
            </div>
          </div>

          {/* Copy Editor & Agent Tone */}
          <div className="p-5 rounded-2xl glass-panel border border-border space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-light" />
                AI Generated Copy (Non-Aggressive)
              </label>
              <span className="text-[10px] text-text-muted">
                Dynamic Personalization
              </span>
            </div>

            <textarea
              value={messageCopy}
              onChange={(e) => setMessageCopy(e.target.value)}
              rows={6}
              className="w-full p-3.5 rounded-xl bg-surface border border-border text-xs text-white leading-relaxed focus:outline-none focus:border-primary font-sans"
            />

            <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 text-[11px] text-text-muted">
              <span className="font-bold text-emerald-400">
                Tone Principle:
              </span>{" "}
              Helpful and non-intrusive. Avoids high-pressure spam tactics and
              respects customer attention.
            </div>
          </div>

          {/* Delivery Mode & Provider Dispatch Controls */}
          <div className="p-5 rounded-2xl glass-panel border border-border space-y-4">
            <div className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              CampaignProvider Dispatch Controls
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
              <div className="space-y-0.5">
                <div className="text-xs font-semibold text-white">
                  Simulate Delivery Failure
                </div>
                <div className="text-[10px] text-text-muted">
                  Tests failure logging & bounded retry without spamming
                </div>
              </div>
              <input
                type="checkbox"
                checked={simulateFailure}
                onChange={(e) => setSimulateFailure(e.target.checked)}
                className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-surface-elevated"
              />
            </div>

            <button
              onClick={handleDispatch}
              disabled={isSending}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-accent-cyan hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Dispatching via CampaignProvider...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Campaign Message</span>
                </>
              )}
            </button>

            {/* Delivery Result Feedback */}
            {deliveryResult && (
              <div
                className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
                  deliveryResult.success
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                    : "bg-rose-500/10 border-rose-500/30 text-rose-300"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {deliveryResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>
                        WhatsApp Delivered (ID: {deliveryResult.messageId})
                      </span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-rose-400" />
                      <span>Delivery Failed: {deliveryResult.error}</span>
                    </>
                  )}
                </div>
                <p className="text-[11px] opacity-80">
                  {deliveryResult.success
                    ? 'Message received on recipient device. Customer can click "View My Cart" to restore checkout state.'
                    : "Failure logged in audit trail. 1 bounded retry scheduled with zero spam frequency."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: REALISTIC WHATSAPP SMARTPHONE MOCKUP (6 COLS) */}
        <div className="lg:col-span-6 flex justify-center">
          {/* Smartphone Frame */}
          <div className="w-[340px] sm:w-[380px] rounded-[42px] bg-[#1F242C] p-3 shadow-2xl border-4 border-[#2D333E] relative">
            {/* Phone Screen */}
            <div className="w-full h-[620px] rounded-[32px] whatsapp-chat-bg overflow-hidden flex flex-col justify-between border border-black/50 relative">
              {/* WhatsApp Header Bar */}
              <div className="bg-[#1F2C34] px-4 py-3 flex items-center justify-between text-white border-b border-black/40 z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent-cyan flex items-center justify-center font-bold text-xs text-white">
                    VS
                  </div>
                  <div>
                    <div className="text-xs font-bold leading-tight">
                      Velocity Sports
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Official Business Account
                    </div>
                  </div>
                </div>
                <span className="text-[10px] text-text-muted">Today</span>
              </div>

              {/* Chat Bubble Area */}
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
                {/* Security Encryption Notice */}
                <div className="text-center">
                  <span className="text-[9px] bg-[#182229] text-amber-300/80 px-2.5 py-1 rounded-md border border-amber-500/20 font-mono inline-block">
                    🔒 Messages are end-to-end encrypted
                  </span>
                </div>

                {/* WhatsApp Message Card */}
                <div className="bg-[#1F2C34] rounded-2xl rounded-tl-sm p-3 border border-white/5 space-y-3 max-w-[95%] shadow-md">
                  {/* Hero Product Media */}
                  <div className="relative w-full h-40 rounded-xl overflow-hidden bg-black/40">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-white">
                      ₹{product.price.toLocaleString("en-IN")}
                    </div>
                  </div>

                  {/* Body Text */}
                  <div className="text-xs text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                    {messageCopy}
                  </div>

                  {/* Delivery Timestamp & Blue Double Ticks */}
                  <div className="flex items-center justify-end gap-1 text-[10px] text-slate-400 font-mono">
                    <span>10:22 AM</span>
                    <CheckCheck className="w-3.5 h-3.5 text-accent-cyan" />
                  </div>

                  {/* Interactive WhatsApp CTA Button */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      onClick={handleCtaClick}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md group"
                    >
                      <span>View My Cart</span>
                      <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <span className="block text-[9px] text-center text-slate-400 mt-1">
                      Clicking CTA restores saved cart & navigates to safe
                      checkout
                    </span>
                  </div>
                </div>
              </div>

              {/* Mock WhatsApp Input Bar */}
              <div className="bg-[#1F2C34] px-3 py-2.5 flex items-center gap-2 border-t border-black/40">
                <div className="flex-1 bg-[#2A3942] rounded-full px-3 py-1.5 text-[11px] text-slate-400">
                  Message...
                </div>
                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
