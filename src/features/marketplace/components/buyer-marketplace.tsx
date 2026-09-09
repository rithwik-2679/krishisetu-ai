"use client";

import React, { useState } from 'react';
import { PROTOTYPE_BUYERS } from '../data/mock-buyers';
import { ShieldCheck, MapPin, Factory, Store, Building2, Ship, Star, Award, Search } from 'lucide-react';

export function BuyerMarketplace() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredBuyers = PROTOTYPE_BUYERS.filter(b => {
    if (typeFilter !== 'All' && b.type !== typeFilter) return false;
    if (searchTerm && !b.name.toLowerCase().includes(searchTerm.toLowerCase()) && !b.requirements.commodities.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()))) return false;
    return true;
  });

  const getIcon = (type: string) => {
    switch(type) {
      case 'Processor': return <Factory className="w-5 h-5 text-purple-600" />;
      case 'Retailer': return <Store className="w-5 h-5 text-blue-600" />;
      case 'Wholesaler': return <Building2 className="w-5 h-5 text-orange-600" />;
      case 'Institutional': return <Building2 className="w-5 h-5 text-gray-600" />;
      case 'Exporter': return <Ship className="w-5 h-5 text-cyan-600" />;
      default: return <Building2 className="w-5 h-5" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
            Buyer Directory
            <ShieldCheck className="w-6 h-6 text-green-600" />
          </h1>
          <p className="text-gray-500 mt-1">Connect directly with pre-verified institutional buyers and processors.</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search commodities or buyers..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm w-full md:w-64 focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
          >
            <option value="All">All Types</option>
            <option value="Processor">Processors</option>
            <option value="Retailer">Retailers</option>
            <option value="Wholesaler">Wholesalers</option>
            <option value="Exporter">Exporters</option>
            <option value="Institutional">Institutional</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredBuyers.map(buyer => (
          <div key={buyer.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                {getIcon(buyer.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-gray-900 truncate" title={buyer.name}>{buyer.name}</h3>
                  {buyer.isVerified && <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />}
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {buyer.location}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-500 fill-amber-500" /> {buyer.rating}</span>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col gap-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Required Commodities</p>
                <div className="flex flex-wrap gap-1.5">
                  {buyer.requirements.commodities.map(c => (
                    <span key={c} className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-md font-medium border border-blue-100">{c}</span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm mt-auto pt-4 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Volume Requirement</p>
                  <p className="font-medium text-gray-900">{buyer.requirements.minQuantity} - {buyer.requirements.maxQuantity} Qtl</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Accepted Grades</p>
                  <p className="font-medium text-gray-900">{buyer.requirements.preferredGrades.join(', ')}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Payment Terms</p>
                  <p className="font-medium text-gray-900 text-xs">{buyer.requirements.paymentTerms}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Delivery</p>
                  <p className="font-medium text-gray-900 text-xs">{buyer.requirements.delivery}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className={`w-4 h-4 ${buyer.reliabilityScore >= 95 ? 'text-green-600' : 'text-blue-600'}`} />
                <span className="text-xs font-medium text-gray-700">Response Reliability: {buyer.reliabilityScore}%</span>
              </div>
              <button className="text-green-700 text-sm font-bold hover:text-green-800 transition-colors">
                View Profile
              </button>
            </div>
          </div>
        ))}

        {filteredBuyers.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white border border-gray-200 rounded-xl border-dashed">
            No verified buyers found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
}

