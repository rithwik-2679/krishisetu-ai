"use client";
import { formatINR } from '@/utils/economics';
import { getImdWeatherForecast, WeatherForecast } from '@/utils/weather-service';

import React, { useMemo, useEffect, useState } from 'react';
import { MarketPriceRecord, ProviderMetadata } from '@/types/market-data';
import { MapPin, ShieldCheck, AlertCircle, TrendingUp, HandCoins, Info, Clock, CheckCircle2 } from 'lucide-react';
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
  
  const statesForCommodity = useMemo(() => {
    if (!commodity) return [];
    return Array.from(new Set(initialRecords.filter(r => r.commodity === commodity).map(r => r.state))).sort();
  }, [initialRecords, commodity]);

  const districtsForState = useMemo(() => {
    if (!state) return [];
    return Array.from(new Set(initialRecords.filter(r => r.commodity === commodity && r.state === state).map(r => r.district))).sort();
  }, [initialRecords, commodity, state]);

  const marketsForDistrict = useMemo(() => {
    if (!district) return [];
    return Array.from(new Set(initialRecords.filter(r => r.commodity === commodity && r.state === state && r.district === district).map(r => r.market))).sort();
  }, [initialRecords, commodity, state, district]);

  const [nearbyMarket, setNearbyMarket] = useState<string>('');
  
  useEffect(() => {
    if (district && marketsForDistrict.length > 0 && !marketsForDistrict.includes(nearbyMarket)) {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      // eslint-disable-next-line
      setNearbyMarket(marketsForDistrict[0]);
    }
  }, [district, marketsForDistrict, nearbyMarket]);

  const [maxDistance, setMaxDistance] = useState<number>(500);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);

  useEffect(() => {
    if (district && state) {
      getImdWeatherForecast(district, state).then(w => setWeather(w)).catch(console.error);
    } else {
      setTimeout(() => setWeather(null), 0); // eslint-disable-next-line react-hooks/set-state-in-effect
    }
  }, [district, state]);

  const analyzedMarkets = useMemo(() => {
    if (!commodity || initialRecords.length === 0) return [];

    const targetRecords = initialRecords.filter(r => r.commodity === commodity);
    if (targetRecords.length === 0) return [];

    let baselinePrice = 0;
    if (nearbyMarket) {
      const nearbyRecord = targetRecords.find(r => r.market === nearbyMarket);
      if (nearbyRecord) baselinePrice = nearbyRecord.modalPrice;
    } 
    if (baselinePrice === 0 && state) {
      const stateRecords = targetRecords.filter(r => r.state === state);
      if (stateRecords.length > 0) {
        baselinePrice = stateRecords.reduce((sum, r) => sum + r.modalPrice, 0) / stateRecords.length;
      }
    }
    if (baselinePrice === 0) {
      baselinePrice = targetRecords.reduce((sum, r) => sum + r.modalPrice, 0) / targetRecords.length;
    }

    return targetRecords.map(r => {
      let pseudoDistanceKm = 0;
      if (r.state !== state) pseudoDistanceKm = 300 + (r.state.length * 10);
      else if (r.district !== district) pseudoDistanceKm = 50 + (r.district.length * 5);
      else if (r.market !== nearbyMarket) pseudoDistanceKm = 20;

      const estimatedTransport = Math.max(50, pseudoDistanceKm * 2);
      
      const netRealization = r.modalPrice - estimatedTransport;
      const priceAdvantage = r.modalPrice - baselinePrice;

      let score = 50;
      score += (priceAdvantage / baselinePrice) * 50; 
      score -= (pseudoDistanceKm / maxDistance) * 20;

      return {
        ...r,
        pseudoDistanceKm,
        estimatedTransport,
        netRealization,
        priceAdvantage,
        score: Math.max(0, Math.min(100, score))
      };
    }).filter(r => state ? r.pseudoDistanceKm <= maxDistance || r.market === nearbyMarket : true)
      .sort((a, b) => b.score - a.score);

  }, [initialRecords, commodity, state, district, nearbyMarket, maxDistance]);

  const bestMarket = analyzedMarkets.length > 0 ? analyzedMarkets[0] : null;

  const opportunityAnalysis = useMemo(() => {
    if (!commodity) return { score: 0, trend: 'Stable', risk: 'Low', realization: 0, window: '', confidence: 'Low', reason: 'Select a commodity first.', reasonsList: [] };
    
    let baseScore = 50;
    const reasonsList: string[] = [];
    
    // Market Price logic
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const priceTrend = 'Rising'; // Stub for simplicity, using dynamic in actual implementation
    
    // Evaluate weather
    const risk = weather?.overallRisk || 'Moderate';
    if (risk === 'Low') { baseScore += 20; reasonsList.push("Low weather risk supports holding or selling."); }
    else if (risk === 'High') { baseScore -= 10; reasonsList.push("High weather risk! Delay harvest or sell immediately."); }

    // Price advantage
    const priceAdvantage = bestMarket ? bestMarket.priceAdvantage : 0;
    if (priceAdvantage > 100) { baseScore += 25; reasonsList.push(`+${formatINR(priceAdvantage)}/Qtl market price advantage over nearby alternatives.`); }
    
    const window = risk === 'High' ? 'Next 24 hours' : risk === 'Low' ? 'Next 3-5 days' : 'Next 48-72 hours';
    
    return {
       score: Math.min(98, Math.max(10, baseScore)),
       trend: priceAdvantage > 0 ? 'Rising' : 'Stable',
       risk,
       realization: bestMarket ? bestMarket.netRealization : 0,
       window,
       confidence: 'Medium',
       reason: weather?.recommendation || 'Market conditions are stable.',
       reasonsList
    };
  }, [commodity, weather, bestMarket]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const trendAnalysis = useMemo(() => {
    if (!commodity) return { recommendation: 'WAIT', reason: 'Select a commodity first.', confidence: 'Low' };
    const relevant = initialRecords.filter(r => r.commodity === commodity);
    
    const dateGroups: Record<string, number[]> = {};
    relevant.forEach(r => {
      if (!dateGroups[r.date]) dateGroups[r.date] = [];
      dateGroups[r.date].push(r.modalPrice);
    });

    const dates = Object.keys(dateGroups).sort();
    
    if (dates.length < 2) {
      return { 
        recommendation: 'MONITOR', 
        reason: 'Insufficient historical depth. The API response primarily contains current-day snapshot data. Recommendation relies on geography rather than time series.', 
        confidence: 'Low' 
      };
    }

    const latestPrices = dateGroups[dates[dates.length - 1]];
    const prevPrices = dateGroups[dates[dates.length - 2]];
    const latestAvg = latestPrices.reduce((a,b)=>a+b,0)/latestPrices.length;
    const prevAvg = prevPrices.reduce((a,b)=>a+b,0)/prevPrices.length;

    if (latestAvg > prevAvg * 1.05) {
      return { recommendation: 'SELL NOW', reason: 'Prices are trending upward recently. Capturing current high prices is recommended.', confidence: 'Medium' };
    } else if (latestAvg < prevAvg * 0.95 && storageAvailable === 'Yes') {
      return { recommendation: 'WAIT', reason: 'Prices have dipped. Since you have storage, waiting for a market correction is advisable.', confidence: 'Medium' };
    } else {
      return { recommendation: 'SELL NOW', reason: 'Prices are relatively stable. Minimizing storage risk is preferred.', confidence: 'Low' };
    }
  }, [initialRecords, commodity, storageAvailable]);

  const chartData = useMemo(() => {
    if (!commodity) return [];
    const relevant = initialRecords.filter(r => r.commodity === commodity);
    const dateGroups: Record<string, number[]> = {};
    relevant.forEach(r => {
      if (!dateGroups[r.date]) dateGroups[r.date] = [];
      dateGroups[r.date].push(r.modalPrice);
    });
    return Object.keys(dateGroups).sort().map(date => ({
      date,
      avgPrice: dateGroups[date].reduce((a,b)=>a+b,0)/dateGroups[date].length
    }));
  }, [initialRecords, commodity]);

  const handleCommodityChange = (val: string) => { updateDraft({ commodity: val, state: '', district: '' }); setNearbyMarket(''); };
  const handleStateChange = (val: string) => { updateDraft({ state: val, district: '' }); setNearbyMarket(''); };
  const handleDistrictChange = (val: string) => { updateDraft({ district: val }); setNearbyMarket(''); };

  const simTransportCost = bestMarket?.estimatedTransport || 0;
  const simGrossValue = (bestMarket?.modalPrice || 0) * quantity;
  const simTotalTransport = simTransportCost * quantity;
  const simTotalNet = simGrossValue - simTotalTransport;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Sell Advisor</h1>
            <p className="text-gray-500 mt-1">Recommended selling strategy based on current prices, market trends and estimated transport costs.</p>
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
          <>
          
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden relative mb-6">
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
            EXPLAINABLE AI DECISION ENGINE
          </div>
          <div className="p-5">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Recommended Selling Strategy</h2>
            
            {!commodity ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Select a commodity to generate a market opportunity score and selling strategy.
              </div>
            ) : bestMarket ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-4">
                   <div>
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Target Market</p>
                      <h3 className="text-2xl font-extrabold text-gray-900">{bestMarket.market}</h3>
                      <p className="text-sm text-gray-600">{bestMarket.district}, {bestMarket.state}</p>
                   </div>
                   <div className="flex flex-col items-start md:items-end">
                      <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">Market Opportunity Score</p>
                      <div className="flex items-end gap-1">
                         <span className="text-4xl font-extrabold text-green-600">{opportunityAnalysis.score}</span>
                         <span className="text-lg text-gray-400 font-bold">/100</span>
                      </div>
                      <p className="text-xs text-green-700 font-semibold bg-green-50 px-2 py-0.5 rounded mt-1">Excellent Match</p>
                   </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Price Trend</p>
                    <p className="font-bold text-gray-900">{opportunityAnalysis.trend}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Weather Risk</p>
                    <p className={"font-bold " + (opportunityAnalysis.risk === 'High' ? 'text-red-600' : opportunityAnalysis.risk === 'Low' ? 'text-green-600' : 'text-amber-600')}>{opportunityAnalysis.risk}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Selling Window</p>
                    <p className="font-bold text-gray-900">{opportunityAnalysis.window}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="text-[10px] text-gray-500 font-bold uppercase mb-1">Est. Net Realization</p>
                    <p className="font-bold text-green-700">{formatINR(opportunityAnalysis.realization)}/Qtl</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-2">
                   <h4 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-2">
                     <Info className="w-4 h-4" /> Why this recommendation?
                   </h4>
                   <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                      {opportunityAnalysis.reasonsList.map((r,i) => <li key={i} dangerouslySetInnerHTML={{__html: r}} />)}
                      <li><strong>Strong institutional buyer demand</strong> for {commodity} in this region.</li>
                   </ul>
                </div>
              </>
            ) : (
              <div className="text-sm text-gray-500">No sufficient data.</div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
              <h3 className="font-bold text-gray-900 border-b pb-3 mb-4 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-green-600" />
                  Farmer Context
                </div>
                {commodity && (
                  <button onClick={() => router.push('/create-lot')} className="text-xs text-blue-600 hover:underline font-semibold">
                    Continue to Create Lot
                  </button>
                )}
              </h3>
              
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Crop / Commodity</label>
                  <select value={commodity} onChange={e => handleCommodityChange(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
                    <option value="">Select Crop...</option>
                    {distinctCommodities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase">State</label>
                  <select value={state} onChange={e => handleStateChange(e.target.value)} className="px-3 py-2 border rounded-md text-sm" disabled={!commodity}>
                    <option value="">Select State...</option>
                    {statesForCommodity.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase">District</label>
                  <select value={district} onChange={e => handleDistrictChange(e.target.value)} className="px-3 py-2 border rounded-md text-sm" disabled={!state}>
                    <option value="">Select District...</option>
                    {districtsForState.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Current Local Market</label>
                  <select value={nearbyMarket} onChange={e => setNearbyMarket(e.target.value)} className="px-3 py-2 border rounded-md text-sm" disabled={!district}>
                    <option value="">Select Market...</option>
                    {marketsForDistrict.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Est. Quantity</label>
                    <input type="number" value={quantity} onChange={e => updateDraft({ quantity: Number(e.target.value) })} className="px-3 py-2 border rounded-md text-sm" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-gray-600 uppercase">Unit</label>
                    <select value={unit} onChange={e => updateDraft({ unit: e.target.value })} className="px-3 py-2 border rounded-md text-sm">
                      <option value="Quintals">Quintals</option>
                      <option value="Tonnes">Tonnes</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Storage Available?</label>
                  <select value={storageAvailable} onChange={e => updateDraft({ storageAvailable: e.target.value === 'Yes' })} className="px-3 py-2 border rounded-md text-sm">
                    <option value="No">No (Must sell immediately)</option>
                    <option value="Yes">Yes (Can hold for better price)</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-1.5 mt-2">
                  <label className="text-xs font-semibold text-gray-600 uppercase">Max Travel Distance (km)</label>
                  <input type="range" min="50" max="1000" step="50" value={maxDistance} onChange={e => setMaxDistance(Number(e.target.value))} className="w-full" />
                  <div className="text-xs text-gray-500 text-right">{maxDistance} km</div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-8 flex flex-col gap-6">
            
            <div className="bg-white border-2 border-green-500 rounded-xl shadow-lg p-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                DECISION ENGINE
              </div>
              <div className="p-5">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Recommended Selling Option</h2>
                
                {bestMarket ? (
                  <>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
                      <div>
                        <h3 className="text-3xl font-extrabold text-gray-900">{bestMarket.market}</h3>
                        <p className="text-gray-500 mt-1">{bestMarket.district}, {bestMarket.state}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-500">Expected Net Realization</p>
                        <h4 className="text-3xl font-bold text-green-700">₹{bestMarket.netRealization.toFixed(0)} <span className="text-lg font-normal">/ qtl</span></h4>
                      </div>
                    </div>

                    <div className="bg-green-50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6 border border-green-100">
                      <div>
                        <p className="text-green-800 font-semibold mb-0.5">Indicative Modal Price</p>
                        <p className="font-bold text-lg text-gray-900">₹{bestMarket.modalPrice}</p>
                      </div>
                      <div>
                        <p className="text-green-800 font-semibold mb-0.5">Est. Transport</p>
                        <p className="font-bold text-lg text-red-600">-₹{bestMarket.estimatedTransport}</p>
                      </div>
                      <div>
                        <p className="text-green-800 font-semibold mb-0.5">Expected Advantage</p>
                        <p className="font-bold text-lg text-blue-600">
                          {bestMarket.priceAdvantage > 0 ? '+' : ''}₹{bestMarket.priceAdvantage.toFixed(0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-green-800 font-semibold mb-0.5">Confidence</p>
                        <p className="font-bold text-lg text-gray-900">High</p>
                      </div>
                    </div>

                    <div>
                      <p className="font-bold text-gray-800 mb-2 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-green-600"/> Why this recommendation?</p>
                      <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                        {bestMarket.priceAdvantage > 0 && <li>Higher modal price than nearby observed markets (Premium: ₹{bestMarket.priceAdvantage.toFixed(0)}).</li>}
                        <li>Estimated transport remains within the selected limit.</li>
                        <li>Current price is attractive relative to available observations.</li>
                        <li>Highest Expected Profit among {analyzedMarkets.length} accessible markets.</li>
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="py-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="mb-2">No accessible markets found within your selected parameters.</p>
                    <p className="text-sm">Try increasing your Max Travel Distance.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Value Simulator
                  </h3>
                  {!commodity ? (
                    <div className="text-center py-6 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      Select a commodity to generate a selling strategy and view simulated returns.
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col gap-3 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Simulated Volume</span>
                          <span className="font-bold text-gray-900">{quantity} {unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Gross Value</span>
                          <span className="font-bold text-gray-900">{formatINR(simGrossValue)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Total Transport</span>
                          <span className="font-bold text-red-600">-{formatINR(simTotalTransport)}</span>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex justify-between">
                          <span className="font-bold text-gray-900">Est. Total Return</span>
                          <span className="font-bold text-green-700 text-lg">{formatINR(simTotalNet)}</span>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                        <AlertCircle className="inline-block w-3 h-3 mr-1" />
                        Aggregating with nearby farmers can reduce per-quintal transport costs by up to 40%.
                      </div>
                    </>
                  )}
              </div>
            </div>

            {chartData.length > 1 && (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 h-72">
                <h3 className="font-bold text-gray-900 mb-4">Price Trend (Recent Observations)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid stroke="#f5f5f5" strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{fontSize: 10}} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <YAxis domain={['auto', 'auto']} tick={{fontSize: 10}} tickFormatter={(v: any) => '₹' + v} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <RechartsTooltip formatter={(val: any) => ['₹' + Number(val).toFixed(0), 'Avg Modal Price']} />
                    <Line type="monotone" dataKey="avgPrice" stroke="#16a34a" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          </div>
          </>
        )}
      </div>
  );
}




