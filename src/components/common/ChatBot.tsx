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
  const STORAGE_KEY = 'trippechalo_chat_state';
  const EXPIRY_TIME = 60 * 60 * 1000; // 1 hour

  const [sessionId] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.lastUpdated < EXPIRY_TIME) {
          return parsed.sessionId;
        }
      }
    } catch (e) {}
    return `session_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  });

  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Date.now() - parsed.lastUpdated < EXPIRY_TIME && parsed.messages) {
          return parsed.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }));
        }
      }
    } catch (e) {}
    return [
      {
        id: 1,
        text: "Hi! I'm **TrippeChalo AI Assistant**.\n\nI can help you find the best flights, hotels, and travel deals. What are you looking for today?",
        sender: 'bot',
        timestamp: new Date(),
      },
    ];
  });

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showPulse, setShowPulse] = useState(true);

  // Save to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        sessionId,
        messages,
        lastUpdated: Date.now()
      }));
    } catch (e) {}
  }, [messages, sessionId]);

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

  useEffect(() => {
    const handleOpenMyra = () => setIsOpen(true);
    window.addEventListener('open-myra-ai', handleOpenMyra);
    return () => window.removeEventListener('open-myra-ai', handleOpenMyra);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

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
      console.error("ChatBot API Error:", error);
      
      let errorMessage = "I'm sorry, I'm having trouble connecting right now. Please try again in a moment! 🙏\n\nYou can also reach us at:\n📧 trippechaloindia@gmail.com\n📞 9555934205";
      
      if (error.response && error.response.data && error.response.data.reply) {
        errorMessage = error.response.data.reply;
      } else if (error.message) {
        // Append the actual network error for debugging
        errorMessage += `\n\n*(Error: ${error.message})*`;
      }

      const errorReply: Message = {
        id: Date.now() + 1,
        text: errorMessage,
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
      {/* Floating Chat Button (Hidden on Mobile, now in Bottom Nav) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden lg:block fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] group"
        aria-label="Open AI Chat Assistant"
      >
        <div className={`relative w-[60px] h-[60px] rounded-full bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-[0_8px_30px_rgba(37,99,235,0.45)] flex items-center justify-center transition-all duration-300 hover:shadow-[0_8px_40px_rgba(37,99,235,0.6)] hover:scale-105 ${isOpen ? 'rotate-0' : ''}`}>
          <div className="relative w-full h-full flex items-center justify-center">
            <X 
              size={26} 
              className={`absolute text-white transition-all duration-300 ease-in-out ${
                isOpen ? 'rotate-0 opacity-100 scale-100' : 'rotate-90 opacity-0 scale-50'
              }`} 
            />
            <MessageCircle 
              size={26} 
              className={`absolute text-white transition-all duration-300 ease-in-out ${
                isOpen ? '-rotate-90 opacity-0 scale-50' : 'rotate-0 opacity-100 scale-100'
              }`} 
            />
          </div>
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
        <>
          {/* Mobile Overlay Background */}
          <div className="lg:hidden fixed inset-0 bg-black/50 z-[9998] transition-opacity" onClick={() => setIsOpen(false)}></div>
          
          <div
            className="fixed bottom-0 lg:bottom-[90px] right-0 lg:right-6 z-[9999] w-full lg:w-[380px] h-[85vh] lg:h-[560px] lg:max-h-[560px] flex flex-col rounded-t-[30px] lg:rounded-2xl bg-white overflow-hidden shadow-[0_-10px_40px_rgba(0,0,0,0.2)] lg:shadow-[0_25px_60px_rgba(0,0,0,0.3)] border-t border-gray-100 lg:border-gray-200/80"
            style={{ animation: 'chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
          >
            {/* Header */}
            <div className="bg-white px-5 py-4 flex items-center justify-between shrink-0 relative">
              <button
                onClick={() => setIsOpen(false)}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center justify-center gap-2">
                <Bot size={22} className="text-blue-600" />
                <span className="text-xl font-black text-gray-800 tracking-tight">TrippeChalo AI</span>
              </div>
              
              <button
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition"
              >
                <div className="flex gap-1">
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                  <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
                </div>
              </button>
            </div>

            {/* Welcome Text (Mobile only for now) */}
            <div className="px-5 pt-2 pb-4 bg-white shrink-0 lg:hidden">
              <h2 className="text-3xl font-bold text-blue-500 mb-1">Hi, There</h2>
              <p className="text-gray-800 text-sm leading-relaxed">
                <strong>I'm TrippeChalo AI</strong> — your personal travel assistant. Let's plan your next trip together.
              </p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 lg:p-5 flex flex-col gap-4 bg-gray-50/50" style={{ scrollbarWidth: 'none' }}>
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


          {/* Input */}
          <form onSubmit={handleSubmit} className="bg-white border-t border-gray-100 px-4 py-4 flex items-center gap-3 shrink-0 rounded-t-[20px] shadow-[0_-5px_15px_rgba(0,0,0,0.02)]">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything"
              className="flex-1 bg-transparent text-[15px] text-gray-800 px-2 py-1 outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isTyping}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                inputValue.trim() && !isTyping
                  ? 'bg-blue-600 text-white shadow-md hover:scale-105'
                  : 'bg-blue-600/50 text-white/80 cursor-not-allowed'
              }`}
            >
              <Send size={16} className={inputValue.trim() ? '-translate-y-[1px]' : ''} style={{ transform: 'rotate(-45deg)' }} />
            </button>
          </form>
        </div>
        </>
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
