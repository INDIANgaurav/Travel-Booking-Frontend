import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Sparkles, ChevronDown } from 'lucide-react';
import api from '../../services/api';

interface Message {
  id: number;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const QUICK_REPLIES = [
  'Book a Flight',
  'Find Hotels',
  'Cancel Booking',
  'Check Refund Status',
  'Talk to Agent',
];

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! I'm **TrippeChalo AI Assistant**.\n\nI can help you find the best flights, hotels, and travel deals. What are you looking for today?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPulse, setShowPulse] = useState(true);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Stop pulsing after first open
  useEffect(() => {
    if (isOpen) setShowPulse(false);
  }, [isOpen]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await api.post('/api/ai/chat', {
        message: text.trim(),
        sessionId,
      });

      const botReply: Message = {
        id: Date.now() + 1,
        text: response.data.reply || response.data.error || "Sorry, I couldn't process that. Please try again!",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botReply]);
    } catch (error: any) {
      const errorReply: Message = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! 🙏\n\nYou can also reach us at:\n📧 support@trippechalo.com\n📞 1800-123-4567",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleQuickReply = (reply: string) => {
    sendMessage(reply);
  };

  const formatMessageText = (text: string) => {
    return text.split('\n').map((line, i) => {
      let formatted = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');
      return (
        <span key={i} dangerouslySetInnerHTML={{ __html: formatted }} style={{ display: 'block', minHeight: line === '' ? '8px' : undefined }} />
      );
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-[9999] group"
        aria-label="Open AI Chat Assistant"
      >
        <div className={`relative w-[60px] h-[60px] rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-[0_8px_30px_rgba(37,99,235,0.45)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_8px_40px_rgba(37,99,235,0.6)] hover:scale-105 ${isOpen ? 'rotate-0' : ''}`}>
          {isOpen ? (
            <X size={26} className="text-white transition-transform duration-200" />
          ) : (
            <MessageCircle size={26} className="text-white transition-transform duration-200" />
          )}
          {/* Pulse ring */}
          {showPulse && !isOpen && (
            <>
              <span className="absolute inset-0 rounded-full bg-blue-500 opacity-30 animate-ping" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                <span className="text-[8px] text-white font-black">1</span>
              </span>
            </>
          )}
        </div>
        {/* Tooltip */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-3 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap shadow-lg pointer-events-none">
            Chat with AI Assistant
            <div className="absolute top-full right-5 w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900" />
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-[90px] right-6 z-[9998] w-[380px] max-h-[560px] flex flex-col rounded-2xl overflow-hidden shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-gray-200/80"
          style={{ animation: 'chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#0b1031] via-[#131b4d] to-[#1a237e] px-5 py-4 flex items-center gap-3 shrink-0">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-md">
                <Bot size={22} className="text-white" />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#0b1031]" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-sm tracking-wide">TrippeChalo AI</h3>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-blue-200 text-[11px]">Online • Powered by Gemini AI</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
            >
              <ChevronDown size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto bg-gradient-to-b from-gray-50 to-white px-4 py-4 space-y-3" style={{ maxHeight: '340px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                style={{ animation: 'msgFadeIn 0.3s ease forwards' }}
              >
                {msg.sender === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <Sparkles size={14} className="text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-md'
                  }`}
                >
                  {formatMessageText(msg.text)}
                  <div className={`text-[9px] mt-1.5 ${msg.sender === 'user' ? 'text-blue-200 text-right' : 'text-gray-400'}`}>
                    {msg.timestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </div>
                </div>
                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                    <User size={14} className="text-white" />
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2 items-end" style={{ animation: 'msgFadeIn 0.2s ease forwards' }}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          <div className="bg-white border-t border-gray-100 px-3 py-2.5 flex gap-2 overflow-x-auto shrink-0" style={{ scrollbarWidth: 'none' }}>
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => handleQuickReply(reply)}
                className="whitespace-nowrap text-[11px] font-semibold px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-colors shrink-0"
              >
                {reply}
              </button>
            ))}
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="bg-white border-t border-gray-200 px-3 py-3 flex items-center gap-2 shrink-0">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 text-sm text-gray-800 px-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-blue-400 focus:bg-white border border-transparent focus:border-blue-200 transition-all placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                inputValue.trim() && !isTyping
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send size={16} className={inputValue.trim() ? 'translate-x-[1px]' : ''} />
            </button>
          </form>

          {/* Powered by footer */}
          <div className="bg-gray-50 border-t border-gray-100 text-center py-1.5 shrink-0">
            <span className="text-[9px] text-gray-400 font-medium tracking-wide">Powered by TrippeChalo AI</span>
          </div>
        </div>
      )}

      {/* Inline animations */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
