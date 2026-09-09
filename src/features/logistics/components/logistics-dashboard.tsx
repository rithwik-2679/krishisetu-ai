"use client";

import React, { useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { PROTOTYPE_BUYERS } from '@/features/marketplace/data/mock-buyers';
import { useRouter } from 'next/navigation';
import { Truck, AlertCircle, ArrowRight, Map as MapIcon, CheckCircle2, Factory, ShieldCheck } from 'lucide-react';
import { formatINR } from '@/utils/economics';
import { TrackingEvent } from '@/types/marketplace';
import { calculateLogistics, getDeterministicDistance } from '@/utils/economics';

const VEHICLES = [
  { id: 'small', name: 'Small Truck (Mini)', capacity: 'Up to 2 Tonnes', rate: 15 },
  { id: 'medium', name: 'Medium Truck', capacity: 'Up to 6 Tonnes', rate: 25 },
  { id: 'large', name: 'Heavy Duty Truck', capacity: 'Up to 15 Tonnes', rate: 40 },
];

export function LogisticsDashboard() {
  const router = useRouter();
  const { currentLot, updateLogistics, updateLotStatus } = useLot();
  const [selectedVehicle, setSelectedVehicle] = useState(VEHICLES[1]);

  if (!currentLot) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Active Lot</h2>
        <p className="text-gray-500 mb-6">You need to create a lot to start finding buyers.</p>
        <button onClick={() => router.push('/create-lot')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          Create Lot
        </button>
      </div>
    );
  }

  if (currentLot.status === 'Draft' || currentLot.status === 'Created' || !currentLot.selectedBuyerId || !currentLot.offerDetails || currentLot.offerDetails.status !== 'Accepted') {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center py-20">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Deal Not Confirmed</h2>
        <p className="text-gray-500 mb-6">Logistics can only be arranged after an offer has been accepted.</p>
        <button onClick={() => router.push('/offers')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors">
          View Offers
        </button>
      </div>
    );
  }

  const buyer = PROTOTYPE_BUYERS.find(b => b.id === currentLot.selectedBuyerId);
  const logistics = currentLot.logisticsDetails;

  const effectiveQuantity = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;

  
  const destination = buyer?.location || 'Processing Facility';
  const origin = currentLot.district || 'Farmer Location';
  const distanceKm = getDeterministicDistance(origin, destination);
  
  const transportCalc = calculateLogistics(distanceKm, effectiveQuantity, { capacityTonnes: parseInt(selectedVehicle.capacity.replace(/[^0-9]/g, '')), ratePerKm: selectedVehicle.rate });
  const estimatedCost = transportCalc.totalTransportCost;
  const vehiclesRequired = transportCalc.vehiclesRequired;
  

  const handleBookLogistics = () => {
    updateLotStatus('Transport Arranged');
    updateLogistics({
      vehicle: selectedVehicle.name,
      distance: distanceKm,
      estimatedCost,
      status: 'Transport Arranged',
      timeline: [
        { status: 'Transport Arranged', timestamp: new Date().toISOString() }
      ]
    });
  };

  const advanceTracking = (nextStatus: TrackingEvent['status']) => {
    if (!logistics) return;
    updateLotStatus(nextStatus);
    updateLogistics({
      status: nextStatus,
      timeline: [
        ...logistics.timeline,
        { status: nextStatus, timestamp: new Date().toISOString() }
      ]
    });
  };

  const renderTimeline = () => {
    if (!logistics) return null;
    const stages: TrackingEvent['status'][] = ['Transport Arranged', 'Dispatched', 'In Transit', 'Delivered'];
    
    return (
      <div className="mt-8">
        <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2"><Truck className="w-5 h-5"/> Delivery Tracking</h3>
        <div className="flex flex-col md:flex-row justify-between relative">
          <div className="absolute top-1/2 left-4 right-4 h-1 bg-gray-200 -translate-y-1/2 hidden md:block z-0"></div>
          
          {stages.map((stage) => {
            const event = logistics.timeline.find(t => t.status === stage);
            const isCompleted = !!event;
            
            return (
              <div key={stage} className="relative z-10 flex flex-row md:flex-col items-center gap-4 md:gap-2 mb-6 md:mb-0 w-full md:w-auto">
                <div className={"w-8 h-8 rounded-full flex items-center justify-center border-2 " + (isCompleted ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-300')}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-gray-300"></div>}
                </div>
                <div className="text-left md:text-center flex-1">
                  <p className={"text-sm font-bold " + (isCompleted ? 'text-gray-900' : 'text-gray-400')}>{stage}</p>
                  {event && <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleDateString('en-IN')}</p>}
                </div>
              </div>
            );
          })}
        </div>

        {logistics.status !== 'Delivered' && (
          <div className="mt-8 flex gap-3 justify-center border-t pt-6 border-gray-100">
            {logistics.status === 'Transport Arranged' && <button onClick={() => advanceTracking('Dispatched')} className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors shadow-sm">Mark as Dispatched (Demo)</button>}
            {logistics.status === 'Dispatched' && <button onClick={() => advanceTracking('In Transit')} className="bg-blue-600 text-white px-4 py-2 rounded font-medium text-sm transition-colors shadow-sm">Mark In Transit (Demo)</button>}
            {logistics.status === 'In Transit' && <button onClick={() => advanceTracking('Delivered')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium text-sm transition-colors shadow-sm">Mark Delivered (Demo)</button>}
          </div>
        )}
        
        {logistics.status === 'Delivered' && (
          <div className="mt-8 flex flex-col items-center border-t pt-6 border-gray-100 text-center">
            <h4 className="text-xl font-bold text-gray-900 mb-2 text-green-700">Delivery Successful</h4>
            <p className="text-gray-500 mb-4 text-sm">The produce has been securely handed over to the buyer. You can now track your payment.</p>
            <button onClick={() => router.push('/payments')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 shadow-sm transition-colors">
              Proceed to Payment Settlement <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2">
          <Truck className="w-8 h-8 text-green-600" />
          Logistics & Transport
        </h1>
        <p className="text-gray-500 mt-1">Coordinate transport from farm gate to buyer destination.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-bold text-gray-800 flex items-center gap-2"><MapIcon className="w-4 h-4"/> Estimated Route View</h2>
            </div>
            <div className="p-6">
              <div className="relative w-full h-48 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden mb-6 flex items-center justify-center">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                  <path d="M 20% 70% Q 50% 20% 80% 40%" fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="8 8" className="animate-pulse" />
                </svg>

                <div className="absolute left-[20%] top-[70%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-6 h-6 bg-white border-4 border-blue-600 rounded-full shadow-lg z-10"></div>
                  <div className="mt-2 bg-white px-3 py-1 rounded shadow text-xs font-bold whitespace-nowrap border border-gray-100 flex flex-col items-center">
                    <span className="text-gray-500">Pickup</span>
                    <span className="text-gray-900">{currentLot.district}, {currentLot.state}</span>
                  </div>
                </div>

                <div className="absolute left-[80%] top-[40%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-8 h-8 bg-white border-4 border-green-600 rounded-full shadow-lg z-10 flex items-center justify-center">
                    <Factory className="w-3 h-3 text-green-600" />
                  </div>
                  <div className="mt-2 bg-white px-3 py-1 rounded shadow text-xs font-bold whitespace-nowrap border border-gray-100 flex flex-col items-center">
                    <span className="text-gray-500">Destination</span>
                    <span className="text-gray-900">{buyer?.location}</span>
                  </div>
                </div>
              </div>

              {logistics ? renderTimeline() : (
                <div>
                  <h3 className="font-bold text-gray-900 mb-4">Select Transport Vehicle</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {VEHICLES.map(v => (
                      <div 
                        key={v.id} 
                        onClick={() => setSelectedVehicle(v)}
                        className={"border rounded-xl p-4 cursor-pointer transition-all " + (selectedVehicle.id === v.id ? 'border-green-600 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-green-300')}
                      >
                        <Truck className={"w-6 h-6 mb-2 " + (selectedVehicle.id === v.id ? 'text-green-600' : 'text-gray-400')} />
                        <h4 className="font-bold text-gray-900 text-sm mb-1">{v.name}</h4>
                        <p className="text-xs text-gray-500">{v.capacity}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="text-sm font-bold text-blue-900">Estimated Logistics Cost</p>
                      <p className="text-xs text-blue-700">Calculated based on {distanceKm}km standard rate</p>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {formatINR(estimatedCost)}
                    </div>
                  </div>

                  <button 
                    onClick={handleBookLogistics}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold shadow-sm transition-colors"
                  >
                    Arrange Transport ({formatINR(estimatedCost)})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sticky top-24">
            <h3 className="font-bold text-gray-900 mb-4 border-b pb-2">Shipment Details</h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Commodity & Volume</p>
                <p className="font-bold text-gray-900">{currentLot.commodity}</p>
                <p className="text-sm text-gray-600">{effectiveQuantity} {currentLot.unit} {currentLot.fpoDetails?.isAggregated && '(FPO Aggregated)'}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Buyer Details</p>
                <p className="font-bold text-gray-900">{buyer?.name}</p>
                <p className="text-sm text-gray-600">{buyer?.location}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Responsibility</p>
                <p className="font-medium text-blue-700 bg-blue-50 inline-block px-2 py-0.5 rounded text-sm mt-0.5">
                  {buyer?.requirements.delivery}
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-start gap-2 text-xs text-gray-500">
              <ShieldCheck className="w-4 h-4 text-green-600 shrink-0" />
              <p>Shipment requires verified weighing scale receipt upon dispatch. Keep physical copies ready.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


