"use client";
import { useLanguage } from '@/contexts/language-context';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Wheat, 
  LayoutDashboard, 
  LineChart, 
  BrainCircuit, 
  PackagePlus, 
  Users, 
  Search, 
  GitMerge, 
  Handshake, 
  Truck, 
  CreditCard, 
  MessageSquareWarning 
} from 'lucide-react';

const NAV_GROUPS = [
  {
    title: 'COMMAND CENTER',
    items: [
      { name: 'Overview', path: '/', icon: LayoutDashboard },
      { name: 'Market Intelligence', path: '/market-intelligence', icon: LineChart },
      { name: 'Sell Advisor', path: '/sell-advisor', icon: BrainCircuit },
    ]
  },
  {
    title: 'MY FARM',
    items: [
      { name: 'Create Lot', path: '/create-lot', icon: PackagePlus },
      { name: 'My Lots', path: '/my-lots', icon: Wheat },
      { name: 'FPO Aggregation', path: '/aggregation', icon: Users },
    ]
  },
  {
    title: 'MARKETPLACE',
    items: [
      { name: 'Buyer Directory', path: '/buyers', icon: Search },
      { name: 'Smart Matching', path: '/matching', icon: GitMerge },
      { name: 'Offers & Deals', path: '/offers', icon: Handshake },
    ]
  },
  {
    title: 'FULFILLMENT',
    items: [
      { name: 'Logistics', path: '/logistics', icon: Truck },
      { name: 'Payments', path: '/payments', icon: CreditCard },
    ]
  },
  {
    title: 'SUPPORT',
    items: [
      { name: 'Grievances', path: '/grievances', icon: MessageSquareWarning },
    ]
  }
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full h-full overflow-y-auto bg-white scrollbar-thin">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100 shrink-0 sticky top-0 bg-white z-10">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
          <Wheat className="h-5 w-5 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold tracking-tight text-gray-900 block leading-none">KRISHISETU</span>
          <span className="text-[10px] font-bold tracking-wider text-green-600 uppercase mt-1 block">AI PLATFORM</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-4 py-6 flex-1 space-y-8">
        {NAV_GROUPS.map((group, idx) => (
          <div key={idx}>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">
              {group.title}
            </h4>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.path;
                const Icon = item.icon;
                return (
                  <Link 
                    key={item.path} 
                    href={item.path}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-green-50 text-green-700 font-bold' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100 shrink-0">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 text-xs text-gray-500 text-center">
          KrishiSetu AI<br/>Farm to Best Market
        </div>
      </div>
    </div>
  );
}


