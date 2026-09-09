"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLot } from '@/contexts/lot-context';
import { Menu, UserCircle, Bell, Activity, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/language-context';

export function AppHeader({ onOpenMenu }: { onOpenMenu: () => void }) {
  const pathname = usePathname();
  const { currentLot, clearLot, isHydrated } = useLot();
  const { language, setLanguage, t } = useLanguage();

  const getPageTitle = () => {
    switch(pathname) {
      case '/': return { title: 'Command Center', subtitle: 'Platform Overview' };
      case '/market-intelligence': return { title: 'Market Intelligence', subtitle: 'Live Government Data' };
      case '/sell-advisor': return { title: 'AI Sell Advisor', subtitle: 'Optimal Selling Strategy' };
      case '/create-lot': return { title: 'Create Produce Lot', subtitle: 'Digitize your harvest' };
      case '/aggregation': return { title: 'FPO Aggregation', subtitle: 'Combine volume for bulk transport' };
      case '/buyers': return { title: 'Buyer Directory', subtitle: 'Verified Institutional Network' };
      case '/matching': return { title: 'Smart Matching', subtitle: 'Find the best buyer fit' };
      case '/offers': return { title: 'Offers & Negotiation', subtitle: 'Manage deal terms' };
      case '/logistics': return { title: 'Logistics', subtitle: 'Transport tracking' };
      case '/payments': return { title: 'Payments', subtitle: 'Financial settlement' };
      case '/grievances': return { title: 'Grievance Resolution', subtitle: 'Dispute management' };
      default: return { title: 'KrishiSetu', subtitle: 'Farm to Market' };
    }
  };

  const { title, subtitle } = getPageTitle();
  const displayTitle = t(title);
  const displaySubtitle = t(subtitle);

  return (
    <header className="bg-white border-b border-gray-200 shrink-0 sticky top-0 z-20">
      {/* Demo Status Banner (If Lot exists) */}
      {isHydrated && currentLot && (
        <div className="bg-green-50 px-4 py-1.5 border-b border-green-100 flex items-center justify-between text-xs w-full">
          <span className="text-green-700 font-medium flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Demo state saved locally ({currentLot.commodity})
          </span>
          <button 
            onClick={clearLot}
            className="text-red-600 hover:text-red-700 font-medium hover:underline px-2 py-0.5 rounded transition-colors"
          >
            Reset Demo Lot
          </button>
        </div>
      )}

      <div className="flex h-16 items-center px-4 md:px-6 justify-between">
        {/* Left Side: Mobile Menu & Title */}
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenMenu}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg hover:bg-gray-100 focus:outline-none"
            aria-label="Open Mobile Menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{displayTitle}</h1>
            <p className="text-xs md:text-sm text-gray-500 hidden sm:block">{displaySubtitle}</p>
          </div>
        </div>

        {/* Right Side: Status & Profile */}
        <div className="flex items-center gap-3 sm:gap-5">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs font-medium text-gray-600">
            <Activity className="w-3.5 h-3.5 text-green-500" />
            <span className="truncate max-w-[120px]">Gov API Connected</span>
          </div>

          <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>

                    <div className="relative group/lang">
            <button className="flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-green-700 bg-gray-50 hover:bg-green-50 px-2 py-1.5 rounded-md border border-gray-200 transition-colors uppercase">
              <Globe className="w-4 h-4" />
              {language}
            </button>
            <div className="absolute right-0 top-full mt-1 w-24 bg-white border border-gray-200 rounded-md shadow-lg hidden group-hover/lang:block z-50">
               <div className="py-1 flex flex-col">
                 <button onClick={() => setLanguage('en')} className={"px-3 py-1.5 text-left text-xs hover:bg-green-50 " + (language === 'en' ? 'font-bold text-green-700' : 'text-gray-700')}>English</button>
                 <button onClick={() => setLanguage('hi')} className={"px-3 py-1.5 text-left text-xs hover:bg-green-50 " + (language === 'hi' ? 'font-bold text-green-700' : 'text-gray-700')}>Hindi</button>
                 <button onClick={() => setLanguage('te')} className={"px-3 py-1.5 text-left text-xs hover:bg-green-50 " + (language === 'te' ? 'font-bold text-green-700' : 'text-gray-700')}>Telugu</button>
               </div>
            </div>
          </div>

          <button className="text-gray-400 hover:text-gray-600 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="flex items-center gap-2 text-left group">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200 group-hover:ring-2 ring-blue-500 ring-offset-1 transition-all">
              <UserCircle className="w-5 h-5" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-bold text-gray-900 leading-none">Farmer Demo</p>
              <p className="text-xs text-gray-500">MH-Pune</p>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
