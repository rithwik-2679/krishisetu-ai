"use client";
import { formatINR } from '@/utils/economics';

import React, { useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { Users, Truck, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function FpoAggregation() {
  const router = useRouter();
  const { currentLot, updateLotStatus, updateAggregation, isHydrated } = useLot();
  const [isAggregating, setIsAggregating] = useState(false);

  if (!isHydrated) return null;

  if (!currentLot) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <Users className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Lot</h2>
        <p className="text-gray-500 mb-6 text-sm">Create a lot to begin your selling journey and discover aggregation opportunities.</p>
        <button onClick={() => router.push('/create-lot')} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Create Lot
        </button>
      </div>
    );
  }

  if (currentLot.fpoDetails?.isAggregated || currentLot.fpoDetails?.status === 'skipped') {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto text-center mt-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Aggregation Complete</h2>
        <p className="text-gray-500 max-w-md mx-auto font-medium">
          {currentLot.fpoDetails?.isAggregated 
            ? "Your lot has been successfully aggregated with nearby farmers. Transport costs will be shared." 
            : "You have skipped aggregation and will proceed with an individual lot."}
        </p>
        <div className="mt-8">
          <button onClick={() => router.push('/matching')} className="px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm inline-flex items-center gap-2">
            Proceed to Buyer Matching <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Simulated FPO matches based on current lot
  const matches = [
    { id: 'F-102', distance: 2.5, quantity: 15 },
    { id: 'F-105', distance: 4.1, quantity: 22 },
    { id: 'F-118', distance: 5.0, quantity: 8 },
  ];

  const totalAdditionalQuantity = matches.reduce((sum, m) => sum + m.quantity, 0);
  const aggregatedQuantity = currentLot.quantity + totalAdditionalQuantity;

  // Logistics constraints: a standard medium truck carries ~150 Quintals (15 Tonnes)
  // Converting standard to quintals for capacity
  const truckCapacityQuintals = currentLot.unit === 'Tonnes' ? 15 : 150;
  
  // Ceiling math for trucks
  const individualTrucks = Math.ceil(currentLot.quantity / truckCapacityQuintals);
  const aggregatedTrucks = Math.ceil(aggregatedQuantity / truckCapacityQuintals);

  // Assuming a flat truck rate per trip (distance normalized for demo)
  const costPerTruck = 8000;
  const individualCost = individualTrucks * costPerTruck;
  
  // Aggregated cost is shared proportionally by quantity
  const totalAggregatedCost = aggregatedTrucks * costPerTruck;
  const farmerShareRatio = currentLot.quantity / aggregatedQuantity;
  const farmerAggregatedCost = Math.round(totalAggregatedCost * farmerShareRatio);

  const estimatedSavings = individualCost - farmerAggregatedCost;

  const handleAggregrate = () => {
    setIsAggregating(true);
    setTimeout(() => {
      updateLotStatus('Ready');
      updateAggregation({
        status: 'aggregated',
        isAggregated: true,
        aggregatedQuantity,
        farmerShareRatio,
        estimatedSavings,
        matchedFarmerCount: matches.length
      });
      setIsAggregating(false);
      router.push('/matching');
    }, 1500);
  };

  const handleSkip = () => {
    updateLotStatus('Ready');
    updateAggregation({
      status: 'skipped',
      isAggregated: false,
      aggregatedQuantity: currentLot.quantity,
      farmerShareRatio: 1,
      estimatedSavings: 0,
      matchedFarmerCount: 0
    });
    router.push('/matching');
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">FPO Smart Aggregation</h1>
        <p className="text-gray-500 font-medium">Combine compatible nearby lots to optimize logistics and reduce transport costs per quintal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Matches Panel */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Your Lot</p>
              <h3 className="text-2xl font-black text-gray-900">{currentLot.quantity} {currentLot.unit}</h3>
              <p className="text-sm font-semibold text-gray-600 mt-1">{currentLot.commodity}</p>
            </div>
            <div className="p-5">
              <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Nearby Compatible Lots</span>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">{matches.length} found</span>
              </h4>
              <div className="space-y-3">
                {matches.map(m => (
                  <div key={m.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-gray-50/50">
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Farmer {m.id}</p>
                      <p className="text-[10px] font-semibold text-gray-500 flex items-center gap-1 mt-0.5"><Users className="w-3 h-3"/> {m.distance} km away</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{m.quantity} {currentLot.unit}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Potential Volume</span>
                <span className="text-xl font-black text-green-700">{aggregatedQuantity} {currentLot.unit}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Economics Panel */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-5"><Users className="w-32 h-32" /></div>
             <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-8">Transport Cost Comparison</h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 relative z-10">
               {/* Individual */}
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Individual Transport</p>
                 <div className="flex items-end gap-2 mb-4">
                   <span className="text-3xl font-black text-gray-900">{formatINR(individualCost)}</span>
                 </div>
                 <div className="space-y-2 text-sm text-gray-600 font-medium">
                   <div className="flex justify-between border-b border-gray-200 pb-2"><span>Vehicle Capacity</span><span>{truckCapacityQuintals} {currentLot.unit}</span></div>
                   <div className="flex justify-between border-b border-gray-200 pb-2"><span>Vehicles Required</span><span>{individualTrucks}</span></div>
                   <div className="flex justify-between"><span>Cost per trip</span><span>{formatINR(costPerTruck)}</span></div>
                 </div>
               </div>

               {/* Aggregated */}
               <div className="bg-green-50 border border-green-200 rounded-xl p-5 relative shadow-sm">
                 <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">Recommended</div>
                 <p className="text-[10px] font-bold text-green-800 uppercase tracking-widest mb-4">Aggregated Transport (Your Share)</p>
                 <div className="flex items-end gap-2 mb-4">
                   <span className="text-3xl font-black text-green-700">{formatINR(farmerAggregatedCost)}</span>
                 </div>
                 <div className="space-y-2 text-sm text-green-800 font-medium">
                   <div className="flex justify-between border-b border-green-200/50 pb-2"><span>Total Volume</span><span>{aggregatedQuantity} {currentLot.unit}</span></div>
                   <div className="flex justify-between border-b border-green-200/50 pb-2"><span>Total Vehicles Required</span><span>{aggregatedTrucks}</span></div>
                   <div className="flex justify-between"><span>Your Cost Share</span><span>{Math.round(farmerShareRatio * 100)}%</span></div>
                 </div>
               </div>
             </div>

             <div className="bg-gradient-to-r from-gray-900 to-green-900 rounded-xl p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-white shadow-lg relative z-10">
                <div>
                  <p className="text-xs font-bold text-green-300 uppercase tracking-widest mb-1">Estimated Savings</p>
                  <p className="text-3xl font-black">{formatINR(estimatedSavings)}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button 
                    onClick={handleSkip}
                    disabled={isAggregating}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-bold transition-colors border border-white/20"
                  >
                    Skip
                  </button>
                  <button 
                    onClick={handleAggregrate}
                    disabled={isAggregating}
                    className="px-8 py-3 bg-green-500 hover:bg-green-400 text-gray-900 rounded-lg font-black transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    {isAggregating ? 'Processing...' : 'Confirm Aggregation'}
                  </button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
