"use client";

import React from 'react';
import { formatINR } from '@/utils/economics';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLot } from '@/contexts/lot-context';
import { useLanguage } from '@/contexts/language-context';
import { 
  LineChart, BrainCircuit, PackagePlus, Users, Search, ArrowRight,
  CheckCircle2, Clock, LayoutDashboard, TrendingUp, Truck, CreditCard,
  Check, FileText, AlertCircle, PlayCircle, PlusCircle, Activity
} from 'lucide-react';

export default function CommandCenter() {
  const router = useRouter();
  const { currentLot, isHydrated, clearLot } = useLot();
  const { t } = useLanguage();

  if (!isHydrated) return null;

  const steps = [
    { id: 'lot', label: 'Lot Created', done: !!currentLot, path: '/create-lot' },
    { id: 'quality', label: 'Quality', done: !!currentLot?.quality, path: '/create-lot' },
    { id: 'fpo', label: 'FPO Aggregation', done: currentLot?.fpoDetails?.isAggregated || currentLot?.fpoDetails?.status === 'skipped', path: '/aggregation', optional: true },
    { id: 'matches', label: 'Buyer Match', done: !!currentLot?.selectedBuyerId, path: '/matching' },
    { id: 'offers', label: 'Offers', done: !!currentLot?.offerDetails, path: '/offers' },
    { id: 'deal', label: 'Deal Confirmed', done: !!currentLot?.dealConfirmed, path: '/offers' },
    { id: 'logistics', label: 'Logistics', done: !!currentLot?.logisticsDetails?.status && currentLot.logisticsDetails.status !== 'Pending', path: '/logistics' },
    { id: 'delivered', label: 'Delivered', done: currentLot?.logisticsDetails?.status === 'Delivered', path: '/logistics' },
    { id: 'payment', label: 'Payment Settled', done: currentLot?.status === 'Payment Settled', path: '/payments' },
  ];

  const currentStepIndex = steps.findIndex(s => !s.done);
  const isComplete = currentLot?.status === 'Payment Settled';

  const getSummaryMetrics = () => {
    if (!currentLot) return null;
    const effQty = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;
    const savings = currentLot.fpoDetails?.estimatedSavings || 0;
    const price = currentLot.offerDetails?.buyerPrice || currentLot.expectedPrice;
    const gross = price * effQty;
    const logCost = currentLot.logisticsDetails?.estimatedCost || 0;
    const net = gross - logCost;
    
    return { qty: effQty, isAggregated: !!currentLot.fpoDetails?.isAggregated, savings, price, gross, logCost, net };
  };

  const metrics = getSummaryMetrics();

  const renderNextActionBlock = () => {
    if (isComplete) {
      return (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center shadow-sm">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Transaction Complete</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your produce has been delivered and the payment is settled. You can review the transaction history or start a new lot.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button onClick={() => router.push('/my-lots')} className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
              View Transaction
            </button>
            <button onClick={clearLot} className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-bold hover:bg-green-700 transition-colors shadow-sm">
              Create New Lot
            </button>
          </div>
        </div>
      );
    }

    const currentStep = currentStepIndex >= 0 ? steps[currentStepIndex] : null;
    if (!currentStep) return null;

    let actionLabel = "Continue to " + currentStep.label;
    let actionDesc = "Please complete this step to move forward.";
    if (currentStep.id === 'fpo') {
      actionLabel = "Review FPO Aggregation";
      actionDesc = "Combine your lot with nearby farmers to save on transport.";
    } else if (currentStep.id === 'matches') {
      actionLabel = "Review Buyer Matches";
      actionDesc = "We found verified buyers matching your lot criteria.";
    } else if (currentStep.id === 'offers' || currentStep.id === 'deal') {
      actionLabel = "Review Offers";
      actionDesc = "Negotiate and confirm a deal with your matched buyer.";
    } else if (currentStep.id === 'logistics') {
      actionLabel = "Arrange Transport";
      actionDesc = "Your deal is confirmed. Coordinate logistics to the buyer facility.";
    }

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-xs font-bold text-green-600 tracking-wider uppercase mb-1">Next Action</h3>
          <h4 className="text-xl font-bold text-gray-900">{actionLabel}</h4>
          <p className="text-sm text-gray-500 mt-1">{actionDesc}</p>
        </div>
        <button 
          onClick={() => router.push(currentStep.path)}
          className="w-full md:w-auto px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          {actionLabel} <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      {/* Premium Hero */}
      {!currentLot && (
        <div className="bg-gradient-to-br from-green-900 to-gray-900 rounded-2xl p-8 md:p-14 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-400 via-transparent to-transparent"></div>
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold tracking-wider text-green-100 uppercase mb-6 backdrop-blur-sm shadow-sm">
              <Activity className="w-4 h-4 text-green-400" />
              India&apos;s Intelligent Farm-to-Market Platform
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-5 leading-tight">
              From Farm Gate to<br/>Best Selling Strategy
            </h1>
            <p className="text-gray-300 md:text-lg mb-8 max-w-2xl font-medium leading-relaxed">
              Market intelligence, selling-window recommendations, quality evidence, buyer matching, negotiation, logistics, storage, and payment tracking in one connected workflow.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button onClick={() => router.push('/market-intelligence')} className="w-full sm:w-auto px-6 py-3.5 bg-white text-green-900 hover:bg-gray-50 rounded-xl font-bold transition-colors shadow-lg flex items-center justify-center gap-2">
                Explore Market Intelligence <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={() => router.push('/create-lot')} className="w-full sm:w-auto px-6 py-3.5 bg-green-800/50 hover:bg-green-800/70 border border-green-500/30 text-white rounded-xl font-bold transition-colors backdrop-blur-sm flex items-center justify-center gap-2">
                <PlusCircle className="w-5 h-5" /> Create Digital Lot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Intelligence Panel & Stepper when Lot Exists */}
      {currentLot && metrics && (
        <>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Current Sale Opportunity</h2>
            <div className="flex gap-2">
              <button onClick={() => router.push('/sell-advisor')} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-colors">Value Simulator</button>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm mb-6 flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-gray-100 overflow-hidden">
             {/* Lot Context */}
             <div className="p-6 flex-1 bg-gray-50/50">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Current Lot</p>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded border border-blue-100">{currentLot.state || 'Location'}</span>
                </div>
                <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-1">{currentLot.commodity}</h3>
                <p className="text-sm text-gray-600 font-medium">
                  {metrics.qty} {currentLot.unit} • Grade {currentLot.quality.grade}
                  {metrics.isAggregated && <span className="ml-2 text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded font-bold border border-purple-100">Aggregated</span>}
                </p>
             </div>
             
             <div className="p-6 flex-1 flex flex-col justify-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Est. Net Realization</p>
                <p className="text-3xl font-black text-green-700 tracking-tight">{formatINR(metrics.net)}</p>
                {metrics.logCost > 0 && <p className="text-xs font-semibold text-gray-500 mt-1">After {formatINR(metrics.logCost)} transport</p>}
             </div>

             <div className="p-6 flex-1 flex flex-col justify-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Market Opportunity</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-gray-900">87</span>
                  <span className="text-sm font-bold text-gray-400">/100</span>
                </div>
                <p className="text-xs text-green-700 font-bold mt-1">Excellent Match</p>
             </div>

             <div className="p-6 flex-1 flex flex-col justify-center">
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Storage Recommendation</p>
                <p className="text-sm font-bold text-gray-900 mb-2">Sell within 2 days</p>
                <span className="self-start text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">Medium Weather Risk</span>
             </div>
          </div>

          <div className="mb-8">
            <h2 className="text-sm font-bold text-gray-900 mb-4 px-1 tracking-tight">Transaction Lifecycle</h2>
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 overflow-x-auto scrollbar-thin">
              <div className="flex items-start min-w-[800px] py-2 relative">
                {steps.map((s, i) => {
                  const isPast = s.done;
                  const isCurrent = !isComplete && currentStepIndex === i;
                  const isSkipped = s.optional && !s.done && i < (currentStepIndex >= 0 ? currentStepIndex : steps.length);
                  
                  return (
                    <div key={s.id} className="flex-1 relative">
                      <div className="flex flex-col items-center relative z-10 group cursor-pointer" onClick={() => router.push(s.path)}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all text-sm font-bold border-2
                          ${isPast ? 'bg-green-600 border-green-600 text-white shadow-md' : 
                            isSkipped ? 'bg-gray-50 border-gray-200 text-gray-400' :
                            isCurrent ? 'bg-white border-green-500 text-green-600 shadow-md ring-4 ring-green-50 scale-110' : 
                            'bg-white border-gray-200 text-gray-400'}`}
                        >
                          {isPast ? <Check className="w-5 h-5" /> : (i + 1)}
                        </div>
                        <div className="mt-4 text-center">
                          <p className={`text-xs font-bold uppercase tracking-wider whitespace-nowrap ${isCurrent ? 'text-green-700' : isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                            {s.label}
                          </p>
                          {isSkipped && <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Skipped</p>}
                        </div>
                      </div>
                      {i < steps.length - 1 && (
                        <div className={`absolute top-5 left-[50%] w-full h-0.5 -z-10 ${steps[i+1].done || isSkipped ? 'bg-green-500' : 'bg-gray-200'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="mb-12">
            {renderNextActionBlock()}
          </div>
        </>
      )}

      {/* Quick Links Section */}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-gray-500 mb-4 px-1 uppercase tracking-wider">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Intelligence', icon: LineChart, path: '/market-intelligence', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Sell Advisor', icon: BrainCircuit, path: '/sell-advisor', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Create Lot', icon: PackagePlus, path: '/create-lot', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'FPO Aggregation', icon: Users, path: '/aggregation', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Buyer Match', icon: Search, path: '/matching', color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Logistics', icon: Truck, path: '/logistics', color: 'text-rose-600', bg: 'bg-rose-50' },
          ].map((item, i) => (
            <button 
              key={i} 
              onClick={() => router.push(item.path)}
              className="flex flex-col items-center justify-center p-5 bg-white border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all group"
            >
              <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <item.icon className="w-6 h-6" />
              </div>
              <span className="text-xs font-bold text-gray-700 text-center">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
