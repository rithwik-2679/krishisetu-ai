"use client";

import React, { useState, useEffect } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';
import { Users, Truck, ArrowRight, ShieldCheck, CheckCircle2, TrendingDown, Info, LayoutDashboard } from 'lucide-react';
import { findCompatibleLots, calculateLogisticsEconomics, ScoredNearbyLot } from '../utils/aggregation-engine';

export function FpoAggregation() {
  const router = useRouter();
  const { currentLot, updateAggregation } = useLot();
  
  const [compatibleLots, setCompatibleLots] = useState<ScoredNearbyLot[]>([]);
  const [selectedLots, setSelectedLots] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    if (currentLot) {
      const lots = findCompatibleLots(currentLot);
      // eslint-disable-next-line
      setCompatibleLots(lots);
      // Pre-select highly compatible lots by default
      const preselected = new Set(lots.filter(l => l.compatibilityScore >= 80).map(l => l.id));
      // eslint-disable-next-line
      setSelectedLots(preselected);
    }
  }, [currentLot]);

  if (!currentLot) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Context</h2>
        <button onClick={() => router.push('/market-intelligence')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Calculate totals dynamically
  const selectedLotDetails = compatibleLots.filter(l => selectedLots.has(l.id));
  const aggregatedQuantity = currentLot.quantity + selectedLotDetails.reduce((sum, lot) => sum + lot.quantity, 0);
  const avgScore = selectedLotDetails.length > 0 
    ? selectedLotDetails.reduce((sum, lot) => sum + lot.compatibilityScore, 0) / selectedLotDetails.length 
    : 0;

  // Assuming a pseudo-distance to the market of 150km for cost demonstration
  const economics = calculateLogisticsEconomics(currentLot.quantity, 150, aggregatedQuantity);

  const toggleLot = (id: string) => {
    const newSet = new Set(selectedLots);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedLots(newSet);
  };

  const handleSkip = () => {
    updateAggregation({ isAggregated: false });
    router.push('/matching');
  };

  const handleConfirm = () => {
    updateAggregation({
      isAggregated: true,
      fpoName: 'KrishiSetu Farmer Producer Organization',
      participatingFarmers: selectedLots.size + 1, // +1 for the current user
      contributingLots: selectedLotDetails,
      originalQuantity: currentLot.quantity,
      aggregatedQuantity: aggregatedQuantity,
      averageCompatibilityScore: avgScore,
      estimatedIndividualCost: economics.estimatedIndividualCost,
      estimatedAggregatedCost: economics.estimatedAggregatedCost,
      estimatedSavings: economics.estimatedSavings,
      status: 'FPO BULK LOT CREATED'
    });
    router.push('/matching');
  };

  if (compatibleLots.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6 py-12 text-center">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Nearby Aggregation Found</h2>
          <p className="text-gray-500 mb-6">There are currently no FPO aggregation opportunities for {currentLot.commodity} in your immediate area.</p>
          <button onClick={handleSkip} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 mx-auto shadow-sm">
            Proceed to Individual Matching <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // Already aggregated view
  if (currentLot.fpoDetails?.isAggregated) {
    const fpo = currentLot.fpoDetails;
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white border-2 border-green-600 rounded-xl shadow-md overflow-hidden relative mb-8">
          <div className="absolute top-0 right-0 bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-green-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3"/> {fpo.status}
          </div>
          <div className="p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 text-green-600" />
              {fpo.fpoName}
            </h1>
            <p className="text-gray-500 mb-8">Your lot is successfully part of an aggregated bulk shipment.</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Total Volume</p>
                <p className="text-2xl font-bold text-gray-900">{fpo.aggregatedQuantity} <span className="text-sm font-normal text-gray-500">{currentLot.unit}</span></p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Farmers</p>
                <p className="text-2xl font-bold text-gray-900">{fpo.participatingFarmers}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 md:col-span-2">
                <p className="text-sm text-green-800 font-medium mb-1 flex items-center gap-1"><TrendingDown className="w-4 h-4"/> Logistics Savings</p>
                <p className="text-2xl font-bold text-green-700">₹{fpo.estimatedSavings.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <button onClick={() => updateAggregation({ isAggregated: false })} className="px-6 py-3 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg font-bold transition-colors">
                Cancel Aggregation
              </button>
              <button onClick={() => router.push('/matching')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors">
                Continue to Buyers <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
          <Users className="w-8 h-8 text-blue-600" />
          FPO Smart Aggregation
        </h1>
        <p className="text-gray-500 mt-2 max-w-2xl">
          Combine your lot with nearby compatible farmers to unlock heavy-duty transport rates and access institutional bulk buyers.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-gray-400" />
              Prototype Network — Nearby Farmers
            </h3>
            <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs flex gap-2 mb-6">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              <span>These are demo network data nodes to demonstrate the FPO functionality. They are not official government records.</span>
            </div>

            <div className="space-y-4">
              {/* Current User's Lot */}
              <div className="border-2 border-green-200 bg-green-50 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-green-700 mb-1 block">Your Lot</span>
                  <h4 className="font-bold text-gray-900">{currentLot.commodity} — Grade {currentLot.quality.grade}</h4>
                  <p className="text-sm text-gray-600">Origin: {currentLot.district}</p>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-gray-900">{currentLot.quantity}</span>
                  <span className="text-sm text-gray-500 ml-1">{currentLot.unit}</span>
                </div>
              </div>

              {/* Compatible Lots */}
              {compatibleLots.map(lot => {
                const isSelected = selectedLots.has(lot.id);
                return (
                  <div 
                    key={lot.id} 
                    onClick={() => toggleLot(lot.id)}
                    className={`border rounded-lg p-4 flex items-center justify-between cursor-pointer transition-colors ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 ${isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-gray-300 bg-white'}`}>
                        {isSelected && <CheckCircle2 className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">{lot.farmerName}</h4>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                          <span>{lot.distanceKm} km away</span>
                          <span>•</span>
                          <span>Grade {lot.qualityGrade}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-gray-900">{lot.quantity}</span>
                      <span className="text-xs text-gray-500 ml-1">{lot.unit}</span>
                      <div className="text-[10px] uppercase font-bold text-blue-600 mt-1">
                        {lot.compatibilityScore >= 80 ? 'High Match' : 'Match'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border-2 border-blue-100 rounded-xl shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-6 border-b pb-2 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-blue-600" /> Logistics Economics
            </h3>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 flex justify-between mb-1">
                  <span>Your Individual Transport</span>
                  <span className="font-medium text-gray-900">₹{economics.estimatedIndividualCost.toLocaleString('en-IN')}</span>
                </p>
                <p className="text-xs text-gray-400">Based on {currentLot.quantity} {currentLot.unit}</p>
              </div>

              {selectedLots.size > 0 && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500 flex justify-between mb-1">
                    <span>Aggregated Shared Cost</span>
                    <span className="font-medium text-blue-700">₹{economics.estimatedAggregatedCost.toLocaleString('en-IN')}</span>
                  </p>
                  <p className="text-xs text-blue-500 mt-1">
    Based on your share of {aggregatedQuantity} {currentLot.unit}. 
    Requires {economics.vehiclesRequired} Heavy Truck(s) (15 Tonnes each).
   </p>
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800 font-medium mb-1">Estimated Savings</p>
                <p className="text-3xl font-bold text-green-700">
                  ₹{economics.estimatedSavings.toLocaleString('en-IN')}
                </p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Truck className="w-3 h-3" /> Heavy-duty truck economics
                </p>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <p className="text-sm font-medium text-gray-700 mb-4">Total FPO Volume</p>
                <p className="text-3xl font-bold text-gray-900 mb-1">{aggregatedQuantity} <span className="text-lg font-normal text-gray-500">{currentLot.unit}</span></p>
                <p className="text-sm text-blue-600 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Unlocks 3 Additional Bulk Buyers
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3">
              <button 
                onClick={handleConfirm} 
                disabled={selectedLots.size === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white py-3 rounded-lg font-bold transition-colors shadow-sm flex justify-center items-center gap-2"
              >
                Create FPO Bulk Lot <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={handleSkip} 
                className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-600 py-3 rounded-lg font-bold transition-colors"
              >
                Skip, Sell Individually
              </button>
            </div>
            
            <p className="text-[10px] text-gray-400 text-center mt-4">
              *Logistics estimates calculated based on standard volume thresholds.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


