"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Send,
  X,
  Minus,
  Bot,
  User,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

/* ──────────── Types ──────────── */
type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

/* ──────────── Mock response engine ──────────── */
const INITIAL_MESSAGE: Message = {
  id: "initial",
  text: "Halo! 👋 Saya **Stokku AI**, asisten pintar untuk manajemen inventaris Anda. Tanyakan soal stok, restock, atau dead-stock kapan saja!",
  sender: "bot",
  timestamp: new Date(),
};

const QUICK_REPLIES = [
  "Cek stok kritis",
  "Rekomendasi restock",
  "Deteksi dead-stock",
  "Info inventaris",
];

function generateBotResponse(userInput: string): string {
  const lower = userInput.toLowerCase();

  if (
    lower.includes("stok") ||
    lower.includes("habis") ||
    lower.includes("kritis") ||
    lower.includes("stock")
  ) {
    return "📦 **Stok Kritis Terdeteksi:**\n\n• Beras Setra Ramos 5kg — sisa **2 unit**\n• Minyak Goreng 2L — sisa **5 unit**\n• Tepung Terigu 1kg — sisa **3 unit**\n\nSegera lakukan restock untuk menghindari kehabisan barang.";
  }

  if (
    lower.includes("restock") ||
    lower.includes("pengadaan") ||
    lower.includes("rekomendasi") ||
    lower.includes("beli")
  ) {
    return "📊 **Rekomendasi Restock (AI Forecast):**\n\n• Kopi Bubuk 250g — tambah **50 unit**\n• Gula Pasir 1kg — tambah **100 unit**\n• Mie Instan — tambah **200 unit**\n\nPermintaan diprediksi naik **15%** minggu depan berdasarkan tren historis.";
  }

  if (
    lower.includes("dead") ||
    lower.includes("mati") ||
    lower.includes("lama") ||
    lower.includes("tidak laku")
  ) {
    return "⚠️ **Dead-Stock Terdeteksi (3 bulan tanpa penjualan):**\n\n• Snack Brand X — 45 unit\n• Minuman Bersoda 1.5L — 30 unit\n• Sarden Kaleng — 20 unit\n\n💡 **Saran:** Adakan promo bundling atau diskon clearance untuk produk ini.";
  }

  if (
    lower.includes("info") ||
    lower.includes("inventaris") ||
    lower.includes("ringkasan") ||
    lower.includes("summary")
  ) {
    return "📋 **Ringkasan Inventaris:**\n\n• Total SKU aktif: **1,247**\n• Nilai inventaris: **Rp 2.4 Miliar**\n• Produk stok kritis: **8 item**\n• Rata-rata turnover: **4.2x/bulan**\n\nGunakan halaman **AI Forecast** untuk analisis prediktif lebih lanjut.";
  }

  if (
    lower.includes("terima kasih") ||
    lower.includes("makasih") ||
    lower.includes("thanks")
  ) {
    return "Sama-sama! 😊 Jangan ragu bertanya lagi kapan saja. Saya selalu siap membantu mengelola inventaris Anda.";
  }

  if (lower.includes("halo") || lower.includes("hai") || lower.includes("hi")) {
    return "Halo! 👋 Ada yang bisa saya bantu hari ini? Anda bisa bertanya tentang:\n\n• **Stok kritis** — cek barang hampir habis\n• **Rekomendasi restock** — saran pengadaan\n• **Dead-stock** — barang tidak terjual\n• **Info inventaris** — ringkasan keseluruhan";
  }

  return "Maaf, saya belum memahami pertanyaan tersebut. 🤔\n\nSaat ini saya dapat membantu:\n• Cek **stok kritis**\n• **Rekomendasi restock**\n• Deteksi **dead-stock**\n• **Info inventaris**\n\nCoba gunakan salah satu kata kunci di atas!";
}

/* ──────────── Markdown-lite renderer ──────────── */
function renderMessageText(text: string) {
  // Split by newlines, then handle bold (**text**)
  return text.split("\n").map((line, i) => {
    const parts = line.split(/(\*\*.*?\*\*)/g).map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={j} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
    return (
      <span key={i}>
        {i > 0 && <br />}
        {parts}
      </span>
    );
  });
}

/* ──────────── Component ──────────── */
export function FloatingChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const handleSend = useCallback(
    (text?: string) => {
      const messageText = (text || input).trim();
      if (!messageText || isTyping) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: "user",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setIsTyping(true);

      // Simulate processing delay (1-2s)
      const delay = 1000 + Math.random() * 1000;
      setTimeout(() => {
        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: generateBotResponse(messageText),
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
      }, delay);
    },
    [input, isTyping]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* ── Chat Panel ── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-20 right-4 z-50 flex flex-col w-[380px] h-[520px] max-h-[80vh] max-w-[calc(100vw-2rem)] rounded-2xl border border-border bg-card shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-foreground leading-tight">
                    Stokku AI
                  </h2>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                    </span>
                    Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                  aria-label="Minimize chat"
                >
                  <Minus size={14} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-md text-muted-foreground hover:bg-danger-bg hover:text-destructive transition-colors"
                  aria-label="Close chat"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={`flex gap-2 ${
                      msg.sender === "user"
                        ? "ml-auto flex-row-reverse max-w-[85%]"
                        : "mr-auto max-w-[85%]"
                    }`}
                  >
                    <Avatar className="h-6 w-6 shrink-0 border border-border">
                      <AvatarFallback
                        className={
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground text-[10px]"
                            : "bg-secondary text-secondary-foreground text-[10px]"
                        }
                      >
                        {msg.sender === "user" ? (
                          <User size={12} />
                        ) : (
                          <Bot size={12} />
                        )}
                      </AvatarFallback>
                    </Avatar>

                    <div
                      className={`flex flex-col gap-0.5 ${
                        msg.sender === "user" ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-xl text-[13px] leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground rounded-tr-sm"
                            : "bg-secondary text-secondary-foreground rounded-tl-sm border border-border"
                        }`}
                      >
                        {renderMessageText(msg.text)}
                      </div>
                      <span className="text-[9px] text-muted-foreground px-1">
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 mr-auto max-w-[85%]"
                >
                  <Avatar className="h-6 w-6 shrink-0 border border-border">
                    <AvatarFallback className="bg-secondary text-secondary-foreground text-[10px]">
                      <Bot size={12} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-secondary border border-border px-3 py-2.5 rounded-xl rounded-tl-sm flex items-center gap-1">
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0,
                      }}
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.15,
                      }}
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        repeat: Infinity,
                        duration: 0.6,
                        delay: 0.3,
                      }}
                      className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Replies — show only when few messages & not typing */}
            {messages.length <= 1 && !isTyping && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                {QUICK_REPLIES.map((reply) => (
                  <button
                    key={reply}
                    onClick={() => handleSend(reply)}
                    className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                  >
                    {reply}
                  </button>
                ))}
              </div>
            )}

            {/* Input Area */}
            <div className="px-3 py-2.5 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Tanya soal stok, restock..."
                  disabled={isTyping}
                  className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50 transition-colors"
                />
                <Button
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isTyping}
                  size="icon"
                  className="h-8 w-8 rounded-lg shrink-0"
                >
                  {isTyping ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p className="text-[9px] text-muted-foreground text-center mt-1.5">
                Stokku AI dapat membuat kesalahan. Periksa kembali informasi
                penting.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Floating Action Button ── */}
      <motion.button
        onClick={() => setIsOpen((prev) => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl transition-shadow duration-200"
        aria-label={isOpen ? "Close Stokku AI chat" : "Open Stokku AI chat"}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <X size={20} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MessageSquare size={20} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}
