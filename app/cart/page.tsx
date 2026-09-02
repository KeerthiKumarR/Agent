'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShoppingCart, 
  Trash2, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Plus, 
  CheckCircle2, 
  ShieldCheck, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Cart, CartItem } from '@/lib/types';
import { UpsellRecommendation } from '@/lib/agents/growthAgent';

export default function SmartCartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [upsell, setUpsell] = useState<UpsellRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [dismissedUpsell, setDismissedUpsell] = useState(false);
  const router = useRouter();

  const fetchCartData = async () => {
    try {
      const res = await fetch('/api/cart');
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
      const res = await fetch('/api/cart', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
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
    setActionLoading('add_upsell');
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: upsell.product.id, quantity: 1, isUpsell: true })
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
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        <p className="text-xs text-text-muted font-mono">Loading smart cart & running Growth Agent telemetry...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-primary-light" />
            Smart Cart
          </h1>
          <p className="text-xs text-text-muted mt-1">
            Autonomous growth analysis and real-time complementary product matching.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/shop"
            className="px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-xs text-text-secondary hover:text-white transition-all"
          >
            ← Continue Shopping
          </Link>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="p-12 rounded-2xl glass-panel text-center space-y-4 max-w-lg mx-auto">
          <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-border flex items-center justify-center text-text-muted mx-auto">
            <ShoppingCart className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">Your Cart is Empty</h3>
            <p className="text-xs text-text-muted">Explore Velocity Sports catalog to add running footwear and gear.</p>
          </div>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold shadow-lg shadow-primary/20 transition-all"
          >
            Browse AI Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* CART ITEMS COLUMN (7 COLS) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="text-xs font-mono text-text-muted uppercase font-bold tracking-wider">
              Cart Items ({items.length})
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl glass-panel border border-border flex items-center gap-4 group"
                >
                  <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-surface-elevated shrink-0 border border-border">
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-white truncate">
                        {item.product.name}
                      </h4>
                      <span className="text-sm font-bold text-white whitespace-nowrap">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="text-xs text-text-muted">
                      Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                    </div>

                    {item.isUpsell && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-accent-purple/20 text-accent-purple border border-accent-purple/30 font-semibold">
                        <Sparkles className="w-2.5 h-2.5" /> Growth Agent Recommended
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={actionLoading === `remove_${item.id}`}
                    className="p-2 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* GROWTH AGENT COMPLEMENTARY UPSELL CARD */}
            {upsell && !dismissedUpsell && (
              <div className="p-5 rounded-2xl glass-panel-glow border border-primary/40 space-y-4 animate-in fade-in">
                
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-primary/20">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary/30 flex items-center justify-center text-primary-light">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        AI Growth Insight
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-primary/40 text-accent-cyan font-semibold">
                          {(upsell.confidence * 100).toFixed(0)}% Co-Purchase Match
                        </span>
                      </h3>
                      <p className="text-[11px] text-text-muted">
                        Autonomous cross-sell recommendation based on your cart category.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reasoning Quote */}
                <div className="p-3 rounded-xl bg-black/40 border border-primary/20 text-xs text-primary-light leading-relaxed">
                  <span className="font-bold text-white">Why Recommended: </span>
                  "{upsell.reasoning}"
                </div>

                {/* Upsell Product Mini-Card */}
                <div className="p-3 rounded-xl bg-surface border border-border flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-elevated">
                    <Image
                      src={upsell.product.image}
                      alt={upsell.product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-white truncate">{upsell.product.name}</div>
                    <div className="text-xs font-bold text-accent-cyan">₹{upsell.product.price.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDismissedUpsell(true)}
                      className="px-2.5 py-1.5 rounded-lg text-xs text-text-muted hover:text-white transition-colors"
                    >
                      Not Interested
                    </button>
                    <button
                      onClick={handleAddUpsell}
                      disabled={actionLoading === 'add_upsell'}
                      className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-primary/25 disabled:opacity-50"
                    >
                      {actionLoading === 'add_upsell' ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" /> Add to Cart
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
            <div className="p-6 rounded-2xl glass-panel border border-border space-y-5">
              <h3 className="text-base font-bold text-white pb-3 border-b border-border">
                Order Summary
              </h3>

              <div className="space-y-2.5 text-xs text-text-secondary">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">₹{cart?.total.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Standard Shipping</span>
                  <span className="text-emerald-400 font-medium">FREE</span>
                </div>
                <div className="flex justify-between">
                  <span>Taxes (GST Included)</span>
                  <span className="text-white font-medium">₹0</span>
                </div>
                <div className="pt-3 border-t border-border flex justify-between text-sm font-bold text-white">
                  <span>Total Amount</span>
                  <span className="text-lg text-accent-cyan">₹{cart?.total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="p-3 rounded-xl bg-surface border border-border text-[11px] text-text-muted space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  Bounded Autonomous Security
                </div>
                <p className="leading-snug">
                  AI recommendations are gated. Final payment requires your explicit customer confirmation on the checkout screen.
                </p>
              </div>

              <Link
                href="/checkout"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-primary via-indigo-500 to-accent-cyan hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-primary/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Proceed to Safe Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
