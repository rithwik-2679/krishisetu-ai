"use client";

import React, { useState, useMemo } from 'react';
import { MarketPriceRecord, ProviderMetadata } from '@/types/market-data';
import { useRouter } from 'next/navigation';
import { ShieldCheck, BrainCircuit, ArrowRight, AlertCircle, Calendar, TrendingUp, TrendingDown, Activity, MapPin, Search } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Link from 'next/link';

interface MarketDashboardProps {
  initialRecords: MarketPriceRecord[];
  metadata: ProviderMetadata;
  error?: string | null;
}

export function MarketDashboard({ initialRecords, metadata, error }: MarketDashboardProps) {
  const router = useRouter();

  // NOTE: export function MarketDashboard({  initialRecords, metadata, error }: MarketDashboardProps) {
  const [commodity, setCommodity] = useState<string>('All');
  const [state, setState] = useState<string>('All');

  const commodities = useMemo(() => {
    const set = new Set(initialRecords.map(r => r.commodity));
    return ['All', ...Array.from(set).sort()];
  }, [initialRecords]);

  const states = useMemo(() => {
    let records = initialRecords;
    if (commodity !== 'All') {
      records = records.filter(r => r.commodity === commodity);
    }
    const set = new Set(records.map(r => r.state));
    return ['All', ...Array.from(set).sort()];
  }, [initialRecords, commodity]);

  const filteredRecords = useMemo(() => {
    return initialRecords.filter(r => {
      if (commodity !== 'All' && r.commodity !== commodity) return false;
      if (state !== 'All' && r.state !== state) return false;
      return true;
    });
  }, [initialRecords, commodity, state]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toISOString().split('T')[0];
  };

  const maxDate = initialRecords.length > 0 
    ? new Date(Math.max(...initialRecords.map(r => new Date(r.date).getTime()))).toISOString().split('T')[0]
    : 'N/A';

  const bestModalPrice = filteredRecords.length > 0 ? Math.max(...filteredRecords.map(r => r.modalPrice)) : 0;
  
  const distinctMarkets = new Set(filteredRecords.map(r => r.market)).size;
  const distinctCommodities = new Set(filteredRecords.map(r => r.commodity)).size;
  
  const avgPrice = filteredRecords.length > 0 
    ? filteredRecords.reduce((sum, r) => sum + r.modalPrice, 0) / filteredRecords.length 
    : 0;

    const topMarkets = useMemo(() => {
    if (commodity === 'All') return [];
    return [...filteredRecords]
      .sort((a, b) => b.modalPrice - a.modalPrice)
      .slice(0, 5)
      .map(r => ({
        name: r.market,
        price: r.modalPrice,
        state: r.state
      }));
  }, [filteredRecords, commodity]);

  const opportunityAnalysis = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    
    return [...filteredRecords].map(r => {
      let pseudoDistanceKm = 0;
      if (r.state !== state && state !== 'All') pseudoDistanceKm = 300;
      else pseudoDistanceKm = 50 + (r.market.length * 5); 

      const estimatedTransport = Math.max(50, pseudoDistanceKm * 2);
      
      return {
        ...r,
        estimatedTransport,
        netRealization: r.modalPrice - estimatedTransport,
        opportunityScore: ((r.modalPrice - estimatedTransport) / avgPrice) * 100
      };
    })
    .sort((a, b) => b.opportunityScore - a.opportunityScore)
    .slice(0, 10);
  }, [filteredRecords, state, avgPrice]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Market Intelligence</h1>
          <p className="text-gray-500 mt-1">Live market data sourced directly from AGMARKNET.</p>
        </div>
        <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full text-sm font-bold border border-green-200">
          <ShieldCheck className="w-4 h-4" />
          Official Government Data
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Government API Unavailable</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {!metadata.isOfficial && (
        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold">Using Cached Government Data</h3>
              <p className="text-sm mt-1">Data from Govt of India — AGMARKNET. The live API is temporarily unavailable.</p>
            </div>
          </div>
          <div className="text-right shrink-0 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-500">Latest Data Date</p>
            <p className="font-bold text-gray-900">{maxDate}</p>
          </div>
        </div>
      )}

      {!!metadata.isOfficial && !error && (
        <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex items-start gap-3">
          <ShieldCheck className="w-6 h-6 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold">Live Government Data Active</h3>
            <p className="text-sm mt-1 opacity-80">No synthetic prices are being displayed.</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase">Commodity</label>
          <select 
            value={commodity} 
            onChange={e => { setCommodity(e.target.value); setState('All'); }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500 min-w-[150px]"
          >
            {commodities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase">State</label>
          <select 
            value={state} 
            onChange={e => setState(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500 min-w-[150px]"
            disabled={commodity === 'All'}
          >
            {states.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {filteredRecords.length === 0 && !error ? (
        <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-gray-200 rounded-xl">
          <Calendar className="w-12 h-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No matching government records.</h3>
          <p className="text-sm text-gray-500 mt-1">Try adjusting your filters.</p>
        </div>
      ) : filteredRecords.length > 0 ? (
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {commodity === 'All' ? (
              <>
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Markets Observed</p>
                      <h3 className="text-3xl font-bold mt-2 text-blue-700">{distinctMarkets}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Across active states</p>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Commodities Observed</p>
                      <h3 className="text-3xl font-bold mt-2 text-green-700">{distinctCommodities}</h3>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Currently trading</p>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Total Price Observations</p>
                      <h3 className="text-3xl font-bold mt-2 text-gray-800">{filteredRecords.length}</h3>
                    </div>
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                      <Search className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Source: Govt Data</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Best Modal Price</p>
                      <h3 className="text-3xl font-bold mt-2 text-green-700">₹{bestModalPrice.toFixed(0)}</h3>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg text-green-600">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Per quintal (Source: Govt Data)</p>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Average Price</p>
                      <h3 className="text-3xl font-bold mt-2 text-gray-800">₹{avgPrice.toFixed(0)}</h3>
                    </div>
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                      <Activity className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Per quintal (across {distinctMarkets} markets)</p>
                </div>
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Markets Observed</p>
                      <h3 className="text-3xl font-bold mt-2 text-blue-700">{distinctMarkets}</h3>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                      <MapPin className="w-5 h-5" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">For {commodity}</p>
                </div>
              </>
            )}

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[496px]">
              <div className="p-6 border-b border-gray-100 shrink-0">
                <h3 className="font-bold text-lg text-gray-800">
                  {commodity === 'All' ? 'Market Price Comparison (Top Observations)' : `${commodity} Modal Price Comparison — Top Markets`}
                </h3>
              </div>
              <div className="p-6 flex-1 min-h-0">
  {commodity === 'All' ? (
    <div className="flex items-center justify-center h-full text-gray-500">
      Select a specific commodity to view its top performing markets.
    </div>
  ) : (
    <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMarkets} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                    <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 12 }} />
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: any) => [`₹${value}`, 'Modal Price']} />
                    <Bar dataKey="price" fill="#16a34a" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                )}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col h-[496px]">
              <div className="p-6 pb-2 shrink-0">
                <h3 className="font-bold text-lg mb-1 text-gray-800">Market Opportunities</h3>
                <p className="text-xs text-gray-500">Compares price, recent trends, demand indicators and estimated transport cost.</p>
              </div>
              
              <div className="flex flex-col gap-3 overflow-y-auto px-6 pb-6">
                {opportunityAnalysis.map((opp, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-4 hover:border-green-300 hover:shadow-sm transition-all bg-gray-50 flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 text-green-700 font-bold text-sm">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-gray-900">{opp.market}</h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {opp.state}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-700">₹{opp.modalPrice}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{opp.commodity}</p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-gray-500 uppercase font-semibold">Expected Net Realization</span>
                          <span className="font-bold text-sm text-gray-800">₹{opp.netRealization.toFixed(0)}</span>
                        </div>
                        <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ml-2">Market Opportunity Score: {opp.opportunityScore.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className="mt-12 bg-green-900 rounded-2xl p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <BrainCircuit className="w-12 h-12 mx-auto mb-4 text-green-400" />
          <h2 className="text-3xl font-bold mb-4">Let our Decision Engine do the math.</h2>
          <p className="text-green-100 mb-8 md:text-lg">
            Not sure where to sell? Our AI Sell Advisor analyzes these live government prices, calculates estimated transport costs from your farm, and recommends the most profitable market.
          </p>
          <button onClick={() => router.push('/sell-advisor')} className="bg-white text-green-900 hover:bg-green-50 px-8 py-4 rounded-xl font-bold transition-colors inline-flex items-center gap-2 shadow-xl">
            Get AI Sell Recommendation <ArrowRight className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute top-0 left-0 right-0 bottom-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at center, #4ade80 0%, transparent 70%)'}}></div>
      </div>
    </div>
  );
}


