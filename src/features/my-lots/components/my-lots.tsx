"use client";
import { formatINR } from '@/utils/economics';
import { formatDate } from '@/utils/date';

import React, { useMemo } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';
import { PackagePlus, Clock, ChevronRight, CheckCircle2, ShieldCheck, Truck, CreditCard, Activity, MapPin, Search } from 'lucide-react';

export function MyLotsDashboard() {
  const router = useRouter();
  const { lotHistory, currentLot, switchLot, isHydrated } = useLot();

  if (!isHydrated) return null;

  const handleContinue = (lotId: string, status: string) => {
    switchLot(lotId);
    
    // Route based on exact status
    if (status === 'Ready') router.push('/aggregation');
    else if (status === 'Pending' || status === 'Deal Confirmed') router.push('/offers');
    else if (status === 'Arranged' || status === 'Dispatched' || status === 'In Transit') router.push('/logistics');
    else if (status === 'Delivered' || status === 'Payment Processing') router.push('/payments');
    else if (status === 'Payment Settled') router.push('/'); // Or payments
    else router.push('/aggregation'); // default fallback
  };

  const getStatusColor = (status: string) => {
    if (status === 'Payment Settled') return 'bg-gray-100 text-gray-700 border-gray-200';
    if (status === 'Delivered' || status === 'Payment Processing') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (['Arranged', 'Dispatched', 'In Transit'].includes(status)) return 'bg-amber-50 text-amber-700 border-amber-200';
    if (status === 'Deal Confirmed') return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-green-50 text-green-700 border-green-200'; // Ready, Pending
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Payment Settled') return <CheckCircle2 className="w-4 h-4" />;
    if (status === 'Delivered' || status === 'Payment Processing') return <CreditCard className="w-4 h-4" />;
    if (['Arranged', 'Dispatched', 'In Transit'].includes(status)) return <Truck className="w-4 h-4" />;
    if (status === 'Deal Confirmed') return <ShieldCheck className="w-4 h-4" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">My Digital Lots</h1>
          <p className="text-gray-500 font-medium">Manage your active transactions and historical sales.</p>
        </div>
        <button 
          onClick={() => router.push('/create-lot')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
        >
          <PackagePlus className="w-5 h-5" />
          Create New Lot
        </button>
      </div>

      {lotHistory.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-16 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
            <PackagePlus className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Transactions Found</h2>
          <p className="text-gray-500 mb-8 max-w-md">You haven&apos;t digitized any produce lots yet. Create your first lot to connect with the institutional buyer network.</p>
          <button 
            onClick={() => router.push('/create-lot')}
            className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-8 py-3.5 rounded-xl font-bold transition-colors shadow-sm"
          >
            Start First Transaction
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
            <div className="relative w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text" 
                placeholder="Search by ID or Commodity..." 
                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100">
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Lot ID & Date</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Commodity</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Volume & Quality</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Buyer / Value</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lotHistory.map((lot) => {
                  const isActive = currentLot?.id === lot.id;
                  const isSettled = lot.status === 'Payment Settled';
                  const date = formatDate(lot.createdAt);
                  
                  return (
                    <tr key={lot.id} className={`hover:bg-gray-50/50 transition-colors ${isActive && !isSettled ? 'bg-green-50/30' : ''}`}>
                      <td className="p-4 align-middle">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900">{lot.id}</span>
                          {isActive && !isSettled && <span className="bg-green-500 w-2 h-2 rounded-full animate-pulse"></span>}
                        </div>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{date}</p>
                      </td>
                      <td className="p-4 align-middle">
                        <p className="font-bold text-gray-900">{lot.commodity}</p>
                        <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3"/> {lot.district}</p>
                      </td>
                      <td className="p-4 align-middle">
                        <p className="font-bold text-gray-900">{lot.quantity} {lot.unit}</p>
                        <p className="text-xs font-semibold text-gray-500 mt-0.5">Grade {lot.quality.grade}</p>
                      </td>
                      <td className="p-4 align-middle">
                        {lot.selectedBuyerId ? (
                          <>
                            <p className="font-bold text-gray-900 truncate max-w-[150px]">{lot.selectedBuyerId}</p>
                            <p className="text-xs font-bold text-green-700 mt-0.5">{formatINR(lot.offerDetails?.buyerPrice || lot.expectedPrice)}</p>
                          </>
                        ) : (
                          <span className="text-xs font-semibold text-gray-400 italic">No buyer selected</span>
                        )}
                      </td>
                      <td className="p-4 align-middle">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border ${getStatusColor(lot.status)}`}>
                          {getStatusIcon(lot.status)} {lot.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right">
                        <button 
                          onClick={() => handleContinue(lot.id, lot.status)}
                          className={`inline-flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                            isActive 
                              ? 'bg-green-600 text-white hover:bg-green-700' 
                              : isSettled 
                                ? 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {isSettled ? 'View Receipt' : isActive ? 'Resume' : 'Open'} <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
