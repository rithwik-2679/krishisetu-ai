"use client";

import React, { useMemo, useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { PROTOTYPE_BUYERS } from '../data/mock-buyers';
import { BuyerMatch } from '@/types/marketplace';
import { MapPin, ShieldCheck, CheckCircle2, Factory, Store, Building2, Ship, AlertCircle, ArrowRight, Award } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function SmartMatching() {
  const router = useRouter();
  const { currentLot, updateLotStatus, updateOffer, setCurrentLot } = useLot();
  const [selectedBuyerId, setSelectedBuyerId] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const matches: BuyerMatch[] = useMemo(() => {
    if (!currentLot) return [];

    const effectiveQuantity = currentLot.fpoDetails?.isAggregated 
      ? currentLot.fpoDetails.aggregatedQuantity 
      : currentLot.quantity;

    return PROTOTYPE_BUYERS.map(buyer => {
      // Compatibility Factors
      const cropScore = buyer.requirements.commodities.includes(currentLot.commodity) ? 100 : 0;
      
      let qtyScore = 0;
      if (effectiveQuantity >= buyer.requirements.minQuantity && effectiveQuantity <= buyer.requirements.maxQuantity) {
        qtyScore = 100;
      } else if (effectiveQuantity < buyer.requirements.minQuantity) {
        qtyScore = (effectiveQuantity / buyer.requirements.minQuantity) * 100;
      } else {
        qtyScore = 80; // Oversupply is easier to negotiate than undersupply
      }

      let qualityScore = 0;
      if (buyer.requirements.preferredGrades.includes(currentLot.quality.grade)) {
        qualityScore = 100;
      } else if (currentLot.quality.grade === 'A') {
        qualityScore = 100; // A meets lower requirements
      } else {
        qualityScore = 40; // Penalty for missing grade target
      }

      // Pseudo Distance penalty based on state/location mismatch
      let distanceScore = 100;
      if (!buyer.location.includes(currentLot.state)) {
        distanceScore -= 40;
      }

      // Expected realization based on indicative range and lot expected price
      const avgIndicative = (buyer.requirements.indicativePriceRange[0] + buyer.requirements.indicativePriceRange[1]) / 2;
      let priceScore = 50;
      if (avgIndicative >= currentLot.expectedPrice) priceScore = 100;
      else priceScore = (avgIndicative / currentLot.expectedPrice) * 100;

      const overallScore = Math.round((cropScore * 0.4) + (qtyScore * 0.2) + (qualityScore * 0.2) + (priceScore * 0.1) + (distanceScore * 0.1));

      // Generate reasons
      const reasons = [];
      if (cropScore === 100) reasons.push(`Crop: Excellent — Buyer actively procuring ${currentLot.commodity}`);
      if (qtyScore === 100) {
        if (currentLot.fpoDetails?.isAggregated) {
          reasons.push(`Quantity: Excellent — Your FPO-aggregated volume (${effectiveQuantity} ${currentLot.unit}) meets this bulk requirement`);
        } else {
          reasons.push('Quantity: Excellent — Volume matches their capacity exactly');
        }
      } else if (qtyScore >= 50) {
        reasons.push('Quantity: Acceptable — Within negotiable bounds');
      }
      if (qualityScore === 100) reasons.push(`Quality: Excellent — Perfectly matches their Grade ${currentLot.quality.grade} requirement`);
      else if (qualityScore > 0) reasons.push(`Quality: Acceptable — Negotiable for Grade ${currentLot.quality.grade}`);
      if (distanceScore > 80) reasons.push('Location: Excellent — Logistically favorable proximity');

      return {
        buyer,
        overallScore,
        expectedRealization: avgIndicative,
        factors: { crop: cropScore, quantity: qtyScore, quality: qualityScore, price: priceScore, distance: distanceScore },
        reasons
      };
    }).filter(m => m.factors.crop > 0) // Only show buyers interested in this crop
      .sort((a, b) => b.overallScore - a.overallScore);
  }, [currentLot]);

  const handleSendLot = () => {
    if (!selectedBuyerId || !currentLot) return;
    
    // Find the selected buyer to generate an initial offer
    const matchedBuyer = matches.find(m => m.buyer.id === selectedBuyerId);
    if (!matchedBuyer) return;

    // The prototype buyer immediately counters with their indicative price
    const initialOfferPrice = Math.round(matchedBuyer.expectedRealization);

    setCurrentLot(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        status: 'Pending Buyer',
        selectedBuyerId: selectedBuyerId,
        offerDetails: {
          buyerPrice: initialOfferPrice,
          status: 'Pending',
          history: [
            {
              role: 'Farmer',
              price: prev.expectedPrice,
              timestamp: new Date().toISOString(),
              note: "Initial Lot Details sent to " + matchedBuyer.buyer.name + ". Awaiting buyer response."
            }
          ]
        }
      };
    });
    setShowSuccess(true);
  };

  if (!currentLot) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Lot Found</h2>
        <p className="text-gray-500 mb-6">Create a produce lot first to find verified buyer matches.</p>
        <button 
          onClick={() => router.push('/create-lot')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Create Produce Lot
        </button>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="max-w-3xl mx-auto p-6 py-12">
        <div className="bg-white border border-green-200 rounded-xl shadow-lg p-10 text-center">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Offer Request Sent</h2>
          <p className="text-lg text-gray-600 mb-8">The buyer has been notified and will review your lot details shortly.</p>
          
          <div className="flex items-center justify-center gap-4 text-sm font-medium text-gray-500 mb-10">
            <span className="flex flex-col items-center gap-1 text-green-600"><div className="w-4 h-4 rounded-full bg-green-600"></div> Lot Created</span>
            <div className="w-12 h-0.5 bg-green-600"></div>
            <span className="flex flex-col items-center gap-1 text-green-600"><div className="w-4 h-4 rounded-full bg-green-600"></div> Quality Recorded</span>
            <div className="w-12 h-0.5 bg-green-600"></div>
            <span className="flex flex-col items-center gap-1 text-green-600"><div className="w-4 h-4 rounded-full bg-green-600"></div> Matched</span>
            <div className="w-12 h-0.5 bg-green-600"></div>
            <span className="flex flex-col items-center gap-1 text-amber-500"><div className="w-4 h-4 rounded-full bg-amber-500"></div> Offer Pending</span>
          </div>

          <button onClick={() => router.push('/offers')} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors">
            View Offers & Negotiation
          </button>
        </div>
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'Processor': return <Factory className="w-5 h-5 text-purple-600" />;
      case 'Retailer': return <Store className="w-5 h-5 text-blue-600" />;
      case 'Wholesaler': return <Building2 className="w-5 h-5 text-orange-600" />;
      case 'Institutional': return <Building2 className="w-5 h-5 text-gray-600" />;
      case 'Exporter': return <Ship className="w-5 h-5 text-cyan-600" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Smart Buyer Matching</h1>
          <p className="text-gray-500 mt-1">AI-powered matchmaking for Lot {currentLot.id}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 shadow-sm flex items-center gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs">Commodity</span>
            <span className="font-bold text-gray-900">{currentLot.commodity}</span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div>
            <span className="text-gray-500 block text-xs">Volume {currentLot.fpoDetails?.isAggregated && '(FPO Bulk)'}</span>
            <span className="font-bold text-gray-900">
              {currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity} {currentLot.unit}
            </span>
          </div>
          <div className="w-px h-8 bg-gray-200"></div>
          <div>
            <span className="text-gray-500 block text-xs">Expected Price</span>
            <span className="font-bold text-gray-900">₹{currentLot.expectedPrice}/{currentLot.unit}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {matches.length === 0 ? (
            <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500 shadow-sm">
              No prototype buyers found matching this crop. Try Tomato, Onion, Wheat, or Banana.
            </div>
          ) : (
            matches.map((match, idx) => {
              const isSelected = selectedBuyerId === match.buyer.id;
              return (
                <div 
                  key={match.buyer.id} 
                  onClick={() => setSelectedBuyerId(match.buyer.id)}
                  className={`bg-white border-2 rounded-xl p-5 cursor-pointer transition-all ${isSelected ? 'border-green-600 shadow-md relative' : 'border-gray-200 hover:border-green-300 shadow-sm'}`}
                >
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-green-600 text-white p-1 rounded-bl-lg">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}
                  {idx === 0 && !isSelected && (
                    <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 text-xs font-bold px-2 py-1 rounded-bl-lg rounded-tr-lg">
                      BEST MATCH
                    </div>
                  )}

                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4 items-center">
                      <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        {getIcon(match.buyer.type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-lg text-gray-900">{match.buyer.name}</h3>
                          <ShieldCheck className="w-4 h-4 text-green-500" />
                        </div>
                        <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {match.buyer.location}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <div className="flex items-center gap-1 mb-1">
                        <Award className="w-4 h-4 text-green-600" />
                        <span className="font-bold text-lg text-green-700">{match.overallScore}<span className="text-sm text-green-600/70">/100</span></span>
                      </div>
                      <span className="text-xs font-medium bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Match Score</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 rounded-lg p-3 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Indicative Price</p>
                      <p className="font-bold text-gray-900">₹{match.expectedRealization}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Payment Terms</p>
                      <p className="font-medium text-gray-900 truncate">{match.buyer.requirements.paymentTerms}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Delivery</p>
                      <p className="font-medium text-gray-900 truncate">{match.buyer.requirements.delivery}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Requirement</p>
                      <p className="font-medium text-gray-900">{match.buyer.requirements.minQuantity}-{match.buyer.requirements.maxQuantity} {currentLot.unit}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1.5">Match Highlights</p>
                    <div className="flex flex-wrap gap-2">
                      {match.reasons.map((r, i) => (
                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md border border-gray-200">{r}</span>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Action Panel</h3>
            
            {selectedBuyerId ? (
              <div className="flex flex-col gap-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800">
                  You have selected a buyer. Click below to formally send your lot details and express interest.
                </div>
                <button 
                  onClick={handleSendLot}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Send Lot Details
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="text-sm text-gray-500 text-center py-6">
                Select a buyer from the matches to proceed with an offer.
              </div>
            )}

            <div className="mt-6 pt-4 border-t border-gray-100">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">How Match Scoring Works</h4>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li>• <b>40%</b> Crop Compatibility</li>
                <li>• <b>20%</b> Quantity Alignment</li>
                <li>• <b>20%</b> Quality Requirements</li>
                <li>• <b>10%</b> Price Attractiveness</li>
                <li>• <b>10%</b> Distance / Logistics</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}




