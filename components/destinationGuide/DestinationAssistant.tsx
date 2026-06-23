// DestinationAssistant.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useDestinationChat } from '../../hooks/destinationGuide/useDestinationChat';

/**
 * Gemini‑powered chat assistant for destination queries.
 * Mirrors the existing AdvisorChat component but scoped to destination context.
 */
const DestinationAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const { destId } = useParams<{ destId: string }>();
  const { messages, sendMessage, isLoading } = useDestinationChat(destId ?? '');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <section className="flex flex-col h-full max-h-[600px] bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-lg">
      <header className="p-4 border-b border-white/10">
        <h2 className="text-lg font-semibold text-white">Destination Assistant</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.role === 'assistant' ? 'text-gray-300' : 'text-indigo-400'}>
            {msg.content}
          </div>
        ))}
        {isLoading && <div className="text-gray-500 animate-pulse">Thinking...</div>}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t border-white/10 flex gap-2">
        <input
          type="text"
          className="flex-1 bg-white/10 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          placeholder="Ask about the destination..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition">
          Send
        </button>
      </form>
    </section>
  );
};

export default DestinationAssistant;
