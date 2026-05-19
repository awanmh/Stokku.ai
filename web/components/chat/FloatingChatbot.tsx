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
import {
  CHAT_HISTORY_LIMIT,
  CHAT_MODEL_OPTIONS,
  DEFAULT_CHAT_MODEL,
  type ChatMessage,
  type ChatModelId,
} from "@/lib/chatbot";

/* ──────────── Types ──────────── */
type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const INITIAL_MESSAGE: Message = {
  id: "initial",
  text: "Halo! 👋 Saya **Stokku AI**, asisten inventaris untuk Stokku.ai. Tanyakan soal stok, restock, dead-stock, atau forecast kapan saja.",
  sender: "bot",
  timestamp: new Date(),
};

const QUICK_REPLIES = [
  "Apa stok kritis hari ini?",
  "Berikan rekomendasi restock",
  "Deteksi dead-stock",
  "Ringkas kondisi inventaris",
];

const CHAT_REQUEST_TIMEOUT_MS = 30000;

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
  const [selectedModel, setSelectedModel] = useState<ChatModelId>(DEFAULT_CHAT_MODEL);
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
    async (text?: string) => {
      const messageText = (text || input).trim();
      if (!messageText || isTyping) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: "user",
        timestamp: new Date(),
      };

      const nextMessages = [...messages, userMsg];

      setMessages(nextMessages);
      setInput("");
      setIsTyping(true);

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), CHAT_REQUEST_TIMEOUT_MS);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal,
          body: JSON.stringify({
            model: selectedModel,
            message: messageText,
            messages: nextMessages
              .slice(-CHAT_HISTORY_LIMIT)
              .map((message): ChatMessage => ({
                role: message.sender === "user" ? "user" : "model",
                content: message.text,
              })),
          }),
        });

        const payload = (await response.json().catch(() => null)) as
          | { success?: boolean; data?: { reply?: string }; message?: string }
          | null;

        if (!response.ok || !payload?.success || !payload?.data?.reply) {
          if (response.status === 429) {
            throw new Error(payload?.message || "Terlalu banyak permintaan. Coba lagi sebentar.");
          }

          if (response.status >= 500) {
            throw new Error(payload?.message || "Layanan AI sedang bermasalah. Coba lagi nanti.");
          }

          throw new Error(payload?.message || "Gagal memproses jawaban dari Gemini.");
        }

        const botMsg: Message = {
          id: (Date.now() + 1).toString(),
          text: payload.data.reply,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, botMsg]);
      } catch (error) {
        const errorMessage =
          error instanceof DOMException && error.name === "AbortError"
            ? "Permintaan melebihi batas waktu. Coba lagi dalam beberapa saat."
            : error instanceof TypeError
              ? "Tidak bisa menjangkau server chatbot. Periksa koneksi atau status server."
              : error instanceof Error
                ? error.message
                : "Terjadi kesalahan tak terduga.";
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            text: `Maaf, chatbot sedang tidak tersedia. ${errorMessage}`,
            sender: "bot",
            timestamp: new Date(),
          },
        ]);
      } finally {
        window.clearTimeout(timeoutId);
        setIsTyping(false);
      }
    },
    [input, isTyping, messages, selectedModel]
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
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 rounded-full border border-border bg-secondary/60 p-1 text-[10px]">
                  {CHAT_MODEL_OPTIONS.map((option) => {
                    const isActive = selectedModel === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedModel(option.id)}
                        className={`rounded-full px-2.5 py-1 transition-colors ${isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                          }`}
                        aria-pressed={isActive}
                        aria-label={`Pilih model ${option.label}`}
                      >
                        {option.id === "gemini-2.5-flash" ? "Flash" : "Gemma"}
                      </button>
                    );
                  })}
                </div>
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
                    className={`flex gap-2 ${msg.sender === "user"
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
                      className={`flex flex-col gap-0.5 ${msg.sender === "user" ? "items-end" : "items-start"
                        }`}
                    >
                      <div
                        className={`px-3 py-2 rounded-xl text-[13px] leading-relaxed ${msg.sender === "user"
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
                  placeholder="Tanya soal stok, restock, atau forecast..."
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
                Model aktif: {selectedModel === "gemini-2.5-flash" ? "Gemini 2.5 Flash" : "Gemma 3 27B"}. Stokku AI dapat membuat kesalahan. Periksa kembali informasi penting.
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
