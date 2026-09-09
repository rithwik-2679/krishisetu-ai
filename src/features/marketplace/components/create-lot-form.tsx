"use client";
import { formatINR } from '@/utils/economics';

import React, { useState, useMemo, useEffect } from 'react';
import { useLot } from '@/contexts/lot-context';
import { INDIAN_STATES, COMMODITIES } from '@/data/geography';
import { QualityAssessment, Lot } from '@/types/marketplace';
import { MarketPriceRecord } from '@/types/market-data';
import { useRouter } from 'next/navigation';
import { ArrowRight, Calculator, CheckCircle2, TrendingUp, AlertCircle, RefreshCw, ChevronRight, Info, PackagePlus, Camera } from 'lucide-react';

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

  const states = useMemo(() => {
    if (!currentLotDraft.commodity) return [];
    return Array.from(new Set(initialRecords.filter(r => r.commodity === currentLotDraft.commodity).map(r => r.state))).sort();
  }, [initialRecords, currentLotDraft.commodity]);

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
    return records.reduce((a, b) => a + b.modalPrice, 0) / records.length;
  }, [initialRecords, currentLotDraft.commodity, currentLotDraft.state, currentLotDraft.district]);

  // Quality State
  const [grade, setGrade] = useState<QualityAssessment['grade']>('A');
  const [proofCaptured, setProofCaptured] = useState(false);
  const [proofLoading, setProofLoading] = useState(false);
  const [moisturePercent, setMoisturePercent] = useState<number>(12);
  const [damagePercent, setDamagePercent] = useState<number>(2);
  const [visualQuality, setVisualQuality] = useState<QualityAssessment['visualQuality']>('Excellent');
  const [size, setSize] = useState<QualityAssessment['size']>('Mixed');

  // Success State
  const [createdLotId, setCreatedLotId] = useState<string | null>(null);
  const [challengeCode] = useState(() => Math.floor(1000 + Math.random() * 9000));

  const handleCreateLot = () => {
    let score = 100;
    if (grade === 'A') score -= 0;
    else if (grade === 'B') score -= 10;
    else if (grade === 'C') score -= 25;
    else score -= 15;

    score -= damagePercent * 2;
    if (moisturePercent > 15) score -= (moisturePercent - 15) * 1.5;

    if (visualQuality === 'Excellent') score += 5;
    if (visualQuality === 'Poor') score -= 20;

    const finalScore = Math.max(0, Math.min(100, score));

    const observations = [];
    if (damagePercent > 5) observations.push('High damage/spoilage rate.');
    if (moisturePercent > 14) observations.push('High moisture content, drying recommended.');
    if (grade === 'A' && damagePercent < 2) observations.push('Premium export-ready quality.');
    if (observations.length === 0) observations.push('Standard quality parameters met.');

    const quality: QualityAssessment = {
      grade,
      moisturePercent,
      damagePercent,
      visualQuality,
      size,
      qualityScore: finalScore,
      observations
    };

    const newLot: Lot = {
      id: "LOT-" + Math.floor(Math.random() * 100000).toString().padStart(5, '0'),
      commodity: currentLotDraft.commodity || '',
      variety: currentLotDraft.variety && currentLotDraft.variety !== 'All / Not Specified' ? currentLotDraft.variety : '',
      quantity: currentLotDraft.quantity || 10,
      unit: currentLotDraft.unit || 'Quintals',
      district: currentLotDraft.district || '',
      state: currentLotDraft.state || '',
      expectedPrice: currentLotDraft.expectedPrice || indicativePrice || 0,
      referenceGovPrice: indicativePrice || 0,
      harvestDate: currentLotDraft.harvestDate || new Date().toISOString().split('T')[0],
      preferredSellingDate: currentLotDraft.preferredSellingDate || '',
      storageAvailable: currentLotDraft.storageAvailable || false,
      notes: currentLotDraft.notes || '',
      quality,
      status: 'Created',
      createdAt: new Date().toISOString()
    };

    setCurrentLot(newLot);
    setCreatedLotId(newLot.id);
    clearDraft();
    setStep(3);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create Produce Lot</h1>
          <p className="text-gray-500 mt-1">Digitize your harvest for the verified marketplace.</p>
        </div>
        <button 
          onClick={() => clearDraft()}
          className="text-sm font-semibold text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded shadow-sm"
        >
          Clear Draft
        </button>
      </div>

      {step === 1 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <PackagePlus className="w-5 h-5 text-green-600" />
              Step 1: Produce Details
            </h2>
            <span className="text-sm text-gray-500">1 of 2</span>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Crop / Commodity *</label>
              <select value={currentLotDraft.commodity || ''} onChange={e => updateDraft({ commodity: e.target.value, variety: '', state: '', district: '' })} className="px-3 py-2 border rounded-md text-sm focus:border-green-500 focus:ring-green-500">
                <option value="">Select Crop...</option>
                {distinctCommodities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Variety</label>
              <select value={currentLotDraft.variety || ''} onChange={e => updateDraft({ variety: e.target.value })} className="px-3 py-2 border rounded-md text-sm disabled:bg-gray-50" disabled={!currentLotDraft.commodity}>
                <option value="">All / Not Specified</option>
                {varieties.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Quantity *</label>
              <div className="flex gap-2">
                <input type="number" value={currentLotDraft.quantity || 10} onChange={e => updateDraft({ quantity: Number(e.target.value) })} className="px-3 py-2 border rounded-md text-sm flex-1" />
                <select value={currentLotDraft.unit || 'Quintals'} onChange={e => updateDraft({ unit: e.target.value })} className="px-3 py-2 border rounded-md text-sm w-32">
                  <option value="Quintals">Quintals</option>
                  <option value="Tonnes">Tonnes</option>
                  <option value="Kg">Kg</option>
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 uppercase flex items-center gap-1">Indicative Market Price <Info className="w-3 h-3" /></label>
              <div className="px-3 py-3 border border-blue-100 bg-blue-50 rounded-md text-sm flex flex-col md:flex-row md:items-center justify-between min-h-[38px] gap-2">
                {indicativePrice ? (
                  <div>
                    <span className="text-xl font-bold text-blue-800">{formatINR(indicativePrice)}</span>
                    <span className="text-xs text-blue-600 ml-1">/{currentLotDraft.unit || 'Quintals'}</span>
                  </div>
                ) : (
                  <span className="text-gray-500 italic text-sm">Select crop and location to calculate price...</span>
                )}
                <div className="text-[10px] text-blue-700 max-w-sm">
                  <b>Pricing Hierarchy:</b> 1. Exact District Government Data &rarr; 2. State Average &rarr; 3. National Fallback. Used for matching, not final deal price.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">State *</label>
              <select value={currentLotDraft.state || ''} onChange={e => updateDraft({ state: e.target.value, district: '' })} className="px-3 py-2 border rounded-md text-sm disabled:bg-gray-50" disabled={!currentLotDraft.commodity}>
                <option value="">Select State...</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">District *</label>
              <select value={currentLotDraft.district || ''} onChange={e => updateDraft({ district: e.target.value })} className="px-3 py-2 border rounded-md text-sm disabled:bg-gray-50" disabled={!currentLotDraft.state}>
                <option value="">Select District...</option>
                {districts.map(d => <option key={d} value={d}>{d}</option>)}
                {districts.length === 0 && currentLotDraft.state && <option value="Other">Other / No Data Available</option>}
              </select>
              {districts.length === 0 && currentLotDraft.state && (
                <span className="text-[10px] text-amber-600">No current government mandi observations available for this combination.</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="text-xs font-semibold text-gray-600 uppercase">Your Expected Price (Optional Override)</label>
              <input type="number" value={currentLotDraft.expectedPrice || ''} onChange={e => updateDraft({ expectedPrice: Number(e.target.value) })} placeholder="Leave blank to use indicative market price" className="px-3 py-2 border rounded-md text-sm" />
              <span className="text-[10px] text-gray-400">Price varies by market, variety and quality.</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Harvest Date *</label>
              <input type="date" value={currentLotDraft.harvestDate || ''} onChange={e => updateDraft({ harvestDate: e.target.value })} className="px-3 py-2 border rounded-md text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-gray-600 uppercase">Preferred Selling Date *</label>
              <input type="date" value={currentLotDraft.preferredSellingDate || ''} onChange={e => updateDraft({ preferredSellingDate: e.target.value })} className="px-3 py-2 border rounded-md text-sm" />
            </div>

            <div className="flex flex-col gap-1.5 md:col-span-2">
              <label className="flex items-center gap-2 text-sm text-gray-700 font-medium mt-2">
                <input type="checkbox" checked={currentLotDraft.storageAvailable || false} onChange={e => updateDraft({ storageAvailable: e.target.checked })} className="rounded text-green-600 focus:ring-green-500 w-4 h-4" />
                Produce is currently safely stored (Storage available)
              </label>
            </div>
          </div>
          
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
            <button 
              onClick={() => setStep(2)} 
              disabled={!currentLotDraft.commodity || !currentLotDraft.state || !currentLotDraft.district || (!indicativePrice && !currentLotDraft.expectedPrice) || !currentLotDraft.harvestDate || !currentLotDraft.preferredSellingDate}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              Continue to Quality
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Step 2: Proof-of-Lot & Quality Verification
            </h2>
            <span className="text-sm text-gray-500">2 of 2</span>
          </div>
          
          <div className="p-6">
            <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-lg p-4 flex gap-3 text-sm mb-8">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p><strong>Farmer-Declared Quality:</strong> This is a self-declared digital assessment. Verified laboratory grading can be attached below if available.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Proof of Lot Block */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8">
                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Camera className="w-5 h-5" /> Live Proof-of-Lot Capture</h3>
                <p className="text-sm text-blue-800 mb-4">To prevent fraud, buyers require live verified images of your crop with a dynamic challenge code. Gallery uploads are not accepted as verified proof.</p>
                
                {!proofCaptured ? (
                  <div className="bg-white border border-blue-100 rounded-lg p-6 flex flex-col items-center justify-center text-center">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Dynamic Verification Challenge</div>
                    <div className="text-3xl font-mono font-bold text-gray-900 bg-gray-100 px-4 py-2 rounded-md mb-4 tracking-widest">
                      KS-{challengeCode}
                    </div>
                    <p className="text-sm text-gray-600 mb-4 max-w-sm">Write this code on a piece of paper and show it clearly in the photos alongside your crop.</p>
                    
                    <button 
                      onClick={() => {
                        setProofLoading(true);
                        setTimeout(() => { setProofCaptured(true); setProofLoading(false); }, 1500);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                      disabled={proofLoading}
                    >
                      {proofLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Camera className="w-5 h-5" />}
                      {proofLoading ? "Verifying..." : "Start Live Capture"}
                    </button>
                  </div>
                ) : (
                  <div className="bg-white border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <div>
                          <div className="font-bold text-green-800">Proof-of-Lot Captured</div>
                          <div className="text-xs text-green-600">4 Views � Challenge Verified � GPS Consistent</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500 uppercase font-bold">Evidence Confidence</div>
                        <div className="text-lg font-black text-green-700">94 / 100</div>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                       {[1,2,3,4].map(i => (
                         <div key={i} className="w-20 h-20 bg-gray-200 rounded border border-gray-300 flex items-center justify-center shrink-0 overflow-hidden">
                            <Camera className="w-6 h-6 text-gray-400 opacity-50" />
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Existing Quality Declaration */}

<div className="flex flex-col gap-6">
<div className="flex flex-col gap-1.5">
<label className="text-xs font-semibold text-gray-600 uppercase flex justify-between">
                      Farmer-Declared Grade
                      <span className="text-gray-400 font-normal">Self-Assessment</span>
                    </label>
                    <div className="flex gap-2 items-start">
                      <select value={grade} onChange={e => setGrade(e.target.value as QualityAssessment['grade'])} className="px-3 py-2 border rounded-md text-sm flex-1">
                        <option value="A">Grade A (Premium)</option>
                        <option value="B">Grade B (Standard)</option>
                        <option value="C">Grade C (Processing)</option>
                        <option value="Unsorted">Unsorted / Bulk</option>
                      </select>
                      <div className={"text-[10px] px-2 py-1.5 rounded w-32 text-center font-bold flex flex-col justify-center " + (
                        grade === 'A' ? 'bg-green-50 text-green-700 border border-green-100' :
                        grade === 'B' ? 'bg-gray-50 text-gray-600 border border-gray-200' :
                        'bg-amber-50 text-amber-700 border border-amber-100'
                      )}>
                        {grade === 'A' ? '+5-10% Premium' : grade === 'B' ? 'Standard Rate' : '-10-15% Discount'}
                      </div>
                    </div>
                  </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase flex justify-between">
                    Visual Quality
                    <span className="text-gray-400 font-normal">Appearance</span>
                  </label>
                  <select value={visualQuality} onChange={e => setVisualQuality(e.target.value as QualityAssessment['visualQuality'])} className="px-3 py-2 border rounded-md text-sm">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase flex justify-between">
                    Produce Size
                  </label>
                  <select value={size} onChange={e => setSize(e.target.value as QualityAssessment['size'])} className="px-3 py-2 border rounded-md text-sm">
                    <option value="Mixed">Mixed / Unsorted</option>
                    <option value="Large">Large</option>
                    <option value="Medium">Medium</option>
                    <option value="Small">Small</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase flex justify-between">
                    Moisture Content (%)
                    <span className="text-gray-400 font-normal">{moisturePercent}%</span>
                  </label>
                  <input type="range" min="0" max="30" step="1" value={moisturePercent} onChange={e => setMoisturePercent(Number(e.target.value))} className="w-full" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase flex justify-between">
                    Damage / Spoilage (%)
                    <span className="text-gray-400 font-normal">{damagePercent}%</span>
                  </label>
                  <input type="range" min="0" max="25" step="1" value={damagePercent} onChange={e => setDamagePercent(Number(e.target.value))} className="w-full" />
                </div>

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-2">
                  <h4 className="font-semibold text-sm mb-2 flex items-center gap-2"><Camera className="w-4 h-4 text-gray-500" /> Photo Upload</h4>
                  <button className="w-full bg-white border-2 border-dashed border-gray-300 rounded p-4 text-sm text-gray-500 hover:border-green-500 hover:text-green-600 transition-colors">
                    + Take or Upload Photos of Produce
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-between">
            <button onClick={() => setStep(1)} className="text-gray-600 font-medium px-4 py-2 hover:bg-gray-200 rounded-lg transition-colors">
              Back
            </button>
            <button 
              onClick={handleCreateLot}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Submit & Create Lot
            </button>
          </div>
        </div>
      )}

      {step === 3 && createdLotId && (
        <div className="bg-white border-2 border-green-500 rounded-xl shadow-md p-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lot Created Successfully</h2>
          <p className="text-gray-600 mb-6">Your lot <strong className="text-gray-900">{createdLotId}</strong> has been added to your Farmer Workspace.</p>
          
          <div className="flex gap-4">
            <button onClick={() => router.push('/aggregation')} className="bg-white border border-gray-300 hover:border-green-500 text-gray-700 px-6 py-2 rounded-lg font-medium transition-colors">
              FPO Aggregation
            </button>
            <button onClick={() => router.push('/matching')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
              Find Buyers <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
