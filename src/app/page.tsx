"use client";

import React from 'react';
import { formatINR } from '@/utils/economics';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLot } from '@/contexts/lot-context';
import { 
  LineChart, 
  BrainCircuit, 
  PackagePlus, 
  Users, 
  Search, 
  ArrowRight,
  CheckCircle2,
  Clock,
  LayoutDashboard,
  TrendingUp,
  Truck,
  CreditCard,
  Building2
} from 'lucide-react';

export default function CommandCenterPage() {
  const router = useRouter();
  const { currentLot, resetAll, clearLot } = useLot();

  const getTimelineSteps = () => {
    if (!currentLot) return [];
    
    const isAggregated = !!currentLot.fpoDetails?.isAggregated;
    const hasBuyer = !!currentLot.selectedBuyerId;
    const offerStatus = currentLot.offerDetails?.status;
    const isDealConfirmed = offerStatus === 'Accepted';
    const logTimeline = currentLot.logisticsDetails?.timeline || [];
    const hasLogistics = logTimeline.some(t => t.status === 'Transport Arranged');
    const isDispatched = logTimeline.some(t => t.status === 'Dispatched');
    const isDelivered = logTimeline.some(t => t.status === 'Delivered');
    const payTimeline = currentLot.paymentDetails?.timeline || [];
    const isSettled = payTimeline.some(t => t.status === 'Payment Settled');
    
    const isComplete = isSettled && isDelivered && isDealConfirmed;

    const fpoDecisionMade = currentLot.fpoDetails !== undefined;
    const isFpoSkipped = fpoDecisionMade && !isAggregated;
    const fpoDone = isAggregated || isFpoSkipped;

    return [
      { id: 'created', label: 'Lot Created', done: true, current: false },
      { id: 'fpo', label: isFpoSkipped ? 'FPO (Skipped)' : 'FPO Aggregation', done: fpoDone, current: !fpoDone && !hasBuyer && !isComplete },
      { id: 'match', label: 'Buyer Matched', done: hasBuyer, current: fpoDone && !hasBuyer && !isComplete },
      { id: 'negotiation', label: 'Negotiation', done: isDealConfirmed, current: hasBuyer && !isDealConfirmed && !isComplete },
      { id: 'deal', label: 'Deal Confirmed', done: isDealConfirmed, current: false },
      { id: 'logistics', label: 'Transport', done: hasLogistics, current: isDealConfirmed && !hasLogistics && !isComplete },
      { id: 'delivery', label: 'Delivered', done: isDelivered, current: hasLogistics && !isDelivered && !isComplete },
      { id: 'payment', label: 'Payment', done: isSettled, current: isDelivered && !isSettled && !isComplete },
    ];
  };

  const steps = getTimelineSteps();
  const isComplete = steps.every(s => s.done) || (currentLot?.status === 'Payment Settled');


  const getSummaryMetrics = () => {
    if (!currentLot) return null;
    const effQty = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;
    const savings = currentLot.fpoDetails?.estimatedSavings || 0;
    const price = currentLot.offerDetails?.buyerPrice || currentLot.expectedPrice;
    const gross = price * effQty;
    const logCost = currentLot.logisticsDetails?.estimatedCost || 0;
    const net = gross - logCost;
    
    return {
      qty: effQty,
      isAggregated: !!currentLot.fpoDetails?.isAggregated,
      savings,
      price,
      gross,
      logCost,
      net,
      buyer: currentLot.selectedBuyerId ? 'Matched Buyer' : 'None',
      deliveryStatus: currentLot.logisticsDetails?.status || 'Pending',
      paymentStatus: currentLot.paymentDetails?.status || 'Pending'
    };
  };

  const metrics = getSummaryMetrics();

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      
      <div className="bg-green-700 rounded-2xl p-6 md:p-10 text-white shadow-lg mb-8 relative overflow-hidden flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block rounded-full bg-green-600/50 backdrop-blur-md px-3 py-1 text-xs font-bold tracking-wider text-green-100 uppercase mb-4 border border-green-500/50">
            AGRICULTURAL MARKET PLATFORM
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            From Farm Gate to Best Market
          </h1>
          <p className="text-green-100 md:text-xl mb-6 max-w-xl">
            Discover verified prices, find the best selling window, match with institutional buyers, and maximize your Expected Net Realization.
          </p>

          {!currentLot && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => router.push('/market-intelligence')}
                className="bg-white text-green-800 hover:bg-green-50 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <LineChart className="w-5 h-5" />
                Explore Market Intelligence
              </button>
              <button 
                onClick={() => router.push('/create-lot')}
                className="bg-green-600 border-2 border-green-500 text-white hover:bg-green-500 px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <PackagePlus className="w-5 h-5" />
                Create Digital Lot
              </button>
            </div>
          )}
        </div>

        <div className="relative z-20 flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto">
          <button onClick={() => clearLot()} className="flex-1 md:flex-none text-xs font-bold text-white hover:text-green-900 bg-white/20 hover:bg-white px-4 py-2.5 rounded shadow-sm transition-colors border border-white/40 text-center">Close Active Workspace</button>
          <button onClick={() => resetAll()} className="flex-1 md:flex-none text-xs font-bold text-white hover:text-red-900 bg-red-500/80 hover:bg-red-400 px-4 py-2.5 rounded shadow-sm transition-colors border border-red-500 text-center">Reset Demo Data</button>
        </div>
        
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-1/4 translate-y-1/4">
          <LayoutDashboard className="w-96 h-96" />
        </div>
            </div>

      {currentLot && metrics && (
         <div className="grid grid-cols-2 md:grid-cols-5 bg-white border border-gray-200 rounded-xl shadow-sm mb-6 divide-y md:divide-y-0 md:divide-x divide-gray-100 overflow-hidden">
            <div className="p-4 bg-gray-50/50 flex flex-col justify-center">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Current Lot</p>
               <p className="text-sm font-bold text-gray-900 truncate">{currentLot.commodity} � {currentLot.district || 'Location'}</p>
               <p className="text-xs text-gray-500">{currentLot.quantity} {currentLot.unit} � Grade {currentLot.quality.grade}</p>
            </div>
            <div className="p-4 flex flex-col justify-center">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Market Opportunity</p>
               <div className="flex items-baseline gap-1">
                 <span className="text-2xl font-black text-green-700">87</span>
                 <span className="text-sm font-bold text-gray-400">/100</span>
               </div>
            </div>
            <div className="p-4 flex flex-col justify-center">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Weather Risk</p>
               <div><span className="inline-block bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-bold border border-amber-200">Medium</span></div>
            </div>
            <div className="p-4 flex flex-col justify-center">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Storage Advice</p>
               <span className="text-sm font-bold text-gray-900 leading-tight">Sell within 2 days</span>
            </div>
            <div className="p-4 flex flex-col justify-center bg-green-50/30">
               <p className="text-[10px] text-gray-500 font-bold uppercase mb-1 tracking-wider">Est. Net Realization</p>
               <span className="text-xl font-black text-green-700">{formatINR(metrics.net)}</span>
            </div>
         </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-gray-400" />
            Current Sale Journey
          </h2>
          
          {currentLot && metrics ? (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {currentLot.commodity} {currentLot.variety ? `(${currentLot.variety})` : ''}
                  </h3>
                  <p className="text-gray-500 mt-1">
                    Effective Volume: <span className="font-bold text-gray-900">{metrics.qty} {currentLot.unit}</span> {metrics.isAggregated && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded ml-1 font-medium border border-blue-100">FPO Aggregated</span>}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold border border-green-100">
                    Active Transaction
                  </span>
                </div>
              </div>

              {isComplete && (
                <div className="p-4 bg-green-50 border-b border-green-100 flex items-center gap-3">
                  <div className="bg-green-500 rounded-full p-1"><CheckCircle2 className="w-5 h-5 text-white" /></div>
                  <div>
                    <h3 className="font-bold text-green-900">Transaction Complete</h3>
                    <p className="text-sm text-green-800">Payment settled successfully. You can view this in My Lots or start a new transaction.</p>
                  </div>
                </div>
              )}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Agreed Price</p>
                  <p className="font-bold text-gray-900">{formatINR(metrics.price)}/{currentLot.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Gross Value</p>
                  <p className="font-bold text-gray-900">{formatINR(metrics.gross)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-semibold mb-1">Logistics Cost</p>
                  <p className="font-bold text-red-600">-{formatINR(metrics.logCost)}</p>
                </div>
                <div>
                  <p className="text-xs text-green-700 font-semibold mb-1">Expected Net Realization</p>
                  <p className="font-bold text-green-700 text-lg">{formatINR(metrics.net)}</p>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <Truck className="w-5 h-5 text-blue-500" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Delivery Status</p>
                      <p className="font-bold text-gray-900 text-sm">{metrics.deliveryStatus}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                    <CreditCard className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 font-semibold">Payment Status</p>
                      <p className="font-bold text-gray-900 text-sm">{metrics.paymentStatus}</p>
                    </div>
                 </div>
              </div>
              
              <div className="p-6">
                <h4 className="text-sm font-bold text-gray-900 mb-6 uppercase tracking-wide">Journey Timeline</h4>
                <div className="relative pl-4 space-y-5">
                  <div className="absolute top-2 bottom-4 left-5 w-0.5 bg-gray-100"></div>
                  
                  {steps.map((step, idx) => {
                    const isDone = step.done;
                    const isCurrent = step.current;
                    const isFuture = !isDone && !isCurrent;
                    
                    return (
                      <div key={step.id} className="relative flex items-center gap-4">
                        <div className={"w-3 h-3 rounded-full flex items-center justify-center z-10 shrink-0 " + 
                          (isDone ? 'bg-green-500 ring-4 ring-green-50' : 
                           isCurrent ? 'bg-blue-500 ring-4 ring-blue-50 animate-pulse' : 
                           'bg-gray-300 ring-4 ring-gray-50')}
                        ></div>
                        <div className={"text-sm font-semibold " + 
                          (isDone ? 'text-gray-900' : 
                           isCurrent ? 'text-blue-700 font-bold' : 
                           'text-gray-400')}
                        >
                          {step.label}
                        </div>
                        {isCurrent && !isComplete && (
<div className="ml-auto">
                              <span className="text-[10px] uppercase font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Next Action Required</span>
</div>
)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center text-gray-500">
              <LayoutDashboard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p>No active lot. Create a lot to begin your journey.</p>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 p-4">
              <h3 className="font-bold text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 flex flex-col gap-2">
              <Link href="/market-intelligence" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium border border-transparent hover:border-gray-200">
                <LineChart className="w-5 h-5 text-gray-400" /> Market Intelligence
              </Link>
              <Link href="/sell-advisor" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium border border-transparent hover:border-gray-200">
                <BrainCircuit className="w-5 h-5 text-gray-400" /> AI Sell Advisor
              </Link>
              <Link href="/create-lot" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium border border-transparent hover:border-gray-200">
                <PackagePlus className="w-5 h-5 text-gray-400" /> Create New Lot
              </Link>
              <div className="h-px bg-gray-100 my-1"></div>
              <Link href="/aggregation" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium border border-transparent hover:border-gray-200">
                <Users className="w-5 h-5 text-gray-400" /> FPO Aggregation
              </Link>
              <Link href="/matching" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-gray-700 font-medium border border-transparent hover:border-gray-200">
                <Search className="w-5 h-5 text-gray-400" /> Smart Buyer Matching
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



