import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { Send, X } from "lucide-react";

import type { AIMessage } from "@/types";

export interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AIMessage[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  context?: { type: string; symbols: string[] };
  questionsRemaining?: number;
}

const TYPING_DOTS = [".", "..", "..."];

export function AIChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  isLoading = false,
  context,
  questionsRemaining,
}: AIChatPanelProps) {
  const [inputValue, setInputValue] = useState("");
  const [visibleSymbols, setVisibleSymbols] = useState<string[]>(context?.symbols ?? []);
  const [dotIndex, setDotIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setVisibleSymbols(context?.symbols ?? []);
  }, [context?.symbols]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotIndex((prev) => (prev + 1) % TYPING_DOTS.length);
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (!textareaRef.current) return;

    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
  }, [inputValue]);

  const isSendDisabled = useMemo(() => {
    const noQuestions = typeof questionsRemaining === "number" && questionsRemaining <= 0;
    return !inputValue.trim() || isLoading || noQuestions;
  }, [inputValue, isLoading, questionsRemaining]);

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSendDisabled) return;

    onSendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleRemoveSymbol = (symbol: string) => {
    setVisibleSymbols((prev) => prev.filter((item) => item !== symbol));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden pointer-events-none">
      <div
        className={`pointer-events-auto flex h-full w-96 flex-col border-l border-gray-800 bg-[#0b1224] shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-white">Deep AI Analyst</h2>
            {typeof questionsRemaining === "number" && (
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-200">
                {questionsRemaining} left
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-gray-400 transition hover:bg-[#111827] hover:text-white"
            aria-label="Close chat panel"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {visibleSymbols.length > 0 && (
          <div className="border-b border-gray-800 px-4 py-2">
            <div className="flex flex-wrap gap-2">
              {visibleSymbols.map((symbol) => (
                <div
                  key={symbol}
                  className="flex items-center gap-1 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-100"
                >
                  <span>{symbol}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSymbol(symbol)}
                    className="text-blue-200 transition hover:text-white"
                    aria-label={`Remove ${symbol}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-hidden">
          <div className="flex h-full flex-col overflow-y-auto px-4 py-4 space-y-4">
            {messages.map((message) => {
              const isUser = message.role === "user";
              return (
                <div key={message.id} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      isUser ? "bg-blue-600 text-white" : "bg-[#111827] text-gray-100"
                    }`}
                  >
                    {message.content}
                  </div>
                  <span className="mt-1 text-xs text-gray-500">
                    {format(new Date(message.createdAt), "p")}
                  </span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-500" />
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-500" style={{ animationDelay: "0.1s" }} />
                <div className="h-2 w-2 animate-pulse rounded-full bg-gray-500" style={{ animationDelay: "0.2s" }} />
                <span className="ml-1">AI is typing{TYPING_DOTS[dotIndex]}</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <form onSubmit={handleSend} className="border-t border-gray-800 px-4 py-3">
          <div className="flex flex-col gap-2">
            <div className="rounded-xl border border-gray-800 bg-[#0f172a] focus-within:border-blue-500">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                placeholder="Ask about market trends, technicals, or strategies..."
                className="h-12 w-full resize-none rounded-xl bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
                rows={1}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{typeof questionsRemaining === "number" && questionsRemaining <= 0 ? "No questions remaining" : ""}</span>
              <button
                type="submit"
                disabled={isSendDisabled}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-gray-700"
              >
                <Send className="h-4 w-4" />
                Send
              </button>
            </div>
          </div>
        </form>

        <div className="border-t border-gray-800 px-4 py-3 text-xs text-gray-500">
          AI responses are for educational purposes only. Not investment advice.
        </div>
      </div>
    </div>
  );
}

export default AIChatPanel;
