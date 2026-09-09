"use client";
import React, { useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';
import { formatDateTime, formatTime } from '@/utils/date';
import { MessageSquareWarning, AlertCircle, FileText, CheckCircle2, Clock, PackageCheck, Send } from 'lucide-react';
import { TrackingEvent } from '@/types/marketplace';

const CATEGORIES = [
  'Payment Delay / Mismatch',
  'Quality Dispute at Destination',
  'Quantity Dispute at Destination',
  'Logistics / Transport Issue',
  'Platform Support / Other'
];

export function GrievanceDashboard() {
  const router = useRouter();
  const { currentLot, updateGrievance, isHydrated } = useLot();
  
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isHydrated) return null;

  if (!currentLot) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <MessageSquareWarning className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Context</h2>
        <p className="text-gray-500 mb-6 text-sm">You need an active lot to file a transaction-related grievance.</p>
        <button onClick={() => router.push('/')} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const hasGrievance = !!currentLot.grievanceDetails;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    
    setIsSubmitting(true);
    
    setTimeout(() => {
      const initialEvent: TrackingEvent = {
        status: 'Ticket Opened',
        location: 'System',
        timestamp: new Date().toISOString(),
        description: `Ticket created for: ${category}`
      };

      updateGrievance({
        id: `TKT-${Math.floor(Math.random() * 90000) + 10000}`,
        status: 'Open',
        category,
        description,
        priority: 'High',
        filedAt: new Date().toISOString(),
        events: [initialEvent]
      });
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Support & Grievances</h1>
        <p className="text-gray-500 font-medium">File and track disputes directly with the platform resolution center.</p>
      </div>

      {!hasGrievance ? (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex items-start gap-3">
             <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
             <div>
               <h3 className="font-bold text-blue-900">Dispute Resolution</h3>
               <p className="text-sm text-blue-800 mt-1">
                 Because KrishiSetu uses Proof-of-Lot digital evidence, quality disputes are resolved significantly faster than traditional channels. Your visual evidence acts as the baseline for all claims.
               </p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 flex justify-between items-center">
               <div>
                 <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Filing Against Lot ID</p>
                 <p className="font-bold text-gray-900">{currentLot.id}</p>
               </div>
               {currentLot.selectedBuyerId && (
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Counterparty</p>
                   <p className="font-bold text-gray-900">{currentLot.selectedBuyerId}</p>
                 </div>
               )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Issue Category</label>
              <select 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-rose-500 outline-none bg-white shadow-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
              <textarea 
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-rose-500 outline-none bg-white shadow-sm"
                rows={5}
                placeholder="Provide detailed information about the issue..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="pt-4">
              <button 
                type="submit"
                disabled={isSubmitting || !description}
                className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? 'Filing Ticket...' : 'Submit Grievance'} <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 bg-rose-50 border-b border-rose-100 flex justify-between items-center">
             <div>
               <h3 className="font-bold text-rose-900 text-lg flex items-center gap-2"><FileText className="w-5 h-5"/> Ticket {currentLot.grievanceDetails?.id}</h3>
               <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mt-1">Status: {currentLot.grievanceDetails?.status}</p>
             </div>
             <span className="bg-rose-200 text-rose-800 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest">
               High Priority
             </span>
          </div>

          <div className="p-6 border-b border-gray-100 bg-gray-50/50">
             <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Category: {currentLot.grievanceDetails?.category}</p>
             <p className="text-sm font-medium text-gray-800 leading-relaxed">{currentLot.grievanceDetails?.description}</p>
             <p className="text-[10px] font-bold text-gray-400 mt-4 flex items-center gap-1">
                <Clock className="w-3 h-3"/> Filed on {formatDateTime(currentLot.grievanceDetails?.filedAt)}
             </p>
          </div>

          <div className="p-6">
             <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">Resolution Timeline</h4>
             <div className="space-y-0">
               {(currentLot.grievanceDetails?.events || currentLot.grievanceDetails?.timeline || []).map((event, idx, arr) => {
                 const isLast = idx === arr.length - 1;
                 return (
                   <div key={idx} className="flex items-start gap-4 relative">
                     <div className="flex flex-col items-center">
                       <div className="w-10 h-10 rounded-full bg-rose-100 border-2 border-rose-500 flex items-center justify-center z-10 shadow-sm text-rose-600">
                         <CheckCircle2 className="w-5 h-5" />
                       </div>
                       {!isLast && <div className="w-0.5 h-16 bg-gray-200 mt-2 mb-2"></div>}
                     </div>
                     <div className={`bg-gray-50 border border-gray-100 rounded-xl p-4 flex-1 mb-6 shadow-sm ${isLast ? 'ring-2 ring-rose-500/20' : ''}`}>
                       <div className="flex justify-between items-start mb-1">
                         <p className="font-bold text-gray-900">{event.status}</p>
                         <p className="text-xs font-semibold text-gray-500">{formatTime(event.timestamp)}</p>
                       </div>
                       <p className="text-sm text-gray-700 font-medium">{event.description}</p>
                     </div>
                   </div>
                 );
               })}
             </div>
             
             <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-xl text-center">
               <p className="text-sm font-bold text-gray-700 mb-1">Your ticket is under review by the Platform Resolution Team.</p>
               <p className="text-xs text-gray-500">You will be notified via SMS when there is an update.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
