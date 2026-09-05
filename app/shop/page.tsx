"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Bot,
  Send,
  Sparkles,
  ShoppingCart,
  CheckCircle2,
  Layers,
  Code2,
  Loader2,
} from "lucide-react";
import { Product } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  recommendations?: any[];
  intent?: any;
}

export default function ShopAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am Commerce Agent's AI Assistant for Velocity Sports. Tell me what sports gear you are looking for, your budget, or specific technical requirements (e.g. waterproof running shoes under ₹6,000) and I'll find and score the best matches.",
    },
  ]);
  const [inputQuery, setInputQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"recommendations" | "raw_catalog">(
    "recommendations",
  );
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [rawCatalogJson, setRawCatalogJson] = useState<string>("");
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load initial products and raw catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch("/api/agent/catalog");
        if (res.ok) {
          const data = await res.json();
          setDisplayedProducts(data.products || []);
          setRawCatalogJson(JSON.stringify(data, null, 2));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    setInputQuery("");
    const userMsg: Message = { role: "user", content: q };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch("/api/agent/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: q }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          role: "assistant",
          content: data.explanation,
          recommendations: data.recommendations,
          intent: data.intent,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        // Update displayed products to ranked recommendations if present
        if (data.recommendations && data.recommendations.length > 0) {
          setDisplayedProducts(data.recommendations.map((r: any) => r.product));
        }
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I encountered an error querying the catalog. Please try again.",
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Network timeout querying AI catalog agent.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    setAddingProductId(product.id);
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (res.ok) {
        setAddFeedback(`Added ${product.name} to cart.`);
        setTimeout(() => setAddFeedback(null), 3000);
      }
    } catch {
      setAddFeedback("Failed to add to cart");
    } finally {
      setAddingProductId(null);
    }
  };

  const samplePrompts = [
    "I need waterproof running shoes under ₹6,000",
    "Show me trail shoes for mountain hiking",
    "Running socks & hydration accessories",
    "Fitness tracker with heart rate & GPS",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#27272a]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5 text-zinc-300" />
              AI Commerce Shop & Catalog
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 font-semibold uppercase">
              Semantic v1
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Machine-readable catalog discoverable & transactable with natural language semantic search.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-1.5 bg-[#121214] p-1 rounded-lg border border-[#27272a]">
          <button
            onClick={() => setActiveTab("recommendations")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "recommendations"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Product Cards
          </button>
          <button
            onClick={() => setActiveTab("raw_catalog")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors ${
              activeTab === "raw_catalog"
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            JSON Endpoint
          </button>
        </div>
      </div>

      {addFeedback && (
        <div className="bg-emerald-950/80 border border-emerald-800/60 p-3 rounded-lg flex items-center justify-between text-xs text-emerald-300">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {addFeedback} (Growth Agent will analyze cart for upsells)
          </span>
          <button
            onClick={() => router.push("/cart")}
            className="px-2.5 py-1 rounded bg-emerald-700 text-white font-medium hover:bg-emerald-600 transition-colors"
          >
            Go to Cart →
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: CONVERSATIONAL AI SHOPPING CHAT (5 COLS) */}
        <div className="lg:col-span-5 rounded-xl bg-[#121214] border border-[#27272a] flex flex-col h-[650px] overflow-hidden">
          {/* Chat Header */}
          <div className="p-3.5 border-b border-[#27272a] bg-[#18181b] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-white">
                  Commerce Agent
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Semantic Catalog Connected
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-zinc-500 bg-black/40 px-2 py-0.5 rounded border border-white/5">
              Velocity Sports
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "assistant" && (
                  <div className="w-6 h-6 rounded-md bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                  </div>
                )}

                <div
                  className={`p-3 rounded-lg text-xs leading-relaxed max-w-[85%] ${
                    msg.role === "user"
                      ? "bg-white text-black font-medium"
                      : "bg-[#18181b] border border-[#27272a] text-zinc-200 space-y-2"
                  }`}
                >
                  <p className="whitespace-pre-line">
                    {msg.content}
                  </p>

                  {/* Intent breakdown if assistant */}
                  {msg.intent && (
                    <div className="mt-1.5 pt-1.5 border-t border-[#27272a] text-[10px] font-mono text-zinc-400">
                      Parsed Intent:{" "}
                      <span className="text-zinc-200">
                        {msg.intent.intentSummary}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-xs text-zinc-300 font-mono bg-[#18181b] p-2.5 rounded-lg border border-[#27272a] w-fit">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-400" />
                <span>Searching catalog & scoring match attributes...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2 bg-[#18181b] border-t border-[#27272a] overflow-x-auto flex gap-1.5">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                className="px-2 py-1 rounded bg-[#121214] hover:bg-zinc-800 border border-[#27272a] text-[10px] text-zinc-400 hover:text-white whitespace-nowrap transition-colors"
              >
                &quot;{p}&quot;
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-[#27272a] bg-[#121214]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask e.g. waterproof running shoes under ₹6000..."
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[#18181b] border border-[#27272a] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-zinc-500"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="p-2 rounded-lg bg-white text-black hover:bg-zinc-200 disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: PRODUCT RECOMMENDATIONS / RAW CATALOG (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          {activeTab === "raw_catalog" ? (
            /* RAW AI-READABLE JSON CATALOG */
            <div className="rounded-xl bg-[#121214] border border-[#27272a] p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-[#27272a]">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-zinc-300" />
                  <h3 className="text-xs font-mono font-semibold text-white">
                    GET /api/agent/catalog
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
                  200 OK • JSON-LD
                </span>
              </div>
              <pre className="text-[11px] font-mono text-zinc-300 bg-[#09090b] p-4 rounded-lg overflow-x-auto max-h-[580px] leading-relaxed border border-[#27272a]">
                {rawCatalogJson}
              </pre>
            </div>
          ) : (
            /* PRODUCT CARDS LIST */
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{displayedProducts.length} Ranked Items</span>
                <span className="text-zinc-500 font-mono">
                  Catalog Match Active
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {displayedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-3.5 rounded-xl bg-[#121214] border border-[#27272a] hover:border-zinc-500 transition-colors flex flex-col justify-between group space-y-3"
                  >
                    {/* Image & Match Score Badge */}
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-[#18181b] border border-[#27272a]">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-cover"
                      />
                      {prod.aiMatchScore && (
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/90 border border-zinc-700 text-emerald-400 text-[11px] font-mono font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          {prod.aiMatchScore}% Match
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] font-mono text-zinc-400 uppercase">
                        {prod.category}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-white">
                          {prod.name}
                        </h4>
                        <span className="text-xs font-semibold text-white whitespace-nowrap">
                          ₹{prod.price.toLocaleString("en-IN")}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-1 pt-1">
                        {prod.features.slice(0, 2).map((f, i) => (
                          <div
                            key={i}
                            className="text-[10px] text-zinc-400 flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* Why Recommended Explanation */}
                      {prod.whyRecommended && (
                        <div className="p-2 rounded bg-[#18181b] border border-[#27272a] text-[10px] text-zinc-300 font-medium leading-tight">
                          <span className="font-semibold text-white">AI Rationale:</span>{" "}
                          {prod.whyRecommended}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-[#27272a] flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-zinc-500">
                        Stock: {prod.stock}
                      </span>
                      <button
                        onClick={() => handleAddToCart(prod)}
                        disabled={addingProductId === prod.id}
                        className="px-3 py-1.5 rounded bg-white hover:bg-zinc-200 text-black text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50"
                      >
                        {addingProductId === prod.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" />{" "}
                            Adding...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-3.5 h-3.5" /> Add to Cart
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
