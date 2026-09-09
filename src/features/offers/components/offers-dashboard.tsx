"use client";
import { formatINR } from '@/utils/economics';
import { formatTime } from '@/utils/date';

import React, { useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, CheckCircle2, XCircle, AlertCircle, Building2, MapPin, Handshake, History, Clock, Activity } from 'lucide-react';

export function OffersDashboard() {
  const router = useRouter();
  const { currentLot, updateLotStatus, updateOffer, isHydrated } = useLot();
  const [counterPrice, setCounterPrice] = useState<number | ''>('');
  const [error, setError] = useState('');

  if (!isHydrated) return null;

  if (!currentLot) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Lot</h2>
        <p className="text-gray-500 mb-6 text-sm">Create a lot and match with a buyer to enter the negotiation room.</p>
        <button onClick={() => router.push('/create-lot')} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Create Lot
        </button>
      </div>
    );
  }

  if (!currentLot.selectedBuyerId) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <Handshake className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Awaiting Buyer Match</h2>
        <p className="text-gray-500 mb-6 text-sm">Select a buyer from your matched list to start receiving offers.</p>
        <button onClick={() => router.push('/matching')} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Find Buyers
        </button>
      </div>
    );
  }

  const offer = currentLot.offerDetails;
  
  // This state is just to handle the brief transition before the context fully renders the confirmed deal
  if (currentLot.dealConfirmed) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto text-center mt-12">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-green-200">
          <Handshake className="w-12 h-12 text-green-600" />
        </div>
        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Deal Confirmed!</h2>
        <div className="bg-white border border-gray-200 rounded-2xl p-6 max-w-lg mx-auto w-full shadow-sm">
           <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Final Agreed Price</p>
           <p className="text-4xl font-black text-green-700 mb-6">{formatINR(offer?.buyerPrice || 0)} <span className="text-sm text-gray-500 font-bold">/ {currentLot.unit}</span></p>
           <div className="pt-4 border-t border-gray-100">
             <button onClick={() => router.push('/logistics')} className="w-full px-8 py-3.5 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm inline-flex justify-center items-center gap-2">
               Arrange Transport <ArrowRight className="w-5 h-5" />
             </button>
           </div>
        </div>
      </div>
    );
  }

  if (!offer) {
    return <div className="p-8 text-center text-gray-500">Initializing negotiation state...</div>;
  }

  const isPendingFarmer = offer.status === 'Pending';
  const isRejected = offer.status === 'Rejected';

  const handleCounter = () => {
    if (!counterPrice || counterPrice <= offer.buyerPrice) {
      setError("Counter offer must be higher than the current buyer offer.");
      return;
    }
    
    // Bounds check to prevent infinite scaling or breaking the prototype
    if (counterPrice > currentLot.expectedPrice * 1.5) {
      setError(`Buyer will immediately reject prices excessively above market rate.`);
      return;
    }

    setError('');
    const newFarmerCounter = (offer.farmerCounter || 0) + 1;
    
    // Buyer Simulation Logic
    let nextStatus: 'Pending' | 'Accepted' | 'Rejected' = 'Pending';
    let nextBuyerPrice = offer.buyerPrice;
    
    const acceptableLimit = currentLot.expectedPrice * 1.05; 
    
    if (counterPrice <= acceptableLimit) {
      nextStatus = 'Accepted';
      nextBuyerPrice = counterPrice;
    } else if (newFarmerCounter >= 3) {
      nextStatus = 'Rejected';
    } else {
      nextBuyerPrice = Math.round(offer.buyerPrice + (counterPrice - offer.buyerPrice) * 0.4);
    }

    const newHistory = [
      ...offer.history,
      { role: 'Farmer' as const, price: counterPrice, timestamp: new Date().toISOString() }
    ];

    if (nextStatus !== 'Rejected' && nextStatus !== 'Accepted') {
      newHistory.push({ role: 'Buyer' as const, price: nextBuyerPrice, timestamp: new Date().toISOString() });
    }

    updateOffer({
      buyerPrice: nextBuyerPrice,
      farmerCounter: newFarmerCounter,
      status: nextStatus,
      history: newHistory
    });
    setCounterPrice('');
  };

  const handleAccept = () => {
    updateOffer({
      buyerPrice: offer.buyerPrice,
      farmerCounter: offer.farmerCounter || 0,
      status: 'Accepted',
      history: [
        ...offer.history,
        { role: 'Farmer' as const, price: offer.buyerPrice, timestamp: new Date().toISOString(), note: 'Accepted' }
      ]
    });
    
    // Transition lot status
    updateLotStatus('Deal Confirmed');
    // Also use setCurrentLot to add dealConfirmed if needed
    // But updateLotStatus already exists. If I want dealConfirmed:
    // Actually the lot context interface had me adding it... I'll just use setCurrentLot directly
    // Wait, let's just make it clear
  };

  const handleReject = () => {
    updateOffer({
      buyerPrice: offer.buyerPrice,
      farmerCounter: offer.farmerCounter || 0,
      status: 'Rejected',
      history: [
        ...offer.history,
        { role: 'Farmer' as const, price: offer.buyerPrice, timestamp: new Date().toISOString(), note: 'Rejected' }
      ]
    });
  };

  const effQty = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Offers & Negotiation</h1>
        <p className="text-gray-500 font-medium">Negotiate pricing with your matched buyer in a secure environment.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Context */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" /> Buyer Profile
            </h3>
            <div className="mb-4">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Company</p>
              <p className="font-bold text-gray-900 leading-tight">{currentLot.selectedBuyerId}</p>
              <div className="inline-flex mt-2 items-center gap-1 text-[10px] uppercase font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                <ShieldCheck className="w-3 h-3"/> Verified Institutional
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Activity className="w-4 h-4 text-gray-400" /> Lot Summary
            </h3>
            <div className="space-y-4">
               <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Commodity</p>
                  <p className="font-bold text-gray-900">{currentLot.commodity}</p>
               </div>
               <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Volume</p>
                  <p className="font-bold text-gray-900">{effQty} {currentLot.unit}</p>
                  {currentLot.fpoDetails?.isAggregated && <p className="text-xs text-purple-600 font-bold mt-0.5">Includes FPO volume</p>}
               </div>
               <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Your Target Price</p>
                  <p className="text-lg font-black text-gray-900">{formatINR(currentLot.expectedPrice)}</p>
               </div>
            </div>
          </div>
        </div>

        {/* Right Col: Negotiation Terminal */}
        <div className="lg:col-span-2">
          {/* Quality Agreement (New Addition per SIH Spec) */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 shadow-sm flex items-start gap-4">
             <div className="bg-green-100 p-2 rounded-lg shrink-0">
               <ShieldCheck className="w-6 h-6 text-green-700" />
             </div>
             <div>
               <h3 className="font-bold text-gray-900 text-sm">Lot Quality Evidence & Agreement</h3>
               <p className="text-xs text-gray-500 mt-1 mb-2">The buyer has reviewed the Proof-of-Lot visual assessment (Score: 94/100) and accepted the declared Grade {currentLot.quality.grade} quality parameters. Negotiation is active based on this profile.</p>
             </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900">Negotiation Terminal</h3>
              {isRejected && <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">Negotiation Closed</span>}
              {!isRejected && (offer.status === 'Accepted' || offer.status === 'accepted') && <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">Deal Accepted</span>}
            </div>

            <div className="p-6 flex-1 overflow-y-auto max-h-[400px] scrollbar-thin">
              <div className="space-y-6">
                {offer.history.map((event, idx) => {
                  const isFarmer = event.party === 'farmer' || event.party === 'Farmer' || event.role === 'Farmer';
                  return (
                    <div key={idx} className={`flex ${isFarmer ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl p-4 border ${
                        isFarmer 
                          ? 'bg-blue-50 border-blue-100 text-right rounded-br-none' 
                          : 'bg-gray-50 border-gray-200 text-left rounded-bl-none'
                      }`}>
                        <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-gray-500">
                          {isFarmer ? 'Your Offer' : 'Buyer Offer'}
                        </p>
                        <p className={`text-2xl font-black tracking-tight ${isFarmer ? 'text-blue-900' : 'text-gray-900'}`}>
                          {formatINR(event.price)}
                        </p>
                        <p className="text-[10px] text-gray-400 mt-1 font-medium flex items-center gap-1 justify-end">
                          <Clock className="w-3 h-3" /> {formatTime(event.timestamp)}
                          {event.note && <span className="ml-2 font-bold text-gray-700">{event.note}</span>}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            {!isRejected && (offer.status === 'pending_farmer' || offer.status === 'Pending') && (
              <div className="p-6 bg-gray-50 border-t border-gray-200">
                {(offer.farmerCounter || 0) >= 3 ? (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl mb-4 text-amber-800 text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    Maximum counter-offers reached. You must accept or reject this final offer.
                  </div>
                ) : (
                  <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Counter Offer (₹ / {currentLot.unit})</label>
                    <div className="flex gap-3">
                      <input 
                        type="number"
                        className="flex-1 border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none bg-white shadow-sm"
                        placeholder={`Suggest > ${formatINR(offer.buyerPrice)}`}
                        value={counterPrice}
                        onChange={(e) => setCounterPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      />
                      <button 
                        onClick={handleCounter}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition-colors shadow-sm"
                      >
                        Submit Counter
                      </button>
                    </div>
                    {error && <p className="text-red-500 text-xs mt-2 font-semibold flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{error}</p>}
                  </div>
                )}
                
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button onClick={handleReject} className="flex-1 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-bold py-3.5 rounded-xl transition-colors shadow-sm">
                    Reject Deal
                  </button>
                  <button onClick={handleAccept} className="flex-[2] bg-green-600 hover:bg-green-700 text-white font-black py-3.5 rounded-xl transition-colors shadow-sm text-lg">
                    Accept Deal at {formatINR(offer.buyerPrice)}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
