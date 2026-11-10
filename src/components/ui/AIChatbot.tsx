"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, X, Send } from "lucide-react";
import { useScrollLock } from "@/hooks/useScrollLock";
import { usePortal } from "@/hooks/usePortal";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your RIFT DISTRICT assistant. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          conversationHistory,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        const assistantMessage: Message = {
          role: "assistant",
          content: data.response,
          timestamp: data.timestamp,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        const errorMessage: Message = {
          role: "assistant",
          content: "Sorry, I'm having trouble right now. Please try again or contact support.",
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, errorMessage]);
      }
    } catch {
      const errorMessage: Message = {
        role: "assistant",
        content: "Connection error. Please check your internet and try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useScrollLock(isOpen);
  const portal = usePortal();

  if (!portal) return null;

  return createPortal(
    <div style={{ pointerEvents: "auto" }}>
      <>
        {/* Floating Chat Button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-14 h-14 bg-gradient-to-br from-rift-orange to-rift-rust rounded-full shadow-lg shadow-rift-orange/30 flex items-center justify-center z-[90]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              className="text-xl text-white"
            >
              <X size={22} />
            </motion.span>
          ) : (
            <motion.span
              key="chat"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-xl"
            >
              <MessageSquare size={22} className="text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[85]"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-20 right-3 sm:bottom-24 sm:right-6 w-[calc(100vw-1.5rem)] max-w-[380px] h-[78dvh] max-h-[600px] sm:h-[600px] glass-card--strong rounded-2xl shadow-2xl z-[90] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-rift-orange to-rift-rust p-3 sm:p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-white text-sm">AI Shopping Assistant</h3>
                <p className="text-xs text-white/80">Always here to help</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-rift-orange to-rift-rust text-white"
                        : "glass-card text-rift-mist/90"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    <p className="text-[10px] mt-1 opacity-60">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="glass-card rounded-2xl px-4 py-3">
                    <div className="flex gap-1">
                      <motion.div
                        className="w-2 h-2 bg-rift-orange rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-rift-orange rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      />
                      <motion.div
                        className="w-2 h-2 bg-rift-orange rounded-full"
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 sm:p-4 border-t border-rift-mist/10">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isLoading}
                  className="input-field flex-1 rounded-xl"
                />
                <button
                  onClick={sendMessage}
                  disabled={!input.trim() || isLoading}
                  className="w-full sm:w-12 h-12 bg-gradient-to-br from-rift-orange to-rift-rust rounded-xl flex items-center justify-center disabled:opacity-50"
                >
                  <Send size={18} className="text-white" />
                </button>
              </div>
              <p className="text-[10px] text-rift-mist/40 mt-2 text-center">
                Powered by AI • May occasionally make mistakes
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </>
    </div>,
    portal
  );
}