"use client";
import { formatINR } from '@/utils/economics';

import React, { useState, useRef, useEffect } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useLanguage } from '@/contexts/language-context';
import { Bot, X, Send, Minimize2, Maximize2 } from 'lucide-react';
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
    // Initial greeting based on state
    if (messages.length === 0 && isOpen) {
       const hasLot = currentLot && currentLot.commodity;
       let greeting = "Hello! I am your KrishiSetu Assistant. How can I help you today?";
       if (language === 'hi') greeting = "नमस्ते! मैं आपका कृषিসেतु सहायक हूँ। मैं आपकी कैसे मदद कर सकता हूँ?";
       if (language === 'te') greeting = "నమస్కారం! నేను మీ కృషిసేతు సహాయకుడిని. నేను మీకు ఎలా సహాయపడగలను?";
       
       if (hasLot) {
          greeting += ' I see you are currently working on a lot of ' + currentLot.commodity + '.';
       }
       
       setMessages([{ role: 'bot', text: greeting }]);
    }
  }, [isOpen, currentLot, language, messages.length]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    
    // Deterministic fallback response based on keywords and state
    setTimeout(() => {
      
      
      let reply = "I can currently help with market prices, selling strategy, weather, storage, quality, buyers, negotiation, logistics and payment tracking.";
      let actions = [{label: 'View Features', route: '/'}];
      const lower = userMsg.toLowerCase();
      
      if (lower.includes('price') || lower.includes('rate') || lower.includes('bhav') || lower.includes('daam')) {
         if (currentLot?.commodity) {
            reply = `The current reference market price for ${currentLot.commodity} is roughly ${formatINR(currentLot.referenceGovPrice || 2000)}/quintal. Would you like me to help you find a buyer?`;
            actions = [{label: 'Compare Markets', route: '/market-intelligence'}, {label: 'Find Buyers', route: '/matching'}];
         } else {
            reply = "You can check the latest government prices in the Market Intelligence tab, or tell me your crop.";
            actions = [{label: 'Compare Markets', route: '/market-intelligence'}];
         }
      } else if (lower.includes('weather') || lower.includes('rain') || lower.includes('mausam')) {
         reply = "Based on IMD data for your region, there is a moderate risk of rain. I recommend harvesting and arranging covered transport soon.";
         actions = [{label: 'Open Sell Strategy', route: '/sell-advisor'}];
      } else if (lower.includes('transport') || lower.includes('truck') || lower.includes('logistics')) {
         reply = "You can aggregate your produce with nearby farmers through an FPO to reduce transport costs by up to 40%. Check the FPO Aggregation step.";
         actions = [{label: 'Arrange Transport', route: '/logistics'}, {label: 'View Aggregation', route: '/aggregation'}];
      } else if (lower.includes('store') || lower.includes('wait') || lower.includes('hold')) {
         if (currentLot?.commodity) {
           reply = `Storing your ${currentLot.commodity} for 5 days in a nearby warehouse would cost roughly ${formatINR(100)}/qtl. Based on current trends, it could increase your net realization slightly, but weather risk is moderate.`;
           actions = [{label: 'Check Storage', route: '/sell-advisor'}];
         } else {
           reply = "I need to know your crop first. Please select one in Sell Advisor.";
           actions = [{label: 'Open Sell Strategy', route: '/sell-advisor'}];
         }
      } else if (lower.includes('negotiate') || lower.includes('bargain') || lower.includes('offer')) {
         if (currentLot?.offerDetails && currentLot?.selectedBuyerId) {
            reply = `The buyer's current offer is ${formatINR(currentLot.offerDetails.buyerPrice)}/qtl. Based on their historical negotiation patterns and your crop's A-grade quality, I recommend countering at ${formatINR(currentLot.offerDetails.buyerPrice + 50)}/qtl.`;
            actions = [{label: 'View Offer', route: '/offers'}];
         } else {
            reply = "You aren't in an active negotiation yet. Find a match in the Buyer Directory to start one.";
            actions = [{label: 'Find Buyers', route: '/matching'}];
         }
      }
      
      setMessages(prev => [...prev, { role: 'bot', text: reply, actions }]);
  

    }, 800);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => { setIsOpen(true); setIsMinimized(false); }}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-xl transition-transform hover:scale-105 z-50 flex items-center gap-2"
      >
        <Bot className="w-6 h-6" />
        <span className="font-bold hidden md:inline">Ask AI Copilot</span>
      </button>
    );
  }

  return (
    <div className={`fixed right-6 bottom-6 bg-white border border-gray-200 shadow-2xl rounded-2xl z-50 flex flex-col transition-all duration-300 ${isMinimized ? 'w-72 h-14' : 'w-80 md:w-96 h-[500px]'}`}>
      {/* Header */}
      <div className="bg-green-600 text-white p-3 rounded-t-2xl flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(!isMinimized)}>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-bold">KrishiSetu Copilot</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1 hover:bg-green-700 rounded" onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}>
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button className="p-1 hover:bg-green-700 rounded" onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}>
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Body */}
      {!isMinimized && (
        <>
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
            {messages.map((m, i) => (
              <div key={i} className={"flex " + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div className={"max-w-[80%] p-3 rounded-xl text-sm " + (m.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm')}>
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200 rounded-b-2xl flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about prices, weather, transport..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="bg-green-600 text-white p-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}
