export const formatINR = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export interface TransportCalculation {
  distanceKm: number;
  ratePerKm: number;
  baseCharge: number;
  requiredTonnes: number;
  vehicleCapacityTonnes: number;
  vehiclesRequired: number;
  totalTransportCost: number;
  costPerQuintal: number;
}

export const calculateLogistics = (
  distanceKm: number,
  effectiveQuantityQuintals: number,
  selectedVehicle: { capacityTonnes: number; ratePerKm: number }
): TransportCalculation => {
  const baseCharge = 500;
  const requiredTonnes = effectiveQuantityQuintals / 10;
  const vehiclesRequired = Math.ceil(requiredTonnes / selectedVehicle.capacityTonnes);
  
  // Cost = Base + (Distance * Rate * Vehicles)
  const totalTransportCost = baseCharge + (distanceKm * selectedVehicle.ratePerKm * vehiclesRequired);
  const costPerQuintal = totalTransportCost / effectiveQuantityQuintals;

  return {
    distanceKm,
    ratePerKm: selectedVehicle.ratePerKm,
    baseCharge,
    requiredTonnes,
    vehicleCapacityTonnes: selectedVehicle.capacityTonnes,
    vehiclesRequired,
    totalTransportCost,
    costPerQuintal
  };
};

export const calculateExpectedNet = (
  agreedPricePerQuintal: number,
  effectiveQuantityQuintals: number,
  totalTransportCost: number,
  transportResponsibility: 'Farmer' | 'Buyer'
): number => {
  const grossValue = agreedPricePerQuintal * effectiveQuantityQuintals;
  const farmerTransportCost = transportResponsibility === 'Farmer' ? totalTransportCost : 0;
  return grossValue - farmerTransportCost;
};
export const getDeterministicDistance = (origin: string, destination: string): number => {
  const combo = (origin + destination).toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < combo.length; i++) {
    hash = (hash << 5) - hash + combo.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  // Map hash to a value between 45 and 350
  const distance = (Math.abs(hash) % 305) + 45;
  return distance;
};
