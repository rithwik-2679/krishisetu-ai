"use client";
import { formatINR } from '@/utils/economics';

import React, { useState, useMemo } from 'react';
import { useLot } from '@/contexts/lot-context';
import { INDIAN_STATES, COMMODITIES } from '@/data/geography';
import { QualityAssessment, Lot } from '@/types/marketplace';
import { MarketPriceRecord } from '@/types/market-data';
import { useRouter } from 'next/navigation';
import { ArrowRight, CheckCircle2, AlertCircle, Info, Camera, ChevronRight, Check } from 'lucide-react';

interface CreateLotProps {
  initialRecords: MarketPriceRecord[];
}

export function CreateLotForm({ initialRecords }: CreateLotProps) {
  const router = useRouter();
  const { currentLotDraft, updateDraft, setCurrentLot, clearDraft } = useLot();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Derived state for dropdowns
  const distinctCommodities = COMMODITIES;
  
  const varieties = useMemo(() => {
    if (!currentLotDraft.commodity) return [];
    return Array.from(new Set(initialRecords.filter(r => r.commodity === currentLotDraft.commodity && r.variety).map(r => r.variety))).sort();
  }, [initialRecords, currentLotDraft.commodity]);

  const states = INDIAN_STATES;

  const districts = useMemo(() => {
    if (!currentLotDraft.commodity || !currentLotDraft.state) return [];
    return Array.from(new Set(initialRecords.filter(r => r.commodity === currentLotDraft.commodity && r.state === currentLotDraft.state).map(r => r.district))).sort();
  }, [initialRecords, currentLotDraft.commodity, currentLotDraft.state]);

  const indicativePrice = useMemo(() => {
    if (!currentLotDraft.commodity) return null;
    let records = initialRecords.filter(r => r.commodity === currentLotDraft.commodity);
    
    if (currentLotDraft.state) {
      const stateRecords = records.filter(r => r.state === currentLotDraft.state);
      if (stateRecords.length > 0) records = stateRecords;
    }
    if (currentLotDraft.district) {
      const districtRecords = records.filter(r => r.district === currentLotDraft.district);
      if (districtRecords.length > 0) records = districtRecords;
    }

    if (records.length === 0) return null;
    const avg = records.reduce((sum, r) => sum + r.modalPrice, 0) / records.length;
    return Math.round(avg);
  }, [initialRecords, currentLotDraft]);

  const [grade, setGrade] = useState<QualityAssessment['grade']>('A');
  const [proofCaptured, setProofCaptured] = useState(false);
  const [proofLoading, setProofLoading] = useState(false);
  const [moisturePercent, setMoisturePercent] = useState<number>(12);
  const [damagePercent, setDamagePercent] = useState<number>(2);
  const [visualQuality, setVisualQuality] = useState<QualityAssessment['visualQuality']>('Excellent');
  const [size, setSize] = useState<QualityAssessment['size']>('Mixed');
  
  const [createdLotId, setCreatedLotId] = useState<string | null>(null);
  const [challengeCode] = useState(() => Math.floor(1000 + Math.random() * 9000));

  const handleCaptureProof = () => {
    setProofLoading(true);
    setTimeout(() => {
      setProofLoading(false);
      setProofCaptured(true);
    }, 1500);
  };

  const handleCreateLot = () => {
    const quality: QualityAssessment = {
      grade,
      moisturePercent,
      damagePercent,
      visualQuality,
      size,
      qualityScore: Math.max(60, 100 - damagePercent * 3 - Math.abs(moisturePercent - 12) * 2),
      observations: damagePercent > 5 ? ['High damage rate'] : [],
      evidenceUrl: proofCaptured ? '/demo-evidence.jpg' : undefined,
      evidenceScore: proofCaptured ? 94 : undefined
    };

    const newLot: Lot = {
      id: "LOT-" + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
      commodity: currentLotDraft.commodity || '',
      variety: currentLotDraft.variety,
      quantity: currentLotDraft.quantity || 10,
      unit: currentLotDraft.unit || 'Quintals',
      state: currentLotDraft.state || '',
      district: currentLotDraft.district || '',
      expectedPrice: currentLotDraft.expectedPrice || indicativePrice || 0,
      status: 'Ready',
      quality,
      createdAt: new Date().toISOString()
    };

    setCurrentLot(newLot);
    clearDraft();
    setCreatedLotId(newLot.id);
  };

  if (createdLotId) {
    return (
      <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto items-center text-center mt-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-gray-900">Lot Created Successfully</h2>
        <p className="text-gray-500 max-w-md">
          Your digital lot ({createdLotId}) has been created with visual evidence. You are now ready for FPO Aggregation and Buyer Matching.
        </p>
        <div className="flex gap-4 mt-6">
          <button onClick={() => router.push('/')} className="px-6 py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200 transition-colors">
            Command Center
          </button>
          <button onClick={() => router.push('/aggregation')} className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 transition-colors shadow-sm">
            Continue to Aggregation
          </button>
        </div>
      </div>
    );
  }

  const stepperItems = ['Lot Details', 'Quality & Evidence', 'Review'];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Create Digital Lot</h1>
        <p className="text-gray-500 font-medium">Digitize your harvest for the institutional buyer network.</p>
      </div>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {stepperItems.map((item, idx) => {
          const isActive = step === idx + 1;
          const isPast = step > idx + 1;
          return (
            <React.Fragment key={idx}>
              <div className="flex flex-col items-center relative z-10 w-32">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
                  ${isPast ? 'bg-green-600 border-green-600 text-white' : 
                    isActive ? 'bg-white border-green-600 text-green-600 ring-4 ring-green-50' : 
                    'bg-white border-gray-200 text-gray-400'}`}>
                  {isPast ? <Check className="w-4 h-4" /> : (idx + 1)}
                </div>
                <span className={`text-xs font-bold uppercase tracking-wider mt-3 ${isActive || isPast ? 'text-gray-900' : 'text-gray-400'}`}>
                  {item}
                </span>
              </div>
              {idx < stepperItems.length - 1 && (
                <div className={`w-16 h-0.5 -mx-8 z-0 ${isPast ? 'bg-green-600' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">1. Crop Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Commodity *</label>
                <select 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                  value={currentLotDraft.commodity || ''}
                  onChange={(e) => updateDraft({ commodity: e.target.value, variety: '' })}
                >
                  <option value="">Select Commodity</option>
                  {distinctCommodities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Variety (Optional)</label>
                <select 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 disabled:opacity-50"
                  value={currentLotDraft.variety || ''}
                  onChange={(e) => updateDraft({ variety: e.target.value })}
                  disabled={!currentLotDraft.commodity}
                >
                  <option value="">Any Variety</option>
                  {varieties.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quantity *</label>
                <div className="flex gap-2">
                  <input 
                    type="number" min="1"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                    value={currentLotDraft.quantity || ''}
                    onChange={(e) => updateDraft({ quantity: Number(e.target.value) })}
                  />
                  <select 
                    className="w-1/3 border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                    value={currentLotDraft.unit || 'Quintals'}
                    onChange={(e) => updateDraft({ unit: e.target.value as 'Quintals' | 'Tonnes' })}
                  >
                    <option value="Quintals">Quintals</option>
                    <option value="Tonnes">Tonnes</option>
                  </select>
                </div>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">2. Origin Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">State *</label>
                <select 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                  value={currentLotDraft.state || ''}
                  onChange={(e) => updateDraft({ state: e.target.value, district: '' })}
                >
                  <option value="">Select State</option>
                  {states.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">District</label>
                <select 
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50 disabled:opacity-50"
                  value={currentLotDraft.district || ''}
                  onChange={(e) => updateDraft({ district: e.target.value })}
                  disabled={!currentLotDraft.state}
                >
                  <option value="">Select District</option>
                  {districts.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-2">3. Pricing</h2>
            <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 mb-6">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-gray-900">Government Market Reference</p>
                  {indicativePrice ? (
                    <p className="text-2xl font-black text-green-700 mt-1">{formatINR(indicativePrice)} <span className="text-sm text-gray-500 font-semibold">/ {currentLotDraft.unit || 'Quintal'}</span></p>
                  ) : (
                    <p className="text-sm text-gray-500 mt-1">Select commodity and location to see reference price.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="max-w-xs">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">My Expected Price (Optional)</label>
              <input 
                type="number"
                placeholder={indicativePrice ? String(indicativePrice) : ''}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                value={currentLotDraft.expectedPrice || ''}
                onChange={(e) => updateDraft({ expectedPrice: Number(e.target.value) })}
              />
            </div>
            
            <div className="flex justify-end mt-8 pt-6 border-t border-gray-100">
              <button 
                onClick={() => setStep(2)}
                disabled={!currentLotDraft.commodity || !currentLotDraft.quantity || !currentLotDraft.state}
                className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                Next Step <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Quality & Proof */}
        {step === 2 && (
          <div className="p-8">
             <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mb-8 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-blue-900">Proof-of-Lot System</h3>
                  <p className="text-sm text-blue-800 mt-1">
                    Buyers require visual evidence before making offers. Capture a photo of your crop alongside the dynamic challenge code below to prove possession.
                  </p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Evidence Panel */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                   <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Dynamic Challenge Code</p>
                   <div className="text-4xl font-black text-gray-900 tracking-widest mb-4 bg-white py-3 border border-gray-200 rounded-xl shadow-sm">KS-{challengeCode}</div>
                   <p className="text-xs text-gray-500 mb-6">Write this on a paper and include it in your photo.</p>
                   
                   {!proofCaptured ? (
                     <button 
                       onClick={handleCaptureProof}
                       disabled={proofLoading}
                       className="w-full py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl hover:border-green-500 hover:bg-green-50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-600 font-bold"
                     >
                       {proofLoading ? (
                         <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                       ) : (
                         <>
                           <Camera className="w-8 h-8 text-gray-400" />
                           Capture Visual Evidence
                         </>
                       )}
                     </button>
                   ) : (
                     <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col items-center">
                       <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                       <p className="font-bold text-green-800 text-sm">Evidence Collected</p>
                       <p className="text-[10px] text-green-600 uppercase tracking-widest font-bold mt-1">Prototype Visual Evidence Assessment</p>
                       <div className="mt-3 bg-white px-4 py-2 rounded-lg border border-green-100 flex items-center gap-2">
                         <span className="text-xs font-bold text-gray-500 uppercase">Confidence Score</span>
                         <span className="text-lg font-black text-green-700">94/100</span>
                       </div>
                     </div>
                   )}
                </div>

                {/* Farmer Declaration */}
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Farmer Quality Declaration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Estimated Grade</label>
                      <select className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none bg-gray-50" value={grade} onChange={e => setGrade(e.target.value as QualityAssessment['grade'])}>
                        <option value="A">Grade A (Premium)</option>
                        <option value="B">Grade B (Standard)</option>
                        <option value="C">Grade C (Processing)</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Moisture %</label>
                        <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none bg-gray-50" value={moisturePercent} onChange={e => setMoisturePercent(Number(e.target.value))} />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Damage %</label>
                        <input type="number" className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none bg-gray-50" value={damagePercent} onChange={e => setDamagePercent(Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </div>
             </div>

             <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
                <button onClick={() => setStep(1)} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">Back</button>
                <button onClick={() => setStep(3)} disabled={!proofCaptured} className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-50">Next Step</button>
             </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="p-8">
            <h2 className="text-xl font-extrabold text-gray-900 mb-6 text-center">Review Digital Lot</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 max-w-2xl mx-auto mb-8">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Commodity</p>
                  <p className="text-lg font-black text-gray-900">{currentLotDraft.commodity} {currentLotDraft.variety ? `(${currentLotDraft.variety})` : ''}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Quantity</p>
                  <p className="text-lg font-black text-gray-900">{currentLotDraft.quantity} {currentLotDraft.unit}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Location</p>
                  <p className="text-sm font-bold text-gray-900">{currentLotDraft.district || 'Unspecified'}, {currentLotDraft.state}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Expected Price</p>
                  <p className="text-sm font-bold text-green-700">{formatINR(currentLotDraft.expectedPrice || indicativePrice || 0)}</p>
                </div>
                <div className="col-span-2 border-t border-gray-200 pt-4 mt-2">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Quality Profile</p>
                  <div className="flex gap-4">
                     <span className="bg-white border border-gray-200 px-3 py-1 rounded text-sm font-bold text-gray-700">Grade {grade}</span>
                     <span className="bg-white border border-gray-200 px-3 py-1 rounded text-sm font-bold text-gray-700">{moisturePercent}% Moisture</span>
                     {proofCaptured && <span className="bg-green-50 border border-green-200 text-green-700 px-3 py-1 rounded text-sm font-bold flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Evidence Verified</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between max-w-2xl mx-auto pt-6 border-t border-gray-100">
                <button onClick={() => setStep(2)} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-colors">Back</button>
                <button onClick={handleCreateLot} className="px-8 py-3 bg-green-600 text-white rounded-xl font-extrabold hover:bg-green-700 transition-colors shadow-md">Submit Digital Lot</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
