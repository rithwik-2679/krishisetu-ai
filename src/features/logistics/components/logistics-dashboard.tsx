"use client";
import { formatINR } from '@/utils/economics';
import { formatTime } from '@/utils/date';

import React, { useState } from 'react';
import { useLot } from '@/contexts/lot-context';
import { useRouter } from 'next/navigation';
import { Truck, AlertCircle, ArrowRight, MapPin, CheckCircle2, Factory, Navigation, PackageCheck, Clock, Map as MapIcon } from 'lucide-react';
import { TrackingEvent } from '@/types/marketplace';

export function LogisticsDashboard() {
  const router = useRouter();
  const { currentLot, updateLogistics, updateLotStatus, isHydrated } = useLot();
  
  const [selectedVehicle, setSelectedVehicle] = useState('Medium Truck');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isHydrated) return null;

  if (!currentLot) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <Truck className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">No Active Lot</h2>
        <p className="text-gray-500 mb-6 text-sm">Create a lot and confirm a deal to arrange transport.</p>
        <button onClick={() => router.push('/create-lot')} className="px-6 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors">
          Create Lot
        </button>
      </div>
    );
  }

  if (!currentLot.dealConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center max-w-lg mx-auto mt-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
        <AlertCircle className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Deal Not Confirmed</h2>
        <p className="text-gray-500 mb-6 text-sm">You must confirm a deal with a buyer before arranging transport.</p>
        <button onClick={() => router.push('/offers')} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
          Review Offers
        </button>
      </div>
    );
  }

  const effQty = currentLot.fpoDetails?.isAggregated ? currentLot.fpoDetails.aggregatedQuantity : currentLot.quantity;
  const isAggregated = !!currentLot.fpoDetails?.isAggregated;
  
  // Basic distance estimation
  const distance = currentLot.selectedBuyerId === 'Metro Retail Logistics' ? 18 : 
                   currentLot.selectedBuyerId === 'FreshFoods Processing Ltd' ? 45 : 120;
  
  const capacityMap: Record<string, number> = {
    'Small Truck': currentLot.unit === 'Tonnes' ? 2 : 20,
    'Medium Truck': currentLot.unit === 'Tonnes' ? 6 : 60,
    'Heavy Truck': currentLot.unit === 'Tonnes' ? 15 : 150,
  };

  const capacity = capacityMap[selectedVehicle];
  const vehiclesRequired = Math.ceil(effQty / capacity);
  
  const rateMap: Record<string, number> = {
    'Small Truck': 15,
    'Medium Truck': 25,
    'Heavy Truck': 40
  };
  
  const ratePerKm = rateMap[selectedVehicle];
  const totalCost = vehiclesRequired * distance * ratePerKm;
  
  // FPO economics adjustment
  const farmerShare = (isAggregated && currentLot.fpoDetails?.farmerShareRatio) ? currentLot.fpoDetails.farmerShareRatio : 1;
  const farmerTransportCost = Math.round(totalCost * farmerShare);

  const handleArrangeTransport = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const initialEvent: TrackingEvent = {
        status: 'Transport Arranged',
        location: `${currentLot.district}, ${currentLot.state}`,
        timestamp: new Date().toISOString(),
        description: `Vehicle scheduled for pickup. Assigned to ${selectedVehicle}.`
      };
      updateLogistics({
        status: 'Arranged',
        estimatedCost: farmerTransportCost,
        distance,
        vehicle: selectedVehicle,
        vehicleType: selectedVehicle,
        timeline: [initialEvent],
        events: [initialEvent]
      });
      setIsProcessing(false);
    }, 1500);
  };

  const simulateNextStep = () => {
    if (!currentLot.logisticsDetails) return;
    setIsProcessing(true);
    setTimeout(() => {
      const events = [...(currentLot.logisticsDetails!.events || currentLot.logisticsDetails!.timeline || [])];
      let nextStatus: 'Arranged' | 'Dispatched' | 'In Transit' | 'Delivered' = 'Arranged';
      let eventStatus: TrackingEvent['status'] = 'Dispatched';
      let desc = '';
      
      const currentStatus = currentLot.logisticsDetails!.status;
      
      if (currentStatus === 'Arranged') {
        nextStatus = 'Dispatched';
        eventStatus = 'Dispatched';
        desc = `Produce loaded and dispatched from ${currentLot.district}.`;
      } else if (currentStatus === 'Dispatched') {
        nextStatus = 'In Transit';
        eventStatus = 'In Transit';
        desc = `In transit to ${currentLot.selectedBuyerId} facility.`;
      } else if (currentStatus === 'In Transit') {
        nextStatus = 'Delivered';
        eventStatus = 'Delivered';
        desc = `Produce successfully delivered to ${currentLot.selectedBuyerId}.`;
      }

      events.push({
        status: eventStatus,
        location: currentStatus === 'In Transit' ? 'Buyer Facility' : 'Route',
        timestamp: new Date().toISOString(),
        description: desc
      });

      updateLogistics({ status: nextStatus, events, timeline: events });
      
      if (nextStatus === 'Delivered') {
        updateLotStatus('Delivered');
      }
      setIsProcessing(false);
    }, 1500);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">Fulfillment & Logistics</h1>
        <p className="text-gray-500 font-medium">Arrange transport and track delivery to the buyer facility.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Route View */}
        <div className="lg:col-span-4 flex flex-col gap-6">
           <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 overflow-hidden relative">
             <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg border-b border-l border-blue-100 shadow-sm">
               Estimated Route View
             </div>
             
             <div className="mt-4 mb-8 relative">
               <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-gray-200"></div>
               <div className="flex items-start gap-4 mb-6 relative">
                 <div className="w-12 h-12 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm">
                   <MapPin className="w-5 h-5 text-gray-600" />
                 </div>
                 <div className="pt-2">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Origin</p>
                   <p className="font-bold text-gray-900">{currentLot.district || 'Farm Location'}, {currentLot.state}</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4 relative">
                 <div className="w-12 h-12 bg-white border-2 border-green-500 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm">
                   <Factory className="w-5 h-5 text-green-600" />
                 </div>
                 <div className="pt-2">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Destination</p>
                   <p className="font-bold text-gray-900">{currentLot.selectedBuyerId}</p>
                 </div>
               </div>
             </div>

             <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-gray-400" />
                  <span className="font-bold text-gray-700">Distance</span>
                </div>
                <span className="text-xl font-black text-gray-900">{distance} km</span>
             </div>
           </div>

           {currentLot.logisticsDetails?.status === 'Delivered' && (
             <div className="bg-green-600 text-white rounded-2xl shadow-lg p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10"><PackageCheck className="w-24 h-24" /></div>
                <h3 className="text-xl font-black mb-2 relative z-10">Delivery Complete</h3>
                <p className="text-green-100 text-sm mb-6 relative z-10 font-medium">The buyer has received the shipment. You are now ready for payment settlement.</p>
                <button onClick={() => router.push('/payments')} className="bg-white text-green-900 font-bold px-6 py-3 rounded-xl shadow-sm w-full relative z-10 transition-colors hover:bg-green-50">
                  Proceed to Payments
                </button>
             </div>
           )}
        </div>

        {/* RIGHT COLUMN: Configuration or Tracking */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {!currentLot.logisticsDetails ? (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 md:p-8">
               <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                 <Truck className="w-5 h-5 text-gray-400" /> Book Transport
               </h3>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Vehicle Requirement</label>
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 font-medium mb-4">
                       Total Volume to transport: <strong>{effQty} {currentLot.unit}</strong>
                       {isAggregated && <span className="block mt-1 text-xs text-blue-600">(Your share: {Math.round(farmerShare * 100)}% of total cost)</span>}
                    </div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Select Vehicle Type</label>
                    <select 
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-green-500 outline-none bg-white shadow-sm"
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                    >
                      <option value="Small Truck">Small Truck (Up to 2T/20Qtl)</option>
                      <option value="Medium Truck">Medium Truck (Up to 6T/60Qtl)</option>
                      <option value="Heavy Truck">Heavy Truck (Up to 15T/150Qtl)</option>
                    </select>
                  </div>
                  
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 flex flex-col justify-center">
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Vehicles Required</p>
                     <p className="text-2xl font-black text-gray-900 mb-4">{vehiclesRequired}</p>
                     
                     <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Estimated Transport Cost (Your Share)</p>
                     <p className="text-4xl font-black text-rose-600">{formatINR(farmerTransportCost)}</p>
                     <p className="text-xs text-gray-500 font-medium mt-2">Deducted from final settlement.</p>
                  </div>
               </div>

               <div className="flex justify-end pt-6 border-t border-gray-100">
                  <button 
                    onClick={handleArrangeTransport}
                    disabled={isProcessing}
                    className="px-8 py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-black transition-colors shadow-sm flex items-center justify-center gap-2"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Transport Booking'}
                  </button>
               </div>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden h-full flex flex-col">
               <div className="bg-gray-50 border-b border-gray-100 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">Shipment Tracker</h3>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Status: <span className="text-green-600">{currentLot.logisticsDetails.status}</span></p>
                  </div>
                  {currentLot.logisticsDetails.status !== 'Delivered' && (
                    <button 
                      onClick={simulateNextStep}
                      disabled={isProcessing}
                      className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-sm font-bold shadow-sm transition-colors"
                    >
                      {isProcessing ? 'Updating...' : 'Simulate Next Update'}
                    </button>
                  )}
               </div>

               <div className="p-6 flex-1 max-h-[500px] overflow-y-auto scrollbar-thin">
                 <div className="space-y-0">
                   {(currentLot.logisticsDetails.events || currentLot.logisticsDetails.timeline || []).map((event, idx, arr) => {
                     const isLast = idx === arr.length - 1;
                     const isDelivered = event.status === 'Delivered';
                     return (
                       <div key={idx} className="flex items-start gap-4 relative">
                         <div className="flex flex-col items-center">
                           <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 shadow-sm
                             ${isDelivered ? 'bg-green-100 border-2 border-green-500 text-green-600' : 'bg-blue-100 border-2 border-blue-500 text-blue-600'}
                           `}>
                             {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                           </div>
                           {!isLast && <div className="w-0.5 h-16 bg-gray-200 mt-2 mb-2"></div>}
                         </div>
                         <div className={`bg-gray-50 border border-gray-100 rounded-xl p-4 flex-1 mb-6 shadow-sm ${isLast ? 'ring-2 ring-blue-500/20' : ''}`}>
                           <div className="flex justify-between items-start mb-1">
                             <p className="font-bold text-gray-900">{event.status}</p>
                             <p className="text-xs font-semibold text-gray-500">{formatTime(event.timestamp)}</p>
                           </div>
                           <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1"><MapIcon className="w-3 h-3"/> {event.location}</p>
                           <p className="text-sm text-gray-700 font-medium">{event.description}</p>
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
