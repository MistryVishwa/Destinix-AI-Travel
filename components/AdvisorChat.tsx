import React, { useState, useRef, useEffect } from 'react';
import { chatWithAdvisor } from '../services/geminiService';
import { ChatMessage } from '../types';
import { useNavigate } from 'react-router-dom';

const AdvisorChat: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        `🌍 Welcome to Destinix AI

Looking for travel inspiration or need help with a booking?

You can ask about:
• Honeymoon trips
• Budget travel
• Weekend getaways
• International destinations`,
      timestamp: new Date()
    }
  ]);

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* ---------------- AUTO SCROLL ---------------- */
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  /* ---------------- DESTINATION DETECTION ---------------- */
  const detectDestination = (message: string) => {
    const words = message.toLowerCase().split(/\s+/);
    return words.find(word => word.length > 2); // basic detection
  };

  /* ---------------- CHECK IF PACKAGE ROUTE EXISTS ---------------- */
  const packageExists = (slug: string) => {
    const knownPackageRoutes = [
      "/packages/goa",
      "/packages/dubai",
      "/packages/manali",
      "/packages/bali",
      "/packages/maldives",
      "/packages/paris",
      "/packages/switzerland"
    ];

    return knownPackageRoutes.includes(`/packages/${slug}`);
  };

  /* ---------------- SMART LINKS ---------------- */
  const buildSmartLinks = (destination?: string) => {
    if (!destination) return null;

    const slug = destination.toLowerCase();
    const hasPackage = packageExists(slug);

    return (
      <div className="mt-3 text-sm space-y-1">
        <div className="font-semibold text-indigo-400">Explore More:</div>

        {hasPackage && (
          <button
            onClick={() => navigate(`/packages/${slug}`)}
            className="block text-indigo-300 hover:underline"
          >
            • View Packages →
          </button>
        )}

        <button
          onClick={() => navigate(`/destinations/${slug}`)}
          className="block text-indigo-300 hover:underline"
        >
          • Destination Guide →
        </button>
      </div>
    );
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const detectedDestination = detectDestination(input);

    try {
      let response = await chatWithAdvisor(
        input,
        messages.map(m => ({ role: m.role, content: m.content }))
      );

      /* CLEAN MARKDOWN */
      response = response
        ?.replace(/#{1,6}\s?/g, '')   // remove ### etc
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .trim();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response || "Here’s your travel recommendation.",
          timestamp: new Date(),
          destination: detectedDestination
        } as any
      ]);

    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "⚠ I'm having trouble connecting right now. Please try again.",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {isOpen ? (
        <div className="w-[350px] md:w-[400px] h-[550px] bg-gray-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col">

          {/* HEADER */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between">
            <h3 className="text-white font-bold">Travel Advisor</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">✕</button>
          </div>

          {/* MESSAGES */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4" ref={scrollRef}>
            {messages.map((msg: any, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-sm whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-white/5 text-gray-200 border border-white/10 rounded-tl-none'
                }`}>
                  <div className="leading-relaxed">{msg.content}</div>

                  {msg.role === 'assistant' && buildSmartLinks(msg.destination)}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* INPUT */}
          <div className="p-4 border-t border-white/5 bg-gray-950">
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl px-4 py-2">

              <input
                type="text"
                placeholder="Ask me anything..."
                className="bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:border-0 focus-visible:outline-none focus-visible:ring-0 text-white text-sm w-full shadow-none"
                style={{ boxShadow: "none" }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />

              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="ml-2 text-indigo-500 hover:text-indigo-400 hover:scale-110 transition-all disabled:text-gray-600"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" />
                </svg>
              </button>
            </div>
          </div>

        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-all"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default AdvisorChat;