"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const INITIAL_MESSAGE: Message = {
  id: "initial",
  text: "Halo! Saya Stokku Assistant. Ada yang bisa saya bantu terkait inventaris, restock, atau analisis produk Anda hari ini?",
  sender: "bot",
  timestamp: new Date(),
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateBotResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes("stok") || lowerInput.includes("habis") || lowerInput.includes("kritis")) {
      return "Berdasarkan pantauan sistem, beberapa produk yang stoknya berada di level kritis: \n- 'Beras Setra Ramos 5kg' (sisa 2 unit)\n- 'Minyak Goreng 2L' (sisa 5 unit)\nSegera lakukan restock untuk menghindari kehabisan barang.";
    }
    
    if (lowerInput.includes("restock") || lowerInput.includes("pengadaan") || lowerInput.includes("rekomendasi")) {
      return "Menurut data AI Forecast, Anda direkomendasikan untuk menambah stok:\n- 'Kopi Bubuk 250g' sebanyak 50 unit\n- 'Gula Pasir 1kg' sebanyak 100 unit\nPermintaan diprediksi akan naik 15% minggu depan.";
    }
    
    if (lowerInput.includes("dead") || lowerInput.includes("mati") || lowerInput.includes("lama") || lowerInput.includes("tidak laku")) {
      return "Terdapat 3 produk kategori dead-stock yang belum terjual dalam 3 bulan terakhir:\n- 'Snack Brand X'\n- 'Minuman Bersoda 1.5L'\n- 'Sarden Kaleng'\nSaya sarankan untuk mengadakan promo bundling atau diskon untuk produk-produk ini.";
    }

    if (lowerInput.includes("terima kasih") || lowerInput.includes("makasih") || lowerInput.includes("thanks")) {
      return "Sama-sama! Jangan ragu untuk bertanya lagi jika Anda butuh bantuan mengenai inventaris Anda.";
    }

    return "Maaf, saya masih belajar. Saat ini saya dapat membantu Anda menganalisa stok kritis, rekomendasi restock, dan mendeteksi dead-stock. Bisa Anda ulangi pertanyaannya dengan kata kunci tersebut?";
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate network delay
    setTimeout(() => {
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(userMsg.text),
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-theme(spacing.14))] flex-col gap-4 p-4 lg:p-6">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Bot size={24} />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">Stokku Assistant</h1>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Online & Ready to help
          </p>
        </div>
      </div>

      {/* Chat Area */}
      <Card className="flex-1 overflow-hidden flex flex-col bg-background/50 border-border shadow-sm">
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex gap-3 max-w-[80%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <Avatar className="h-8 w-8 border border-border">
                  {msg.sender === "user" ? (
                    <>
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User size={16} />
                      </AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarFallback className="bg-secondary text-secondary-foreground">
                        <Bot size={16} />
                      </AvatarFallback>
                    </>
                  )}
                </Avatar>
                
                <div className={`flex flex-col gap-1 ${msg.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-sm"
                        : "bg-secondary text-secondary-foreground rounded-tl-sm border border-border"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-muted-foreground px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-3 max-w-[80%] mr-auto"
            >
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-secondary text-secondary-foreground">
                  <Bot size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl rounded-tl-sm border border-border flex items-center gap-1">
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                />
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                  className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
                />
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background border-t border-border">
          <div className="flex gap-2 items-center relative max-w-4xl mx-auto">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tanyakan soal stok, restock, atau dead-stock..."
              className="pr-12 py-6 rounded-xl border-border bg-background focus-visible:ring-primary shadow-sm"
              disabled={isTyping}
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              size="icon"
              className="absolute right-2 h-8 w-8 rounded-lg transition-all duration-200"
            >
              {isTyping ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <div className="mt-2 text-center text-[10px] text-muted-foreground">
            Stokku Assistant dapat membuat kesalahan. Harap periksa kembali informasi penting.
          </div>
        </div>
      </Card>
    </div>
  );
}
