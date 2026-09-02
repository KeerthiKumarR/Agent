'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Bot, 
  Send, 
  Sparkles, 
  ShoppingCart, 
  CheckCircle2, 
  Layers, 
  Code2, 
  ArrowRight, 
  Loader2, 
  Zap, 
  Info,
  ShieldCheck
} from 'lucide-react';
import { Product } from '@/lib/types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  recommendations?: any[];
  intent?: any;
}

export default function ShopAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello! I am CommercePilot's AI Shopping Assistant for Velocity Sports. Tell me what sports gear you are looking for, your budget, or specific technical requirements (e.g. waterproof running shoes under ₹6,000) and I'll find and score the best matches in our catalog."
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'recommendations' | 'raw_catalog'>('recommendations');
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [rawCatalogJson, setRawCatalogJson] = useState<string>('');
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [addFeedback, setAddFeedback] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load initial products and raw catalog
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/agent/catalog');
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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || inputQuery;
    if (!q.trim() || isLoading) return;

    setInputQuery('');
    const userMsg: Message = { role: 'user', content: q };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: q })
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMsg: Message = {
          role: 'assistant',
          content: data.explanation,
          recommendations: data.recommendations,
          intent: data.intent
        };
        setMessages(prev => [...prev, assistantMsg]);

        // Update displayed products to ranked recommendations if present
        if (data.recommendations && data.recommendations.length > 0) {
          setDisplayedProducts(data.recommendations.map((r: any) => r.product));
        }
      } else {
        setMessages(prev => [
          ...prev, 
          { role: 'assistant', content: "I encountered an error querying the catalog. Please try again." }
        ]);
      }
    } catch (e) {
      setMessages(prev => [
        ...prev, 
        { role: 'assistant', content: "Network timeout querying AI catalog agent." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: Product) => {
    setAddingProductId(product.id);
    try {
      const res = await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });

      if (res.ok) {
        setAddFeedback(`Added ${product.name} to cart!`);
        setTimeout(() => setAddFeedback(null), 3000);
      }
    } catch (e) {
      setAddFeedback('Failed to add to cart');
    } finally {
      setAddingProductId(null);
    }
  };

  const samplePrompts = [
    "I need waterproof running shoes under ₹6,000",
    "Show me trail shoes for mountain hiking",
    "Running socks & hydration accessories under ₹1,000",
    "Fitness tracker with heart rate & GPS"
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary-light" />
              AI Commerce Assistant & Catalog
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-primary/20 text-primary-light border border-primary/30 font-bold uppercase">
              Agentic Protocol v1
            </span>
          </div>
          <p className="text-xs text-text-muted mt-1">
            Machine-readable catalog discoverable & transactable by AI agents with natural language semantic search.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-2 bg-surface p-1 rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'recommendations' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-text-muted hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Product Cards
          </button>
          <button
            onClick={() => setActiveTab('raw_catalog')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              activeTab === 'raw_catalog' 
                ? 'bg-primary text-white shadow-sm' 
                : 'text-text-muted hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            AI-Readable JSON
          </button>
        </div>
      </div>

      {addFeedback && (
        <div className="bg-emerald-500/15 border border-emerald-500/30 p-3 rounded-xl flex items-center justify-between text-xs font-medium text-emerald-300 animate-in fade-in">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            {addFeedback} (Growth Agent will analyze cart for upsells)
          </span>
          <button
            onClick={() => router.push('/cart')}
            className="px-3 py-1 rounded bg-emerald-500 text-white font-bold hover:bg-emerald-600 transition-colors"
          >
            Go to Cart →
          </button>
        </div>
      )}

      {/* MAIN TWO-COLUMN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONVERSATIONAL AI SHOPPING CHAT (5 COLS) */}
        <div className="lg:col-span-5 rounded-2xl glass-panel border border-border flex flex-col h-[700px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/40 flex items-center justify-center text-primary-light">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Commerce Agent</div>
                <div className="text-[10px] text-accent-emerald flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-pulse" />
                  Semantic Catalog Connected
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-text-muted bg-black/40 px-2 py-0.5 rounded border border-white/5">
              Velocity Sports
            </span>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary-light shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                )}
                
                <div
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-tr-none'
                      : 'bg-surface-elevated border border-border/80 text-text-secondary rounded-tl-none space-y-2'
                  }`}
                >
                  <p className="whitespace-pre-line text-text-primary">{msg.content}</p>

                  {/* Intent breakdown if assistant */}
                  {msg.intent && (
                    <div className="mt-2 pt-2 border-t border-border/60 text-[10px] font-mono text-text-muted">
                      Parsed Intent: <span className="text-accent-cyan">{msg.intent.intentSummary}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-xs text-primary-light font-mono bg-surface-elevated p-3 rounded-xl border border-primary/30 w-fit animate-pulse">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span>Searching catalog & scoring match attributes...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts */}
          <div className="p-2.5 bg-surface/50 border-t border-border/40 overflow-x-auto flex gap-1.5 no-scrollbar">
            {samplePrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(p)}
                className="px-2.5 py-1 rounded-lg bg-surface-elevated hover:bg-surface border border-border text-[10px] text-text-secondary hover:text-white whitespace-nowrap transition-colors"
              >
                "{p}"
              </button>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-border bg-surface">
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
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border text-xs text-white placeholder-text-muted focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={isLoading || !inputQuery.trim()}
                className="p-2.5 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: PRODUCT RECOMMENDATIONS / RAW CATALOG (7 COLS) */}
        <div className="lg:col-span-7 space-y-4">
          
          {activeTab === 'raw_catalog' ? (
            /* RAW AI-READABLE JSON CATALOG */
            <div className="rounded-2xl glass-panel border border-border p-5 space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-accent-cyan" />
                  <h3 className="text-xs font-mono font-bold text-white">
                    GET /api/agent/catalog
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 font-semibold">
                  200 OK • JSON-LD
                </span>
              </div>
              <pre className="text-[11px] font-mono text-emerald-300 bg-[#060910] p-4 rounded-xl overflow-x-auto max-h-[620px] leading-relaxed border border-border/80">
                {rawCatalogJson}
              </pre>
            </div>
          ) : (
            /* PRODUCT CARDS LIST */
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>Displaying {displayedProducts.length} Ranked Items</span>
                <span className="text-accent-cyan font-mono">Real-time Match Scoring Active</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl glass-panel border border-border hover:border-primary/50 transition-all flex flex-col justify-between group space-y-3"
                  >
                    {/* Image & Match Score Badge */}
                    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-surface-elevated border border-border">
                      <Image
                        src={prod.image}
                        alt={prod.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {prod.aiMatchScore && (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-black/80 backdrop-blur-md border border-accent-cyan/50 text-accent-cyan text-xs font-mono font-bold flex items-center gap-1 shadow-lg">
                          <Sparkles className="w-3 h-3" />
                          {prod.aiMatchScore}% Match
                        </div>
                      )}
                      <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-text-secondary uppercase">
                        {prod.category}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white group-hover:text-primary-light transition-colors">
                          {prod.name}
                        </h4>
                        <span className="text-sm font-bold text-white whitespace-nowrap">
                          ₹{prod.price.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <p className="text-[11px] text-text-muted line-clamp-2 leading-relaxed">
                        {prod.description}
                      </p>

                      {/* Features */}
                      <div className="space-y-1 pt-1">
                        {prod.features.slice(0, 2).map((f, i) => (
                          <div key={i} className="text-[10px] text-text-secondary flex items-center gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span className="truncate">{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* Why Recommended Explanation */}
                      {prod.whyRecommended && (
                        <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-[10px] text-primary-light font-medium leading-tight">
                          <span className="font-bold">AI Rationale:</span> {prod.whyRecommended}
                        </div>
                      )}
                    </div>

                    {/* Action Button */}
                    <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-text-muted">
                        Stock: {prod.stock} left
                      </span>
                      <button
                        onClick={() => handleAddToCart(prod)}
                        disabled={addingProductId === prod.id}
                        className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-primary/20 disabled:opacity-50"
                      >
                        {addingProductId === prod.id ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin" /> Adding...
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
