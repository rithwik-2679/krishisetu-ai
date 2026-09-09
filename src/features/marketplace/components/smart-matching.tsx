"use client";
import { formatINR } from '@/utils/economics';

import React, { useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';
import { ShieldCheck, MapPin, Package, ArrowRight, GitMerge, Info, CheckCircle2 } from 'lucide-react';

export function SmartMatching() {
  const router = useRouter();
  const { currentLot, updateLotStatus, setCurrentLot, isHydrated, updateOffer } = useLot();
  const [isMatching, setIsMatching] = useState(false);

  if (!isHydrated) return null;

  if (!currentLot) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <GitMerge className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Lot</h2>
        <p className="text-gray-500 mb-6 text-sm">Create a lot and complete FPO aggregation to see buyer matches.</p>
        <button onClick={() => router.push('/create-lot')} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Create Lot
        </button>
      </div>
    );
  }

  if (currentLot.selectedBuyerId) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto text-center mt-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Buyer Selected</h2>
        <p className="text-gray-500 max-w-md mx-auto font-medium">
          You have successfully matched with {currentLot.selectedBuyerId}. Negotiation is now active in your Offers dashboard.
        </p>
        <div className="mt-8">
          <button onClick={() => router.push('/offers')} className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm inline-flex items-center gap-2">
            View Offers Dashboard <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  const effQty = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;

  const matches = [
    {
      id: "ORG-BUYER-1",
      name: "FreshFoods Processing Ltd",
      distance: 45,
      requiredQty: Math.round(effQty * 1.2),
      offeredPrice: currentLot.expectedPrice * 0.98,
      qualityReq: 'Grade A or B',
      score: 92,
      reasons: ["Quantity aligns with combined FPO volume", "Quality requirement matches Grade " + currentLot.quality.grade, "Facility located within 50km radius"],
      type: "Processor"
    },
    {
      id: "ORG-BUYER-2",
      name: "National Export Traders",
      distance: 120,
      requiredQty: Math.round(effQty * 3),
      offeredPrice: currentLot.expectedPrice * 1.05,
      qualityReq: 'Grade A strictly',
      score: 78,
      reasons: ["Strong price premium offered", "Distance increases transport cost", "Requires larger ongoing volumes"],
      type: "Exporter"
    },
    {
      id: "ORG-BUYER-3",
      name: "Metro Retail Logistics",
      distance: 18,
      requiredQty: Math.round(effQty * 0.8),
      offeredPrice: currentLot.expectedPrice * 0.95,
      qualityReq: 'Grade B or C',
      score: 85,
      reasons: ["Very close proximity reduces logistics risk", "Flexible on moisture content", "Cannot absorb entire FPO volume"],
      type: "Retailer"
    }
  ];

  const handleSelectBuyer = (buyer: typeof matches[0]) => {
    setIsMatching(true);
    setTimeout(() => {
      // Use setCurrentLot to set the selectedBuyerId
      setCurrentLot((prev) => prev ? { ...prev, status: 'Pending', selectedBuyerId: buyer.id } : null);
      
      // Initialize negotiation state
      updateOffer({
        buyerPrice: buyer.offeredPrice,
        farmerCounter: 0,
        status: 'Pending',
        history: [{ role: 'Buyer', price: buyer.offeredPrice, timestamp: new Date().toISOString() }]
      });
      setIsMatching(false);
      router.push('/offers');
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-[10px] font-bold tracking-wider text-blue-700 uppercase mb-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Institutional Buyer Network
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Smart Buyer Matching</h1>
          <p className="text-gray-500 font-medium">Buyers ranked by compatibility with your lot size, quality, and location.</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl px-5 py-3 shadow-sm flex flex-col items-end">
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Your Target Price</p>
           <p className="text-2xl font-black text-green-700">{formatINR(currentLot.expectedPrice)}<span className="text-sm text-gray-500 font-bold ml-1">/ {currentLot.unit}</span></p>
        </div>
      </div>

      <div className="space-y-6">
        {matches.map((buyer, idx) => (
          <div key={buyer.id} className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row transition-shadow hover:shadow-md">
            
            {/* Buyer Profile */}
            <div className="p-6 md:w-1/3 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">Demo Network Profile</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">{buyer.type}</span>
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-4">{buyer.name}</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400" /> {buyer.distance} km from your location
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <Package className="w-4 h-4 text-gray-400" /> Needs {buyer.requiredQty} {currentLot.unit}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-gray-700">
                    <ShieldCheck className="w-4 h-4 text-gray-400" /> Accepts {buyer.qualityReq}
                  </div>
                </div>
              </div>
            </div>

            {/* Match Analysis */}
            <div className="p-6 md:w-2/3 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6">
                <div>
                   <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Match Reasons</h4>
                   <ul className="space-y-2">
                     {buyer.reasons.map((r, i) => (
                       <li key={i} className="flex items-start gap-2 text-sm font-medium text-gray-700">
                         <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${idx === 0 ? 'text-green-500' : 'text-gray-400'}`} />
                         {r}
                       </li>
                     ))}
                   </ul>
                </div>
                <div className="flex flex-col items-start sm:items-end shrink-0">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Compatibility Score</p>
                  <div className="flex items-baseline gap-1 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
                    <span className={`text-4xl font-black tracking-tight ${idx === 0 ? 'text-green-600' : idx === 1 ? 'text-amber-600' : 'text-blue-600'}`}>
                      {buyer.score}
                    </span>
                    <span className="text-sm font-bold text-gray-400">/100</span>
                  </div>
                </div>
              </div>

              <div className="pt-5 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                <div>
                   <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Initial Bid Offer</p>
                   <p className="text-xl font-black text-gray-900">{formatINR(buyer.offeredPrice)} <span className="text-xs font-bold text-gray-500">/ {currentLot.unit}</span></p>
                </div>
                <button 
                  onClick={() => handleSelectBuyer(buyer)}
                  disabled={isMatching}
                  className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-sm
                    ${idx === 0 ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {isMatching ? 'Initializing...' : 'Select & Negotiate'} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
