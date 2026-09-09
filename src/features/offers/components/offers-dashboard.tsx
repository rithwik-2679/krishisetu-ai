"use client";

import React, { useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { PROTOTYPE_BUYERS } from '@/features/marketplace/data/mock-buyers';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowRight, CheckCircle2, XCircle, AlertCircle, Building2, MapPin, HandCoins, History, Clock } from 'lucide-react';

export function OffersDashboard() {
  const router = useRouter();
  const { currentLot, updateLotStatus, updateOffer } = useLot();
  const [counterPrice, setCounterPrice] = useState<number | ''>('');

  if (!currentLot) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Lot</h2>
        <p className="text-gray-500 mb-6">You need to create a lot to start finding buyers.</p>
        <button onClick={() => router.push('/create-lot')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Create Lot
        </button>
      </div>
    );
  }

  if (!currentLot.selectedBuyerId) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lot Ready for Buyer Matching</h2>
        <p className="text-gray-500 mb-6">Find a verified buyer for your active lot.</p>
        <button onClick={() => router.push('/matching')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Find Buyers
        </button>
      </div>
    );
  }

  if (!currentLot.offerDetails) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Offer Sent Yet</h2>
        <p className="text-gray-500 mb-6">Select a buyer to send your lot details.</p>
        <button onClick={() => router.push('/matching')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Go to Smart Matching
        </button>
      </div>
    );
  }

  const buyer = PROTOTYPE_BUYERS.find(b => b.id === currentLot.selectedBuyerId);
  const offer = currentLot.offerDetails;
  
  const handleAccept = () => {
    updateLotStatus('Deal Confirmed');
    updateOffer({
      status: 'Accepted',
      history: [
        ...offer.history,
        { role: 'Farmer', price: offer.buyerPrice, timestamp: new Date().toISOString(), note: 'Offer Accepted. Deal Confirmed.' }
      ]
    });
  };

  const handleReject = () => {
    updateLotStatus('Deal Rejected');
    updateOffer({
      status: 'Rejected',
      history: [
        ...offer.history,
        { role: 'Farmer', price: offer.buyerPrice, timestamp: new Date().toISOString(), note: 'Offer Rejected.' }
      ]
    });
  };

  const handleCounter = () => {
    if (!counterPrice || counterPrice <= 0) return;
    updateLotStatus('Counter Sent');
    
    updateOffer({
      buyerPrice: Number(counterPrice),
      status: 'Pending',
      history: [
        ...offer.history,
        { role: 'Farmer' as const, price: Number(counterPrice), timestamp: new Date().toISOString(), note: 'Counter offer submitted.' }
      ]
    });
    setCounterPrice('');
  };

  const handleSimulateBuyerResponse = () => {
    const marketRef = currentLot.referenceGovPrice || 2000;
    const buyerMaxPrice = Math.round(marketRef * 1.08);
    const buyerInitial = offer.history.length > 1 
      ? offer.history.find(h => h.role === 'Buyer')?.price || marketRef 
      : (offer.buyerPrice || Math.round(marketRef * 0.95));

    const farmerLastRequest = offer.history[offer.history.length - 1].price;
    const buyerLastOffer = [...offer.history].reverse().find(h => h.role === 'Buyer')?.price || buyerInitial;

    if (farmerLastRequest <= buyerMaxPrice && farmerLastRequest <= buyerLastOffer * 1.05) {
       updateLotStatus('Deal Confirmed');
       updateOffer({
         status: 'Accepted',
         history: [
           ...offer.history,
           { role: 'Buyer' as const, price: farmerLastRequest, timestamp: new Date().toISOString(), note: 'Buyer accepted the counter offer.' }
         ]
       });
       return;
    }

    let nextOffer = buyerLastOffer + Math.round((farmerLastRequest - buyerLastOffer) * 0.3);
    let note = 'Buyer proposed a revised counter offer.';
    
    if (nextOffer >= buyerMaxPrice) {
       nextOffer = buyerMaxPrice;
       note = 'Buyer proposed their final maximum offer. No further increases possible.';
    }

    if (offer.history.length === 1) {
        nextOffer = buyerInitial;
        note = 'Buyer submitted initial offer based on quality and logistics.';
    } else if (buyerLastOffer >= buyerMaxPrice) {
        updateLotStatus('Deal Rejected');
        updateOffer({
          status: 'Rejected',
          history: [
             ...offer.history,
             { role: 'Buyer' as const, price: buyerLastOffer, timestamp: new Date().toISOString(), note: 'Negotiation failed. Farmer expectation exceeds buyer maximum limits.' }
          ]
        });
        return;
    }

    updateLotStatus('Offer Received');
    updateOffer({
      buyerPrice: nextOffer,
      status: 'Countered',
      history: [
        ...offer.history,
        { role: 'Buyer' as const, price: nextOffer, timestamp: new Date().toISOString(), note }
      ]
    });
  };

  const isAccepted = offer.status === 'Accepted';
  const isRejected = offer.status === 'Rejected';
  const isPendingBuyer = offer.status === 'Pending';
  const isPendingFarmer = offer.status === 'Countered';

  const effectiveQuantity = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;
  const grossValue = offer.buyerPrice * effectiveQuantity;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Offers & Negotiation</h1>
          <p className="text-gray-500 mt-1">Review, counter, or accept buyer offers for your lot.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border-2 border-green-600 rounded-xl shadow-md overflow-hidden relative">
            <div className="absolute top-0 right-0 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b border-blue-200">
              BUYER OFFER
            </div>
            <div className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {buyer?.name}
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                  </h3>
                  <p className="text-gray-500 flex items-center gap-1"><MapPin className="w-4 h-4" /> {buyer?.location}</p>
                </div>
              </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-50 rounded-lg p-4 mb-4 border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Commodity</p>
                  <p className="font-bold text-gray-900">{currentLot.commodity}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Volume {currentLot.fpoDetails?.isAggregated && '(FPO)'}</p>
                  <p className="font-bold text-gray-900">{effectiveQuantity} {currentLot.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Payment</p>
                  <p className="font-bold text-gray-900">{buyer?.requirements.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Logistics</p>
                  <p className="font-bold text-gray-900">Farmer Arranges</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-blue-900 text-sm flex items-center gap-1"><ShieldCheck className="w-4 h-4"/> Lot Quality Evidence & Agreement</h4>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-200 text-blue-800 px-2 py-0.5 rounded">Buyer Accepted</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-blue-700">Farmer Declared</span>
                    <strong className="text-blue-900">Grade {currentLot.quality.grade}</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-blue-700">AI Visual Assessment</span>
                    <strong className="text-blue-900">Grade A (91%)</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-blue-700">Proof-of-Lot</span>
                    <strong className="text-blue-900">{currentLot.proofOfLot?.confidenceScore || 94}% Confidence</strong>
                  </div>
                  <div>
                    <span className="block text-xs text-blue-700">Evidence</span>
                    <strong className="text-blue-900">{currentLot.proofOfLot?.imagesCaptured || 4} Images + Challenge</strong>
                  </div>
                </div>
              </div>


              {isAccepted ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-green-800 mb-1">Deal Confirmed</h3>
                  <p className="text-green-700 font-medium mb-4">You have accepted the offer of ?{offer.buyerPrice}/{currentLot.unit}</p>
                  <div className="inline-flex flex-col items-center gap-1 bg-white px-6 py-3 rounded-lg border border-green-200 shadow-sm">
                    <span className="text-xs text-gray-500 uppercase font-semibold">Gross Deal Value</span>
                    <span className="text-2xl font-bold text-gray-900">?{grossValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ) : isRejected ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <XCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-red-800 mb-1">Offer Rejected</h3>
                  <p className="text-red-700">You have declined this buyer&apos;s offer.</p>
                </div>
              ) : isPendingBuyer ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
                  <Clock className="w-12 h-12 text-amber-600 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-amber-800 mb-1">Awaiting Buyer Response</h3>
                  <p className="text-amber-700">The buyer is reviewing the latest details.</p>
                  <button onClick={handleSimulateBuyerResponse} className="mt-4 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors shadow-sm">
                    Simulate Buyer Response (Demo)
                  </button>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-lg font-bold text-blue-900 mb-1">Current Offer</h3>
                      <p className="text-sm text-blue-700">The buyer has proposed the following price:</p>
                    </div>
                    <div className="text-right bg-white px-4 py-2 rounded-lg border border-blue-100 shadow-sm">
                      <span className="block text-xs text-gray-500 font-semibold uppercase mb-0.5">Offered Price</span>
                      <span className="text-2xl font-bold text-blue-700">?{offer.buyerPrice}<span className="text-sm text-gray-500 font-normal">/{currentLot.unit}</span></span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button onClick={handleAccept} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-sm flex items-center justify-center gap-2 transition-colors">
                      <CheckCircle2 className="w-5 h-5" /> Accept Offer
                    </button>
                    <button onClick={handleReject} className="px-6 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-3 rounded-lg font-bold transition-colors">
                      Reject
                    </button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-blue-200">
                    <p className="text-sm font-bold text-gray-800 mb-3">Counter Offer</p>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">?</span>
                        <input 
                          type="number" 
                          value={counterPrice}
                          onChange={e => setCounterPrice(e.target.value ? Number(e.target.value) : '')}
                          placeholder="Enter your price" 
                          className="w-full pl-8 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </div>
                      <button onClick={handleCounter} disabled={!counterPrice} className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                        Send Counter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="bg-blue-50 text-blue-800 p-3 rounded-lg text-xs flex gap-2 mx-6 mb-6">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Demo Data Notice: Offers are simulated based on verified buyer criteria. In production, this connects to the buyer&apos;s live bidding terminal.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" /> Negotiation History
            </h3>
            
            <div className="space-y-6">
              {offer.history.map((event, idx) => (
                <div key={idx} className="relative pl-6 border-l-2 border-gray-100 last:border-transparent">
                  <div className={"absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white " + (event.role === 'Buyer' ? 'bg-blue-500' : 'bg-green-500')}></div>
                  <div className="mb-1 flex justify-between items-start">
                    <span className="font-bold text-sm text-gray-900">{event.role}</span>
                    <span className="text-[10px] text-gray-500">{new Date(event.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-xs text-gray-600 mb-1">{event.note}</p>
                  <p className="font-bold text-sm text-gray-800">?{event.price}/{currentLot.unit}</p>
                </div>
              ))}
            </div>

            {isAccepted && (
              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-800 mb-2">
                  Deal successfully confirmed! Next, arrange transportation to dispatch the produce.
                </div>
                <button 
                  onClick={() => router.push('/logistics')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  Proceed to Logistics <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}



