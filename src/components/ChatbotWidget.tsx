import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  Zap,
} from 'lucide-react';
import Markdown from 'react-markdown';
import { NavTab } from '../types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  source?: string;
  suggestedTab?: NavTab;
  tabLabel?: string;
}

interface ChatbotWidgetProps {
  theme: 'dark' | 'light';
  onNavigateTab?: (tab: NavTab) => void;
}

const STARTER_PROMPTS = [
  { label: 'How to make a Wi-Fi QR?', prompt: 'How do I create a Wi-Fi QR code that connects automatically?' },
  { label: 'What is a Dynamic QR?', prompt: 'What is a Dynamic QR code and how can I change the URL later?' },
  { label: 'Add logo without scan error', prompt: 'How do I safely add a company logo to my QR code without breaking scan reliability?' },
  { label: 'Best format for printing', prompt: 'What is the best resolution and file format to export for physical print and banners?' },
  { label: 'Scan Safety Score guide', prompt: 'How is the Scan Safety Score calculated and how do I fix low contrast?' },
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({ theme, onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `👋 **Hi! I'm your NOVA QR AI Assistant.**\n\nI have complete knowledge of all tools, features, and scan safety practices across NOVA QR. Ask me anything, or pick a question below!`,
      timestamp: Date.now(),
      source: 'knowledge-base',
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [lastFailedPrompt, setLastFailedPrompt] = useState<string | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDark = theme === 'dark';

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const newUserMessage: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: query,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInputValue('');
    setIsLoading(true);
    setLastFailedPrompt(null);

    // Contextual navigation suggestion heuristic based on user query
    let suggestedTab: NavTab | undefined;
    let tabLabel: string | undefined;
    const lower = query.toLowerCase();

    if (lower.includes('scan') && (lower.includes('camera') || lower.includes('decode') || lower.includes('read'))) {
      suggestedTab = 'scanner';
      tabLabel = 'Open QR Scanner';
    } else if (lower.includes('frame') || lower.includes('ticket') || lower.includes('badge') || lower.includes('studio') || lower.includes('design')) {
      suggestedTab = 'designer';
      tabLabel = 'Open Designer Studio';
    } else if (lower.includes('dynamic') || lower.includes('redirect') || lower.includes('edit url')) {
      suggestedTab = 'dynamic';
      tabLabel = 'Open Dynamic QR View';
    } else if (lower.includes('analytic') || lower.includes('metric') || lower.includes('track')) {
      suggestedTab = 'analytics';
      tabLabel = 'Open Scan Analytics';
    } else if (lower.includes('bio') || lower.includes('profile link') || lower.includes('social tree')) {
      suggestedTab = 'bio';
      tabLabel = 'Open Link-in-Bio';
    } else if (lower.includes('history') || lower.includes('favorite') || lower.includes('past')) {
      suggestedTab = 'history';
      tabLabel = 'Open History & Favorites';
    } else if (lower.includes('wifi') || lower.includes('vcard') || lower.includes('url') || lower.includes('create') || lower.includes('make')) {
      suggestedTab = 'generator';
      tabLabel = 'Open QR Generator';
    }

    try {
      // Build conversation history payload
      const historyPayload = messages
        .filter((m) => m.id !== 'welcome')
        .slice(-6)
        .map((m) => ({
          role: m.role === 'user' ? 'user' : 'model',
          text: m.text,
        }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historyPayload,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.reply || "I'm sorry, I couldn't generate a response right now. Please try again.";

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: Date.now(),
        source: data.source || 'gemini-3.8-flash',
        suggestedTab,
        tabLabel,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      if (!isOpen) setHasUnread(true);
    } catch (err: any) {
      console.warn('Chat request failed, using intelligent offline fallback:', err);
      setLastFailedPrompt(query);

      // Intelligent client-side fallback so user is NEVER left without an answer
      const fallbackText = getClientFallbackAnswer(query);

      const fallbackMessage: ChatMessage = {
        id: `ai-fallback-${Date.now()}`,
        role: 'assistant',
        text: fallbackText,
        timestamp: Date.now(),
        source: 'offline-knowledge',
        suggestedTab,
        tabLabel,
      };

      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(id);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        text: `✨ Chat history cleared! Ask me anything about NOVA QR features, scan safety, or styling options.`,
        timestamp: Date.now(),
        source: 'knowledge-base',
      },
    ]);
  };

  return (
    <>
      {/* 1. Small button on the left side to toggle chatbot */}
      <div className="fixed bottom-20 md:bottom-6 left-4 sm:left-6 z-40 flex items-center gap-2 group">
        <button
          id="btn-open-chatbot"
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className={`relative p-3 sm:p-3.5 rounded-2xl shadow-xl transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${
            isOpen
              ? isDark
                ? 'bg-cyan-500 text-slate-950 ring-2 ring-cyan-400'
                : 'bg-cyan-600 text-white ring-2 ring-cyan-500'
              : isDark
              ? 'bg-slate-900/95 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:border-cyan-400 hover:shadow-cyan-500/20'
              : 'bg-white hover:bg-cyan-50 text-cyan-700 border border-cyan-200 hover:border-cyan-400 hover:shadow-md'
          }`}
          aria-label="Open NOVA QR AI Assistant"
          title="Ask NOVA AI (Chatbot)"
        >
          {isOpen ? (
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          ) : (
            <>
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
              {/* Pulsing online indicator */}
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950" />
              </span>
            </>
          )}
        </button>

        {/* Small desktop label pill */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer shadow-sm ${
              isDark
                ? 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-800 hover:border-cyan-500/40'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 hover:border-cyan-400'
            }`}
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Ask NOVA AI</span>
          </button>
        )}
      </div>

      {/* 2. Floating Chatbot Window */}
      {isOpen && (
        <div
          id="chatbot-window"
          className={`fixed bottom-36 md:bottom-20 left-4 sm:left-6 z-50 w-[calc(100vw-2rem)] sm:w-[410px] h-[540px] max-h-[75vh] sm:max-h-[80vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl transition-all duration-300 animate-fadeIn ${
            isDark
              ? 'bg-slate-950/95 border-slate-800/90 text-slate-100 shadow-cyan-950/30'
              : 'bg-white/98 border-slate-200 text-slate-900 shadow-slate-300/60'
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-4 py-3.5 border-b select-none ${
              isDark ? 'border-slate-800/80 bg-slate-900/60' : 'border-slate-200 bg-slate-50/90'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${
                  isDark
                    ? 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400'
                    : 'bg-cyan-100 border-cyan-300 text-cyan-800'
                }`}
              >
                <Bot className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h2 className={`text-sm font-black tracking-tight truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    NOVA Assistant
                  </h2>
                  <span
                    className={`text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded-full border shrink-0 ${
                      isDark
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}
                  >
                    Online
                  </span>
                </div>
                <p className={`text-[11px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Knows everything about NOVA QR
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClearChat}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200'
                }`}
                title="Clear chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200'
                }`}
                title="Close chatbot"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick Starter Question Chips */}
          <div
            className={`px-3 py-2 border-b flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 ${
              isDark ? 'border-slate-800/80 bg-slate-950/40' : 'border-slate-200 bg-slate-100/60'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-500 flex items-center gap-1 shrink-0 pl-1">
              <Zap className="w-3 h-3" /> Quick:
            </span>
            {STARTER_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.prompt)}
                disabled={isLoading}
                className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition cursor-pointer shrink-0 border ${
                  isDark
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800 hover:border-cyan-500/40'
                    : 'bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 border-slate-200 hover:border-cyan-400 shadow-xs'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 scrollbar-thin">
            {messages.map((m) => {
              const isUser = m.role === 'user';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div
                    className={`max-w-[88%] p-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed relative group ${
                      isUser
                        ? isDark
                          ? 'bg-gradient-to-tr from-cyan-600 to-cyan-500 text-slate-950 font-medium rounded-br-xs shadow-md'
                          : 'bg-cyan-600 text-white font-medium rounded-br-xs shadow-md'
                        : isDark
                        ? 'bg-slate-900/90 text-slate-200 border border-slate-800/90 rounded-bl-xs shadow-xs'
                        : 'bg-slate-100 text-slate-800 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    {isUser ? (
                      <p className="whitespace-pre-wrap">{m.text}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="prose prose-invert prose-xs max-w-none text-current">
                          <Markdown>{m.text}</Markdown>
                        </div>

                        {/* Direct Tab Navigation Action */}
                        {m.suggestedTab && onNavigateTab && (
                          <div className="pt-2 border-t border-slate-800/40 dark:border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => {
                                onNavigateTab(m.suggestedTab!);
                                setIsOpen(false);
                              }}
                              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                                isDark
                                  ? 'bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border-cyan-500/30'
                                  : 'bg-cyan-100 hover:bg-cyan-200 text-cyan-800 border-cyan-300'
                              }`}
                            >
                              <span>{m.tabLabel || 'Open Feature'}</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Message Meta & Copy button */}
                  {!isUser && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                      <span>{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {m.source && (
                        <span className="font-mono text-[9px] uppercase tracking-wider opacity-60">
                          {m.source.replace('-latest', '')}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleCopyText(m.id, m.text)}
                        className="hover:text-slate-300 transition cursor-pointer flex items-center gap-0.5"
                        title="Copy answer"
                      >
                        {copiedMessageId === m.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading typing bubble */}
            {isLoading && (
              <div className="flex items-center gap-1.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800 max-w-[120px]">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            )}

            {/* Retry banner if last prompt failed */}
            {lastFailedPrompt && (
              <div
                className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                  isDark ? 'bg-rose-950/40 border-rose-800/60 text-rose-300' : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Connection was slow</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleSendMessage(lastFailedPrompt)}
                  className="px-2 py-0.5 rounded font-bold underline hover:no-underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className={`p-3 border-t flex items-center gap-2 ${
              isDark ? 'border-slate-800/80 bg-slate-950' : 'border-slate-200 bg-white'
            }`}
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask anything about NOVA QR..."
              className={`flex-1 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm border outline-none transition ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-500 focus:border-cyan-400'
                  : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-cyan-600'
              }`}
            />
            <button
              id="btn-send-chat"
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`p-2.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                inputValue.trim() && !isLoading
                  ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-md'
                  : isDark
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

// Client-side instant knowledge base for offline reliability
function getClientFallbackAnswer(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('wifi') || q.includes('wi-fi')) {
    return `### How to Create a Wi-Fi QR Code:
1. Select the **Wi-Fi** category in the **Generator** tab.
2. Enter your **SSID** (Wi-Fi network name).
3. Select your encryption protocol (usually **WPA/WPA2**).
4. Enter your password.
5. Anyone scanning the QR code with their phone camera connects automatically without typing passwords!`;
  }

  if (q.includes('dynamic') || q.includes('redirect')) {
    return `### What is a Dynamic QR Code?
A **Dynamic QR Code** routes through a short URL redirect.
- You can change where the QR code points at **any time** without re-printing posters or flyers!
- You can also track total scans and visitor analytics in the **Analytics** tab.
- Click the **Dynamic** tab in the top navigation bar to create one!`;
  }

  if (q.includes('logo') || q.includes('image') || q.includes('sticker')) {
    return `### Safe Logo Embedding Tips:
1. Go to the **Customize** panel or the **Designer Studio** tab.
2. Under **Stickers & Logo**, upload your image or pick an emblem.
3. Keep the logo size between **15% and 25%** so scanner cameras can still read the outer timing cells.
4. NOVA QR automatically sets error correction to **Level H (30%)**, which ensures up to 30% of covered pixels can be mathematically recovered by scanners.`;
  }

  if (q.includes('print') || q.includes('svg') || q.includes('resolution')) {
    return `### Best Formats for Printing:
- **SVG (Vector)**: The gold standard for print. It scales to huge sizes (banners, billboards, stickers) with crisp lines.
- **4096px / 2048px (Ultra HD)**: Great for 300 DPI business cards and flyers.
- **1024px**: Perfect for digital screens, websites, and email signatures.`;
  }

  if (q.includes('scan') && (q.includes('fail') || q.includes('score') || q.includes('safety') || q.includes('contrast'))) {
    return `### Ensuring 100% Scan Reliability:
- **Contrast**: Maintain dark code modules against a light background (at least 4.5:1 ratio).
- **Margins**: Leave at least 8-12px of margin (quiet zone) around the QR matrix.
- **Payload size**: Shorter text or URLs produce bigger, simpler QR modules that focus immediately.`;
  }

  if (q.includes('frame') || q.includes('ticket') || q.includes('badge')) {
    return `### Custom Frames & Badges:
Go to the **Designer Studio** tab to pick:
- **"SCAN ME" Pill**: Bottom action pill with call-to-action text.
- **Ticket Stub**: Perforated coupon / event ticket layout.
- **Banners & Badges**: Top and bottom branded cards with custom colors!`;
  }

  return `I have full knowledge of the entire NOVA QR suite! You can ask me:
- How to create Wi-Fi, vCard, WhatsApp, or Calendar QR codes.
- How to use the Designer Studio for custom "SCAN ME" frames.
- How to use the Dynamic QR system and scan analytics.
- Best export formats for printing on vinyl, paper, or billboards.`;
}
