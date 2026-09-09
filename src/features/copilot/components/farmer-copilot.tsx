"use client";
import { formatINR } from '@/utils/economics';

import React, { useState, useRef, useEffect } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useLanguage } from '@/contexts/language-context';
import { Bot, X, Send, Minimize2, Maximize2, BrainCircuit, ChevronUp, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FarmerCopilot() {
  const router = useRouter();
  const { currentLot } = useLot();
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'bot', text: string, actions?: {label: string, route: string}[]}[]>([]);
  const [input, setInput] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    if (messages.length === 0 && isOpen) {
       const hasLot = currentLot && currentLot.commodity;
       let greeting = language === 'hi' ? 'नमस्ते! मैं कृषिसेतु एआई हूं।' : 
                      language === 'te' ? 'నమస్కారం! నేను కృషిసేతు AI ని.' : 
                      'Hello! I am KrishiSetu AI.';
                      
       if (hasLot) {
          if (currentLot.dealConfirmed) {
            greeting += ` Your deal for ${currentLot.commodity} is confirmed. Should we arrange transport?`;
          } else if (currentLot.selectedBuyerId) {
            greeting += ` You are negotiating with ${currentLot.selectedBuyerId}. I can help you evaluate their offer.`;
          } else {
            greeting += ` I see your ${currentLot.commodity} lot is ready. Would you like to check the weather or find buyers?`;
          }
       } else {
          greeting += ' Ask me about market prices, selling strategy, weather, or how to create a digital lot.';
       }
       
       // eslint-disable-next-line react-hooks/set-state-in-effect
       setTimeout(() => setMessages([{ role: 'bot', text: greeting }]), 0);
    }
  }, [isOpen, currentLot, language, messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    setTimeout(() => {
      let reply = "I can currently help with market prices, selling strategy, weather, storage, quality, buyers, negotiation, logistics and payment tracking.";
      let actions: {label: string, route: string}[] = [];
      const lower = userMsg.toLowerCase();
      
      if (lower.includes('price') || lower.includes('rate')) {
         if (currentLot?.commodity) {
            reply = `The current reference market price for ${currentLot.commodity} is roughly ${formatINR(currentLot.expectedPrice || 2000)}/quintal. Would you like to find a buyer?`;
            actions = [{label: 'Compare Markets', route: '/market-intelligence'}, {label: 'Find Buyers', route: '/matching'}];
         } else {
            reply = "You can check the latest government prices in the Market Intelligence tab.";
            actions = [{label: 'Compare Markets', route: '/market-intelligence'}];
         }
      } else if (lower.includes('weather') || lower.includes('store') || lower.includes('sell today')) {
         reply = "Based on the 5-day forecast, there is moderate rain risk approaching. If you have storage, holding could improve prices slightly, but selling today is the safest option.";
         actions = [{label: 'View AI Sell Strategy', route: '/sell-advisor'}];
      } else if (lower.includes('logistics') || lower.includes('transport') || lower.includes('truck')) {
         reply = "You can arrange aggregated transport through nearby FPOs to save costs, or book an individual truck.";
         actions = [{label: 'Check FPO Aggregation', route: '/aggregation'}, {label: 'Book Transport', route: '/logistics'}];
      } else if (lower.includes('buyer') || lower.includes('match')) {
         reply = "We have matched your lot against our institutional buyer network based on your quantity, quality grade, and distance.";
         actions = [{label: 'View Matches', route: '/matching'}];
      } else if (lower.includes('negotiat') || lower.includes('offer')) {
         reply = "You can submit counter-offers directly to the buyer. Ensure your counter is within 5-10% of their offer for the best chance of acceptance.";
         actions = [{label: 'Go to Negotiation', route: '/offers'}];
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: reply, actions }]);
    }, 800);
  };

  const handleSuggestion = (text: string) => {
    setInput(text);
    setTimeout(() => document.getElementById('copilot-send-btn')?.click(), 50);
  };

  const suggestions = currentLot 
    ? ["Should I sell today or store?", "Which market is better?", "Which buyer is the best match?"]
    : ["What are the current prices?", "How do I create a lot?", "Show me market trends"];

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-green-600 text-white rounded-full p-4 shadow-2xl hover:bg-green-700 transition-all hover:scale-105 z-50 flex items-center justify-center group"
      >
        <BrainCircuit className="w-7 h-7" />
        <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs group-hover:ml-3 transition-all duration-300 font-bold ease-in-out">
          Ask KrishiSetu AI
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed right-4 md:right-6 bottom-6 w-full max-w-[360px] md:max-w-[400px] bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'h-14' : 'h-[600px] max-h-[85vh]'}`}>
      
      {/* Header */}
      <div 
        className="flex items-center justify-between bg-gradient-to-r from-green-700 to-green-600 text-white p-4 rounded-t-2xl cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
             <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
             <h3 className="font-bold leading-none tracking-wide text-sm">KRISHISETU COPILOT</h3>
             <p className="text-[10px] font-medium text-green-100 mt-1">{isMinimized ? 'Tap to expand' : 'AI Farm-to-Market Assistant'}</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
            {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50/50 scrollbar-thin">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'
                }`}>
                  {m.role === 'bot' && (
                    <div className="flex items-center gap-1.5 mb-2 text-green-700">
                      <BrainCircuit className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-widest">AI Response</span>
                    </div>
                  )}
                  <p className="leading-relaxed">{m.text}</p>
                  
                  {/* Action Buttons */}
                  {m.actions && m.actions.length > 0 && (
                    <div className="mt-3 flex flex-col gap-2">
                      {m.actions.map((act, actIdx) => (
                        <button 
                          key={actIdx}
                          onClick={() => {
                             router.push(act.route);
                             setIsOpen(false);
                          }}
                          className="w-full text-center bg-gray-50 hover:bg-green-50 border border-gray-200 hover:border-green-300 text-green-700 font-bold py-2 px-3 rounded-xl transition-colors text-xs"
                        >
                          {act.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {messages.length === 1 && (
              <div className="mt-6 flex flex-col gap-2">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Suggested Questions</p>
                {suggestions.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSuggestion(s)}
                    className="text-left bg-white border border-gray-200 hover:border-green-300 hover:bg-green-50 px-4 py-2.5 rounded-xl text-xs font-semibold text-gray-600 transition-colors shadow-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200 rounded-b-2xl">
            <div className="relative flex items-center">
              <input 
                type="text"
                placeholder="Ask about your sale..."
                className="w-full pl-4 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-sm font-medium transition-all"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                id="copilot-send-btn"
                onClick={handleSend}
                disabled={!input.trim()}
                className="absolute right-1.5 p-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
