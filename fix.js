const fs = require('fs');

const myLotsContent = 
"use client";

import React from 'react';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';
import { PackagePlus, Clock, ChevronRight, CheckCircle2, ShieldCheck, Truck, CreditCard, Activity } from 'lucide-react';

export function MyLotsDashboard() {
  const router = useRouter();
  const { lotHistory, currentLot, switchLot } = useLot();

  const handleContinue = (lotId, status) => {
    switchLot(lotId);
    
    if (status === 'Created') router.push('/aggregation');
    else if (status === 'Pending Buyer') router.push('/offers');
    else if (status === 'Accepted') router.push('/logistics');
    else if (status === 'Transport Arranged' || status === 'Dispatched' || status === 'In Transit') router.push('/logistics');
    else if (status === 'Delivered' || status === 'Payment Pending' || status === 'Payment Processing') router.push('/payments');
    else if (status === 'Payment Settled') router.push('/payments');
    else router.push('/aggregation');
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Lots</h1>
          <p className="text-gray-500 mt-1">Manage your digital produce lots and active transactions.</p>
        </div>
        <button 
          onClick={() => router.push('/create-lot')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
        >
          <PackagePlus className="w-4 h-4" />
          Create New Lot
        </button>
      </div>

      {lotHistory.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <PackagePlus className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Lots Found</h2>
          <p className="text-gray-500 mb-6 max-w-md">You haven't created any digital produce lots yet. Create your first lot to connect with verified buyers.</p>
          <button 
            onClick={() => router.push('/create-lot')}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Create Your First Lot
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lotHistory.map(lot => {
            const isCurrent = currentLot?.id === lot.id;
            const effQty = lot.fpoDetails?.isAggregated ? lot.fpoDetails.aggregatedQuantity : lot.quantity;
            
            return (
              <div key={lot.id} className={"bg-white border-2 rounded-xl shadow-sm overflow-hidden flex flex-col transition-all " + (isCurrent ? 'border-green-500 shadow-md ring-2 ring-green-100' : 'border-gray-200 hover:border-green-300')}>
                {isCurrent && (
                  <div className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wider text-center py-1">
                    Active Workspace
                  </div>
                )}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-bold text-gray-400 block">{lot.id}</span>
                      <h3 className="text-xl font-bold text-gray-900">{lot.commodity} {lot.variety ? '(' + lot.variety + ')' : ''}</h3>
                    </div>
                    <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-1 rounded border border-blue-100">
                      {lot.status}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 mb-6 flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Effective Volume</span>
                      <span className="font-semibold text-gray-900">{effQty} {lot.unit} {lot.fpoDetails?.isAggregated ? '(FPO)' : ''}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Created</span>
                      <span className="font-semibold text-gray-900">{new Date(lot.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                    {lot.selectedBuyerId && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Buyer</span>
                        <span className="font-semibold text-gray-900 truncate max-w-[140px]">{lot.selectedBuyerId}</span>
                      </div>
                    )}
                    {lot.offerDetails?.status === 'Accepted' && (
                      <div className="flex justify-between text-sm border-t border-gray-100 pt-2 mt-1">
                        <span className="text-green-700 font-semibold">Agreed Price</span>
                        <span className="font-bold text-green-700">?{lot.offerDetails.history[lot.offerDetails.history.length - 1].price} /{lot.unit}</span>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleContinue(lot.id, lot.status)}
                    className={"w-full py-2.5 rounded-lg font-bold flex justify-center items-center gap-2 transition-colors " + (isCurrent ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-gray-900')}
                  >
                    {isCurrent ? 'Continue Transaction' : 'Open Transaction'}
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
;

fs.writeFileSync('src/features/my-lots/components/my-lots.tsx', myLotsContent, 'utf8');

const sellAdvisorContent = fs.readFileSync('src/features/sell-advisor/components/sell-advisor.tsx', 'utf8');
const fixedSellAdvisor = sellAdvisorContent.replace(/? \+ v/g, "'?' + v").replace(/\[? \+ Number/g, "['?' + Number");
fs.writeFileSync('src/features/sell-advisor/components/sell-advisor.tsx', fixedSellAdvisor, 'utf8');

const createLotContent = fs.readFileSync('src/features/marketplace/components/create-lot-form.tsx', 'utf8');
const fixedCreateLot = createLotContent.replace(/"LOT-" \+/g, '"LOT-" +');
fs.writeFileSync('src/features/marketplace/components/create-lot-form.tsx', fixedCreateLot, 'utf8');

console.log("Fixed files");
