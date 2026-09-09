"use client";

import React, { useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';
import { MessageSquareWarning, AlertCircle, FileText, CheckCircle2, Search, ArrowRight } from 'lucide-react';
import { TrackingEvent } from '@/types/marketplace';

const CATEGORIES = [
  'Payment Delay',
  'Payment Mismatch',
  'Quantity Dispute',
  'Quality Dispute',
  'Delivery Issue',
  'Buyer Issue',
  'Logistics Issue',
  'Other'
];

export function GrievanceDashboard() {
  const router = useRouter();
  const { currentLot, updateGrievance } = useLot();
  
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('High');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If no lot at all
  if (!currentLot) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Context</h2>
        <p className="text-gray-500 mb-6">Create a lot and process a transaction to access the grievance center.</p>
        <button onClick={() => router.push('/market-intelligence')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Go to Dashboard
        </button>
      </div>
    );
  }

  const grievance = currentLot.grievanceDetails;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description) return;
    setIsSubmitting(true);

    setTimeout(() => {
      updateGrievance({
        id: `GRIEV-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
        category,
        description,
        priority,
        status: 'Grievance Raised',
        timeline: [
          { status: 'Grievance Raised', timestamp: new Date().toISOString() }
        ]
      });
      setIsSubmitting(false);
    }, 800);
  };

  const advanceTracking = (nextStatus: TrackingEvent['status']) => {
    if (!grievance) return;
    updateGrievance({
      status: nextStatus,
      timeline: [
        ...grievance.timeline,
        { status: nextStatus, timestamp: new Date().toISOString() }
      ]
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            Dispute & Grievance Center
            <MessageSquareWarning className="w-6 h-6 text-amber-500" />
          </h1>
          <p className="text-gray-500 mt-1">Raise and track issues related to Lot {currentLot.id}</p>
        </div>
      </div>

      {!grievance ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-amber-50 border-b border-amber-100 p-4 flex gap-3 text-amber-800 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p><strong>Demo Workflow:</strong> Raising a grievance will generate a simulated timeline. In production, this escalates to APMC officials or dedicated KrishiSetu resolution agents.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 md:p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Reference Lot / Transaction ID</label>
              <input type="text" disabled value={currentLot.paymentDetails?.transactionId || currentLot.id} className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 font-mono text-sm cursor-not-allowed" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Issue Category <span className="text-red-500">*</span></label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">Priority Level</label>
                <select value={priority} onChange={e => setPriority(e.target.value)} className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900">
                  <option value="Critical">Critical</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Description <span className="text-red-500">*</span></label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                rows={5} 
                required
                placeholder="Please describe the issue in detail..." 
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 text-gray-900" 
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">Supporting Documents (Optional)</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <FileText className="w-8 h-8 mb-2 text-gray-400" />
                <span className="text-sm font-medium">Click to upload photos or receipts</span>
              </div>
            </div>

            <div className="flex justify-end mt-4 pt-6 border-t border-gray-100">
              <button 
                type="submit"
                disabled={isSubmitting || !description}
                className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
                {!isSubmitting && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white border-2 border-amber-200 rounded-xl shadow-md overflow-hidden">
          <div className="bg-amber-50 p-6 border-b border-amber-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="bg-white text-amber-800 font-mono font-bold px-2 py-1 rounded border border-amber-200 text-sm shadow-sm">{grievance.id}</span>
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${grievance.priority === 'Critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>{grievance.priority} Priority</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mt-2">{grievance.category}</h2>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-lg font-bold text-amber-700">{grievance.status}</p>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Description Provided</h3>
              <p className="text-gray-800 bg-gray-50 p-4 rounded-lg border border-gray-100">{grievance.description}</p>
            </div>

            <h3 className="text-sm font-semibold text-gray-500 uppercase mb-6">Resolution Timeline</h3>
            
            <div className="relative">
              <div className="absolute top-0 bottom-0 left-4 w-1 bg-gray-100 z-0"></div>
              
              {['Grievance Raised', 'Under Review', 'Response Received', 'Resolved'].map((stage) => {
                const event = grievance.timeline.find(t => t.status === stage);
                const isDone = !!event;
                
                return (
                  <div key={stage} className="relative z-10 flex items-start gap-4 mb-6 last:mb-0">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center border-2 shrink-0 bg-white ${isDone ? 'border-amber-500 text-amber-600' : 'border-gray-200 text-gray-300'}`}>
                      {isDone ? (stage === 'Resolved' ? <CheckCircle2 className="w-5 h-5" /> : <Search className="w-4 h-4" />) : <div className="w-2.5 h-2.5 rounded-full bg-gray-200"></div>}
                    </div>
                    <div className="pt-1.5">
                      <p className={`font-bold ${isDone ? 'text-gray-900' : 'text-gray-400'}`}>{stage}</p>
                      {event && <p className="text-xs text-gray-500 mt-0.5">{new Date(event.timestamp).toLocaleString('en-IN')}</p>}
                      
                      {grievance.status === 'Grievance Raised' && stage === 'Under Review' && (
                        <button onClick={() => advanceTracking('Under Review')} className="mt-3 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 px-4 py-1.5 rounded text-sm font-medium transition-colors">Simulate: Agent Reviews Case</button>
                      )}
                      {grievance.status === 'Under Review' && stage === 'Response Received' && (
                        <button onClick={() => advanceTracking('Response Received')} className="mt-3 bg-amber-100 hover:bg-amber-200 text-amber-800 border border-amber-200 px-4 py-1.5 rounded text-sm font-medium transition-colors">Simulate: Buyer/System Responds</button>
                      )}
                      {grievance.status === 'Response Received' && stage === 'Resolved' && (
                        <button onClick={() => advanceTracking('Resolved')} className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1">Simulate: Mark Resolved <CheckCircle2 className="w-4 h-4" /></button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
