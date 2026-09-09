"use client";

import React, { useEffect } from 'react';
import { useLot } from '@/contexts/lot-context';
import { PROTOTYPE_BUYERS } from '@/features/marketplace/data/mock-buyers';
import { useRouter } from 'next/navigation';
import { CreditCard, CheckCircle2, AlertCircle, Building2, TrendingUp, HandCoins, Truck, ShieldCheck, MessageSquareWarning } from 'lucide-react';
import { TrackingEvent } from '@/types/marketplace';

export function PaymentDashboard() {
  const router = useRouter();
  const { currentLot, updateLotStatus, updatePayment } = useLot();

  useEffect(() => {
    if (currentLot && currentLot.offerDetails?.status === 'Accepted' && !currentLot.paymentDetails) {
      const effectiveQuantity = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;
      const grossValue = currentLot.offerDetails!.buyerPrice * effectiveQuantity;
      // If logistics not arranged yet, it's 0 or estimated
      const logisticsDeduction = currentLot.logisticsDetails?.estimatedCost || 0; 
      const netPayable = grossValue - logisticsDeduction;

      updatePayment({
        transactionId: 'TXN-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'),
        grossValue,
        logisticsDeduction,
        netPayable,
        expectedDate: new Date(Date.now() + 86400000 * 2).toISOString(),
        status: 'Payment Pending',
        timeline: [
          { status: 'Payment Pending', timestamp: new Date().toISOString() }
        ]
      });
    }
  }, [currentLot, updatePayment]);

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

  if (!currentLot.offerDetails || currentLot.offerDetails.status !== 'Accepted') {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Confirmed Deal</h2>
        <p className="text-gray-500 mb-6">Payment becomes available after a confirmed deal and delivery.</p>
        <button onClick={() => router.push('/offers')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          View Offers
        </button>
      </div>
    );
  }

  if (currentLot.status !== 'Delivered' && !['Payment Pending', 'Payment Processing', 'Payment Settled'].includes(currentLot.status)) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Produce Not Delivered</h2>
        <p className="text-gray-500 mb-6">Payment becomes available after the produce is successfully delivered.</p>
        <button onClick={() => router.push('/logistics')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Open Logistics
        </button>
      </div>
    );
  }

  const buyer = PROTOTYPE_BUYERS.find(b => b.id === currentLot.selectedBuyerId);
  const payment = currentLot.paymentDetails;
  
  if (!payment) return null; // wait for effect

  const advancePayment = (nextStatus: TrackingEvent['status']) => {
    updateLotStatus(nextStatus);
    updatePayment({
      status: nextStatus,
      timeline: [
        ...payment.timeline,
        { status: nextStatus, timestamp: new Date().toISOString() }
      ]
    });
  };

  const isCompleted = payment.status === 'Payment Settled';

  const effectiveQuantity = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-green-600" />
            Transaction Record & Settlement
          </h1>
          <p className="text-gray-500 mt-1">Track the financial settlement of your confirmed deal.</p>
        </div>
        <button onClick={() => router.push('/grievances')} className="flex items-center gap-2 text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-red-200 shadow-sm">
          <MessageSquareWarning className="w-4 h-4" /> Raise Grievance
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className={"bg-white border-2 rounded-xl shadow-md overflow-hidden relative " + (isCompleted ? 'border-green-600' : 'border-blue-200')}>
            <div className={"absolute top-0 right-0 text-xs font-bold px-3 py-1 rounded-bl-xl border-l border-b " + (isCompleted ? 'bg-green-100 text-green-800 border-green-200' : 'bg-blue-100 text-blue-800 border-blue-200')}>
              {isCompleted ? 'TRANSACTION COMPLETED' : 'DEMO TRANSACTION'}
            </div>
            
            <div className="p-6 md:p-8">
              <div className="flex justify-between items-start mb-8 border-b border-gray-100 pb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{payment.transactionId}</h2>
                  <p className="text-sm text-gray-500">Lot ID: {currentLot.id}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-500 mb-1">Total Net Payable</p>
                  <p className="text-3xl font-bold text-green-700">?{payment.netPayable.toLocaleString('en-IN')}</p>
                </div>
              </div>

              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <HandCoins className="w-5 h-5 text-gray-400" /> Settlement Breakdown
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Agreed Price</span>
                  <span className="font-medium text-gray-900">?{currentLot.offerDetails.buyerPrice} / {currentLot.unit}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Volume</span>
                  <span className="font-medium text-gray-900">{effectiveQuantity} {currentLot.unit} {currentLot.fpoDetails?.isAggregated && '(FPO)'}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Gross Deal Value</span>
                  <span className="font-bold text-gray-900">?{payment.grossValue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-red-600 pt-3 border-t border-gray-200">
                  <span>Logistics Deduction</span>
                  <span>-?{payment.logisticsDeduction.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold text-green-700 pt-3 border-t border-gray-200">
                  <span>Expected Net Realization</span>
                  <span>?{payment.netPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-gray-400" /> Payment Timeline
                </h3>
                
                <div className="relative">
                  <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  
                  {['Payment Pending', 'Payment Processing', 'Payment Settled'].map((stage, idx) => {
                    const event = payment.timeline.find(t => t.status === stage);
                    const isDone = !!event;
                    
                    return (
                      <div key={stage} className="relative flex items-center gap-4 mb-6 last:mb-0">
                        <div className={"w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 bg-white " + (isDone ? 'border-green-600 text-green-600' : 'border-gray-300 text-gray-300')}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                        </div>
                        <div>
                          <p className={"font-bold text-sm " + (isDone ? 'text-gray-900' : 'text-gray-500')}>{stage}</p>
                          {event && <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString('en-IN')}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {!isCompleted && (
                <div className="mt-8 flex gap-3 justify-center border-t border-gray-100 pt-6">
                  {payment.status === 'Payment Pending' && (
                    <button onClick={() => advancePayment('Payment Processing')} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                      Advance to Processing (Demo)
                    </button>
                  )}
                  {payment.status === 'Payment Processing' && (
                    <button onClick={() => advancePayment('Payment Settled')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-sm">
                      Advance to Settled (Demo)
                    </button>
                  )}
                </div>
              )}
            </div>
            <div className="bg-blue-50 text-blue-800 p-3 text-xs flex gap-2 border-t border-blue-100">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p>  <b>Demo Transaction:</b> Payment status simulated for prototype demonstration. In production, this integrates with escrow/nodal bank accounts.</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" /> Buyer Details
            </h3>
            <p className="font-bold text-gray-900">{buyer?.name}</p>
            <p className="text-sm text-gray-600 mb-4">{buyer?.location}</p>
            
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded border border-green-100">
              <ShieldCheck className="w-4 h-4" />
              Verified Institutional Buyer
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2 flex items-center gap-2">
              <Truck className="w-5 h-5 text-gray-400" /> Logistics Context
            </h3>
            {currentLot.logisticsDetails ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="font-bold text-gray-900">{currentLot.logisticsDetails.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Vehicle</p>
                  <p className="text-sm text-gray-900">{currentLot.logisticsDetails.vehicle}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded border border-amber-100">
                Logistics not yet arranged. Expected transport cost will be finalized upon dispatch.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


