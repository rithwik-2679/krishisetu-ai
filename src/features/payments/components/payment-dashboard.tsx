"use client";
import { formatINR } from '@/utils/economics';

import React, { useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';
import { CreditCard, AlertCircle, CheckCircle2, Clock, ShieldCheck, Download, ArrowRight, Receipt, Landmark } from 'lucide-react';

export function PaymentDashboard() {
  const router = useRouter();
  const { currentLot, updateLotStatus, isHydrated } = useLot();
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isHydrated) return null;

  if (!currentLot) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <CreditCard className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Lot</h2>
        <p className="text-gray-500 mb-6 text-sm">Create a lot, confirm a deal, and complete delivery to receive payment.</p>
        <button onClick={() => router.push('/create-lot')} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Create Lot
        </button>
      </div>
    );
  }

  if (currentLot.logisticsDetails?.status !== 'Delivered') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Delivery Pending</h2>
        <p className="text-gray-500 mb-6 text-sm">Payment settlement requires the produce to be delivered and inspected by the buyer.</p>
        <button onClick={() => router.push('/logistics')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
          Track Logistics
        </button>
      </div>
    );
  }

  const isSettled = currentLot.status === 'Payment Settled';
  const isSettlementProcessing = currentLot.status === 'Payment Processing';

  const effQty = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;
  const buyerPrice = currentLot.offerDetails?.buyerPrice || 0;
  const grossValue = buyerPrice * effQty;
  const transportCost = currentLot.logisticsDetails?.estimatedCost || 0;
  
  // Platform fee simulated for realism
  const platformFee = Math.round(grossValue * 0.01); 
  const netRealization = grossValue - transportCost - platformFee;

  const handleSettle = () => {
    setIsProcessing(true);
    updateLotStatus('Payment Processing');
    
    // Simulate settlement delay
    setTimeout(() => {
      updateLotStatus('Payment Settled');
      setIsProcessing(false);
    }, 2500);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Financial Settlement</h1>
          <p className="text-gray-500 font-medium">Review your transaction economics and track payment status.</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-200 text-xs font-bold tracking-widest text-blue-700 uppercase shadow-sm">
          <ShieldCheck className="w-4 h-4" /> Demo Transaction Gateway
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Economics Breakdown */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-50 border-b border-gray-100 p-6 flex items-center gap-3">
             <Receipt className="w-5 h-5 text-gray-400" />
             <h3 className="font-bold text-gray-900 text-lg">Sale Transaction Invoice</h3>
          </div>
          
          <div className="p-6 flex-1 flex flex-col">
            <div className="space-y-4 flex-1">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Gross Deal Value</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{effQty} {currentLot.unit} @ {formatINR(buyerPrice)}</p>
                </div>
                <p className="font-black text-gray-900 text-lg">{formatINR(grossValue)}</p>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Transport & Logistics</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">Deducted at source</p>
                </div>
                <p className="font-black text-rose-600 text-lg">-{formatINR(transportCost)}</p>
              </div>

              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-900">Platform Facilitation Fee (1%)</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">For escrow & matching</p>
                </div>
                <p className="font-black text-rose-600 text-lg">-{formatINR(platformFee)}</p>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-xl p-5 mt-6 shadow-sm">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-green-800 uppercase tracking-widest">Net Realization</p>
                <p className="text-3xl font-black text-green-700 tracking-tight">{formatINR(netRealization)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Status Tracker */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8 flex flex-col justify-between relative overflow-hidden">
           <div className="absolute top-0 right-0 p-8 opacity-5"><Landmark className="w-32 h-32" /></div>
           
           <div>
             <h3 className="font-bold text-gray-900 text-lg mb-8 relative z-10">Settlement Timeline</h3>
             
             <div className="space-y-8 relative z-10">
                {/* Step 1: Delivery Confirmed */}
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="pt-1">
                    <p className="font-bold text-gray-900">Delivery Confirmed</p>
                    <p className="text-sm text-gray-500 font-medium">Buyer has accepted the lot.</p>
                  </div>
                </div>

                {/* Step 2: Processing */}
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2
                    ${isSettled ? 'bg-green-100 border-green-500 text-green-600' : 
                      isSettlementProcessing ? 'bg-blue-100 border-blue-500 text-blue-600 ring-4 ring-blue-50 animate-pulse' : 
                      'bg-gray-50 border-gray-200 text-gray-400'}
                  `}>
                    {isSettled ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="pt-1">
                    <p className={`font-bold ${isSettled || isSettlementProcessing ? 'text-gray-900' : 'text-gray-400'}`}>Payment Processing</p>
                    <p className="text-sm text-gray-500 font-medium">Funds in escrow clearing.</p>
                  </div>
                </div>

                {/* Step 3: Settled */}
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2
                    ${isSettled ? 'bg-green-100 border-green-500 text-green-600 ring-4 ring-green-50' : 'bg-gray-50 border-gray-200 text-gray-400'}
                  `}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="pt-1">
                    <p className={`font-bold ${isSettled ? 'text-gray-900' : 'text-gray-400'}`}>Settlement Complete</p>
                    <p className="text-sm text-gray-500 font-medium">Funds deposited to bank account ending in 4821.</p>
                  </div>
                </div>
             </div>
           </div>

           <div className="mt-10 pt-6 border-t border-gray-100 relative z-10">
             {!isSettled && !isSettlementProcessing && (
               <button 
                 onClick={handleSettle}
                 className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black transition-colors shadow-sm text-lg"
               >
                 Trigger Demo Settlement
               </button>
             )}
             
             {isSettlementProcessing && (
               <div className="w-full py-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl font-bold flex items-center justify-center gap-2">
                 <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                 Processing Payment...
               </div>
             )}

             {isSettled && (
               <div className="flex flex-col gap-4">
                 <div className="w-full py-4 bg-green-50 border border-green-200 text-green-800 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm">
                   <CheckCircle2 className="w-5 h-5 text-green-600" /> Payment Settled Successfully
                 </div>
                 <div className="flex gap-3">
                   <button onClick={() => router.push('/my-lots')} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-50 transition-colors shadow-sm">
                     View Transaction
                   </button>
                   <button className="flex-[2] bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-sm flex items-center justify-center gap-2">
                     <Download className="w-4 h-4" /> Download Receipt
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
