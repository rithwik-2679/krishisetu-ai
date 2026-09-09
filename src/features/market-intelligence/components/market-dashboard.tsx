"use client";

import React, { useState, useMemo } from 'react';
import { MarketPriceRecord, ProviderMetadata } from '@/types/market-data';
import { useRouter } from 'next/navigation';
import { formatINR } from '@/utils/economics';
import { formatDateTime } from '@/utils/date';
import { ShieldCheck, BrainCircuit, ArrowRight, AlertCircle, Calendar, TrendingUp, TrendingDown, Activity, MapPin, Search, LineChart, PackageSearch, Database } from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart as RechartsLine, Line } from 'recharts';
import Link from 'next/link';

interface MarketDashboardProps {
  initialRecords: MarketPriceRecord[];
  metadata: ProviderMetadata;
  error?: string | null;
}

export function MarketDashboard({ initialRecords, metadata, error }: MarketDashboardProps) {
  const router = useRouter();

  const [commodity, setCommodity] = useState<string>('All');
  const [state, setState] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
    let filtered = initialRecords;
    if (commodity !== 'All') filtered = filtered.filter(r => r.commodity === commodity);
    if (state !== 'All') filtered = filtered.filter(r => r.state === state);
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(r => 
        r.market.toLowerCase().includes(q) || 
        r.district.toLowerCase().includes(q) || 
        r.commodity.toLowerCase().includes(q)
      );
    }
    // Sort by latest date, then highest modal price
    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return b.modalPrice - a.modalPrice;
    });
  }, [initialRecords, commodity, state, searchQuery]);

  // All commodities stats
  const totalMarkets = new Set(initialRecords.map(r => r.market)).size;
  const totalCommodities = new Set(initialRecords.map(r => r.commodity)).size;
  
  // Selected commodity stats
  const avgPrice = useMemo(() => {
    if (filteredRecords.length === 0) return 0;
    return filteredRecords.reduce((sum, r) => sum + r.modalPrice, 0) / filteredRecords.length;
  }, [filteredRecords]);

  const minPrice = useMemo(() => {
    if (filteredRecords.length === 0) return 0;
    return Math.min(...filteredRecords.map(r => r.minPrice || r.modalPrice));
  }, [filteredRecords]);

  const maxPrice = useMemo(() => {
    if (filteredRecords.length === 0) return 0;
    return Math.max(...filteredRecords.map(r => r.maxPrice || r.modalPrice));
  }, [filteredRecords]);

  const chartData = useMemo(() => {
    return filteredRecords.slice(0, 15).map(r => ({
      market: r.market,
      district: r.district,
      modalPrice: r.modalPrice,
      minPrice: r.minPrice || r.modalPrice,
      maxPrice: r.maxPrice || r.modalPrice
    }));
  }, [filteredRecords]);

  return (
    <div className="flex flex-col p-4 md:p-6 max-w-7xl mx-auto space-y-6 bg-gray-50/50 min-h-screen">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wide uppercase border border-green-200 flex items-center gap-1">
              <Database className="w-3 h-3" /> AGMARKNET
            </span>
            <span className="text-xs text-gray-500 font-medium">Last synced: {metadata.lastSyncTime ? formatDateTime(metadata.lastSyncTime, true) : 'Not available'}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900">Market Intelligence</h1>
          <p className="text-gray-500 text-sm mt-1">Latest Government Market Observations across India</p>
        </div>
        <button 
          onClick={() => router.push('/sell-advisor')}
          className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm"
        >
          <BrainCircuit className="w-4 h-4" /> Go to AI Sell Advisor
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl flex items-start gap-3 shadow-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div>
            <h3 className="font-bold">Data Source Unavailable</h3>
            <p className="text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Summary Metrics Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Market Overview</h2>
        
        {commodity === 'All' ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Total Observations</p>
              <p className="text-2xl font-black text-gray-900">{initialRecords.length}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Markets Observed</p>
              <p className="text-2xl font-black text-gray-900">{totalMarkets}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Commodities Tracked</p>
              <p className="text-2xl font-black text-gray-900">{totalCommodities}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">Latest Data Source</p>
              <p className="text-lg font-bold text-blue-900 truncate">data.gov.in (API)</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            <div className="bg-green-50 rounded-xl p-4 border border-green-100 md:col-span-2">
               <p className="text-[10px] font-bold text-green-700 uppercase tracking-wider mb-1">Avg Modal Price</p>
               <p className="text-3xl font-black text-green-800">{formatINR(avgPrice)}<span className="text-sm text-green-600 font-bold ml-1">/Qtl</span></p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Min Price</p>
               <p className="text-lg font-bold text-gray-900">{formatINR(minPrice)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Max Price</p>
               <p className="text-lg font-bold text-gray-900">{formatINR(maxPrice)}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Records</p>
               <p className="text-lg font-bold text-gray-900">{filteredRecords.length}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
               <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Markets</p>
               <p className="text-lg font-bold text-gray-900">{new Set(filteredRecords.map(r => r.market)).size}</p>
            </div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input 
            type="text"
            placeholder="Search by market, district, or commodity..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 focus:outline-none transition-shadow"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select 
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none"
          value={commodity}
          onChange={(e) => setCommodity(e.target.value)}
        >
          {commodities.map(c => <option key={c} value={c}>{c === 'All' ? 'All Commodities' : c}</option>)}
        </select>
        <select 
          className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-green-500 focus:outline-none"
          value={state}
          onChange={(e) => setState(e.target.value)}
        >
          {states.map(s => <option key={s} value={s}>{s === 'All' ? 'All States' : s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Market List */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-900 tracking-tight px-1 flex items-center gap-2">
            <Activity className="w-4 h-4 text-green-600" />
            Market Activity Board
          </h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="max-h-[600px] overflow-y-auto scrollbar-thin divide-y divide-gray-100">
              {filteredRecords.length === 0 ? (
                <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                  <PackageSearch className="w-8 h-8 text-gray-300 mb-3" />
                  <p className="font-medium text-sm">No market observations found matching your filters.</p>
                </div>
              ) : (
                filteredRecords.map((record, idx) => (
                  <div key={idx} className="p-4 hover:bg-green-50/50 transition-colors flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold px-2 py-0.5 rounded border bg-gray-50 border-gray-200 text-gray-600">{record.commodity}</span>
                        {record.variety && <span className="text-[10px] text-gray-500 font-medium truncate max-w-[120px]">{record.variety}</span>}
                      </div>
                      <h4 className="text-base font-bold text-gray-900 leading-tight">{record.market}</h4>
                      <div className="flex items-center text-xs text-gray-500 mt-1 gap-3">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {record.district}, {record.state}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {record.date}</span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right bg-gray-50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none border border-gray-100 sm:border-none">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-0.5">Modal Price</p>
                      <p className="text-xl font-black text-green-700">{formatINR(record.modalPrice)}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{formatINR(record.minPrice || record.modalPrice)} - {formatINR(record.maxPrice || record.modalPrice)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Charts & Analytics */}
        <div className="flex flex-col gap-6">
          {commodity !== 'All' && filteredRecords.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <LineChart className="w-4 h-4 text-green-600" />
                Top Markets Comparison
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.slice(0,5)} layout="vertical" margin={{ top: 5, right: 10, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f0f0f0" />
                    <XAxis type="number" tick={{fontSize: 10, fill: '#6b7280'}} tickFormatter={(v) => `₹${v/1000}k`} />
                    <YAxis dataKey="market" type="category" tick={{fontSize: 10, fill: '#374151'}} width={80} />
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    <Tooltip cursor={{fill: '#f3f4f6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(val: any) => formatINR(val)} />
                    <Bar dataKey="modalPrice" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-gradient-to-br from-green-800 to-green-900 rounded-2xl shadow-sm border border-green-700 p-6 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-20"><BrainCircuit className="w-16 h-16" /></div>
            <h3 className="text-lg font-bold mb-2 relative z-10">AI Sell Advisor</h3>
            <p className="text-sm text-green-100 mb-6 relative z-10">We can analyze this data to find your most profitable selling window and buyer match.</p>
            <button onClick={() => router.push('/sell-advisor')} className="w-full bg-white text-green-900 font-bold py-2.5 px-4 rounded-xl shadow hover:bg-green-50 transition-colors relative z-10">
              Run Market Analysis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
