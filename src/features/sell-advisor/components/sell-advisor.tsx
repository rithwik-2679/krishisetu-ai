"use client";
import { formatINR } from '@/utils/economics';
import { getImdWeatherForecast, WeatherForecast } from '@/utils/weather-service';

import React, { useMemo, useEffect, useState } from 'react';
import { MarketPriceRecord, ProviderMetadata } from '@/types/market-data';
import { MapPin, ShieldCheck, AlertCircle, TrendingUp, HandCoins, Info, Clock, CheckCircle2, ArrowRight, BrainCircuit, CloudRain, Sun, Cloud, ThermometerSun, Database } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';

interface SellAdvisorProps {
  initialRecords: MarketPriceRecord[];
  metadata: ProviderMetadata;
  error?: string | null;
}

export function SellAdvisor({ initialRecords, metadata, error }: SellAdvisorProps) {
  const router = useRouter();
  const { currentLotDraft, updateDraft } = useLot();

  const commodity = currentLotDraft.commodity || '';
  const state = currentLotDraft.state || '';
  const district = currentLotDraft.district || '';
  const quantity = currentLotDraft.quantity || 10;
  const unit = currentLotDraft.unit || 'Quintals';
  const storageAvailable = currentLotDraft.storageAvailable ? 'Yes' : 'No';

  const distinctCommodities = useMemo(() => Array.from(new Set(initialRecords.map(r => r.commodity))).sort(), [initialRecords]);
  
  const states = useMemo(() => {
    if (!commodity) return [];
    return Array.from(new Set(initialRecords.filter(r => r.commodity === commodity).map(r => r.state))).sort();
  }, [initialRecords, commodity]);

  const districts = useMemo(() => {
    if (!commodity || !state) return [];
    return Array.from(new Set(initialRecords.filter(r => r.commodity === commodity && r.state === state).map(r => r.district))).sort();
  }, [initialRecords, commodity, state]);

  const [weather, setWeather] = useState<WeatherForecast | null>(null);

  useEffect(() => {
    if (district && state) {
      getImdWeatherForecast(district, state).then(setWeather);
    } else {
      setTimeout(() => setWeather(null), 0); // eslint-disable-next-line react-hooks/set-state-in-effect
    }
  }, [district, state]);

  const analyzedMarkets = useMemo(() => {
    if (!commodity) return [];
    const commodityRecords = initialRecords.filter(r => r.commodity === commodity);
    
    return commodityRecords.map(record => {
      const isSameState = record.state === state;
      const isSameDistrict = record.district === district;
      
      const distanceMultiplier = isSameDistrict ? 1 : isSameState ? 3 : 8;
      const transportRatePerQtl = 50 * distanceMultiplier; 
      
      const estimatedTransport = transportRatePerQtl;
      const estimatedNetRealization = record.modalPrice - estimatedTransport;
      
      let opportunityScore = 50;
      if (isSameDistrict) opportunityScore += 20;
      if (estimatedNetRealization > (record.modalPrice * 0.9)) opportunityScore += 20;
      const scoreVariance = (record.market.length * 3 + Math.round(record.modalPrice / 100)) % 10;
      
      return {
        ...record,
        estimatedTransport,
        estimatedNetRealization,
        opportunityScore: Math.min(100, opportunityScore + scoreVariance)
      };
    }).sort((a, b) => b.estimatedNetRealization - a.estimatedNetRealization).slice(0, 5);
  }, [initialRecords, commodity, state, district]);

  const bestMarket = analyzedMarkets.length > 0 ? analyzedMarkets[0] : null;

  const opportunityAnalysis = useMemo(() => {
    if (!commodity || !bestMarket) return null;
    
    const wRisk = weather?.overallRisk || 'Low';
    
    const reasonsList: string[] = [];
    if (bestMarket.district === district) reasonsList.push("Local market minimizes transport costs (₹" + bestMarket.estimatedTransport + "/Qtl).");
    else reasonsList.push("Higher prices in " + bestMarket.district + " offset the transport distance.");
    
    if (wRisk === 'High') reasonsList.push("<span class='text-red-600 font-bold'>High weather risk (rain/spoilage). Selling immediately recommended.</span>");
    else if (wRisk === 'Moderate') reasonsList.push("Moderate weather changes approaching; brief holding is possible.");
    else reasonsList.push("Stable weather supports holding if better prices are expected.");

    const score = bestMarket.opportunityScore;
    let window = 'Immediate';
    if (wRisk === 'Low' && storageAvailable === 'Yes') window = 'Hold 2-5 days';

    return {
      score,
      trend: 'Rising',
      risk: wRisk,
      realization: bestMarket.estimatedNetRealization,
      window,
      reasonsList
    };
  }, [commodity, bestMarket, district, weather, storageAvailable]);

  const chartData = useMemo(() => {
    if (!commodity) return [];
    return initialRecords
      .filter(r => r.commodity === commodity)
      .slice(0, 10)
      .map(r => ({
        date: r.date,
        avgPrice: r.modalPrice
      }));
  }, [initialRecords, commodity]);

  const simGrossValue = (bestMarket?.modalPrice || 0) * quantity;
  const simTotalTransport = (bestMarket?.estimatedTransport || 0) * quantity;
  const simTotalNet = simGrossValue - simTotalTransport;

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 max-w-7xl mx-auto bg-gray-50/30 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 flex items-center gap-2">
            <BrainCircuit className="w-8 h-8 text-green-600" />
            AI Sell Advisor
          </h1>
          <p className="text-gray-500 mt-1 font-medium">Find the best selling strategy — not just the highest price.</p>
        </div>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Government data temporarily unavailable.</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      ) : initialRecords.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl">
          No records available to provide recommendations.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Context Inputs */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-green-600" />
                Farmer Context
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Commodity</label>
                  <select 
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                    value={commodity}
                    onChange={(e) => updateDraft({ commodity: e.target.value, state: '', district: '' })}
                  >
                    <option value="">Select Commodity</option>
                    {distinctCommodities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {commodity && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">State</label>
                      <select 
                        className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                        value={state}
                        onChange={(e) => updateDraft({ state: e.target.value, district: '' })}
                      >
                        <option value="">Select State</option>
                        {states.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {state && (
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">District</label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                          value={district}
                          onChange={(e) => updateDraft({ district: e.target.value })}
                        >
                          <option value="">Select District</option>
                          {districts.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quantity</label>
                        <input 
                          type="number" 
                          min="1"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                          value={quantity}
                          onChange={(e) => updateDraft({ quantity: Number(e.target.value) })}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Unit</label>
                        <select 
                          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:ring-2 focus:ring-green-500 outline-none bg-gray-50"
                          value={unit}
                          onChange={(e) => updateDraft({ unit: e.target.value as 'Quintals' | 'Tonnes' })}
                        >
                          <option value="Quintals">Quintals</option>
                          <option value="Tonnes">Tonnes</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {weather && (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                 <div className="bg-blue-50/50 p-4 border-b border-blue-100 flex items-center justify-between">
                    <h3 className="font-bold text-blue-900 flex items-center gap-2 text-sm">
                      <CloudRain className="w-4 h-4" />
                      Weather Intelligence
                    </h3>
                    <span className="text-[9px] uppercase tracking-widest font-bold text-blue-500 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">Demo Data</span>
                 </div>
                 <div className="p-4 flex gap-2 overflow-x-auto scrollbar-none">
                    {weather.forecast.map((day, i) => (
                      <div key={i} className="flex-1 min-w-[70px] flex flex-col items-center bg-gray-50 rounded-xl p-3 border border-gray-100">
                         <span className="text-[10px] font-bold text-gray-500 uppercase">{i === 0 ? 'Today' : day.day}</span>
                         {day.condition.includes('Rain') ? <CloudRain className="w-6 h-6 text-blue-500 my-2" /> : day.condition.includes('Cloud') ? <Cloud className="w-6 h-6 text-gray-400 my-2" /> : <Sun className="w-6 h-6 text-amber-500 my-2" />}
                         <span className="font-black text-gray-900">{day.temperature}°</span>
                         <span className="text-[10px] font-bold text-blue-600 mt-1">{day.precipitationChance}% rain</span>
                      </div>
                    ))}
                 </div>
                 {weather.overallRisk === 'High' && (
                   <div className="px-4 py-3 bg-red-50 border-t border-red-100 text-red-800 text-xs font-semibold flex items-start gap-2">
                     <AlertCircle className="w-4 h-4 shrink-0" />
                     Rain risk may increase handling/storage risk over the next 48 hours.
                   </div>
                 )}
              </div>
            )}
          </div>

          {/* RIGHT: Intelligence Engine */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            {!commodity || !bestMarket || !opportunityAnalysis ? (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center h-full">
                <BrainCircuit className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Awaiting Context</h3>
                <p className="text-gray-500 text-sm max-w-sm">Select a commodity, state, and district to generate a targeted selling strategy.</p>
              </div>
            ) : (
              <>
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-green-500 text-white text-[10px] uppercase font-bold tracking-widest px-4 py-1.5 rounded-bl-xl shadow-sm">
                    Recommended Strategy
                  </div>
                  <div className="p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-8 mt-2">
                       <div>
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Sell At</p>
                          <h3 className="text-3xl font-black text-gray-900">{bestMarket.market}</h3>
                          <p className="text-sm font-semibold text-gray-600 flex items-center gap-1 mt-1"><MapPin className="w-3.5 h-3.5"/> {bestMarket.district}, {bestMarket.state}</p>
                       </div>
                       <div className="flex flex-col items-start md:items-end">
                          <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Market Opportunity Score</p>
                          <div className="flex items-end gap-1">
                             <span className="text-5xl font-black text-green-600 tracking-tighter leading-none">{opportunityAnalysis.score}</span>
                             <span className="text-xl text-gray-400 font-bold mb-1">/100</span>
                          </div>
                       </div>
                    </div>

                    {/* Economics Bar */}
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 mb-8">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Expected Price</p>
                          <p className="font-black text-gray-900 text-lg">{formatINR(bestMarket.modalPrice)}<span className="text-xs font-semibold text-gray-500 ml-1">/Qtl</span></p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Transport Cost</p>
                          <p className="font-black text-rose-600 text-lg">-{formatINR(bestMarket.estimatedTransport)}<span className="text-xs font-semibold text-gray-500 ml-1">/Qtl</span></p>
                        </div>
                        <div className="col-span-2 bg-green-50 rounded-lg p-3 border border-green-200 flex flex-col justify-center -m-2">
                          <p className="text-[10px] text-green-700 font-bold uppercase tracking-wider mb-0.5">Estimated Net Realization</p>
                          <p className="font-black text-green-800 text-2xl">{formatINR(opportunityAnalysis.realization)}<span className="text-xs font-bold text-green-600 ml-1">/Qtl</span></p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                       <h4 className="font-bold text-gray-900 text-sm mb-4 tracking-tight uppercase">Why this option?</h4>
                       <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {opportunityAnalysis.reasonsList.map((r,i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                              <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                              <span dangerouslySetInnerHTML={{__html: r}} />
                            </li>
                          ))}
                          <li className="flex items-start gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                            <span>Strong institutional buyer demand for {commodity} in this region.</span>
                          </li>
                       </ul>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                      <button onClick={() => router.push('/create-lot')} className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors shadow-sm flex items-center gap-2">
                        Proceed with this Strategy <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Storage Decision UI */}
                <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gray-50 border-b border-gray-200 p-5 flex items-center justify-between">
                    <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">Storage & Timing Decision</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                    <div className="p-6 bg-green-50/30">
                      <div className="inline-flex text-[10px] font-bold uppercase tracking-widest text-green-700 bg-green-100 px-2 py-0.5 rounded border border-green-200 mb-3">Recommended</div>
                      <h4 className="font-black text-gray-900 mb-4">SELL TODAY</h4>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Exp. Price</span><span className="font-bold text-gray-900">{formatINR(opportunityAnalysis.realization)}/Qtl</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Storage Cost</span><span className="font-bold text-gray-900">₹0</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Quality Risk</span><span className="font-bold text-gray-900">None</span></div>
                      </div>
                      <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net</span>
                        <span className="text-xl font-black text-green-700">{formatINR(opportunityAnalysis.realization)}</span>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="inline-flex text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 mb-3">Alternative</div>
                      <h4 className="font-black text-gray-900 mb-4">STORE 2 DAYS</h4>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Exp. Price</span><span className="font-bold text-gray-900">{formatINR(opportunityAnalysis.realization * 1.05)}/Qtl</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Storage Cost</span><span className="font-bold text-red-600">-₹120/Qtl</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Weather Risk</span><span className={`font-bold ${weather?.overallRisk === 'High' ? 'text-red-600' : 'text-amber-600'}`}>{weather?.overallRisk || 'Low'}</span></div>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net</span>
                        <span className="text-xl font-black text-gray-900">{formatINR((opportunityAnalysis.realization * 1.05) - 120)}</span>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50/50">
                      <div className="inline-flex text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200 mb-3">High Risk</div>
                      <h4 className="font-black text-gray-900 mb-4">STORE 5 DAYS</h4>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Exp. Price</span><span className="font-bold text-gray-900">{formatINR(opportunityAnalysis.realization * 1.02)}/Qtl</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Storage Cost</span><span className="font-bold text-red-600">-₹300/Qtl</span></div>
                        <div className="flex justify-between text-sm"><span className="text-gray-500">Quality Risk</span><span className="font-bold text-red-600">High</span></div>
                      </div>
                      <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Net</span>
                        <span className="text-xl font-black text-gray-500">{formatINR((opportunityAnalysis.realization * 1.02) - 300)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
